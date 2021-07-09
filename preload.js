const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld('geode', {
    sendOverlayKey: () => {
        ipcRenderer.invoke("overlay-key");
    },
    onOverlayChangeState: (cb) => {
        ipcRenderer.on('change-overlay-state', (e, data) => {
            console.log("thsrhrth");
            cb(data.state);
        });
    }
});

console.log("Preloaded!");