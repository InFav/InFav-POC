# Use the official Node.js image with a specific version of Node.js and Alpine Linux
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Copy the entire source code into the container
COPY . .

# Expose the application port
EXPOSE 8080

# Start the application using ts-node to run your TypeScript server
CMD ["ts-node", "server/server.ts"]
