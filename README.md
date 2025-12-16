# Perp Prediction Discord Bot

Standalone Discord bot that analyzes crypto charts using AI-powered technical analysis via OpenRouter API.

## Features

- 🤖 `/perp` slash command
- 📊 Upload chart images directly to Discord
- ⏱️ Select timeframe (1m to 1w)
- 🎯 Get instant AI analysis:
  - LONG/SHORT recommendation
  - Certainty percentage
  - Entry price, Stop Loss, Take Profit
  - Risk/Reward ratio
  - Detailed analysis report
- ⚡ Works independently (no web app needed)

## Setup

### 1. Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **"New Application"** → Name it "Perp Prediction Bot"
3. Go to **"Bot"** tab → **"Reset Token"** → **Copy the token**
4. Go to **"OAuth2"** → **"URL Generator"**
   - Scopes: ✅ `bot` ✅ `applications.commands`
   - Bot Permissions: ✅ Send Messages ✅ Embed Links ✅ Attach Files
5. **Copy the URL** and invite bot to your server

### 2. Get OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Sign in and create a new API key
3. Copy the key

### 3. Configure Bot

Edit `.env` and add:
```env
DISCORD_TOKEN=your_discord_bot_token
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Install & Run

```bash
npm install
npm start
```

## Usage

In Discord, type:
```
/perp timeframe:1h chart:[upload image]
```

The bot will analyze your chart and return:
- 📈 **Recommendation**: LONG or SHORT
- 🎯 **Certainty**: Confidence percentage
- ⚖️ **Risk/Reward**: Ratio (e.g., 2.5:1)
- 💰 **Entry/SL/TP**: Complete trade setup
- 📝 **Report**: Detailed analysis with patterns and justification

## Example

1. Type `/perp` in Discord
2. Select timeframe: `1h`
3. Upload your chart screenshot
4. Get instant analysis! ⚡

## Hosting 24/7 (Free)

**Run your bot 24/7 on:**
- **Railway**: https://railway.app (Recommended)
- **Render**: https://render.com
- **Fly.io**: https://fly.io

Simply:
1. Push to GitHub
2. Connect repo to hosting platform
3. Add environment variables
4. Deploy!

## Tech Stack

- Discord.js v14
- Node.js
- OpenRouter AI API (NVIDIA Nemotron)

## License

MIT

---

**Disclaimer:** This bot is for educational purposes only. Not financial advice. Always DYOR before trading.
