# Use the official Node.js image as a base
FROM node:20-alpine as build-stage

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build Vue.js application
RUN npm run build

# Use Nginx as a lightweight server for the production build
FROM nginx:alpine

# Copy the built Vue.js application from the build-stage container to the Nginx server
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
