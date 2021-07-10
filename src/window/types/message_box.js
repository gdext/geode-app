class MessageBox {
    /**
     * This will make a message box pop up with the `title` being the title
     * text and the `caption` being the center text.
     * @param {*} desktop 
     * @param {*} title 
     * @param {*} caption 
     * @param {*} callback 
     */
    constructor(desktop, title, caption, callback) {
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