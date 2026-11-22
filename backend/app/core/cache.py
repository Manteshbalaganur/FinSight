"""Tiny in-memory TTL cache (enough for a single-process demo)."""
import threading
import time
from typing import Any, Callable

_store: dict[str, tuple[float, Any]] = {}
_lock = threading.Lock()


def cached(key: str, ttl_seconds: int, producer: Callable[[], Any]) -> Any:
    """Return the cached value for `key`, or call `producer()` and cache it.

    Exceptions are never cached.
    """
    now = time.time()
    with _lock:
        hit = _store.get(key)
        if hit and hit[0] > now:
            return hit[1]
    value = producer()
    with _lock:
        _store[key] = (now + ttl_seconds, value)
    return value


def put(key: str, ttl_seconds: int, value: Any) -> None:
    with _lock:
        _store[key] = (time.time() + ttl_seconds, value)


def peek(key: str) -> Any | None:
    with _lock:
        hit = _store.get(key)
        if hit and hit[0] > time.time():
            return hit[1]
    return None
