r"""Grant a project admin/owner role to an existing Telegram-linked user.

Run locally from the backend folder with DATABASE_URL configured in the environment
or in backend/.env. Example:

    .\.venv\Scripts\python.exe scripts\grant_project_admin.py --project-slug doch-vinodela --telegram-id 123456789 --role admin --dry-run

The script never prints DATABASE_URL, tokens, passwords, or credentials.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database import SessionLocal
from app.permissions.service import get_capabilities_for_role
from app.projects.models import PROJECT_USER_ROLES, Project, ProjectUser
from app.users.models import TelegramIdentity

ADMIN_ROLES = ("admin", "owner")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Grant admin/owner project role to an existing Telegram user.")
    parser.add_argument("--project-slug", required=True, help="Project slug, for example doch-vinodela.")
    parser.add_argument("--telegram-id", required=True, help="Numeric Telegram user id.")
    parser.add_argument("--role", default="admin", choices=ADMIN_ROLES, help="Role to set. Must grant access_admin.")
    parser.add_argument("--dry-run", action="store_true", help="Print what would change without committing.")
    return parser.parse_args()


def grant_project_role(
    db: Session,
    *,
    project_slug: str,
    telegram_id: str,
    role: str,
    dry_run: bool,
) -> int:
    if role not in PROJECT_USER_ROLES:
        print(f"[ERROR] Unsupported role: {role}")
        return 2
    if "access_admin" not in get_capabilities_for_role(role):
        print(f"[ERROR] Role does not grant admin access: {role}")
        return 2
    if not telegram_id.isdigit():
        print("[ERROR] --telegram-id must be numeric.")
        return 2

    identity = db.query(TelegramIdentity).filter(TelegramIdentity.telegram_id == telegram_id).one_or_none()
    if identity is None:
        print("[ERROR] Telegram identity was not found. Log in through Telegram Mini App first.")
        return 1

    project = db.query(Project).filter(Project.slug == project_slug).one_or_none()
    if project is None:
        print(f"[ERROR] Project was not found: {project_slug}")
        return 1

    project_user = (
        db.query(ProjectUser)
        .filter(ProjectUser.user_id == identity.user_id, ProjectUser.project_id == project.id)
        .one_or_none()
    )
    if project_user is None:
        print("[ERROR] ProjectUser was not found for this user/project. Create project access through the normal app flow first.")
        return 1

    old_role = project_user.role
    print(f"Project: {project.slug}")
    print(f"User id: {identity.user_id}")
    print(f"ProjectUser id: {project_user.id}")
    print(f"Role: {old_role} -> {role}")
    print(f"Status: {project_user.status}")

    if old_role == role:
        print("[OK] Role is already set. No change needed.")
        return 0

    if dry_run:
        print("[DRY RUN] No database changes committed.")
        return 0

    project_user.role = role
    db.commit()
    print("[OK] Project role updated.")
    return 0


def main() -> int:
    args = parse_args()
    db = SessionLocal()
    try:
        return grant_project_role(
            db,
            project_slug=args.project_slug,
            telegram_id=args.telegram_id,
            role=args.role,
            dry_run=args.dry_run,
        )
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
