import ui from './gen_html'

const DRAG_UP    = 0b1000;
const DRAG_DOWN  = 0b0100;
const DRAG_LEFT  = 0b0010;
const DRAG_RIGHT = 0b0001;

export default class Window {
    constructor(desktop, id, data) {
        this.x = data.x ? data.x : 200;
        this.y = data.y ? data.y : 300;
        this.width  = data.width  ? data.width  : 400;
        this.height = data.height ? data.height : 300;

        this.title = data.title ? data.title : "Geode Untitled Window";

        this.maxWidth  = data.maxWidth  ? data.maxWidth  : 200;
        this.maxHeight = data.maxHeight ? data.maxHeight : 28;

        this.id = id;

        this.desktop = desktop;

        this.content = ui.div("window-content");

        this.events = {};

        this.holding  = false;
        this.dragHold = 0;

        this.ignoreHolding = false;

        let posLeft = 0;
        let posRight = 0;

        let posTop = 0;
        let posBottom = 0;

        this.pinned = false;

        this.pinButton   = ui.icon("bxs-pin", "window-button");
        this.closeButton = ui.icon("close-big", ["window-button", "close-button"]);

        this.pinButton.onmousedown = () => {
            this.ignoreHolding = true;
        }

        this.closeButton.onmousedown = () => {
            this.ignoreHolding = true;
        }

        this.pinButton.onclick = e => {
            this.emit("pinned", !this.pinned);
            if (e.button == 0) this.setPinned(!this.pinned);
        }

        this.closeButton.onclick = e => {
            this.emit("close");
        }

        this.windowTop = ui.div("window-top", [
            ui.span("window-title", this.title),
            ui.div("window-buttons", [
                this.pinButton,
                this.closeButton
            ])
        ]);

        this.windowTop.onmousedown = (e) => {
            window.getSelection().empty();

            if (this.ignoreHolding) {
                this.ignoreHolding = false;
                return;
            }
            
            if (e.button == 0)
                this.holding = true;
        };

        let dragUp = (deltaY) => {
            posTop += deltaY;

            this.y = Math.min(posTop, posBottom - this.maxHeight);
            this.height -= deltaY;
        };

        let dragDown = (deltaY) => {
            this.height += deltaY;
        };

        let dragLeft = (deltaX) => {
            posLeft += deltaX;

            this.x = Math.min(posLeft, posRight - this.maxWidth);
            this.width -= deltaX;
        };

        let dragRight = (deltaX) => {
            this.width += deltaX;
        };

        document.addEventListener('mousemove', (e) => {
            if (this.dragHold != 0) {
                if ((this.dragHold & DRAG_UP) != 0)
                    dragUp(e.movementY);
                if ((this.dragHold & DRAG_DOWN) != 0)
                    dragDown(e.movementY);
                if ((this.dragHold & DRAG_LEFT) != 0)
                    dragLeft(e.movementX);
                if ((this.dragHold & DRAG_RIGHT) != 0)
                    dragRight(e.movementX);

                this.updateTransform();
            } else if (this.holding) {
                this.x += e.movementX;
                this.y += e.movementY;

                this.updateTransform();
            }
        });

        document.addEventListener('mouseup', (e) => {
            this.holding  = false;
            this.dragHold = 0;

            this.width  = Math.max(this.width, this.maxWidth);
            this.height = Math.max(this.height, this.maxHeight);
        });

        this.dragTop    = ui.div(["window-drag", "drag-top"]);
        this.dragBottom = ui.div(["window-drag", "drag-bottom"]);
        this.dragLeft   = ui.div(["window-drag", "drag-left"]);
        this.dragRight  = ui.div(["window-drag", "drag-right"]);

        this.dragTopLeft     = ui.div(["window-drag", "drag-topleft"]);
        this.dragTopRight    = ui.div(["window-drag", "drag-topright"]);
        this.dragBottomLeft  = ui.div(["window-drag", "drag-bottomleft"]);
        this.dragBottomRight = ui.div(["window-drag", "drag-bottomright"]);

        let mousedownCallback = (type, e) => {
            window.getSelection().empty();

            if (e.button == 0) {
                this.dragHold = type;
                console.log(type);
            }

            posLeft = this.x;
            posRight = posLeft + this.width;

            posTop = this.y;
            posBottom = posTop + this.height;
        }

        this.dragTop.onmousedown    = mousedownCallback.bind(this, DRAG_UP);
        this.dragBottom.onmousedown = mousedownCallback.bind(this, DRAG_DOWN);
        this.dragLeft.onmousedown   = mousedownCallback.bind(this, DRAG_LEFT);
        this.dragRight.onmousedown  = mousedownCallback.bind(this, DRAG_RIGHT);

        this.dragTopLeft.onmousedown     = mousedownCallback.bind(this, DRAG_UP | DRAG_LEFT);
        this.dragTopRight.onmousedown    = mousedownCallback.bind(this, DRAG_UP | DRAG_RIGHT);
        this.dragBottomLeft.onmousedown  = mousedownCallback.bind(this, DRAG_DOWN | DRAG_LEFT);
        this.dragBottomRight.onmousedown = mousedownCallback.bind(this, DRAG_DOWN | DRAG_RIGHT);

        this.winElement = ui.div("geode-window", [
            this.windowTop,
            this.dragTop,
            this.dragBottom,
            this.dragLeft,
            this.dragRight,
            this.dragTopLeft,
            this.dragTopRight,
            this.dragBottomLeft,
            this.dragBottomRight,
            this.content
        ]);

        this.updateTransform();
    }

    emit(event, ...args) {
        if (this.events[event])
            for (let cb of this.events[event])
                cb(...args);
    }

    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];

        this.events[event].push(callback);
    }

    close() {
        this.winElement.style.opacity = 0;
        this.winElement.style.animation = 'popOut ease 0.25s';
        this.winElement.style.animationFillMode = 'both';
        setTimeout(() => {
            this.winElement.remove();
            this.desktop.destroyWindow(this.id);
        }, 250);
    }

    setContent(content) {
        while (this.content.firstChild) {
            this.content.removeChild(this.content.lastChild);
        }

        ui.add(this.content, content);
    }

    setPinned(state) {
        if (state) {
            this.winElement.style.opacity = '';
            this.pinButton.classList.add("pinned");
        } else
            this.pinButton.classList.remove("pinned");

        this.pinned = state;
    }

    setVisible(visible) {
        if (this.pinned) return;

        if (visible)
            this.winElement.style.opacity = '';
        else
            this.winElement.style.opacity = '0';
    }

    setZOrder(order) {
        this.winElement.style["z-index"] = order.toString();
    }

    isInWindow(x, y) {
        let rect = this.winElement.getBoundingClientRect();

        return x >= rect.left - 4 && x < rect.right + 4 &&
               y >= rect.top - 4  && y < rect.bottom + 4;
    }

    updateTransform() {
        this.winElement.style["left"] = this.x + "px";
        this.winElement.style["top"]  = this.y + "px";

        this.winElement.style["width"]  = Math.max(this.width, 200) + "px";
        this.winElement.style["height"] = Math.max(this.height, 28) + "px";
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;

        updateTransform();
    }

    setSize(w, h) {
        this.width  = w;
        this.height = h;

        updateTransform();
    }

    getContent() {
        return this.content;
    }

    getElement() {
        return this.winElement;
    }
}