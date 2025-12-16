FROM alpine:latest

RUN apk add --no-cache curl

COPY cleanup.sh /etc/periodic/daily/cleanup-views
RUN chmod +x /etc/periodic/daily/cleanup-views

CMD ["crond", "-f", "-l", "2"]
