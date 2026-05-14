# Use an official Node runtime as a base image
FROM node:22.14.0

# Set working directory
WORKDIR /project

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN yarn install

# Copy the application code to the container
COPY . .

# Expose the port that the app will run on
EXPOSE 4700

# Define the command to run your app
CMD ["yarn", "start"]