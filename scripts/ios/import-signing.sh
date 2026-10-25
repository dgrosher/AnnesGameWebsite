#!/bin/bash
set -euo pipefail
for name in IOS_DISTRIBUTION_P12_BASE64 IOS_DISTRIBUTION_P12_PASSWORD IOS_PROVISION_PROFILE_BASE64 APPLE_TEAM_ID; do
  if [[ -z "${!name:-}" ]]; then echo "::error::Missing app-store environment secret: $name"; exit 1; fi
done
umask 077
SIGNING_DIR="$RUNNER_TEMP/arcade-signing"
mkdir -p "$SIGNING_DIR"
export SIGNING_DIR
python3 - <<'PY'
import os, base64
from pathlib import Path
p=Path(os.environ['SIGNING_DIR'])
for key, filename in [('IOS_DISTRIBUTION_P12_BASE64','distribution.p12'),('IOS_PROVISION_PROFILE_BASE64','profile.mobileprovision')]:
    (p/filename).write_bytes(base64.b64decode(''.join(os.environ[key].split()), validate=True))
PY
security cms -D -i "$SIGNING_DIR/profile.mobileprovision" > "$SIGNING_DIR/profile.plist"
python3 scripts/ios/validate-profile.py
KEYCHAIN_PASSWORD=$(openssl rand -hex 32)
security create-keychain -p "$KEYCHAIN_PASSWORD" "$SIGNING_DIR/signing.keychain-db"
security set-keychain-settings -lut 21600 "$SIGNING_DIR/signing.keychain-db"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$SIGNING_DIR/signing.keychain-db"
security import "$SIGNING_DIR/distribution.p12" -P "$IOS_DISTRIBUTION_P12_PASSWORD" -A -t cert -f pkcs12 -k "$SIGNING_DIR/signing.keychain-db"
security set-key-partition-list -S apple-tool:,apple:,codesign: -k "$KEYCHAIN_PASSWORD" "$SIGNING_DIR/signing.keychain-db" >/dev/null
security list-keychains -d user -s "$SIGNING_DIR/signing.keychain-db" "$HOME/Library/Keychains/login.keychain-db"
python3 - <<'PY'
import hashlib,os,plistlib,subprocess
from pathlib import Path
p=Path(os.environ['SIGNING_DIR'])
profile=plistlib.loads((p/'profile.plist').read_bytes())
identities=subprocess.check_output(['security','find-identity','-v','-p','codesigning',str(p/'signing.keychain-db')],text=True)
matching=[hashlib.sha1(cert).hexdigest().upper() for cert in profile['DeveloperCertificates'] if hashlib.sha1(cert).hexdigest().upper() in identities]
if not matching: raise SystemExit('No valid signing identity matches the provisioning profile. Export the matching Apple Distribution certificate WITH its private key.')
with open(os.environ['GITHUB_ENV'],'a') as f: f.write(f'IOS_SIGNING_IDENTITY={matching[0]}\n')
PY
