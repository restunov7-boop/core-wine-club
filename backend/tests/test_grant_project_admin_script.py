from app.database import SessionLocal
from app.projects.models import ProjectUser
from app.projects.service import ensure_default_project
from app.users.models import TelegramIdentity, User
from scripts.grant_project_admin import grant_project_role


def test_grant_project_admin_dry_run_does_not_change_role(capsys):
    db = SessionLocal()
    try:
        project_user = _create_telegram_project_user(db, telegram_id="555001")

        exit_code = grant_project_role(
            db,
            project_slug="doch-vinodela",
            telegram_id="555001",
            role="admin",
            dry_run=True,
        )

        db.refresh(project_user)
        output = capsys.readouterr().out
        assert exit_code == 0
        assert project_user.role == "member"
        assert "Role: member -> admin" in output
        assert "[DRY RUN]" in output
    finally:
        db.close()


def test_grant_project_admin_updates_project_user_role(capsys):
    db = SessionLocal()
    try:
        project_user = _create_telegram_project_user(db, telegram_id="555002")

        exit_code = grant_project_role(
            db,
            project_slug="doch-vinodela",
            telegram_id="555002",
            role="admin",
            dry_run=False,
        )

        db.refresh(project_user)
        output = capsys.readouterr().out
        assert exit_code == 0
        assert project_user.role == "admin"
        assert project_user.status == "active"
        assert project_user.is_premium is False
        assert "[OK] Project role updated." in output
    finally:
        db.close()


def test_grant_project_admin_requires_existing_project_user(capsys):
    db = SessionLocal()
    try:
        user = User(display_name="No Membership")
        db.add(user)
        db.flush()
        db.add(TelegramIdentity(user_id=user.id, telegram_id="555003"))
        db.commit()

        exit_code = grant_project_role(
            db,
            project_slug="doch-vinodela",
            telegram_id="555003",
            role="admin",
            dry_run=False,
        )

        output = capsys.readouterr().out
        assert exit_code == 1
        assert "ProjectUser was not found" in output
        assert db.query(ProjectUser).filter(ProjectUser.user_id == user.id).one_or_none() is None
    finally:
        db.close()


def _create_telegram_project_user(db, telegram_id: str) -> ProjectUser:
    project = ensure_default_project(db)
    user = User(display_name="QA User")
    db.add(user)
    db.flush()
    db.add(TelegramIdentity(user_id=user.id, telegram_id=telegram_id))
    project_user = ProjectUser(user_id=user.id, project_id=project.id, role="member", status="active")
    db.add(project_user)
    db.commit()
    db.refresh(project_user)
    return project_user
