const { app, BrowserWindow, ipcMain } = require('electron');
const { overlayWindow } = require('electron-overlay-window');

const Connection = require('./core/connection');
const ModManager = require('./core/mod_manager');

const path = require('path');

const CONNECTION_PORT   = 3264;

const GAME_WINDOW_TITLE = 'Geometry Dash';
const OVERLAY_ENABLED   = false;

const MOD_FOLDER = path.join(app.getPath('userData'), 'mods');
const MOD_CACHE  = path.join(app.getPath('userData'), 'cache/mods');

module.exports = class MainApp {
    constructor() {
        this.preloadPath = path.join(__dirname, 'preload.js');
        this.htmlPath = 'web/index.html';

        this.createWindow();
        this.initConnection();

        this.modManager = new ModManager(MOD_FOLDER, MOD_CACHE);

        this.modManager.loadPromise
            .then(() => {
                console.log("Mods loaded");
                this.sendWebEvent("mods-loaded", this.modManager.getModList());
            })
            .catch(e => {
                console.log("An error occurred while loading mods: ");
                console.log(e.message);
            });

        ipcMain.handle('overlay-key', this.toggleOverlay.bind(this));
    }

    createWindow() {
        let overlayOpts = OVERLAY_ENABLED ? overlayWindow.WINDOW_OPTS : {};

        this.window = new BrowserWindow({
            webPreferences: {
                preloadPath: this.preloadPath
            },
            ...overlayOpts
        });

        this.window.setMenu(null);
        this.window.loadFile(this.htmlPath)
            .then(() => {
                console.log("Webpage loaded");
            });

        if (OVERLAY_ENABLED)
            overlayWindow.attachTo(this.window, GAME_WINDOW_TITLE);

        this.setOverlayVisible(false);

        console.log("Window created");
    }

    sendWebEvent(channel, ...args) {
        this.window.webContents.send(channel, ...args);
    }

    setOverlayVisible(visible) {
        if (OVERLAY_ENABLED) {
            if (!visible)
                overlayWindow.focusTarget();

            this.window.setIgnoreMouseEvents(!visible);
        }

        this.sendWebEvent('overlay-visible', visible);

        this.overlayVisible = visible;
    }

    toggleOverlay() {
        this.setOverlayVisible(!this.overlayVisible);
    }

    initConnection() {
        this.connection = new Connection(CONNECTION_PORT);

        console.log("Connection server listening at " + CONNECTION_PORT);

        this.connection.on('error', () => this.exitApp());
        this.connection.on('connect', () => console.log('Connected to Geode Native'));

        this.connection.on('packet', data => {
            data = JSON.parse(data);

            if (!data || typeof data != 'object' || Array.isArray(data))
                return;

            if (!data.type || typeof data.type != 'string')
                return;

            switch (data.type) {
                case 'overlay_key':
                    this.toggleOverlay();
            }
        })

        this.connection.sendPacket("config", {
            "overlay_key": 60
        });
    }

    exitApp() {
        app.exit(0);
    }
}