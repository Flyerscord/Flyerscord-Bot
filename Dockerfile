# Stage 1: Install production dependencies
FROM node:24 AS prod-dependencies

WORKDIR /usr/src/app

RUN npm install -g pnpm

ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .husky .husky
RUN pnpm install --prod --frozen-lockfile

# Stage 2: Install all dependencies
FROM node:24 AS dependencies

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# Stage 3: Build the application
FROM node:24 AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# Stage 4: Final runtime image
FROM node:24

RUN npm install -g pnpm

# Set the timezone so that the logs are in the correct timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=prod-dependencies /usr/src/app/node_modules ./node_modules

COPY --from=builder /usr/src/app/dist ./dist

CMD ["pnpm", "start"]
