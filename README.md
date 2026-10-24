# Anne’s Arcade

A cheerful, responsive collection of browser games made for kids and their grown-ups.

## Run locally

Requires Python 3 to serve the site. No dependencies or build step are needed.

```sh
npm start
```

Open port 3000 in your browser. Alternatively run `python3 -m http.server 3000` from this directory.

## Games

- **Memory Match:** uncover all eight pairs, with a move counter.
- **Snake:** arrow keys, WASD, or touch buttons to steer. Start/pause with the button; Space also pauses when focus is outside a button. Switching tabs pauses the game.

- **UNO:** play against the computer with action cards, wild colors, and an UNO call button. Includes in-game rules for this casual two-player version.
- **Set Match:** find sets across four features, with hints and additional deals.
- **The Secret Garden:** an original choose-your-own-adventure with four endings.
- **Anne’s Game:** an original number-matching game against the computer. Four each of numbers 1–6, six Draw 2 wilds, and five cards per player. Match the previous number or play a wild. If unable to play, draw one and end your turn; the next player may play any card. Draw 2 makes the opponent draw two and miss their turn, then opens play to any card. First empty hand wins.

- **Finn’s Treehouse:** a 14-page illustrated read-aloud story and firefly-finding game. Each page has one sentence and its own picture. Read one page or the whole story with automatic page turns. The narrator automatically prefers natural, neural, or enhanced English voices when available; choose a storyteller and Gentle, Natural, or Lively pacing. Voice and pace preferences are saved on your device. Some voices require internet; if a selected voice fails or never starts, narration retries an available device voice and then the browser default. Speech resumes a paused browser engine, retains the utterance during playback, and reports startup failures. Browser text-to-speech availability depends on the device and installed voices; reading and the picture game work without audio. No microphone is used.

- **Space Invaders:** move with Left/Right or A/D and fire with Space. Hold the on-screen buttons on touch devices. Clear waves, score points, and protect your three lives.
- **Pong:** play against the computer; first to seven wins. Move with Up/Down or W/S, hold touch buttons, or drag on the court. Both arcade games support P to pause and pause automatically when you switch tabs.

- **Fox & Found:** an original cooperative deduction game for one to four detectives sharing one screen, inspired by cooperative fox mysteries. Choose clues or suspects, roll up to three times with matching dice automatically kept, and identify the pie thief before eight escape steps. All players win or lose together; accusations require confirmation. No online multiplayer or accounts.

- **Cloudwing Couriers:** an original flying arcade adventure inspired by aerial jousting games. Pip rides a moonwing moth, meets cloud sprites from above, and collects the letters they release. Move with Left/Right or A/D; hold Space to flap. Three hearts, cloud platforms, and increasingly busy delivery routes.
- **Root & Rumble:** an original digging arcade adventure. Mina Mole digs tunnels and sprinkles grumblebugs into flowers. Move with arrows/WASD; face a bug and hold Space for three dew bursts within three dug squares. Three hearts and progressively busier gardens. Both games have original canvas artwork, holdable touch controls, P to pause, and automatic pause when leaving the tab.

- **Ami’s Garden Jigsaw:** exactly 50 interlocking pieces (10 × 5) of an original illustrated garden. Drag pieces or select a piece and tap its board square. Includes a picture preview, edge filter, paged tray, larger scrollable board, keyboard placement, and completion celebration. No timer or rotation.

## Test

With Node.js 18 or newer, run `npm test` to check game rules. The site is static and can be deployed on any static host. Google Fonts is optional; system font fallbacks work offline. No accounts, API keys, analytics, or backend services are required.
