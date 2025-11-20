# ============================================
# Stage 1: Build stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first (for better layer caching)
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/server/tsconfig.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/

# Install dependencies (this layer is cached unless package files change)
# Use npm ci without --only=production to install all dependencies (including dev deps for build)
RUN npm ci

# Copy source files (separate layer for better caching)
COPY packages/server/src ./packages/server/src
COPY packages/shared/src ./packages/shared/src

# Build shared package first (server depends on it)
WORKDIR /app/packages/shared
RUN npm run build

# Build server package
WORKDIR /app/packages/server
RUN npm run build

# ============================================
# Stage 2: Production stage
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files to maintain workspace structure
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Copy built artifacts (workspace linking will work with these)
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Install only production dependencies (workspace-aware)
# Workspaces are automatically handled by npm when package.json has workspaces field
RUN npm ci --only=production && \
    npm cache clean --force

# Expose port (default 3001, can be overridden via env)
EXPOSE 3001

# Set command to start server
WORKDIR /app/packages/server
CMD ["node", "dist/main.js"]

