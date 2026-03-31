import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // Socket.io event handling
  io.on("connection", (socket) => {
    console.log(`[AEGIS SOCKET] Client connected: ${socket.id}`);
    
    socket.on("sync:targets", (targets) => {
      socket.broadcast.emit("sync:targets", targets);
    });

    socket.on("sync:alerts", (alerts) => {
      socket.broadcast.emit("sync:alerts", alerts);
    });

    socket.on("new:alert", (alert) => {
      socket.broadcast.emit("new:alert", alert);
    });

    socket.on("disconnect", () => {
      console.log(`[AEGIS SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  // C2 Callback Endpoint for Persistent Backdoors
  app.post("/api/c2/callback", (req, res) => {
    const { target, status, payload, metadata } = req.body;
    console.log(`[AEGIS C2] Incoming callback from ${target}: ${status}`);
    
    // Broadcast to all clients via socket.io
    io.emit("new:alert", {
      id: Math.random().toString(36).substr(2, 9),
      type: "CRITICAL",
      message: `[C2 CALLBACK] Persistent backdoor established on ${target}`,
      timestamp: new Date().toLocaleTimeString(),
      target: target,
      status: "ACTIVE",
      metadata: { ...metadata, payload }
    });

    res.status(200).json({ status: "ACKNOWLEDGED", next_command: "STAY_SILENT" });
  });

  // OSINT Proxy to bypass CORS for target domains
  app.all("/api/proxy", async (req, res) => {
    const targetUrl = req.headers["x-target-url"] as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing x-target-url header" });
    }

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Aegis-OSINT-Module/1.0",
          // Forward relevant headers if needed, but avoid sensitive ones
        },
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      });

      const data = await response.text();
      
      // Forward status and response
      res.status(response.status).send(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[AEGIS SERVER] Operational on http://localhost:${PORT}`);
  });
}

startServer();
