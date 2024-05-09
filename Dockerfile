# Stage 1: Build the backend
FROM node:14-alpine as backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

# Stage 2: Build the frontend
FROM node:20-alpine as frontend-builder  
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
ARG VUE_APP_API_BASE_URL  
ENV VUE_APP_API_BASE_URL=$VUE_APP_API_BASE_URL
RUN npm run build -- --mode production 

# Stage 3: Nginx setup
FROM nginx:alpine
# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Add the original nginx configuration file
COPY nginx/nginx.conf /etc/nginx/nginx.conf.template

# Copy static assets from builder stage
COPY --from=frontend-builder /app/dist/ /usr/share/nginx/html 

# Copy backend build and node_modules
COPY --from=backend-builder /app /usr/src/app

# At runtime, replace environment variables and then start Nginx
CMD envsubst '$$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'

