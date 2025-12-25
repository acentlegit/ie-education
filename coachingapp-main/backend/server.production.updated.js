import express from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import fs from "fs";
import cors from "cors";

const app = express();

// CORS Configuration - Allow S3 frontend and local development
app.use(cors({
  origin: [
    'http://coaching-platform-frontend.s3-website-us-east-1.amazonaws.com', // Replace with your S3 URL
    'http://98.92.71.17:3001',
    'http://localhost:5173', // For local development
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "demo_key";
const LIVEKIT_SECRET = process.env.LIVEKIT_SECRET || "demo_secret";
const LIVEKIT_URL = process.env.LIVEKIT_URL || "wss://demo.livekit.cloud";
const PORT = process.env.PORT || 3001;

const roomService = new RoomServiceClient(
  LIVEKIT_URL.replace("wss", "https"),
  LIVEKIT_API_KEY,
  LIVEKIT_SECRET
);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

app.get("/token", (req, res) => {
  try {
    const { name, room, role } = req.query;
    
    if (!name || !room) {
      return res.status(400).json({ error: 'Name and room are required' });
    }
    
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_SECRET, {
      identity: name,
    });
    at.addGrant({
      roomJoin: true,
      room,
      canPublish: role !== "viewer",
    });
    
    // Create audit.log if it doesn't exist
    try {
      fs.appendFileSync(
        "audit.log",
        JSON.stringify({
          event: "JOIN",
          name,
          room,
          role,
          ts: new Date(),
        }) + "\n"
      );
    } catch (err) {
      console.warn('Could not write to audit.log:', err.message);
    }
    
    res.json({ token: at.toJwt(), url: LIVEKIT_URL });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.post("/stream/rtmp", async (req, res) => {
  try {
    const { room, rtmpUrl } = req.body;
    if (!room || !rtmpUrl) {
      return res.status(400).json({ error: 'Room and rtmpUrl are required' });
    }
    const egress = await roomService.startRoomCompositeEgress(room, {
      rtmp: { urls: [rtmpUrl] },
    });
    res.json({ egressId: egress.egressId });
  } catch (error) {
    console.error('Error starting RTMP stream:', error);
    res.status(500).json({ error: 'Failed to start RTMP stream' });
  }
});

app.post("/stream/record", async (req, res) => {
  try {
    const { room } = req.body;
    if (!room) {
      return res.status(400).json({ error: 'Room is required' });
    }
    const egress = await roomService.startRoomCompositeEgress(room, {
      file: { filepath: `/streams/${room}-${Date.now()}.mp4` },
    });
    res.json({ egressId: egress.egressId });
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({ error: 'Failed to start recording' });
  }
});

app.post("/moderate/kick", async (req, res) => {
  try {
    const { room, identity } = req.body;
    if (!room || !identity) {
      return res.status(400).json({ error: 'Room and identity are required' });
    }
    await roomService.removeParticipant(room, identity);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

app.post("/audit", (req, res) => {
  try {
    fs.appendFileSync("audit.log", JSON.stringify(req.body) + "\n");
    res.sendStatus(200);
  } catch (error) {
    console.error('Error writing audit log:', error);
    res.status(500).json({ error: 'Failed to write audit log' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://98.92.71.17:${PORT}/health`);
  console.log(`Token endpoint: http://98.92.71.17:${PORT}/token`);
});



