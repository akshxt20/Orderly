# syntax=docker/dockerfile:1

# ---------- Stage 1: builder ----------
# Installs dependencies into an isolated prefix so the final image carries only
# the installed packages, not pip's caches or build metadata.
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app
COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# ---------- Stage 2: runtime ----------
FROM python:3.12-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

# Run as an unprivileged user — a container should never serve traffic as root.
RUN useradd --create-home --uid 1000 appuser

# Pull in just the installed packages from the builder stage.
COPY --from=builder /install /usr/local

COPY . .
RUN chmod +x /app/entrypoint.sh && chown -R appuser:appuser /app

USER appuser
EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
