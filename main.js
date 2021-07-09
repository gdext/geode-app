const { app, BrowserWindow, ipcMain } = require('electron');
const { overlayWindow } = require('electron-overlay-window');

const Connection = require('./core/connection');

const path = require('path');

let mainWindow;
let isOverlayOpen = false;

function toggleOverlay() {
    if (isOverlayOpen) {
        mainWindow.setIgnoreMouseEvents(true);
        overlayWindow.focusTarget();
    } else {
        mainWindow.setIgnoreMouseEvents(false);
        overlayWindow.activateOverlay();
    }

    isOverlayOpen = !isOverlayOpen;
    mainWindow.webContents.send('change-overlay-state', {'state': isOverlayOpen});
}

function createWindow() {
    console.log(path.join(__dirname, 'preload.js'));

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        ...overlayWindow.WINDOW_OPTS
    });

    mainWindow.setMenu(null);

    mainWindow.loadFile('web/index.html');

    overlayWindow.attachTo(mainWindow, 'Geometry Dash');

    mainWindow.setIgnoreMouseEvents(true);
    overlayWindow.focusTarget();

    let con = new Connection(3264);

    con.on("error", () => {
        app.exit(0);
    });

    con.on("connection", () => {
        console.log("connected!");
    });

    con.on("packet", d => {
        d = JSON.parse(d);
        console.log(typeof d, d, d.type);
        if (d.type == "overlay_key") {
            toggleOverlay();
        }
    });

    con.sendPacket("config", {
        "overlay_key": 60
    });
}

ipcMain.handle('openDevTools', (e) => {
    mainWindow.webContents.toggleDevTools();
});

ipcMain.handle('overlay-key', toggleOverlay);

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})