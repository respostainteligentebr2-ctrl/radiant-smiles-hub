#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <target-dir> [port]"
  echo "Example: $0 /var/www/camilaresende 34567"
  exit 1
fi

TARGET_DIR="$1"
PORT="${2:-34567}"
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$TARGET_DIR" = "/" ]; then
  echo "Error: target directory cannot be /. Choose a dedicated path like /var/www/camilaresende."
  exit 1
fi

echo "Deploying app to: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

rsync -a --exclude '.git' --exclude 'node_modules' --exclude 'dist' --exclude 'deploy.sh' --exclude 'DEPLOYMENT.md' "$CURRENT_DIR/" "$TARGET_DIR/"

cd "$TARGET_DIR"

echo "Installing dependencies..."
npm ci

echo "Running build..."
npm run build

echo ""
echo "Build complete. App files are in: $TARGET_DIR"
echo "Use a free local port such as: $PORT"
echo ""
echo "Next steps:"
echo "  1) Start the app from the target folder:"
echo "       npm run preview -- --host 127.0.0.1 --port $PORT"
echo "  2) Configure nginx to proxy camilaresende.com to http://127.0.0.1:$PORT"
echo "  3) Use DNS A record for camilaresende.com pointing to your VPS IP"
echo ""
echo "Example systemd service (edit TARGET_DIR and PORT):"
cat <<'EOF'
[Unit]
Description=Camila Resende app
After=network.target

[Service]
WorkingDirectory=TARGET_DIR
ExecStart=/usr/bin/env npm run preview -- --host 127.0.0.1 --port PORT
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=PORT

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "Example nginx server block (replace PORT):"
cat <<'EOF'
server {
  listen 80;
  server_name camilaresende.com www.camilaresende.com;

  location / {
    proxy_pass http://127.0.0.1:PORT;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
EOF
