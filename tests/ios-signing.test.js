import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtemp, mkdir, readFile, writeFile, cp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

test('release profile validation rejects wrong teams, apps, expired profiles and other distribution types', () => {
  execFileSync('python3', ['-c', `
import importlib.util, datetime, copy
spec=importlib.util.spec_from_file_location('signing','scripts/ios/validate-profile.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
team='ABCDE12345'; bundle='com.dgrosher.annesarcade'
p={'TeamIdentifier':[team],'ApplicationIdentifierPrefix':[team],
'Entitlements':{'application-identifier':team+'.'+bundle,'get-task-allow':False},
'ExpirationDate':datetime.datetime(2099,1,1),'DeveloperCertificates':[b'test'],
'UUID':'12345678-1234-1234-1234-123456789ABC'}
assert m.validate(p,team,bundle)==p['UUID']
for change in [
 {'TeamIdentifier':['OTHER12345']},
 {'Entitlements':{'application-identifier':team+'.*'}},
 {'ExpirationDate':datetime.datetime(2000,1,1)},
 {'Entitlements':{'application-identifier':team+'.'+bundle,'get-task-allow':True}},
 {'ProvisionedDevices':['device']}, {'ProvisionsAllDevices':True},
 {'DeveloperCertificates':[]}, {'UUID':'../bad'},
]:
 bad=copy.deepcopy(p);bad.update(change)
 try:m.validate(bad,team,bundle)
 except ValueError:pass
 else:raise AssertionError('Accepted invalid profile: '+str(change.keys()))
# Older teams can have an App ID prefix distinct from the team identifier.
p['ApplicationIdentifierPrefix']=['PREFIX1234'];p['Entitlements']['application-identifier']='PREFIX1234.'+bundle
assert m.validate(p,team,bundle)
`]);
});

test('archive applies signing to the app configurations and exports with the selected profile', async () => {
  const dir=await mkdtemp(join(tmpdir(),'arcade-signing-test-'));
  try {
    await mkdir(join(dir,'bin'));
    await cp('ios/App/App.xcodeproj',join(dir,'ios/App/App.xcodeproj'),{recursive:true});
    await writeFile(join(dir,'bin/xcodebuild'),'#!/bin/bash\nprintf "%s\\n" "$*" >> "$RUNNER_TEMP/xcode-calls"\n',{mode:0o700});
    const env={...process.env,PATH:`${dir}/bin:${process.env.PATH}`,RUNNER_TEMP:dir,
      APP_VERSION:'1.0.0',BUILD_NUMBER:'42.1',IOS_TEAM_ID:'ABCDE12345',
      IOS_BUNDLE_ID:'com.dgrosher.annesarcade',IOS_SIGNING_IDENTITY:'A'.repeat(40),
      IOS_PROFILE_UUID:'12345678-1234-1234-1234-123456789ABC'};
    execFileSync('bash',[resolve('scripts/ios/archive.sh')],{cwd:dir,env});
    const project=await readFile(join(dir,'ios/App/App.xcodeproj/project.pbxproj'),'utf8');
    assert.equal([...project.matchAll(/CODE_SIGN_STYLE = Manual;/g)].length,2);
    assert.equal([...project.matchAll(/PROVISIONING_PROFILE_SPECIFIER = /g)].length,2);
    const calls=await readFile(join(dir,'xcode-calls'),'utf8');
    assert.match(calls,/CURRENT_PROJECT_VERSION=42.1 archive/);
    assert.doesNotMatch(calls,/PROVISIONING_PROFILE_SPECIFIER=/);
    const options=JSON.parse(execFileSync('python3',['-c',
      'import json,plistlib,sys;print(json.dumps(plistlib.load(open(sys.argv[1],"rb"))))',
      join(dir,'ExportOptions.plist')],{encoding:'utf8'}));
    assert.equal(options.method,'app-store-connect');
    assert.equal(options.provisioningProfiles[env.IOS_BUNDLE_ID],env.IOS_PROFILE_UUID);
    assert.equal(options.manageAppVersionAndBuildNumber,false);
    const bad=spawnSync('bash',[resolve('scripts/ios/archive.sh')],{cwd:dir,env:{...env,BUILD_NUMBER:'invalid;command'}});
    assert.notEqual(bad.status,0);
    assert.match(bad.stderr.toString(),/BUILD_NUMBER must contain/);
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('signing and upload fail clearly before using absent credentials', () => {
  const signing=spawnSync('bash',['scripts/ios/import-signing.sh'],{env:{...process.env,IOS_DISTRIBUTION_P12_BASE64:''}});
  assert.notEqual(signing.status,0);
  assert.match(signing.stdout.toString(),/Missing app-store environment secret: IOS_DISTRIBUTION_P12_BASE64/);
  const upload=spawnSync('bash',['scripts/ios/upload.sh'],{env:{...process.env,APP_STORE_CONNECT_KEY_ID:''}});
  assert.notEqual(upload.status,0);
  assert.match(upload.stdout.toString(),/Missing app-store environment secret: APP_STORE_CONNECT_KEY_ID/);
});
