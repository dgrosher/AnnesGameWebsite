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
- **Anne’s Game:** a coming-soon placeholder until its rules are defined.

## Test

With Node.js 18 or newer, run `npm test` to check game rules. The site is static and can be deployed on any static host. Google Fonts is optional; system font fallbacks work offline. No accounts, API keys, analytics, or backend services are required.
