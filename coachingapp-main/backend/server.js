import express from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import config from "./config.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'https://crossskill.net',
    'https://www.crossskill.net',
    'https://d19z8axyv5innr.cloudfront.net',
    'http://coaching-platformm.s3-website-us-east-1.amazonaws.com',
    'https://main.*.amplifyapp.com',
    'http://98.92.71.17:3001',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "demo_key";
const LIVEKIT_SECRET = process.env.LIVEKIT_SECRET || "demo_secret";
const LIVEKIT_URL = process.env.LIVEKIT_URL || "wss://demo.livekit.cloud";

// Debug: Log environment variables (without exposing secrets)
console.log("Environment loaded:");
console.log("LIVEKIT_API_KEY:", LIVEKIT_API_KEY ? `${LIVEKIT_API_KEY.substring(0, 5)}...` : "NOT SET");
console.log("LIVEKIT_SECRET:", LIVEKIT_SECRET ? "SET" : "NOT SET");
console.log("LIVEKIT_URL:", LIVEKIT_URL);

const roomService = new RoomServiceClient(
  LIVEKIT_URL.replace("wss", "https"),
  LIVEKIT_API_KEY,
  LIVEKIT_SECRET
);

app.get("/token", async (req, res) => {
  try {
    const { name, room, role } = req.query;
    
    console.log('=== TOKEN REQUEST ===');
    console.log('Name:', name);
    console.log('Room:', room);
    console.log('Role:', role || 'host');
    console.log('LIVEKIT_API_KEY:', LIVEKIT_API_KEY ? `${LIVEKIT_API_KEY.substring(0, 5)}...` : 'NOT SET');
    console.log('LIVEKIT_SECRET:', LIVEKIT_SECRET ? 'SET' : 'NOT SET');
    console.log('LIVEKIT_URL:', LIVEKIT_URL);
    
    if (!name || !room) {
      console.error('Missing required parameters: name or room');
      return res.status(400).json({ error: 'Name and room are required' });
    }
    
    // Validate credentials are set
    if (!LIVEKIT_API_KEY || LIVEKIT_API_KEY === "demo_key" || !LIVEKIT_SECRET || LIVEKIT_SECRET === "demo_secret") {
      console.error('LiveKit credentials not properly configured');
      return res.status(500).json({ 
        error: 'LiveKit credentials not configured',
        message: 'Please check your .env file'
      });
    }
    
    console.log('Creating AccessToken...');
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_SECRET, {
      identity: name,
    });
    at.addGrant({
      roomJoin: true,
      room,
      canPublish: role !== "viewer",
    });
    
    console.log('Generating JWT token...');
    // toJwt() returns a Promise - need to await it!
    const token = await at.toJwt();
    console.log('Token generated successfully');
    console.log('Token type:', typeof token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NULL');
    
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
    
    console.log(`Token generated for ${name} in room ${room} as ${role || 'host'}`);
    res.json({ token: token, url: LIVEKIT_URL });
  } catch (error) {
    console.error('=== ERROR GENERATING TOKEN ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to generate token', details: error.message });
  }
});

app.post("/stream/rtmp", async (req, res) => {
  const { room, rtmpUrl } = req.body;
  const egress = await roomService.startRoomCompositeEgress(room, {
    rtmp: { urls: [rtmpUrl] },
  });
  res.json({ egressId: egress.egressId });
});

app.post("/stream/record", async (req, res) => {
  const { room } = req.body;
  const egress = await roomService.startRoomCompositeEgress(room, {
    file: { filepath: `/streams/${room}-${Date.now()}.mp4` },
  });
  res.json({ egressId: egress.egressId });
});

app.post("/moderate/kick", async (req, res) => {
  const { room, identity } = req.body;
  await roomService.removeParticipant(room, identity);
  res.sendStatus(200);
});

app.post("/audit", (req, res) => {
  fs.appendFileSync("audit.log", JSON.stringify(req.body) + "\n");
  res.sendStatus(200);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// User storage file path
const USERS_FILE = "users.json";

// Helper function to read users from file
const readUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf8");
      return JSON.parse(data);
    }
    // Initialize with default admin user
    const defaultUsers = [
      {
        id: "1",
        username: "admin",
        password: "admin",
        role: "admin",
        email: "admin@coaching.com",
        name: "Admin User",
        createdAt: new Date().toISOString()
      }
    ];
    writeUsers(defaultUsers);
    return defaultUsers;
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
};

