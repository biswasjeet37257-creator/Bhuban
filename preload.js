const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
    quitApp: () => ipcRenderer.send('quit-app'),
    platform: process.platform,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});
