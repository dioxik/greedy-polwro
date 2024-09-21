# Use an official SQLite image or build from a base image
FROM python:3.9-slim

# Install SQLite
RUN apt-get update && \
    apt-get install -y sqlite3

# Copy the database initialization script
COPY init_db.sql /docker-entrypoint-initdb.d/

# Set the working directory
WORKDIR /app

# Expose the port (if needed)
EXPOSE 80
