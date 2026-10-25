#!/bin/bash
set -euo pipefail
for name in APP_STORE_CONNECT_KEY_ID APP_STORE_CONNECT_ISSUER_ID APP_STORE_CONNECT_PRIVATE_KEY; do
  if [[ -z "${!name:-}" ]]; then echo "::error::Missing app-store environment secret: $name"; exit 1; fi
done
if [[ ! "$APP_STORE_CONNECT_KEY_ID" =~ ^[A-Za-z0-9]+$ ]]; then echo '::error::Invalid API Key ID'; exit 1; fi
umask 077
export API_PRIVATE_KEYS_DIR="$RUNNER_TEMP/app-store-keys"
mkdir -p "$API_PRIVATE_KEYS_DIR"
printf '%s\n' "$APP_STORE_CONNECT_PRIVATE_KEY" > "$API_PRIVATE_KEYS_DIR/AuthKey_${APP_STORE_CONNECT_KEY_ID}.p8"
IPA_FILES=("$RUNNER_TEMP"/ios-export/*.ipa)
if [[ ${#IPA_FILES[@]} -ne 1 || ! -f "${IPA_FILES[0]}" ]]; then echo '::error::Expected exactly one exported IPA'; exit 1; fi
xcrun altool --upload-app --type ios --file "${IPA_FILES[0]}" \
  --apiKey "$APP_STORE_CONNECT_KEY_ID" --apiIssuer "$APP_STORE_CONNECT_ISSUER_ID"
cat >> "$GITHUB_STEP_SUMMARY" <<'MD'
### Uploaded to App Store Connect
Apple still needs to process this build before it appears in TestFlight. Add testers in App Store Connect after processing. This workflow does not submit a public App Store release; choose the tested build and submit it for review in App Store Connect.
MD
