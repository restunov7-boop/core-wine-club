param(
    [string]$BaseUrl = "http://127.0.0.1:8000/api/v1"
)

$ErrorActionPreference = "Stop"

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message"
}

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )
    if (-not $Condition) {
        throw $Message
    }
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )

    $params = @{
        Method = $Method
        Uri = "$BaseUrl$Path"
        Headers = $Headers
    }

    if ($null -ne $Body) {
        $params.ContentType = "application/json"
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    Invoke-RestMethod @params
}

$health = Invoke-Api -Method Get -Path "/health"
Assert-True ($health.data.status -eq "ok") "Healthcheck did not return ok"
Write-Ok "health"

$session = Invoke-Api -Method Post -Path "/auth/telegram" -Body @{ init_data = "dev_mock_init_data" }
Assert-True ([string]::IsNullOrWhiteSpace($session.data.access_token) -eq $false) "Auth token is empty"
$headers = @{ Authorization = "Bearer $($session.data.access_token)" }
Write-Ok "auth telegram"

$me = Invoke-Api -Method Get -Path "/auth/me" -Headers $headers
Assert-True ($me.data.project_user.project_slug -eq "doch-vinodela") "Unexpected project slug"
Assert-True ($me.data.project_user.role -eq "member") "Unexpected project role"
Write-Ok "auth me"

$reset = Invoke-Api -Method Post -Path "/onboarding/reset-dev" -Headers $headers
Assert-True ($reset.data.is_completed -eq $false) "Onboarding reset failed"
Write-Ok "onboarding reset-dev"

$complete = Invoke-Api -Method Post -Path "/onboarding/complete" -Headers $headers -Body @{
    wine_experience_level = "beginner"
    taste_preferences = @("red", "sparkling")
    goals = @("choose_bottle", "feel_confident")
    display_name = "Smoke User"
}
Assert-True ($complete.data.is_completed -eq $true) "Onboarding complete failed"
Write-Ok "onboarding complete"

$homeResponse = Invoke-Api -Method Get -Path "/home" -Headers $headers
Assert-True ($homeResponse.data.project.slug -eq "doch-vinodela") "Home project slug mismatch"
Write-Ok "home"

$discoveries = Invoke-Api -Method Get -Path "/discoveries" -Headers $headers
Assert-True ($discoveries.data.items.Count -ge 1) "Discoveries list is empty"
$firstSlug = $discoveries.data.items[0].slug
Write-Ok "discoveries list"

$discovery = Invoke-Api -Method Get -Path "/discoveries/$firstSlug" -Headers $headers
Assert-True ($discovery.data.slug -eq $firstSlug) "Discovery detail slug mismatch"
Write-Ok "discoveries detail"

$learningPaths = Invoke-Api -Method Get -Path "/learning/paths" -Headers $headers
Assert-True ($learningPaths.data.items.Count -ge 1) "Learning paths list is empty"
$firstPathSlug = $learningPaths.data.items[0].slug
Assert-True ($firstPathSlug -eq "wine-basics") "Unexpected first learning path slug"
Write-Ok "learning paths list"

$learningPath = Invoke-Api -Method Get -Path "/learning/paths/$firstPathSlug" -Headers $headers
Assert-True ($learningPath.data.lessons.Count -eq 5) "Learning path lesson count mismatch"
$firstLessonSlug = $learningPath.data.lessons[0].slug
Write-Ok "learning path detail"

$lesson = Invoke-Api -Method Get -Path "/learning/lessons/$firstLessonSlug" -Headers $headers
Assert-True ($lesson.data.slug -eq $firstLessonSlug) "Lesson detail slug mismatch"
Assert-True ([string]::IsNullOrWhiteSpace($lesson.data.body) -eq $false) "Lesson body is empty"
Write-Ok "learning lesson detail"

