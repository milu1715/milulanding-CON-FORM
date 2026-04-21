const { app, BrowserWindow, ipcMain, protocol, net } = require("electron");
const path = require("path");
const fs = require("fs");
const url = require("url");

// ─── Register app:// protocol before app is ready ───────────────────────────
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true, supportFetchAPI: true } },
]);

// ─── Simple JSON config store (no electron-store dependency) ─────────────────
function getConfigPath() {
  return path.join(app.getPath("userData"), "milu-ads-config.json");
}
function readConfig() {
  try { return JSON.parse(fs.readFileSync(getConfigPath(), "utf8")); } catch { return {}; }
}
function writeConfig(data) {
  fs.writeFileSync(getConfigPath(), JSON.stringify(data, null, 2), "utf8");
}
const store = {
  get: (key, def) => { const d = readConfig(); return key in d ? d[key] : def; },
  set: (key, val) => { const d = readConfig(); d[key] = val; writeConfig(d); },
  delete: (key) => { const d = readConfig(); delete d[key]; writeConfig(d); },
};

const isDev = process.env.NODE_ENV === "development";
const outDir = path.join(__dirname, "../out");

// MIME types for static file serving
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".txt": "text/plain", ".pak": "application/octet-stream",
};

function serveStaticFile(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(data, { headers: { "content-type": MIME[ext] || "application/octet-stream" } });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: "MiLù Ads Console",
    backgroundColor: "#09090b",
    icon: path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "default",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("app://./index.html");
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Serve Next.js static output via app:// protocol
  protocol.handle("app", (request) => {
    let pathname = new URL(request.url).pathname;
    if (pathname === "/") pathname = "/index.html";

    // Try exact path
    let filePath = path.join(outDir, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveStaticFile(filePath);
    }
    // Try with .html extension (Next.js static export)
    if (fs.existsSync(filePath + ".html")) {
      return serveStaticFile(filePath + ".html");
    }
    // Try index.html in subdirectory
    const indexPath = path.join(filePath, "index.html");
    if (fs.existsSync(indexPath)) {
      return serveStaticFile(indexPath);
    }
    // Fallback to root index.html (SPA routing)
    return serveStaticFile(path.join(outDir, "index.html"));
  });

  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── IPC Handlers ────────────────────────────────────────────────────────────

function registerIpcHandlers() {
  ipcMain.handle("get-api-key", () => store.get("anthropicApiKey", null));
  ipcMain.handle("set-api-key", (_event, key) => { store.set("anthropicApiKey", key); });
  ipcMain.handle("delete-api-key", () => { store.delete("anthropicApiKey"); });

  // Strategy generation with streaming
  ipcMain.handle("analyze", async (event, params) => {
    const apiKey = store.get("anthropicApiKey");
    if (!apiKey) throw new Error("Chiave API Anthropic non configurata. Vai in Impostazioni.");

    const Anthropic = require("@anthropic-ai/sdk");
    const { buildStrategyPrompt } = require("../src/lib/ai/prompts");

    const client = new Anthropic.default({ apiKey });
    const prompt = buildStrategyPrompt(params);

    const stream = await client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        fullText += chunk.delta.text;
        if (!event.sender.isDestroyed()) {
          event.sender.send("analyze:chunk", chunk.delta.text);
        }
      }
    }
    return fullText;
  });

  // Next move suggestion
  ipcMain.handle("next-move", async (_event, params) => {
    const apiKey = store.get("anthropicApiKey");
    if (!apiKey) throw new Error("Chiave API Anthropic non configurata. Vai in Impostazioni.");

    const Anthropic = require("@anthropic-ai/sdk");
    const { buildNextMovePrompt } = require("../src/lib/ai/prompts");

    const client = new Anthropic.default({ apiKey });
    const prompt = buildNextMovePrompt(params);

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch?.[0] ?? text);
    } catch {
      return { nextMove: text, reasoning: "", expectedImpact: "", priority: "medium" };
    }
  });
}
