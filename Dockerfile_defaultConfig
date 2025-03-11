# Build the production image
FROM node:18

ENV ENVIRONMENT=docker

# Set the timezone so that the logs are in the correct timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY . .

RUN npm install --frozen-lockfile

CMD ["npm", "run", "generate-config"]