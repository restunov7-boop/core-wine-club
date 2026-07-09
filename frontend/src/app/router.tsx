import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminGuard } from "./guards/AdminGuard";
import { AuthGuard } from "./guards/AuthGuard";
import { AdminLayout } from "./layout/AdminLayout";
import { AppShell } from "./layouts/AppShell";
import { BottlePage } from "../modules/bottle/BottlePage";
import { DictionaryPage } from "../modules/dictionary/DictionaryPage";
import { DiaryNoteDetailPage } from "../modules/diary/DiaryNoteDetailPage";
import { DiaryNoteFormPage } from "../modules/diary/DiaryNoteFormPage";
import { DiaryPage } from "../modules/diary/DiaryPage";
import { DiscoveriesPage } from "../modules/discoveries/DiscoveriesPage";
import { DiscoveryDetailPage } from "../modules/discoveries/DiscoveryDetailPage";
import { HomePage } from "../modules/home/HomePage";
import { LearningPathDetailPage } from "../modules/learning/LearningPathDetailPage";
import { LearningPathsPage } from "../modules/learning/LearningPathsPage";
import { LessonDetailPage } from "../modules/learning/LessonDetailPage";
import { MyPathPage } from "../modules/my-path/MyPathPage";
import { OfflineTastingsPage } from "../modules/offline-tastings/OfflineTastingsPage";
import { OnboardingPage } from "../modules/onboarding/OnboardingPage";
import { ProgressActivityPage } from "../modules/progress/ProgressActivityPage";
import { QuizDetailPage } from "../modules/quizzes/QuizDetailPage";
import { QuizzesPage } from "../modules/quizzes/QuizzesPage";
import { TasteMapPage } from "../modules/taste-map/TasteMapPage";
import { TasteProfilePage } from "../modules/taste-profile/TasteProfilePage";
import { TelegramDebugPage } from "../modules/debug/TelegramDebugPage";
import { WineShelfPage } from "../modules/wine-shelf/WineShelfPage";
import { PlaceholderPage } from "../shared/ui/PlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/loading",
    element: <PlaceholderPage title="Загрузка" />,
  },
  {
    path: "/telegram-debug",
    element: <TelegramDebugPage />,
  },
  {
    path: "/onboarding",
    element: (
      <AuthGuard>
        <OnboardingPage />
      </AuthGuard>
    ),
  },
  {
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/bottle", element: <BottlePage /> },
      { path: "/progress", element: <ProgressActivityPage /> },
      { path: "/my-path", element: <MyPathPage /> },
      { path: "/quizzes", element: <QuizzesPage /> },
      { path: "/quizzes/:quizSlug", element: <QuizDetailPage /> },
      { path: "/discoveries", element: <DiscoveriesPage /> },
      { path: "/discoveries/:slug", element: <DiscoveryDetailPage /> },
      { path: "/learn", element: <LearningPathsPage /> },
      { path: "/learn/lessons/:lessonSlug", element: <LessonDetailPage /> },
      { path: "/learn/:pathSlug", element: <LearningPathDetailPage /> },
      { path: "/diary", element: <DiaryPage /> },
      { path: "/diary/shelf", element: <WineShelfPage /> },
      { path: "/diary/new", element: <DiaryNoteFormPage /> },
      { path: "/diary/:noteId", element: <DiaryNoteDetailPage /> },
      { path: "/diary/:noteId/edit", element: <DiaryNoteFormPage /> },
      { path: "/taste-map", element: <TasteMapPage /> },
      { path: "/dictionary", element: <DictionaryPage /> },
      { path: "/taste-profile", element: <TasteProfilePage /> },
      { path: "/profile", element: <Navigate to="/taste-profile" replace /> },
      { path: "/offline-tastings", element: <OfflineTastingsPage /> },
      { path: "/club", element: <PlaceholderPage title="Клуб" /> },
      { path: "/premium", element: <PlaceholderPage title="Премиум" /> },
      { path: "/notifications", element: <PlaceholderPage title="Уведомления" /> },
      { path: "/settings", element: <PlaceholderPage title="Настройки" /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <PlaceholderPage title="Админ-раздел" /> },
      { path: "dashboard", element: <PlaceholderPage title="Админ-панель" /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
]);
