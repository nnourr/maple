# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and public directory
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine as production

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./dist/public

# Expose port
EXPOSE 5173

# Start serve
CMD ["serve", "-s", "dist", "-p", "5173"]