FROM debian:latest

RUN apt-get update && apt-get install -y gnupg2

COPY generate-key.sh /generate-key.sh
RUN chmod +x /generate-key.sh

CMD ["/generate-key.sh"]