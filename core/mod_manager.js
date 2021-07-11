const Mod = require('./mod');

const path = require('path');
const fs = require('fs');

module.exports = class ModManager {
    constructor(appData) {
        this.appData = appData;
        this.modsFolder = path.join(appData, "/mods");

        this.loadedMods  = {};
        this.loadPromise = this.loadMods();
    }

    loadMods() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.modsFolder, (err, files) => {
                if (err) return reject(err);

                for (let file of files)
                    this.loadedMods[file] = new Mod(path.join(this.modsFolder, file), this.appData);

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
}