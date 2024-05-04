# Use the official Node.js 16 image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache build-base musl

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the API server will run on
EXPOSE 3000

# Command to run the Node.js server
CMD ["node", "server.js"]
