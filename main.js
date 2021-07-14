const { app, BrowserWindow, ipcMain } = require('electron');
const { overlayWindow } = require('electron-overlay-window');

const Connection = require('./core/connection');
const ModManager = require('./core/mod_manager');
const Config     = require('./core/config');

const path = require('path');

const CONNECTION_PORT   = 3264;

const GAME_WINDOW_TITLE = 'Geometry Dash';
const OVERLAY_ENABLED   = true;

const MOD_FOLDER  = path.join(app.getPath('userData'), 'mods');
const MOD_CACHE   = path.join(app.getPath('userData'), 'cache/mods');

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

module.exports = class MainApp {
    constructor() {
        this.preloadPath = path.join(__dirname, 'preload.js');
        this.htmlPath = 'web/index.html';

        this.createWindow();
        this.initConnection();
        
        this.config = new Config(CONFIG_PATH);

        this.config.defineProperty('mods', 'object', {});

        this.modManager = new ModManager(this, MOD_FOLDER, MOD_CACHE);

        this.modManager.loadPromise
            .then(() => {
                this.sendModsChangeEvent();
                this.modManager.sendModList();

                for (let m of this.modManager.getModList()) {
                    let modConfig = this.config.mods[m.zipName];

                    if (m.loaded && (!modConfig || modConfig.enabled)) {
                        this.modManager.loadMod(m.zipName)
                            .then(() => {
                                console.log(`'${m.name}' loaded successfully`);
                                this.sendModsChangeEvent
                            })
                            .catch((e) => console.log(`Couldn't enable mod '${m.name}': ${e.message}`));
                    }
                }
            })
            .catch(e => {
                console.log("An error occurred while loading mods: ");
                console.log(e.stack);
            });

        ipcMain.handle('overlay-key', this.toggleOverlay.bind(this));
    }

    sendModsChangeEvent() {
        let modList = [];

        for (let m of this.modManager.getModList()) {
            let mod = {
                loaded: m.loaded,
                enabled: m.enabled,
                reason: m.reason
            };

            if (m.name) mod.name = m.name;
            else mod.name = m.zipName;
            if (m.version) mod.version = m.version;
            if (m.authors) mod.authors = m.authors;

            modList.push(mod);
        }

        this.sendWebEvent("mods-change", modList);
    }

    createWindow() {
        let overlayOpts = OVERLAY_ENABLED ? overlayWindow.WINDOW_OPTS : {};

        this.window = new BrowserWindow({
            webPreferences: {
                preload: this.preloadPath
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
            if (!data || typeof data != 'object' || Array.isArray(data))
                return;

            if (!data.type || typeof data.type != 'string')
                return;

            switch (data.type) {
                case 'overlay_key':
                    this.toggleOverlay();
                    break;
                case 'modloaded':
                case 'modunloaded':
                    this.modManager.recievePacket(data);
                    break;
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