const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // API Key
  getApiKey: () => ipcRenderer.invoke("get-api-key"),
  setApiKey: (key) => ipcRenderer.invoke("set-api-key", key),
  deleteApiKey: () => ipcRenderer.invoke("delete-api-key"),

  // Strategy generation with streaming
  analyzeStream: (params, onChunk) => {
    const handler = (_event, text) => onChunk(text);
    ipcRenderer.on("analyze:chunk", handler);
    return ipcRenderer
      .invoke("analyze", params)
      .finally(() => ipcRenderer.removeListener("analyze:chunk", handler));
  },

  // Next move
  getNextMove: (params) => ipcRenderer.invoke("next-move", params),
});
