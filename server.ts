import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AEGIS SERVER] Operational on http://localhost:${PORT}`);
  });
}

startServer();
