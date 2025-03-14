FROM debian:latest

RUN apt-get update && apt-get install -y gnupg2 sops

# Set GPG directory
ENV GNUPGHOME /root/.gnupg
RUN mkdir -p "$GNUPGHOME" && chmod 700 "$GNUPGHOME"

COPY ./keys/gpg-public-key.asc /root/gpg-public-key.asc

RUN gpg --import /root/gpg-public-key.asc

RUN sops --encrypt --pgp $(gpg --list-keys --with-colons | awk -F: '/^pub/{print $5}') /config/local.config.ts > /config/local.config.enc.ts

CMD ["cat", "/config/local.config.enc.ts"]