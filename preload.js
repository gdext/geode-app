const { ipcRenderer, contextBridge } = require("electron");

let loadedMods;
let modLoadCallbacks = [];

contextBridge.exposeInMainWorld('geode', {
    sendOverlayKey: () => {
        ipcRenderer.invoke("overlay-key");
    },
    onOverlayChangeState: (cb) => {
        ipcRenderer.on('change-overlay-state', (e, data) => {
            console.log("thsrhrth");
            cb(data.state);
        });
    },
    onModsLoaded: (cb) => {
        if (loadedMods)
            cb();
        else
            modLoadCallbacks.push(cb);
    },
    getLoadedMods: () => {
        let ret = [];

        for (let m of loadedMods) {
            let mod = {
                loaded: m.loaded,
                reason: m.reason
            };

            if (m.name) mod.name = m.name;
            if (m.version) mod.version = m.version;
            if (m.authors) mod.authors = m.authors;

            ret.push(mod);
        }

        return ret;
    }
});

ipcRenderer.on('mods-loaded', (mods) => {
    loadedMods = mods;

    for (let cb of modLoadCallbacks)
        cb();
})

console.log("Preloaded!");