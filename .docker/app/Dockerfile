# This dockerfile has multiple stages in order
# to optimize the build process time and reduce 
# the final image size.

# ============================
# ==== Dependencies stage ====
# ============================

FROM node:22-alpine as dependencies

    WORKDIR /app

    COPY package.json .
    COPY pnpm-lock.yaml .

    # install deps
    RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 && \
    npm install -g pnpm && pnpm install --frozen-lockfile && \
        apk del .build-deps

# ======================
# ===== Build stage ====
# ======================

FROM node:22-alpine as builder

    WORKDIR /app

    # copy source files
    COPY src ./src
    COPY tsconfig.json .

    # copy build files from dependencies stage
    COPY --from=dependencies /app/package.json .
    COPY --from=dependencies /app/pnpm-lock.yaml .
    COPY --from=dependencies /app/node_modules /app/node_modules

    # Install pnpm globally in this stage as well
    RUN npm install -g pnpm

    # install plugin dependencies
    # RUN pnpm run install:plugins

    # build the project
    RUN pnpm run build

# ========================
# ===== Prepare stage ====
# ========================

FROM node:22-alpine as prepare

    WORKDIR /app

    # copy build files from builder stage
    COPY --from=builder /app/build /app/build
    COPY --from=builder /app/package.json .
    COPY --from=builder /app/pnpm-lock.yaml .
    COPY --from=builder /app/node_modules /app/node_modules

    # Install pnpm globally in this stage as well
    RUN npm install -g pnpm

    # purge dev dependencies
    RUN pnpm prune --prod

# =====================
# ===== Run stage =====
# =====================

FROM node:22-alpine as runner

    WORKDIR /app

    # set production mode
    ARG NODE_ENV=production
    ENV NODE_ENV $NODE_ENV

    # copy build files from prepare stage
    COPY --from=prepare /app/build /app/build
    COPY --from=prepare /app/package.json .
    COPY --from=prepare /app/pnpm-lock.yaml .
    COPY --from=prepare /app/node_modules /app/node_modules

    # Install pnpm globally in this stage as well
    RUN npm install -g pnpm

    # finaly start the bot
    CMD ["pnpm", "run", "start"]