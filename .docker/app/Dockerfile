# This dockerfile has multiple stages in order
# to optimize the build process time and reduce
# the final image size using pnpm.

# ============================
# ==== Dependencies stage ====
# ============================

FROM node:22-alpine as dependencies

    # Install pnpm
    RUN npm install -g pnpm

    WORKDIR /app

    COPY package.json .
    COPY pnpm-lock.yaml .

    # install build dependencies needed for native modules, if any
    # install project dependencies using pnpm
    RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 && \
        pnpm install --frozen-lockfile --ignore-scripts=false && \
        apk del .build-deps

# ======================
# ===== Build stage ====
# ======================

FROM node:22-alpine as builder

    # Install pnpm
    RUN npm install -g pnpm

    WORKDIR /app

    # copy source files
    COPY src ./src
    COPY tsconfig.json .

    # copy dependency definitions and installed modules from dependencies stage
    COPY --from=dependencies /app/package.json /app/pnpm-lock.yaml .
    # Instead of copying node_modules directly (less ideal with pnpm's store/linking),
    # copy the pnpm store content for potential caching, or simply rely on reinstalling
    # using the lockfile for consistency in this stage. For simplicity here, we reinstall.
    # If you have a complex setup needing the store cache, adjust accordingly.
    COPY --from=dependencies /app/node_modules ./node_modules


    # Re-link or ensure dependencies are available for build scripts
    # Often pnpm install might be run again here, or just rely on copied node_modules if sufficient
    # RUN pnpm install --frozen-lockfile # Uncomment if build scripts need specific linking/binaries setup

    # install plugin dependencies (using pnpm)
    RUN pnpm run install:plugins

    # build the project (using pnpm)
    RUN pnpm run build

# ========================
# ===== Prepare stage ====
# ========================

FROM node:22-alpine as prepare

    # Install pnpm
    RUN npm install -g pnpm

    WORKDIR /app

    # copy build artifacts from builder stage
    # COPY --from=builder /app/build /app/build
    # copy dependency definitions
    COPY --from=dependencies /app/package.json /app/pnpm-lock.yaml .
    COPY --from=dependencies /app/node_modules ./node_modules

    # install only production dependencies using pnpm
    RUN pnpm prune --prod

# =====================
# ===== Run stage =====
# =====================

FROM node:22-alpine as runner
    WORKDIR /app

    # Add compatibility library for native modules on Alpine
    RUN apk add --no-cache libc6-compat

    # set production mode
    ARG NODE_ENV=production
    ENV NODE_ENV $NODE_ENV

    # copy production dependencies and build artifacts from prepare stage
    COPY --from=builder /app/build ./build
    # Copy manifests and PRUNED production node_modules from prepare stage
    COPY --from=prepare /app/package.json ./package.json
    # COPY --from=prepare /app/pnpm-lock.yaml ./pnpm-lock.yaml # Optional
    COPY --from=prepare /app/node_modules ./node_modules

    # finally start the bot (using pnpm)
    CMD ["node", "build/main.js"]
