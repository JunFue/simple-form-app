# Stage 1: Use an official Node.js runtime as the base image.
# We're using a specific version (node:18) for consistency. 'alpine' is a lightweight version of Linux.
FROM node:18-alpine

# Set the working directory inside the container to /app
# All subsequent commands will be run from this directory.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
# The '*' is a wildcard to grab both files. We copy these first to leverage Docker's layer caching.
# The 'npm install' step will only be re-run if these files change.
COPY package*.json ./

# Install the application's dependencies inside the container.
RUN npm install

# Copy the rest of the application's source code into the working directory.
# The '.' means copy everything from the current local directory to the container's WORKDIR (/app).
COPY . .

# Expose port 5000. This informs Docker that the application inside the container
# will listen on this port. We'll map this to a port on our local machine when we run it.
EXPOSE 5000

# Define the command to run the application.
# This is what starts our Express server when the container starts.
CMD [ "node", "server.js" ]

