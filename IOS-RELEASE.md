# Build, sign, and release Anne’s Arcade using GitHub

No personal Mac is required. GitHub’s macOS runner compiles and signs the app. You use Apple’s and GitHub’s websites, and optionally a GitHub Codespace terminal to generate signing files.

The app source and workflow are on **gh-pages**, while the repository’s default branch is **main**. The workflow builds a tested, fixed commit from gh-pages. It runs an unsigned simulator build after relevant pushes, and uploads a signed build **only when you manually select testflight**. It never submits a public App Store release automatically.

## 1. Enable the workflow’s Run workflow button (one time)

GitHub requires a manually dispatched workflow to exist on the repository’s **default branch**. This repository currently defaults to main; the full arcade is on gh-pages.

1. Open [the workflow on gh-pages](https://github.com/dgrosher/AnnesGameWebsite/blob/gh-pages/.github/workflows/ios.yml) and copy its raw contents.
2. Open [the repository on main](https://github.com/dgrosher/AnnesGameWebsite/tree/main). Choose **Add file → Create new file**.
3. Name it `.github/workflows/ios.yml`, paste the exact workflow contents, and commit it to main (or open and merge a pull request if main is protected). This adds only the workflow to main; you do not need to replace main with the whole arcade.
4. Open **Actions → iOS build and TestFlight → Run workflow**. Leave branch **main** selected and destination **simulator**. Run it.
5. Both **tests** and **simulator** should turn green. Download the `AnnesArcade-simulator` artifact if desired. This is for an Apple simulator, not installation on an iPhone. No Apple account or secrets are required for this check.

If Actions is disabled, enable it under repository **Settings → Actions → General**. Public-repository standard hosted runners are generally free; private repositories have plan-dependent included minutes and macOS usage costs. Check your account’s Actions billing before running many builds.

Keep the copy on main updated if you later change `.github/workflows/ios.yml` on gh-pages. The workflow explicitly selects Xcode 26.3 on macos-15; update `DEVELOPER_DIR` in both jobs if GitHub retires that installation.

## 2. Enroll with Apple and create the app identity

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/enroll/). This is a paid membership; check Apple’s current local price. Accept any agreements Apple requests.
2. In [Apple Developer → Membership details](https://developer.apple.com/account), find your **Team ID**, a 10-character identifier. Save it for GitHub Secrets.
3. Open **Certificates, Identifiers & Profiles → Identifiers → + → App IDs → App**.
4. Description: `Anne's Arcade`. Use the **explicit** Bundle ID `com.dgrosher.annesarcade`. No extra capabilities are needed. Register it. If that ID is unavailable, choose your own ID, update `appId` in `capacitor.config.json` and both `PRODUCT_BUNDLE_IDENTIFIER` entries in the Xcode project on gh-pages, then use that ID everywhere below.
5. Open [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps → + → New App**. Select iOS, your language, your app name (subject to availability), and that Bundle ID. Choose an internal SKU such as `annes-arcade-ios-001`. Create the app. A different SKU does not change the bundle ID.

An Account Holder/Admin may need to perform these steps or grant appropriate access. Resolve pending agreements in App Store Connect if uploads are blocked.

## 3. Create an Apple Distribution certificate without a Mac

If you already have a valid **Apple Distribution certificate exported with its matching private key as a .p12**, skip to step 4. A `.cer` alone cannot sign an app.

Otherwise use a private local terminal with OpenSSL, or create a **GitHub Codespace** from this repository (Code → Codespaces → create). Codespaces has separate usage quotas/billing. In its Linux terminal:

```sh
mkdir -m 700 -p /tmp/annes-signing
cd /tmp/annes-signing
openssl genrsa -aes256 -out distribution-private-key.pem 2048
openssl req -new -sha256 -key distribution-private-key.pem \
  -out CertificateSigningRequest.certSigningRequest
```

OpenSSL asks you to set a private-key password, then asks for it again to create the CSR. Use your own identifying information for the CSR prompts; leave the challenge password blank. Keep the private key and password private. Do not put signing files in the repository or this chat.

1. Download **only** `CertificateSigningRequest.certSigningRequest` from the Codespace if needed. Files in `/tmp` can be opened using File → Open Folder → `/tmp/annes-signing`, then downloaded from the Explorer.
2. In Apple Developer → **Certificates → +**, choose **Apple Distribution**. Upload the CSR and download the resulting certificate, normally `distribution.cer`.
3. Upload the `.cer` into `/tmp/annes-signing` in that same Codespace, preserving the filename used below. Keep the same private key generated above.
4. Run:

```sh
cd /tmp/annes-signing
openssl x509 -inform DER -in distribution.cer -out distribution-certificate.pem
openssl pkcs12 -export \
  -inkey distribution-private-key.pem -in distribution-certificate.pem \
  -out distribution.p12 -name "Anne's Arcade Distribution"
```

You will enter the private-key password, then choose an **export password for the P12**. The P12 export password is the password GitHub needs. Use a nonempty password.

Retain a secure backup of the .p12 and its export password. Apple cannot recreate the private key from the certificate. Avoid revoking other apps’ distribution certificates if Apple reports a certificate limit.

## 4. Create the App Store provisioning profile

1. Apple Developer → **Profiles → +**.
2. Under Distribution, select **App Store Connect** (older interfaces may call it App Store).
3. Select the exact Anne’s Arcade App ID.
4. Select the Apple Distribution certificate from step 3.
5. Name the profile `Annes Arcade App Store`, generate it, and download the `.mobileprovision` file.
6. Put it beside `distribution.p12` in the Codespace as `AnnesArcade.mobileprovision` if using the commands below.

This is not an iOS App Development, Ad Hoc, or Enterprise profile. Renew the profile/certificate and replace the GitHub secrets when they expire. The workflow checks the profile’s team, bundle ID, expiration, distribution type, and matching signing identity before building.

## 5. Create an App Store Connect API key

1. App Store Connect → **Users and Access → Integrations → App Store Connect API → Team Keys**. The Account Holder may first need to request API access.
2. Generate a **team API key**, name it `GitHub Anne's Arcade`, and choose **App Manager** access.
3. Record the **Issuer ID** and **Key ID**. Download the `.p8` private key immediately; Apple permits downloading it once.

This API key authenticates uploads. It does not replace the distribution certificate and provisioning profile used to sign the app. Keep it out of source control and this chat.

## 6. Add the GitHub environment and secrets

Open repository **Settings → Environments → New environment**. Name it exactly **app-store**. Add these **environment secrets**:

| Secret | Value |
|---|---|
| `APPLE_TEAM_ID` | Your 10-character Developer Team ID |
| `IOS_DISTRIBUTION_P12_BASE64` | Base64-encoded contents of `distribution.p12` |
| `IOS_DISTRIBUTION_P12_PASSWORD` | The P12 export password |
| `IOS_PROVISION_PROFILE_BASE64` | Base64-encoded contents of the `.mobileprovision` file |
| `APP_STORE_CONNECT_KEY_ID` | API Key ID from step 5 |
| `APP_STORE_CONNECT_ISSUER_ID` | API Issuer ID from step 5 |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Complete text of the .p8 file, including BEGIN/END lines and real newlines |

To produce the two Base64 values in a Linux Codespace:

```sh
cd /tmp/annes-signing
base64 -w 0 distribution.p12 > distribution.p12.base64
base64 -w 0 AnnesArcade.mobileprovision > profile.base64
```

Copy each resulting file’s full contents into its matching GitHub secret. Do not paste these values into Actions logs. If GitHub CLI is authenticated in your Codespace, you can instead send them directly without displaying them:

```sh
gh secret set IOS_DISTRIBUTION_P12_BASE64 --env app-store \
  --repo dgrosher/AnnesGameWebsite < distribution.p12.base64
gh secret set IOS_PROVISION_PROFILE_BASE64 --env app-store \
  --repo dgrosher/AnnesGameWebsite < profile.base64
```

If you configure environment deployment-branch restrictions, allow **main**, because manual runs start from main even though they check out arcade source from gh-pages. Required reviewers are optional. Once secrets are installed and securely backed up, delete the Codespace containing signing files. Do not upload signing files as GitHub artifacts. The workflow removes temporary credentials from its disposable runner after each release job.

## 7. Build and upload to TestFlight

1. Repository → **Actions → iOS build and TestFlight → Run workflow**.
2. Branch: **main**. Destination: **testflight**. Version: **1.0.0** for the first release.
3. Leave build number blank on initial use. It defaults to GitHub’s run number plus attempt (for example `8.1`). Each uploaded build number must increase for the same version. Re-running an older run can produce a lower number than newer uploads, so start a new workflow run instead. If you have uploaded builds another way, enter a higher build number explicitly.
4. Start it. Watch **tests → testflight**. A missing-secret error names the missing secret without printing its value.
5. After a successful upload, open App Store Connect → your app → **TestFlight → iOS**. Apple processing may take some time. An upload success does not mean processing or review has finished. If needed, check Apple’s processing email for errors.
6. Resolve compliance questions, provide test information, and create an **internal testing group**. Add your App Store Connect user as an internal tester, select the build, then accept the invitation in Apple’s TestFlight app on your iPhone.
7. For family members who are not App Store Connect users, create an **external testing group** and invite them by email. Complete the beta test information and submit for Beta App Review when Apple requests it. External testing can require Apple review even though internal testing is available sooner.

The workflow also saves the signed IPA as a short-lived GitHub artifact. Downloading an App Store IPA does not make it directly installable on your phone; use TestFlight. No UDID registration is required for TestFlight testers.

Test all games on real devices: offline cold launch, narration, controls in both orientations, app switching, small screens and iPad. An unsigned simulator build alone does not verify these.

## 8. Submit the tested build to the App Store

In App Store Connect:

1. Open the app’s iOS version; create version **1.0.0** if necessary and select the tested build matching that version.
2. Fill in name, subtitle, description, keywords, category, copyright, content rights, age-rating questionnaire, availability and price. No payment collection is implemented in this app. If you select Apple’s Kids Category, check and meet its additional requirements before submission.
3. Upload real app screenshots for the device sizes App Store Connect currently requests, including iPad because this app supports it. You can capture these on your devices; GitHub’s build artifact does not supply screenshots.
4. Support URL: `https://dgrosher.github.io/AnnesGameWebsite/support.html`. Verify GitHub Issues is enabled for support or replace this page with your preferred adult support contact.
5. Privacy policy URL: `https://dgrosher.github.io/AnnesGameWebsite/privacy-ios.html`. Confirm both pages load publicly after Pages deploys. This policy describes the app, separately from website analytics.
6. Complete App Privacy based on the app you actually ship. The current bundled app disables Umami and remote fonts, has no accounts, ads or purchase code, and keeps preferences/scores on-device. Review all SDKs and your final behavior before declaring data collection; update answers if you change them.
7. Complete export compliance. The project currently declares no non-exempt encryption; revisit that answer if you add encryption functionality requiring a different declaration.
8. In App Review Information, provide your adult contact details and explain: “Anne’s Arcade is a collection of 27 locally bundled games and learning activities. No login is required. Games work offline; read-aloud voice availability depends on the device’s installed speech voices.” Reviewers need no demo account.
9. Review game names and artwork rights before a public submission. Current titles include **UNO** and **Space Invaders**; use branding you have rights to use or rename/redesign those titles appropriately. The other original adaptations should also be reviewed for rights. Apple may request additional changes or native functionality during review.
10. Choose **manual release** if you want control over when an approved app becomes public. Add the version for review and submit it. Apple review and approval remain separate from TestFlight upload.

For future updates: change shared game code on gh-pages, verify the simulator workflow, manually upload a higher build number, test in TestFlight, then submit a new App Store version when ready. Installed apps receive changes through Apple’s distribution process; website deployments alone do not update them.

## Troubleshooting

- **No Run workflow button:** copy the workflow onto main as described in step 1 and confirm Actions is enabled.
- **Missing secret:** add it to environment `app-store`, not to a different environment.
- **Certificate/profile mismatch:** regenerate the profile with the same certificate whose private key is in the P12. A newly downloaded `.cer` does not recreate a lost key.
- **P12 import password error:** use the export password, not your Apple password or the earlier PEM key password.
- **Unknown certificate authority:** update the macOS/Xcode runner or install Apple’s current Worldwide Developer Relations intermediate certificate from Apple’s official certificate authority page. Never disable certificate validation.
- **Bundle identifier not found / upload forbidden:** check that the app record, registered App ID, profile, API key’s team and configured bundle ID all refer to the same app/team.
- **Build number already used:** start a new run or explicitly enter a higher build number.
- **Key/API authorization error:** use the team Key ID and Issuer ID, verify App Manager access and the complete unmodified `.p8` text, and check pending Apple agreements.
- **Xcode installation missing:** consult GitHub’s macos-15 runner image software list and update `DEVELOPER_DIR` in both workflow copies to a supported Xcode 26+ installation.
