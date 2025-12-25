# LiveKit Backend Server

This is the backend server for LiveKit video streaming functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional, defaults provided):
```bash
export LIVEKIT_API_KEY="your_api_key"
export LIVEKIT_SECRET="your_secret"
export LIVEKIT_URL="wss://your-livekit-server.com"
```

3. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on port 3001.

## Endpoints

- `GET /token?name=username&room=roomname&role=host` - Get access token for LiveKit
- `POST /stream/rtmp` - Start RTMP streaming
- `POST /stream/record` - Start recording
- `POST /moderate/kick` - Kick a participant
- `POST /audit` - Log audit events

## Note

For production, you'll need to:
1. Set up a LiveKit server or use LiveKit Cloud
2. Configure proper API keys and secrets
3. Set up proper CORS policies
4. Add authentication/authorization



