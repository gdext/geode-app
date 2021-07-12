const { ipcRenderer, contextBridge } = require("electron");

let loadedMods;
let modLoadCallbacks = [];

contextBridge.exposeInMainWorld('geode', {
    sendOverlayKey: () => {
        ipcRenderer.invoke("overlay-key");
    },
    onOverlayChangeState: (cb) => {
        ipcRenderer.on('overlay-visible', (e, data) => {
            cb(data);
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