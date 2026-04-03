const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let store = {};

const isDev = !app.isPackaged;

// Simple JSON file store (no extra dependency needed in dev)
const fs = require('fs');
const storeFile = path.join(app.getPath('userData'), 'settings.json');

function loadStore() {
  try {
    if (fs.existsSync(storeFile)) {
      store = JSON.parse(fs.readFileSync(storeFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load store:', e);
    store = {};
  }
}

function saveStore() {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save store:', e);
  }
}

loadStore();

// IPC handlers for persistent storage
ipcMain.handle('store-get', (_, key) => {
  return store[key];
});

ipcMain.handle('store-set', (_, key, value) => {
  store[key] = value;
  saveStore();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icons/icon-512.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
