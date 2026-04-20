const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const serve = require("electron-serve");
const Store = require("electron-store");

const store = new Store({ name: "milu-ads-config" });
const isDev = process.env.NODE_ENV === "development";

const loadURL = serve({ directory: path.join(__dirname, "../out") });

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
    loadURL(mainWindow);
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── IPC Handlers ───────────────────────────────────────────────────────────

function registerIpcHandlers() {
  // API Key management
  ipcMain.handle("get-api-key", () => store.get("anthropicApiKey", null));

  ipcMain.handle("set-api-key", (_event, key) => {
    store.set("anthropicApiKey", key);
  });

  ipcMain.handle("delete-api-key", () => {
    store.delete("anthropicApiKey");
  });

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
