FROM python:3.9-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# Copy all files
COPY . .

# Install Python dependencies
WORKDIR /app/backend
RUN pip install -r requirements.txt

# Install and build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Copy built frontend to backend static folder
RUN mkdir -p /app/backend/static
RUN cp -r build/* /app/backend/static/ 2>/dev/null || echo "No build files"

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
