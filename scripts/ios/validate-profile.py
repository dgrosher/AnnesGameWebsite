"""Validate an App Store profile without logging its contents or credentials."""
import datetime
import json
import os
import plistlib
import re
from pathlib import Path


def validate(profile, team, bundle, now=None):
    if not re.fullmatch(r'[A-Z0-9]{10}', team):
        raise ValueError('APPLE_TEAM_ID must be your 10-character Apple Developer Team ID.')
    if team not in profile.get('TeamIdentifier', []):
        raise ValueError('The provisioning profile belongs to a different Apple team.')
    entitlements = profile.get('Entitlements', {})
    prefixes = profile.get('ApplicationIdentifierPrefix', [team])
    if entitlements.get('application-identifier') not in [f'{prefix}.{bundle}' for prefix in prefixes]:
        raise ValueError('The profile must match the exact app bundle ID; wildcard profiles are not supported.')
    expiry = profile.get('ExpirationDate')
    if expiry is None or expiry.replace(tzinfo=datetime.timezone.utc) <= (now or datetime.datetime.now(datetime.timezone.utc)):
        raise ValueError('The provisioning profile has expired or has no expiration date.')
    if entitlements.get('get-task-allow') or profile.get('ProvisionedDevices') is not None or profile.get('ProvisionsAllDevices'):
        raise ValueError('Use an App Store Connect distribution profile, not development, Ad Hoc, or Enterprise.')
    if not profile.get('DeveloperCertificates'):
        raise ValueError('The profile contains no distribution certificate.')
    uuid = profile.get('UUID', '')
    if not re.fullmatch(r'[0-9A-Fa-f-]{36}', uuid):
        raise ValueError('The profile has an invalid UUID.')
    return uuid


if __name__ == '__main__':
    signing = Path(os.environ['SIGNING_DIR'])
    profile = plistlib.loads((signing/'profile.plist').read_bytes())
    bundle = json.loads(Path('capacitor.config.json').read_text())['appId']
    team = os.environ['APPLE_TEAM_ID']
    uuid = validate(profile, team, bundle)
    installed = Path.home()/'Library/MobileDevice/Provisioning Profiles'/f'{uuid}.mobileprovision'
    installed.parent.mkdir(parents=True, exist_ok=True)
    installed.write_bytes((signing/'profile.mobileprovision').read_bytes())
    # Xcode 16+ also uses the newer provisioning profile directory.
    modern = Path.home()/'Library/Developer/Xcode/UserData/Provisioning Profiles'/installed.name
    modern.parent.mkdir(parents=True, exist_ok=True)
    modern.write_bytes(installed.read_bytes())
    with open(os.environ['GITHUB_ENV'], 'a') as output:
        output.write(f'IOS_TEAM_ID={team}\nIOS_BUNDLE_ID={bundle}\nIOS_PROFILE_UUID={uuid}\n')
    print('Validated matching, unexpired App Store distribution profile.')
