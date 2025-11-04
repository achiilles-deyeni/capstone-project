# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install build deps and pip
RUN apt-get update && apt-get install -y --no-install-recommends gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Port will be provided by platform; use 8000 locally
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.app:app", "--bind", "0.0.0.0:8080", "--workers", "2"]