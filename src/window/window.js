import ui from './ui'

const DRAG_UP    = 0b1000;
const DRAG_DOWN  = 0b0100;
const DRAG_LEFT  = 0b0010;
const DRAG_RIGHT = 0b0001;

export default class Window {
    constructor(desktop, id, data, callback) {
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

        this.holding  = false;
        this.dragHold = 0;

        let posLeft = 0;
        let posRight = 0;

        let posTop = 0;
        let posBottom = 0;

        this.windowTop = ui.div("window-top", [
            ui.span("window-title", this.title),
            ui.div("window-buttons", [
                ui.icon("bxs-pin", "window-button"),
                ui.icon("close-big", "window-button")
            ])
        ]);

        this.windowTop.onmousedown = (e) => {
            window.getSelection().empty();
            
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