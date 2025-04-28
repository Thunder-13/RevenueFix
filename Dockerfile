
FROM python:3.12-slim AS backend-base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=app.py \
    FLASK_ENV=production

# Backend dependencies
FROM backend-base AS backend-deps
COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Backend development
FROM backend-deps AS backend-dev
COPY backend/ .
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

# Backend production
FROM backend-deps AS backend-prod
COPY backend/ .
RUN pip install gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

# ---- React Frontend Stages ----
FROM node:23.11.0-slim AS frontend-base
WORKDIR /app

# Frontend dependencies
FROM frontend-base AS frontend-deps
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
# RUN --mount=type=cache,id=yarn,target=/usr/local/share/.cache/yarn \
#     yarn install --frozen-lockfile

# Frontend development
FROM frontend-deps AS frontend-dev
COPY frontend/ .
CMD ["npm", "run", "dev"]

# Frontend production build
FROM frontend-deps AS frontend-prod
COPY frontend/ .
CMD ["npm", "run", "build"]

# ---- NGINX Stage ----
FROM nginx:alpine AS nginx
COPY --from=frontend-prod /app/dist /usr/share/nginx/html
COPY --from=backend-prod /app /app/backend
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]