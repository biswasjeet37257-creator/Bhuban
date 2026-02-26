const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let tray;
let backendProcess;

// Start backend server
function startBackend() {
// DEBUG: console.log('Starting backend server...');
    
    backendProcess = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit'
    });

    backendProcess.on('error', (error) => {
        console.error('Failed to start backend:', error);
    });

    backendProcess.on('exit', (code) => {
// DEBUG: console.log(`Backend process exited with code ${code}`);
    });

    // Wait for backend to start
    return new Promise((resolve) => {
        setTimeout(resolve, 3000);
    });
}

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        icon: path.join(__dirname, 'build', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#000000',
        show: false,
        frame: true,
        titleBarStyle: 'default'
    });

    // Load the app
    mainWindow.loadFile('index.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

// Create system tray
function createTray() {
    tray = new Tray(path.join(__dirname, 'build', 'icon.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Bhuban',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Shorts',
            click: () => {
                mainWindow.loadFile('shorts.html');
                mainWindow.show();
            }
        },
        {
            label: 'AI Assistant',
            click: () => {
                mainWindow.loadFile('ai-assistant-location.html');
                mainWindow.show();
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Bhuban - Video Platform');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.show();
    });
}

// App ready
app.whenReady().then(async () => {
    // Start backend first
    await startBackend();
    
    // Create window and tray
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !=== 'darwin') {
        app.quit();
    }
});

// Clean up on quit
app.on('before-quit', () => {
    app.isQuitting = true;
    
    // Kill backend process
    if (backendProcess) {
        backendProcess.kill();
    }
});

// Handle IPC messages
ipcMain.on('minimize-to-tray', () => {
    mainWindow.hide();
});

ipcMain.on('quit-app', () => {
    app.isQuitting = true;
    app.quit();
});
