const { ipcRenderer, contextBridge } = require("electron");

let loadedMods;
let modLoadCallbacks = [];

console.log("(--0--)");

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
        return loadedMods;
    }
});

ipcRenderer.on('mods-loaded', (s, mods) => {
    loadedMods = mods;

    for (let cb of modLoadCallbacks)
        cb();
})

console.log("Preloaded!");