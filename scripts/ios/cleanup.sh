#!/bin/bash
set -uo pipefail
# Only delete files created by this job on the disposable GitHub runner.
if [[ -n "${IOS_PROFILE_UUID:-}" ]]; then
  rm -f "$HOME/Library/MobileDevice/Provisioning Profiles/$IOS_PROFILE_UUID.mobileprovision"
  rm -f "$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles/$IOS_PROFILE_UUID.mobileprovision"
fi
security delete-keychain "$RUNNER_TEMP/arcade-signing/signing.keychain-db" 2>/dev/null || true
rm -rf "$RUNNER_TEMP/arcade-signing" "$RUNNER_TEMP/app-store-keys"
