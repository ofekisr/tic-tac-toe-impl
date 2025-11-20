# Docker Build Context Optimization

## Problem

When using the project root as Docker build context, Docker sends the entire directory to the Docker daemon, which can be slow and inefficient for large monorepos.

## Strategies to Minimize Build Context

### 1. Comprehensive `.dockerignore` (Primary Strategy)

The `.dockerignore` file tells Docker which files to **exclude** from the build context. This is the most important optimization.

**What we exclude:**
- `node_modules/` - Dependencies (installed in container)
- `**/dist` - Build artifacts (built in container)
- `docs/` - Documentation (not needed in container)
- `packages/client` and `packages/mock-server` - Unused packages
- Test files, coverage reports, IDE files, etc.

**Impact:** Reduces build context from ~94MB to only essential source files.

### 2. Multi-Stage Builds

Separate build and runtime stages:
- **Builder stage**: Installs dev dependencies, compiles TypeScript
- **Production stage**: Only copies built artifacts and production dependencies

**Benefits:**
- Smaller final image (no dev dependencies)
- Better layer caching
- Faster builds (only rebuilds changed layers)

### 3. Layer Ordering for Caching

Copy files in order of change frequency:
1. Package files (rarely change) → Install dependencies
2. Source files (change frequently) → Build

This maximizes Docker layer cache hits.

### 4. Selective File Copying

Only copy what's needed:
```dockerfile
# Good: Copy only package files first
COPY package.json ./
COPY packages/server/package.json ./packages/server/

# Bad: Copy entire directory
COPY . .
```

### 5. Use BuildKit (Advanced)

Enable Docker BuildKit for better caching:
```bash
DOCKER_BUILDKIT=1 docker-compose build
```

**Benefits:**
- Parallel builds
- Better cache management
- Mount cache for node_modules

## Current Implementation

### `.dockerignore` Excludes:
- All `node_modules/` directories
- Build artifacts (`dist/`, `*.tsbuildinfo`)
- Documentation (`docs/`, `*.md`)
- Unused packages (`packages/client`, `packages/mock-server`)
- Test files, IDE files, logs

### Multi-Stage Dockerfile:
1. **Builder stage**: Installs all dependencies, builds TypeScript
2. **Production stage**: Only production dependencies + built files

### Estimated Build Context Size:
- **Without `.dockerignore`**: ~94MB (entire project)
- **With `.dockerignore`**: ~2-5MB (only source files)

## Verification

Check what Docker will send:
```bash
# See what files would be included
tar --exclude-from=.dockerignore -czf - . | wc -c

# Or use Docker's context size
docker build --progress=plain -t test . 2>&1 | grep "Sending build context"
```

## Best Practices

1. ✅ **Always use `.dockerignore`** - Exclude everything not needed
2. ✅ **Use multi-stage builds** - Separate build and runtime
3. ✅ **Copy selectively** - Don't use `COPY . .` unless necessary
4. ✅ **Order layers by change frequency** - Package files before source
5. ✅ **Exclude test files** - Not needed in production image
6. ✅ **Exclude documentation** - Not needed in container
7. ✅ **Exclude unused packages** - Only include what's needed

## Alternative: Separate Build Contexts

If the project grows very large, consider:
- Building shared package separately
- Publishing shared package to npm registry
- Using it as a dependency instead of workspace

But for this project size (~94MB), the current approach is optimal.

