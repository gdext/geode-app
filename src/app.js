import Desktop from "./window/desktop";
import ui from "./scripts/ui";
import util from "./scripts/util";

import MainWindow from './window/types/main_window';

export default class App {
    constructor() {
        this.version = "Geode 1.0.0";
        this.body    = document.getElementsByTagName("body")[0];

        this.desktop = new Desktop(this.body, this);

        let win1 = new MainWindow(this.desktop);

        let win2 = this.desktop.createWindow({
            title: "another very pogger window"
        });

        win1.on("close", () => win1.close());
        win2.on("close", () => win2.close());

        let p = document.createElement("p");
        p.style.color = "white";

        p.textContent = "THIS IS THE CONTENTS OF THIS WINDOW POGGERS!";

        win1.setContent(p);

        let contents = document.createElement('div');
        contents.classList.add('uistretch');
        ui.renderUiObject({
            properties: {
                type: 'container',
                paddingX: 15,
                paddingY: 5
            }, 
            children: [
                {
                    properties: {
                        type: 'label',
                        text: 'Hello?'
                    }
                },
                {
                    properties: {
                        type: 'textInput',
                        placeholder: 'Your credit card information',
                        icon: 'pick'
                    }
                },
                {
                    properties: {
                        type: 'button',
                        text: 'Submit',
                        marginTop: 5,
                        primary: true,
                        onClick: () => {
                            util.alert('testalert', 'This is an alert!', 'How Cool!', 'Okay Zoom3r');
                        }
                    }
                },
                {
                    properties: {
                        type: 'button',
                        text: 'Create Window',
                        marginTop: 5,
                        primary: true,
                        onClick: () => {
                            let newwin = this.desktop.createWindow({
                                title: "new window"
                            });          
                            newwin.on("close", () => newwin.close());          
                        }
                    }
                }
            ]
        }, contents);
        win2.setContent(contents);

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