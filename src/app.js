import Desktop from "./window/desktop";

export default class App {
    constructor() {
        this.version = "Geode 1.0.0";
        this.body    = document.getElementsByTagName("body")[0];

        this.desktop = new Desktop(this.body, this);

        this.desktop.createWindow({
            title: "very pogger window"
        });

        this.desktop.createWindow({
            title: "another very pogger window"
        });

        document.addEventListener("keydown", (e) => {
            if (e.code == "F2") {
                window.geode.sendOverlayKey();
            }
        });

        window.geode.onOverlayChangeState(this.desktop.changeOverlayState.bind(this.desktop));
    }
}