// Helper function to write users to file
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users:", error);
  }
};

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate required fields
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "Username, password, and role are required"
      });
    }

    // Read users
    const users = readUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password && u.role === role
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Remove password before sending
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during login"
    });
  }
});

// Registration endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Validate role
    if (!["admin", "coach", "student"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role. Must be admin, coach, or student"
      });
    }

    // Read existing users
    const users = readUsers();

    // Check if username or email already exists
    const existingUser = users.find(
      (u) => u.username === username || u.email === email
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username or email already exists"
      });
    }

    // Handle admin registration locally
    if (role === "admin") {
      const newUser = {
        id: String(users.length + 1),
        name,
        email,
        username,
        password, // In production, hash this password
        role: "admin",
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeUsers(users);

      return res.json({
        success: true,
        message: "Admin account created successfully",
        user: { ...newUser, password: undefined }
      });
    }

    // Handle coach and student registration via Beam API
    if (role === "coach" || role === "student") {
      try {
        // Call Beam API for user registration
        const beamResponse = await fetch(
          `${config.BEAM_LIVE.BASE_URL}/api/users/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": config.BEAM_LIVE.API_KEY,
              "X-API-Secret": config.BEAM_LIVE.API_SECRET
            },
            body: JSON.stringify({
              name,
              email,
              username,
              password,
              role
            })
          }
        );

        if (!beamResponse.ok) {
          const errorData = await beamResponse.json().catch(() => ({}));
          return res.status(beamResponse.status).json({
            success: false,
            error: errorData.error || "Failed to register with Beam API"
          });
        }

        const beamUser = await beamResponse.json();

        // Store user locally as well for login purposes
        const newUser = {
          id: beamUser.id || String(users.length + 1),
          name,
          email,
          username,
          password, // In production, hash this password
          role,
          beamUserId: beamUser.id,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        writeUsers(users);

        return res.json({
          success: true,
          message: `${role === "coach" ? "Coach" : "Student"} account created successfully`,
          user: { ...newUser, password: undefined }
        });
      } catch (beamError) {
        console.error("Beam API error:", beamError);
        // Fallback: register locally if Beam API fails
        const newUser = {
          id: String(users.length + 1),
          name,
          email,
          username,
          password,
          role,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        writeUsers(users);

        return res.json({
          success: true,
          message: `Account created locally (Beam API unavailable)`,
          user: { ...newUser, password: undefined }
        });
      }
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during registration"
    });
  }
});

// Password reset endpoint (supports both token generation and direct reset)
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { username, newPassword, email } = req.body;

    // Priority 1: If username + newPassword provided, do direct reset (no token needed)
    if (username && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long"
        });
      }

      // Read users
      const users = readUsers();
      const userIndex = users.findIndex((u) => u.username === username);

      if (userIndex === -1) {
        return res.status(400).json({
          success: false,
          error: "Invalid username"
        });
      }

      // Update password
      users[userIndex].password = newPassword; // In production, hash this password
      writeUsers(users);

      // If user is coach/student, also update in Beam API
      if (users[userIndex].role === "coach" || users[userIndex].role === "student") {
        try {
          await fetch(`${config.BEAM_LIVE.BASE_URL}/api/users/reset-password/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": config.BEAM_LIVE.API_KEY,
              "X-API-Secret": config.BEAM_LIVE.API_SECRET
            },
            body: JSON.stringify({
              email: users[userIndex].email,
              newPassword
            })
          });
        } catch (beamError) {
          console.error("Beam API reset password error:", beamError);
        }
      }

      return res.json({
        success: true,
        message: "Password has been reset successfully"
      });
    }

    // Priority 2: If only email provided, generate token (old flow)
    if (email && !username && !newPassword) {
      // Original token generation flow
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required"
        });
      }

      const users = readUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        return res.json({
          success: true,
          message: "If an account exists with this email, a password reset link has been sent."
        });
      }

      const resetToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      const resetExpiry = new Date(Date.now() + 3600000);

      let resetTokens = [];
      try {
        if (fs.existsSync("reset-tokens.json")) {
          resetTokens = JSON.parse(fs.readFileSync("reset-tokens.json", "utf8"));
        }
      } catch (error) {
        console.error("Error reading reset tokens:", error);
        resetTokens = [];
      }
      
      resetTokens.push({
        email,
        token: resetToken,
        expiresAt: resetExpiry.toISOString()
      });
      
      try {
        fs.writeFileSync("reset-tokens.json", JSON.stringify(resetTokens, null, 2));
      } catch (error) {
        console.error("Error writing reset tokens:", error);
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      console.log(`\n=== PASSWORD RESET LINK ===`);
      console.log(`Email: ${email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`Token: ${resetToken}`);
      console.log(`Expires: ${resetExpiry.toISOString()}`);
      console.log(`============================\n`);

      if (user.role === "coach" || user.role === "student") {
        try {
          await fetch(`${config.BEAM_LIVE.BASE_URL}/api/users/reset-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": config.BEAM_LIVE.API_KEY,
              "X-API-Secret": config.BEAM_LIVE.API_SECRET
            },
            body: JSON.stringify({
              email,
              resetLink
            })
          });
        } catch (beamError) {
          console.error("Beam API reset password error:", beamError);
        }
      }

      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      return res.json({
        success: true,
        message: isDevelopment 
          ? "Password reset link generated. Check server console or use the link below."
          : "Password reset link has been sent to your email.",
        ...(isDevelopment && { resetLink, token: resetToken })
      });
    }

    return res.status(400).json({
      success: false,
      error: "Either email (for token generation) or username + newPassword (for direct reset) is required"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during password reset"
    });
  }
});

