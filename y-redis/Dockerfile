# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Install glibc compatibility for alpine
# See more at https://wiki.alpinelinux.org/wiki/Running_glibc_programs
RUN apk add gcompat

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install any dependencies
RUN npm install

# Bundle your app source inside the Docker image
COPY . .

ENV REDIS='redis://localhost:6379'
ENV POSTGRES=''

# ENV DB_HOST=''
# ENV DB_NAME=''
# ENV DB_PORT=''
# ENV DB_USER=''
# ENV DB_PASS=''

# Make port 3002 available to the world outside this container,
# assuming your app runs on port 3002
EXPOSE 3002

# Removed CMD instruction to allow dynamic command execution at runtime
CMD ["npm", "run", "start:worker"]