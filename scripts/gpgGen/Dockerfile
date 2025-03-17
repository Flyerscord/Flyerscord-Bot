FROM debian:latest

RUN apt-get update && apt-get install -y gnupg2

COPY scripts/gpgGen/generate-key.sh /generate-key.sh
RUN chmod +x /generate-key.sh

RUN mkdir -p /keys
VOLUME /keys

CMD ["/generate-key.sh"]