# Use the official Node.js image with a version that supports your application
FROM node:16-alpine

# Set working directory in the container
WORKDIR /app

# Copy both package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the API server will run on
EXPOSE 3000

# Command to run the Node.js server
CMD ["node", "server.js"]  # assuming your entry point is named server.js
