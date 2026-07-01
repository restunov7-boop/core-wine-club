from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.quizzes.schemas import QuizCheckRequest
from app.quizzes.service import check_quiz_answers, get_quiz_detail, list_quizzes
from app.shared.responses import success_response

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("")
def get_quizzes(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    items = list_quizzes(db, project_user)
    return success_response({"items": [item.model_dump(mode="json") for item in items]})


@router.get("/{slug}")
def get_quiz(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    quiz = get_quiz_detail(db, project_user, slug)
    return success_response(quiz.model_dump(mode="json"))


@router.post("/{slug}/check")
def check_quiz(
    slug: str,
    payload: QuizCheckRequest,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    result = check_quiz_answers(
        db,
        project_user,
        slug,
        [(answer.question_id, answer.selected_option_key) for answer in payload.answers],
    )
    return success_response(result.model_dump(mode="json"))
