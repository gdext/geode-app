import genhtml from './gen_html';
import '../styles/desktop.css';
import '../styles/ui.css';

import bxs_pin from '../assets/bxs-pin.svg';
import close_big from '../assets/ic-exit.svg';

import Window from './window';

export default class Desktop {
    constructor(body, app) {
        genhtml.load_icon("bxs-pin", bxs_pin);
        genhtml.load_icon("close-big", close_big);

        this.body = body;
        this.app  = app;

        this.lastId = 0;

        this.windows = {};
        this.windowOrder = [];

        this.overlay_visible = false;

        this.generate();

        document.addEventListener("mousedown", (e) => {
            let win = this.getWindowAt(e.clientX, e.clientY);

            if (win != null)
                this.putWindowOnTop(win);
        });
    }

    generate() {
        this.layer   = genhtml.div("geode-layer");
        this.footer  = genhtml.span("geode-footer", this.app.version);
        this.desktop = genhtml.div("geode-app");

        this.layer.style.opacity = '0';
        this.footer.style.opacity = '0';
        
        genhtml.add(this.body, this.layer);
        genhtml.add(this.body, this.footer);
        genhtml.add(this.body, this.desktop);
    }

    updateZOrders() {
        for (let i = 0; i < this.windowOrder.length; i++) {
            let id  = this.windowOrder[i];
            this.windows[id].setZOrder(i);
        }
    }

    getWindowAt(x, y) {
        let lastWin = null;

        for (let i = 0; i < this.windowOrder.length; i++) {
            let id  = this.windowOrder[i];
            let win = this.windows[id];

            if (win.isInWindow(x, y)) lastWin = id;
        }

        return lastWin;
    }

    putWindowOnTop(id) {
        console.log(id);

        for (let i = 0; i < this.windowOrder.length; i++) {
            if (this.windowOrder[i] == id) {
                this.windowOrder.splice(i, 1);
                break;
            }
        }

        this.windowOrder.push(id);
        this.updateZOrders();
    }

    destroyWindow(id) {
        for (let i = 0; i < this.windowOrder.length; i++) {
            if (this.windowOrder[i] == id) {
                this.windowOrder.splice(i, 1);
                break;
            }
        }

        this.windows[id] = undefined;

        this.updateZOrders();
    }

    createWindow(data) {
        let win = new Window(this, this.lastId, data);
        win.setVisible(this.overlay_visible);
        
        genhtml.add(this.desktop, win.getElement());

        this.windows[this.lastId] = win;

        this.windowOrder.push(this.lastId);
        this.lastId++;

        this.updateZOrders();

        return win;
    }

    changeOverlayState(state) {
        if (state == true) {
            this.layer.style.opacity = '';
            this.footer.style.opacity = '';
        } else {
            this.layer.style.opacity = '0';
            this.footer.style.opacity = '0';
        }

        this.overlay_visible = state;

        for (let i = 0; i < this.windowOrder.length; i++) {
            let id  = this.windowOrder[i];
            this.windows[id].setVisible(state);
        }
    }
}