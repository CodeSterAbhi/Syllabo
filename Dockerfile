# Stage 1: Build the React application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies cleanly using package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code and build for production
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx Alpine
FROM nginx:alpine

# Remove default static Nginx assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built application assets from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure Nginx for React SPA fallback routing
RUN echo 'server {' > /etc/nginx/conf.d/default.conf \
    && echo '    listen 80;' >> /etc/nginx/conf.d/default.conf \
    && echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf \
    && echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    index index.html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    location / {' >> /etc/nginx/conf.d/default.conf \
    && echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '    error_page 500 502 503 504 /50x.html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    location = /50x.html {' >> /etc/nginx/conf.d/default.conf \
    && echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    }' >> /etc/nginx/conf.d/default.conf \
    && echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