// Password reset confirmation endpoint (with token)
app.post("/api/auth/reset-password/confirm", async (req, res) => {
  try {
    const { token, username, newPassword } = req.body;

    if (!token || !username || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Token, username, and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }

    // Read reset tokens
    let resetTokens = [];
    try {
      if (fs.existsSync("reset-tokens.json")) {
        resetTokens = JSON.parse(fs.readFileSync("reset-tokens.json", "utf8"));
      }
    } catch (error) {
      console.error("Error reading reset tokens:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }

    // Find the token
    const tokenData = resetTokens.find(
      (t) => t.token === token && new Date(t.expiresAt) > new Date()
    );

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token"
      });
    }

    // Read users
    const users = readUsers();
    const userIndex = users.findIndex((u) => u.email === tokenData.email);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Verify username matches the user associated with the token
    if (users[userIndex].username !== username) {
      return res.status(400).json({
        success: false,
        error: "Username does not match the account associated with this reset link"
      });
    }

    // Update password
    users[userIndex].password = newPassword; // In production, hash this password
    writeUsers(users);

    // Remove used token
    resetTokens = resetTokens.filter((t) => t.token !== token);
    try {
      fs.writeFileSync("reset-tokens.json", JSON.stringify(resetTokens, null, 2));
    } catch (error) {
      console.error("Error writing reset tokens:", error);
    }

    // If user is coach/student, also update in Beam API
    if (users[userIndex].role === "coach" || users[userIndex].role === "student") {
      try {
        await fetch(`${config.BEAM_LIVE.BASE_URL}/api/users/reset-password/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": config.BEAM_LIVE.API_KEY,
            "X-API-Secret": config.BEAM_LIVE.API_SECRET
          },
          body: JSON.stringify({
            email: tokenData.email,
            newPassword
          })
        });
      } catch (beamError) {
        console.error("Beam API password update error:", beamError);
        // Continue even if Beam API fails
      }
    }

    return res.json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during password reset"
    });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log("Advanced streaming backend running on port 3001");
  console.log("Health check: http://0.0.0.0:3001/health");
  console.log("Token endpoint: http://0.0.0.0:3001/token");
  console.log("Login endpoint: http://0.0.0.0:3001/api/auth/login");
  console.log("Registration endpoint: http://0.0.0.0:3001/api/auth/register");
  console.log("Password reset endpoint: http://0.0.0.0:3001/api/auth/reset-password");
  console.log("Accessible from: http://98.92.71.17:3001");
});
