#!/bin/sh
# Builds the plugin zip for Customize -> Plugins -> Upload.
# The zip holds the contents of plugin/ at its top level, as the upload expects.
set -e
cd "$(dirname "$0")/.."
version=$(node -e 'console.log(require("./plugin/.claude-plugin/plugin.json").version)')
out="dist/mb4c-plugin-$version.zip"
mkdir -p dist
rm -f "$out"
(cd plugin && zip -qr "../$out" . -x '*.DS_Store')
echo "$out"
