import ui from '../../scripts/ui';

class MainWindow {
    constructor(desktop, callback) {
        this.window = desktop.createWindow({
            title: 'Geode Mod Manager',
            width: 256,
            height: 512
        });

        this.window.on('close', () => {
            this.window.close();
            callback();
        });

        //this.window.setContent( /* Put here an element to be set as the window content */ );
    }
}

export default MainWindow; 