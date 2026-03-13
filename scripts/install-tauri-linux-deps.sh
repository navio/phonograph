#!/usr/bin/env bash

set -euo pipefail

sudo apt-get update
sudo apt-get install -y \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf

webkit_package="libwebkit2gtk-4.1-dev"
if ! apt-cache show "$webkit_package" >/dev/null 2>&1; then
  webkit_package="libwebkit2gtk-4.0-dev"
fi

sudo apt-get install -y "$webkit_package"
echo "Installed desktop Linux dependencies including ${webkit_package}."
