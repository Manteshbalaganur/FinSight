"""Application errors that map to clean JSON responses ({"detail": ..., "code": ...})."""


class AppError(Exception):
    status_code = 500
    code = "internal_error"

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class InvalidSymbolError(AppError):
    status_code = 404
    code = "invalid_symbol"


class InvalidRequestError(AppError):
    status_code = 422
    code = "invalid_request"


class DataUnavailableError(AppError):
    status_code = 502
    code = "data_unavailable"


class InsufficientDataError(AppError):
    status_code = 422
    code = "insufficient_data"


class NewsUnavailableError(AppError):
    status_code = 502
    code = "news_unavailable"


class OpenAIConfigError(AppError):
    status_code = 503
    code = "openai_not_configured"


class OpenAIRequestError(AppError):
    status_code = 502
    code = "openai_error"


class OpenAIRateLimitError(AppError):
    status_code = 429
    code = "openai_rate_limited"

