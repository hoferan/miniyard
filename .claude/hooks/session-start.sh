#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

npm install

# Wire up the pre-installed Playwright browser at /opt/pw-browsers.
# The container ships chromium-1194 but @playwright/test expects revision 1228,
# so we create a bridge directory with the expected naming convention.
if [ -d /opt/pw-browsers/chromium_headless_shell-1194 ] && [ ! -f /opt/pw-browsers/chromium_headless_shell-1228/INSTALLATION_COMPLETE ]; then
  mkdir -p /opt/pw-browsers/chromium_headless_shell-1228/chrome-headless-shell-linux64
  ln -sf /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
    /opt/pw-browsers/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
  for f in libvk_swiftshader.so vk_swiftshader_icd.json libvulkan.so.1 libGLESv2.so libEGL.so v8_context_snapshot.bin; do
    [ -f /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/$f ] && \
      ln -sf /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/$f \
        /opt/pw-browsers/chromium_headless_shell-1228/chrome-headless-shell-linux64/$f || true
  done
  touch /opt/pw-browsers/chromium_headless_shell-1228/INSTALLATION_COMPLETE \
        /opt/pw-browsers/chromium_headless_shell-1228/DEPENDENCIES_VALIDATED
fi

# Export PLAYWRIGHT_BROWSERS_PATH so all commands in this session use the pre-installed browser.
echo 'export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers' >> "$CLAUDE_ENV_FILE"
