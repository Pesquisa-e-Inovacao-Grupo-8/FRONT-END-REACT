#!/bin/sh
set -e

cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  VITE_ENV: "${VITE_ENV}",
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}"
};
EOF

exec nginx -g 'daemon off;'
