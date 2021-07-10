class MainWindow {
    constructor(desktop, callback) {
        this.window = desktop.createWindow({
            title: title,
            width: 200,
            height: 100
        });

        this.window.on('close', () => {
            this.window.close();
            callback();
        });

        this.window.setContent( /* Put here an element to be set as the window content */ );
    }
}