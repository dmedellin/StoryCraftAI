# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY story-craft/package.json story-craft/package-lock.json ./story-craft/
RUN cd story-craft && npm ci

# Copy the rest of the application code
COPY story-craft/ ./story-craft/

# Build the React app
RUN cd story-craft && npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the built React app from Stage 1
COPY --from=build /app/story-craft/build /usr/share/nginx/html

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Change ownership of Nginx directories
RUN chown -R appuser:appgroup /usr/share/nginx/html \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/run

# Switch to non-root user
USER appuser

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
