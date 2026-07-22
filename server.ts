import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import profileHandler from "./api/profile.ts";
import pushHandler from "./api/push.ts";

dotenv.config();

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json({ limit: "5mb" }));

    // API Routes delegate to Vercel Serverless Functions
    app.all("/api/profile", async (req, res) => {
        try {
            await profileHandler(req, res);
        } catch (error: any) {
            console.error("Error executing serverless function:", error);
            res.status(500).json({ error: error.stack || error.toString() });
        }
    });

    app.all("/api/push", async (req, res) => {
        try {
            await pushHandler(req, res);
        } catch (error: any) {
            console.error("Error executing push serverless function:", error);
            res.status(500).json({ error: error.stack || error.toString() });
        }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { 
                middlewareMode: true,
                hmr: process.env.DISABLE_HMR === 'true' ? false : undefined
            },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist', 'public');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

startServer();
