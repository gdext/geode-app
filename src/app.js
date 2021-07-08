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
    }
}