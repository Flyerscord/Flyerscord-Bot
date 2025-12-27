FROM node:24 AS dependencies

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

RUN pnpm install --frozen-lockfile

FROM node:24

# Set the timezone so that the logs are in the correct timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY --from=dependencies /usr/src/app/node_modules ./node_modules

COPY . .

CMD ["npm", "start"]
