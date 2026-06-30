from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def healthcheck() -> dict[str, object]:
    return {
        "data": {
            "status": "ok",
            "service": "core-wine-club-backend",
        },
        "meta": {},
    }
