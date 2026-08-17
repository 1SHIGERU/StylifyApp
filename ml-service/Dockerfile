FROM python:3.11-slim

WORKDIR /app

# Instalacja zależności systemowych
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Kopiowanie i instalacja zależności Pythona
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Polski model spacy dla Presidio (podejście B)
RUN python -m spacy download pl_core_news_sm

# Kopiowanie kodu
COPY . .

# Port FastAPI
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
