#!/bin/sh
# Substitute environment variables in the nginx config file
envsubst '$$PORT' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Call original entrypoint (make sure this is executable)
exec nginx -g 'daemon off;'
