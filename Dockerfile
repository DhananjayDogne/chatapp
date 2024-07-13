FROM node:18-alpine as BUILD_IMAGE
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json  ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

FROM node:18-alpine as PRODUCTION_IMAGE
WORKDIR /app

# Copy the built files and node_modules from the build stage
COPY --from=BUILD_IMAGE /app/dist/ /app/dist/
COPY --from=BUILD_IMAGE /app/node_modules/ /app/node_modules/

# Expose the port
EXPOSE 8080

# Copy necessary configuration files
COPY package.json .
COPY vite.config.js .

# Command to run the app
CMD ["npm", "run", "preview"]
