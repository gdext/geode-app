import ui from '../../scripts/ui';

class MainWindow {
    constructor(desktop) {
        this.window = desktop.createWindow({
            title: 'Geode Mod Manager',
            width: 256,
            height: 512
        });

        this.events = {};

        this.window.on('close', () => this.window.close());

        this.generate();
    }

    generate() {
        // Add here code to generate the ui
        // You can also use this.emit("event", data) to send and
        // event so when ex a mod is activated

        this.window.content = document.createElement("p");
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
}

export default MainWindow; 