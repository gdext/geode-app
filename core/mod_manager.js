const Mod = require('./mod');

const path = require('path');
const fs = require('fs');

module.exports = class ModManager {
    constructor(app, modFolder, modCache) {
        this.modFolder = modFolder;
        this.modCache  = modCache;

        this.app = app;
        this.connection = app.connection;

        this.loadModsAwaitingCallback = {};

        this.loadedMods  = {};
        this.loadPromise = this.loadMods();
    }

    loadMods() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.modFolder, (err, files) => {
                if (err) return reject(err);

                for (let file of files)
                    this.loadedMods[file] = new Mod(path.join(this.modFolder, file), this.modCache);

                resolve();
            });
        });
    }

    getModList() {
        let ret = [];

        for (let [n, mod] of Object.entries(this.loadedMods))
            ret.push(mod);

        return ret;
    }

    sendModList() {
        let loadedMods = [];

        for (let [n, m] of Object.entries(this.loadedMods))
            if (m.loaded)
                loadedMods.push([
                    m.zipName,
                    m.dllPath
                ]);

        this.connection.sendPacket("modlist", {
            mods: loadedMods
        });
    }

    getMod(name) {
        for (let [n, m] of Object.entries(this.loadedMods))
            if (m.zipName == name) return m;

        return null;
    }

    recievePacket(packet) {
        if (packet.type == "modloaded") {
            let mcb = this.loadModsAwaitingCallback[packet.name];

            if (!mcb)
                return;

            if (packet.success) {
                mcb.resolve();

                let m = this.getMod(packet.name);
                if (m) m.enabled = true;
            } else
                mcb.reject( new Error("Mod failed to load") );

            this.loadModsAwaitingCallback[packet.name] = null;
        }
    }

    loadMod(zipName) {
        return new Promise((resolve, reject) => {
            this.connection.sendPacket("modload", {name: zipName});

            this.loadModsAwaitingCallback[zipName] = {resolve: resolve, reject: reject};
        });
    }
}