Invoke-Api -Method Delete -Path "/progress/lessons/$firstLessonSlug/complete" -Headers $headers | Out-Null
$progressBefore = Invoke-Api -Method Get -Path "/progress/summary" -Headers $headers
Assert-True ($progressBefore.data.learning.completed_lessons_count -eq 0) "Initial completed lesson count mismatch"
Assert-True ($progressBefore.data.learning.available_lessons_count -eq 5) "Available lesson count mismatch"
Assert-True ($progressBefore.data.diary.notes_count -eq 0) "Initial diary notes count mismatch"
Assert-True ($progressBefore.data.diary.created_note_events_count -eq 0) "Initial diary event count mismatch"
Write-Ok "progress summary initial"

$myPathBefore = Invoke-Api -Method Get -Path "/my-path" -Headers $headers
Assert-True ($myPathBefore.data.summary.completed_lessons_count -eq 0) "Initial my-path lesson count mismatch"
Assert-True ($myPathBefore.data.summary.diary_notes_count -eq 0) "Initial my-path diary count mismatch"
Assert-True ($myPathBefore.data.next_actions.Count -ge 2) "Initial my-path next actions missing"
Assert-True ($myPathBefore.data.next_actions[0].key -eq "start_learning") "Initial my-path first action mismatch"
Write-Ok "my-path initial"

$bottleBefore = Invoke-Api -Method Get -Path "/bottle/progress" -Headers $headers
Assert-True ($bottleBefore.data.completed_units -eq 0) "Initial bottle completed units mismatch"
Assert-True ($bottleBefore.data.total_units -eq 8) "Initial bottle total units mismatch"
Assert-True ($bottleBefore.data.fill_percent -eq 0) "Initial bottle fill mismatch"
Assert-True ($bottleBefore.data.source -eq "learning_and_diary") "Initial bottle source mismatch"
Assert-True ($bottleBefore.data.breakdown.learning.available_lessons_count -eq 5) "Initial bottle learning total mismatch"
Assert-True ($bottleBefore.data.breakdown.diary.target_notes_count -eq 3) "Initial bottle diary target mismatch"
Write-Ok "bottle progress initial"

$completedLesson = Invoke-Api -Method Post -Path "/progress/lessons/$firstLessonSlug/complete" -Headers $headers
Assert-True ($completedLesson.data.is_completed -eq $true) "Lesson completion failed"
Write-Ok "progress complete lesson"

$myPathAfterLesson = Invoke-Api -Method Get -Path "/my-path" -Headers $headers
$myPathAfterLessonKeys = @($myPathAfterLesson.data.next_actions | ForEach-Object { $_.key })
Assert-True ($myPathAfterLessonKeys -contains "continue_learning") "My-path did not switch to continue learning"
Assert-True ($myPathAfterLessonKeys -contains "view_bottle") "My-path did not include bottle after progress"
Assert-True ($myPathAfterLesson.data.next_actions.Count -le 4) "My-path returned more than 4 actions"
Write-Ok "my-path after lesson"

$bottleAfterComplete = Invoke-Api -Method Get -Path "/bottle/progress" -Headers $headers
Assert-True ($bottleAfterComplete.data.completed_units -eq 1) "Bottle completed units did not update"
Assert-True ($bottleAfterComplete.data.fill_percent -eq 12) "Bottle fill did not update"
Assert-True ($bottleAfterComplete.data.breakdown.learning.completed_lessons_count -eq 1) "Bottle learning count did not update"
Write-Ok "bottle progress after complete"

$learningPathAfterCompletion = Invoke-Api -Method Get -Path "/learning/paths/$firstPathSlug" -Headers $headers
Assert-True ($learningPathAfterCompletion.data.completed_lessons_count -eq 1) "Learning path completed count mismatch"
Assert-True ($learningPathAfterCompletion.data.lessons[0].is_completed -eq $true) "Learning lesson completion state mismatch"
Write-Ok "learning detail completion state"

$progressAfter = Invoke-Api -Method Get -Path "/progress/summary" -Headers $headers
Assert-True ($progressAfter.data.learning.completed_lessons_count -eq 1) "Completed lesson count did not update"
Write-Ok "progress summary after complete"

