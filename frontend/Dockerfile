# Build stage
FROM node:20-alpine as build-stage

# Set working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build Vue.js application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built Vue.js application from the build-stage to the Nginx server
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 for the service
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
