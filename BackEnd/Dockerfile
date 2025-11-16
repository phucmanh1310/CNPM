# Multi-stage build for Node.js Backend
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start development server
CMD ["yarn", "dev"]

# Test stage
FROM base AS test
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install all dependencies (including dev dependencies for testing)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set test environment
ENV NODE_ENV=test

# Note: Tests require MongoDB connection
# This stage is meant to be run with docker-compose.test.yml
# which provides MongoDB service
CMD ["yarn", "test:ci"]

# Production build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Run any build steps if needed (linting, etc.)
RUN yarn lint

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start production server
CMD ["node", "index.js"]