$uncompletedLesson = Invoke-Api -Method Delete -Path "/progress/lessons/$firstLessonSlug/complete" -Headers $headers
Assert-True ($uncompletedLesson.data.is_completed -eq $false) "Lesson uncomplete failed"
Assert-True ($uncompletedLesson.data.deleted -eq $true) "Lesson uncomplete did not delete event"
Write-Ok "progress uncomplete lesson"

$progressAfterUncomplete = Invoke-Api -Method Get -Path "/progress/summary" -Headers $headers
Assert-True ($progressAfterUncomplete.data.learning.completed_lessons_count -eq 0) "Completed lesson count did not reset"
Write-Ok "progress summary after uncomplete"

$bottleAfterUncomplete = Invoke-Api -Method Get -Path "/bottle/progress" -Headers $headers
Assert-True ($bottleAfterUncomplete.data.completed_units -eq 0) "Bottle completed units did not reset"
Assert-True ($bottleAfterUncomplete.data.fill_percent -eq 0) "Bottle fill did not reset"
Write-Ok "bottle progress after uncomplete"

$note = Invoke-Api -Method Post -Path "/diary/notes" -Headers $headers -Body @{
    wine_name = "Smoke Chianti"
    producer = "Smoke Producer"
    country = "Italy"
    region = "Tuscany"
    grape = "Sangiovese"
    vintage = 2021
    wine_color = "red"
    sweetness = "dry"
    rating = 4
    tasted_at = "2026-06-29"
    aroma_notes = @("cherry", "spice")
    taste_notes = @("fresh", "structured")
    personal_note = "Smoke note"
    would_buy_again = $true
}
$noteId = $note.data.id
Assert-True ([string]::IsNullOrWhiteSpace($noteId) -eq $false) "Diary note id is empty"
Write-Ok "diary create"

$progressAfterDiaryCreate = Invoke-Api -Method Get -Path "/progress/summary" -Headers $headers
Assert-True ($progressAfterDiaryCreate.data.diary.notes_count -eq 1) "Diary notes count did not update"
Assert-True ($progressAfterDiaryCreate.data.diary.created_note_events_count -eq 1) "Diary event count did not update"
Write-Ok "progress summary after diary create"

$myPathAfterDiary = Invoke-Api -Method Get -Path "/my-path" -Headers $headers
$myPathAfterDiaryKeys = @($myPathAfterDiary.data.next_actions | ForEach-Object { $_.key })
Assert-True ($myPathAfterDiary.data.summary.diary_notes_count -eq 1) "My-path diary count did not update"
Assert-True ($myPathAfterDiaryKeys -contains "add_diary_note") "My-path did not switch to add diary note"
Assert-True ($myPathAfterDiaryKeys -contains "view_bottle") "My-path did not include bottle after diary progress"
Assert-True ($myPathAfterDiary.data.next_actions.Count -le 4) "My-path after diary returned more than 4 actions"
Write-Ok "my-path after diary"

$completedLessonForActivity = Invoke-Api -Method Post -Path "/progress/lessons/$firstLessonSlug/complete" -Headers $headers
Assert-True ($completedLessonForActivity.data.is_completed -eq $true) "Lesson completion for activity failed"
$activity = Invoke-Api -Method Get -Path "/progress/activity" -Headers $headers
Assert-True ($activity.data.items.Count -ge 2) "Progress activity did not include lesson and diary events"
Assert-True ($activity.data.items[0].event_type -in @("learning.lesson.completed", "diary.note.created")) "Unexpected activity event type"
Assert-True ($activity.meta.limit -eq 20) "Progress activity default limit mismatch"
Write-Ok "progress activity"

$homeWithActivity = Invoke-Api -Method Get -Path "/home" -Headers $headers
$activitySection = $homeWithActivity.data.sections | Where-Object { $_.key -eq "activity" } | Select-Object -First 1
Assert-True ($null -ne $activitySection) "Home activity section is missing"
Assert-True ($activitySection.href -eq "/progress") "Home activity href mismatch"
Assert-True ($activitySection.items.Count -ge 2) "Home activity preview did not include recent events"
$myPathSection = $homeWithActivity.data.sections | Where-Object { $_.key -eq "my_path" } | Select-Object -First 1
Assert-True ($null -ne $myPathSection) "Home my-path section is missing"
Assert-True ($myPathSection.href -eq "/my-path") "Home my-path href mismatch"
Assert-True ($myPathSection.items.Count -le 2) "Home my-path preview returned too many actions"
Write-Ok "home activity preview"

