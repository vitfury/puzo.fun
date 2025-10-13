FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY ../../frontend/package*.json ./

# Install dependencies
RUN npm ci

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
