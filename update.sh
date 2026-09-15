#!/usr/bin/env bash
set -e

echo "========================================="
echo "  Aktualizace God's Eye View ze serveru  "
echo "========================================="

# Prechod do adresare skriptu
cd "$(dirname "$0")"

# Stazeni zmen z gitu
echo "[1/3] Stahuji nejnovejsi zmeny z GitHubu..."
git pull origin main

# Kontrola a instalace novych zavislosti
echo "[2/3] Kontrola zavislosti (npm ci)..."
PUPPETEER_SKIP_DOWNLOAD=true npm ci

# Restart procesu v PM2
echo "[3/3] Restartuji aplikaci v PM2..."
pm2 restart gods-eye-view

echo ""
echo "Hotovo! Nova verze je aktivni."
