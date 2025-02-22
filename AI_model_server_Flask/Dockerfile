# Use the latest official Python runtime as a parent image
FROM python:latest

# Set the working directory to /app
WORKDIR /app

# Copy only the requirements file first (for caching purposes)
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the application code to /app
COPY . .

# Expose port 8000
EXPOSE 8000

# Run the application
CMD ["python", "app.py"]
