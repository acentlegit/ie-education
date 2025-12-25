import express from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Environment variables with defaults
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "demo_key";
const LIVEKIT_SECRET = process.env.LIVEKIT_SECRET || "demo_secret";
const LIVEKIT_URL = process.env.LIVEKIT_URL || "wss://demo.livekit.cloud";
const PORT = process.env.PORT || 3000;

const roomService = new RoomServiceClient(
  LIVEKIT_URL.replace("wss", "https"),
  LIVEKIT_API_KEY,
  LIVEKIT_SECRET
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
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
      canPublish: role !== "viewer"
    });
    
    // Log to audit file (optional)
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync("audit.log", JSON.stringify({
        event: "JOIN",
        name,
        room,
        role,
        ts: new Date().toISOString()
      }) + "\n");
    }
    
    res.json({ 
      token: at.toJwt(), 
      url: LIVEKIT_URL 
    });
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
      rtmp: {
        urls: [rtmpUrl]
      }
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
      file: {
        filepath: `/streams/${room}-${Date.now()}.mp4`
      }
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
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync("audit.log", JSON.stringify({
        ...req.body,
        timestamp: new Date().toISOString()
      }) + "\n");
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Error writing audit log:', error);
    res.status(500).json({ error: 'Failed to write audit log' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});



