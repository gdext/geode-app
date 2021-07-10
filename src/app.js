import Desktop from "./window/desktop";

export default class App {
    constructor() {
        this.version = "Geode 1.0.0";
        this.body    = document.getElementsByTagName("body")[0];

        this.desktop = new Desktop(this.body, this);

        let win1 = this.desktop.createWindow({
            title: "very pogger window"
        });

        let win2 = this.desktop.createWindow({
            title: "another very pogger window"
        });

        win1.on("close", () => win1.close());
        win2.on("close", () => win2.close());

        let p = document.createElement("p");
        p.style.color = "white";

        p.textContent = "THIS IS THE CONTENTS OF THIS WINDOW POGGERS!";

        win1.setContent(p);

        let browser_only_overlaystate = false;

        document.addEventListener("keydown", (e) => {
            if (e.code == "F2") {
                if (window.geode)
                    window.geode.sendOverlayKey();
                else {
                    browser_only_overlaystate = !browser_only_overlaystate;
                    this.desktop.changeOverlayState(browser_only_overlaystate);
                }
            }
        });

        if (window.geode)
            window.geode.onOverlayChangeState(this.desktop.changeOverlayState.bind(this.desktop));
    }
}