# Anne’s Arcade for iPhone and iPad

The Capacitor app bundles all 27 games, artwork, and game code locally. It works without loading the GitHub Pages website. The website remains independently deployable. Future game changes go into the shared `src/` files, then are copied into the app with `npm run ios:sync`.

## Run on a Mac

Requirements: Node.js 22 or newer, Xcode 26 or newer with its iOS SDK installed, and an iOS 15+ simulator or device. Xcode downloads the pinned Capacitor Swift package on the first build, so development setup needs internet access.

```sh
git clone --branch gh-pages https://github.com/dgrosher/AnnesGameWebsite.git
cd AnnesGameWebsite
npm ci
npm run ios:sync
npm run ios:open
```

In Xcode, choose the **App** scheme and an iPhone or iPad simulator, then press Run. The project is `ios/App/App.xcodeproj`; it uses Swift Package Manager, so CocoaPods is not required.

For your own iPhone, select the App target’s **Signing & Capabilities**, choose your Apple development team, and enable automatic signing. The initial bundle identifier is `com.dgrosher.annesarcade`; if you change it, update both `capacitor.config.json` and the App target’s bundle identifier. Choose the connected device, enable Developer Mode on the device if prompted, and Run. A free Apple account can install a development build on your own device, with Apple’s provisioning limits.

## Distribution

For TestFlight or App Store distribution, use an Apple Developer Program membership. Set your own team, bundle identifier, version and build number in Xcode, select **Any iOS Device**, and use **Product → Archive → Distribute App → App Store Connect**. Create the matching app record in App Store Connect and provide screenshots, description, support URL, privacy policy and age rating. Each update requires a new native build; GitHub Pages deployments do not update installed apps.

The included app icon and launch artwork are original arcade branding. Review game names, artwork rights, App Store metadata, and Apple’s requirements before submitting. This repository does not contain signing credentials or an uploaded App Store build.

## App behavior and privacy

- Games and garden artwork ship inside the app. Touch controls are shared with the website, and the app supports portrait and landscape on iPhone and iPad.
- The app bundle removes remote Google Fonts and disables Umami. Website analytics remain configured as before. The bundled privacy page describes the app’s behavior.
- Read-aloud uses the device speech service. Test Finn’s Treehouse and Animal Go Fish on an actual iPhone; voice availability and offline speech depend on installed voices. There are no microphone permissions or speech uploads implemented by the app.
- Voice preferences and the runner’s best score use local web storage. Reinstalling the app clears them. Other in-progress games are not saved across app termination.

## Checks before sharing

```sh
npm test
npm run ios:sync
```

On a Mac, a simulator build can also be checked with:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -sdk iphonesimulator -configuration Debug \
  -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Check every game on a device, including read-aloud audio, multitouch controls, notches and home indicators in both orientations, pause/resume after app switching, and an airplane-mode cold launch. The Linux cloud environment can test the bundled web games and generate/sync the Xcode project, but cannot run Xcode, validate device audio, sign an IPA, or submit the app.
