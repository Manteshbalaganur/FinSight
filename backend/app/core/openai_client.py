"""Single place that talks to OpenAI and turns SDK errors into clean app errors."""
import logging

import openai
from openai import OpenAI

from app.core.config import settings
from app.core.errors import OpenAIConfigError, OpenAIRateLimitError, OpenAIRequestError

log = logging.getLogger("finsight.openai")
_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if not settings.openai_configured:
        raise OpenAIConfigError(
            "OPENAI_API_KEY is not set. Add it to backend/.env and restart the backend."
        )
    if _client is None:
        _client = OpenAI(api_key=settings.openai_api_key, timeout=60, max_retries=1)
    return _client


def chat_completion(messages: list[dict], json_schema: dict | None = None) -> str:
    """Run one chat completion and return the text. Optionally force a JSON schema."""
    client = get_client()
    kwargs: dict = {"model": settings.openai_model, "messages": messages}
    if json_schema:
        kwargs["response_format"] = {"type": "json_schema", "json_schema": json_schema}
    try:
        resp = client.chat.completions.create(**kwargs)
    except openai.AuthenticationError as exc:
        raise OpenAIConfigError("OpenAI rejected the API key. Check OPENAI_API_KEY in backend/.env.") from exc
    except openai.NotFoundError as exc:
        raise OpenAIConfigError(
            f"OpenAI model '{settings.openai_model}' is not available for this API key. Set OPENAI_MODEL in backend/.env to a model you have access to."
        ) from exc
    except openai.RateLimitError as exc:
        raise OpenAIRateLimitError("OpenAI rate limit or quota reached. Wait a moment and try again, or check your billing.") from exc
    except openai.APITimeoutError as exc:
        raise OpenAIRequestError("The OpenAI request timed out. Please try again.") from exc
    except openai.APIConnectionError as exc:
        raise OpenAIRequestError("Could not connect to OpenAI. Check your internet connection.") from exc
    except openai.BadRequestError as exc:
        log.warning("OpenAI bad request: %s", exc)
        raise OpenAIRequestError(f"OpenAI rejected the request: {getattr(exc, 'message', exc)}") from exc
    except openai.APIError as exc:
        log.warning("OpenAI error: %s", exc)
        raise OpenAIRequestError(f"OpenAI error: {getattr(exc, 'message', exc)}") from exc
    content = resp.choices[0].message.content
    if not content:
        raise OpenAIRequestError("OpenAI returned an empty response.")
    return content


def check_model() -> dict:
    """Used by /api/health: verifies the key works and the configured model exists."""
    if not settings.openai_configured:
        return {"configured": False, "model": settings.openai_model, "model_available": None, "message": "OPENAI_API_KEY not set"}
    try:
        get_client().models.retrieve(settings.openai_model)
        return {"configured": True, "model": settings.openai_model, "model_available": True, "message": "ok"}
    except openai.NotFoundError:
        return {"configured": True, "model": settings.openai_model, "model_available": False,
                "message": f"Model '{settings.openai_model}' not available for this key. Update OPENAI_MODEL."}
    except openai.AuthenticationError:
        return {"configured": True, "model": settings.openai_model, "model_available": None, "message": "API key rejected by OpenAI."}
    except Exception as exc:
        return {"configured": True, "model": settings.openai_model, "model_available": None, "message": f"Could not verify: {exc.__class__.__name__}"}
