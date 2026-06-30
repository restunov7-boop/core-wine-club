from fastapi import Request
from fastapi.responses import JSONResponse

from app.shared.errors import AppError


def success_response(data: object, meta: dict | None = None) -> dict[str, object]:
    return {"data": data, "meta": meta or {}}


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "meta": {},
        },
    )
