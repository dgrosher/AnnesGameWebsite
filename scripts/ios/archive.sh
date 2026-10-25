#!/bin/bash
set -euo pipefail
python3 - <<'PY'
import os,plistlib,re
from pathlib import Path
for name in ['APP_VERSION','BUILD_NUMBER']:
    if not re.fullmatch(r'[0-9]+(?:\.[0-9]+){0,2}',os.environ.get(name,'')):
        raise SystemExit(f'{name} must contain one to three numeric components.')
options={
 'method':'app-store-connect', 'destination':'export', 'teamID':os.environ['IOS_TEAM_ID'],
 'signingStyle':'manual', 'signingCertificate':os.environ['IOS_SIGNING_IDENTITY'],
 'provisioningProfiles':{os.environ['IOS_BUNDLE_ID']:os.environ['IOS_PROFILE_UUID']},
 'manageAppVersionAndBuildNumber':False, 'uploadSymbols':True,
}
Path(os.environ['RUNNER_TEMP'],'ExportOptions.plist').write_bytes(plistlib.dumps(options))
# Apply signing only to app targets, not Swift package dependencies.
project=Path('ios/App/App.xcodeproj/project.pbxproj')
source=project.read_text()
settings=('CODE_SIGN_STYLE = Manual;\n'
          f'\t\t\t\tDEVELOPMENT_TEAM = {os.environ["IOS_TEAM_ID"]};\n'
          f'\t\t\t\tCODE_SIGN_IDENTITY = {os.environ["IOS_SIGNING_IDENTITY"]};\n'
          f'\t\t\t\tPROVISIONING_PROFILE_SPECIFIER = {os.environ["IOS_PROFILE_UUID"]};')
if source.count('CODE_SIGN_STYLE = Automatic;') != 2:
    raise SystemExit('Expected two app signing configurations; review the Xcode project.')
source=source.replace('CODE_SIGN_STYLE = Automatic;',settings)
source=re.sub(r'PRODUCT_BUNDLE_IDENTIFIER = [^;]+;',f'PRODUCT_BUNDLE_IDENTIFIER = {os.environ["IOS_BUNDLE_ID"]};',source)
project.write_text(source)
PY
xcodebuild -version
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$RUNNER_TEMP/AnnesArcade.xcarchive" \
  MARKETING_VERSION="$APP_VERSION" CURRENT_PROJECT_VERSION="$BUILD_NUMBER" archive
xcodebuild -exportArchive -archivePath "$RUNNER_TEMP/AnnesArcade.xcarchive" \
  -exportOptionsPlist "$RUNNER_TEMP/ExportOptions.plist" -exportPath "$RUNNER_TEMP/ios-export"
