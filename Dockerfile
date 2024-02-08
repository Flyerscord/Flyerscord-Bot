# Build typescript into javascript
FROM node:18 AS BUILDER

WORKDIR /usr/src/build

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

FROM node:18

# Set the timezone so that the logs are in the correct timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --production

COPY --from=BUILDER /usr/src/build/dist src/

CMD ["npm", "run", "start:prod"]
# CMD ["tail", "-f", "/dev/null"]