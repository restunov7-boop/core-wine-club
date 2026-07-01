from app.database import SessionLocal
from app.discoveries.service import seed_demo_discoveries
from app.learning.service import seed_demo_learning
from app.projects.service import DEFAULT_PROJECT_SLUG, ensure_default_project
from app.quizzes.service import seed_demo_quizzes


def main() -> None:
    db = SessionLocal()
    try:
        project = ensure_default_project(db)
        discovery_count = seed_demo_discoveries(db, project)
        lesson_count = seed_demo_learning(db, project)
        quiz_question_count = seed_demo_quizzes(db, project)
        db.commit()
        print(f"Seeded project: {DEFAULT_PROJECT_SLUG} ({project.id})")
        print(f"Seeded discoveries: {discovery_count}")
        print(f"Seeded learning lessons: {lesson_count}")
        print(f"Seeded quiz questions: {quiz_question_count}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
