class AppError(Exception):
    status_code = 500
    code = "app_error"

    def __init__(self, message: str = "Application error", details: dict | None = None) -> None:
        self.message = message
        self.details = details or {}
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class PermissionDeniedError(AppError):
    status_code = 403
    code = "permission_denied"


class ValidationAppError(AppError):
    status_code = 422
    code = "validation_error"


class ConflictError(AppError):
    status_code = 409
    code = "conflict"


class PremiumRequiredError(AppError):
    status_code = 402
    code = "premium_required"


class AuthenticationError(AppError):
    status_code = 401
    code = "authentication_error"
