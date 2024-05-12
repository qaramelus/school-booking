# Use a base image that is compatible with your architecture (ARM for M1)
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port and start application
EXPOSE 5000
CMD ["npm", "start"]
