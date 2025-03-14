FROM debian:latest as decrypt-stage

RUN apt-get update && apt-get install -y gnupg2 sops

# Set up GPG environment
ENV GNUPGHOME /root/.gnupg
RUN mkdir -p "$GNUPGHOME" && chmod 700 "$GNUPGHOME"

COPY ./keys/gpg-private-key.asc /root/gpg-private-key.asc
RUN gpg --import /root/gpg-private-key.asc
RUN rm -f /root/gpg-private-key.asc

COPY src/common/config/local.config.enc.ts /app/local.config.enc.ts

RUN sops --decrypt /app/local.config.enc.ts > /app/local.config.ts

FROM node:18

# Set the timezone so that the logs are in the correct timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY . .

COPY --from=decrypt-stage /app/local.config.ts /usr/src/app/src/common/config/local.config.ts

RUN npm install --frozen-lockfile

CMD ["npm", "start"]
# CMD ["tail", "-f", "/dev/null"]