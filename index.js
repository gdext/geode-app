const { app } = require('electron');
const MainApp = require('./main');

let mainApp;

app.whenReady().then(() => {
    mainApp = new MainApp();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') mainApp.exitApp();
});