# Use Python 3.11 (compatible with all packages)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies - FIXED for newer Debian
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p saved_models data uploads

# Train NPK model with correct pickle protocol for Python 3.11
RUN python3 -c "from model.predict import train_npk_regressor; train_npk_regressor(); print('NPK model trained successfully')"

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Run the application
CMD ["python3", "main.py"]