$bottleAfterDiaryCreate = Invoke-Api -Method Get -Path "/bottle/progress" -Headers $headers
Assert-True ($bottleAfterDiaryCreate.data.completed_units -eq 2) "Bottle diary and lesson contribution did not update"
Assert-True ($bottleAfterDiaryCreate.data.fill_percent -eq 25) "Bottle diary and lesson fill did not update"
Assert-True ($bottleAfterDiaryCreate.data.breakdown.diary.notes_count -eq 1) "Bottle diary notes count did not update"
Assert-True ($bottleAfterDiaryCreate.data.breakdown.diary.contributed_units -eq 1) "Bottle diary contributed units mismatch"
Assert-True ($bottleAfterDiaryCreate.data.activity_preview.Count -ge 2) "Bottle activity preview did not include recent events"
Write-Ok "bottle progress after diary create"

$uncompletedLessonForActivity = Invoke-Api -Method Delete -Path "/progress/lessons/$firstLessonSlug/complete" -Headers $headers
Assert-True ($uncompletedLessonForActivity.data.is_completed -eq $false) "Lesson cleanup after activity failed"
Write-Ok "progress activity lesson cleanup"

$notes = Invoke-Api -Method Get -Path "/diary/notes" -Headers $headers
Assert-True ($notes.data.total -ge 1) "Diary list is empty"
Write-Ok "diary list"

$detail = Invoke-Api -Method Get -Path "/diary/notes/$noteId" -Headers $headers
Assert-True ($detail.data.id -eq $noteId) "Diary detail id mismatch"
Write-Ok "diary detail"

$patched = Invoke-Api -Method Patch -Path "/diary/notes/$noteId" -Headers $headers -Body @{
    rating = 5
    personal_note = "Smoke note updated"
}
Assert-True ($patched.data.rating -eq 5) "Diary patch failed"
Write-Ok "diary update"

$profile = Invoke-Api -Method Get -Path "/taste-profile" -Headers $headers
Assert-True ($profile.data.stats.notes_count -ge 1) "Taste profile notes count did not update"
Write-Ok "taste-profile"

$deleted = Invoke-Api -Method Delete -Path "/diary/notes/$noteId" -Headers $headers
Assert-True ($deleted.data.deleted -eq $true) "Diary delete failed"
Write-Ok "diary delete"

try {
    Invoke-Api -Method Get -Path "/diary/notes/$noteId" -Headers $headers | Out-Null
    throw "Deleted note unexpectedly returned 200"
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 404) {
        throw
    }
}
Write-Ok "deleted note returns 404"

$progressAfterDiaryDelete = Invoke-Api -Method Get -Path "/progress/summary" -Headers $headers
Assert-True ($progressAfterDiaryDelete.data.diary.notes_count -eq 0) "Diary notes count did not reset after delete"
Assert-True ($progressAfterDiaryDelete.data.diary.created_note_events_count -eq 1) "Diary event history was unexpectedly removed"
Write-Ok "progress summary after diary delete"

$bottleAfterDiaryDelete = Invoke-Api -Method Get -Path "/bottle/progress" -Headers $headers
Assert-True ($bottleAfterDiaryDelete.data.completed_units -eq 0) "Bottle diary contribution did not reset after delete"
Assert-True ($bottleAfterDiaryDelete.data.fill_percent -eq 0) "Bottle diary fill did not reset after delete"
Assert-True ($bottleAfterDiaryDelete.data.breakdown.diary.notes_count -eq 0) "Bottle diary notes did not reset after delete"
Write-Ok "bottle progress after diary delete"

Write-Ok "sprint 6 smoke complete"
