#!/bin/sh
# Cleanup old view statistics

if [ -n "$CRON_SECRET" ]; then
  curl -s -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/cleanup-views"
else
  curl -s "$APP_URL/api/cron/cleanup-views"
fi
