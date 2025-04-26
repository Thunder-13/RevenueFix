FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create app directory
WORKDIR /app

ENV FLASK_APP=app.py

ENV FLASK_ENV=production

# Copy only requirements first for layer caching
COPY ./requirements.txt .

# Install dependencies into system-wide (no venv in container)
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose Flask port
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]