CAPABILITIES = (
    "view_app",
    "access_admin",
    "moderate_content",
    "manage_content",
    "manage_users",
    "manage_premium",
    "view_analytics",
    "manage_project_settings",
)

ROLE_CAPABILITIES: dict[str, set[str]] = {
    "member": {"view_app"},
    "moderator": {"view_app", "moderate_content"},
    "admin": {
        "view_app",
        "access_admin",
        "moderate_content",
        "manage_content",
        "manage_users",
        "manage_premium",
        "view_analytics",
    },
    "owner": set(CAPABILITIES),
}


def get_capabilities_for_role(role: str) -> list[str]:
    return sorted(ROLE_CAPABILITIES.get(role, set()))


def has_capability(role: str, capability: str) -> bool:
    return capability in ROLE_CAPABILITIES.get(role, set())
