FROM node:20-alpine

# Install dependencies for better performance
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Note: Files will be mounted as volumes in docker-compose
# We just set up the environment here

# Expose Vite dev server port
EXPOSE 5173

# Start development server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
