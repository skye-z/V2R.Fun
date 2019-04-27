const {
    BrowserWindow,
    ipcMain,
    app
} = require('electron')
var Config = require("./package.json");
var LoadWindow = null;
var MainWindow = null;

app.on('ready', () => {
    LoadWindow = new BrowserWindow({
        show: false,
        width: 350,
        height: 150,
        frame: false,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        title: 'V2r.Fun v' + Config.version,
        webPreferences:{
            nodeIntegration: true
        }
    });
    LoadWindow.loadURL('file://' + __dirname + '/app/load.html');
    LoadWindow.once('ready-to-show', () => {
        LoadWindow.show()
    });
    LoadWindow.on('closed', () => {
        LoadWindow = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
})

ipcMain.on('main-open', () => {
    MainWindow = new BrowserWindow({
        show: false,
        width: 350,
        height: 500,
        frame: false,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        title: 'V2r.Fun v' + Config.version,
        webPreferences:{
            nodeIntegration: true
        }
    });
    MainWindow.loadURL('file://' + __dirname + '/app/index.html');
    MainWindow.webContents.openDevTools();
    MainWindow.once('ready-to-show', () => {
        MainWindow.show();
        LoadWindow.close();
    });
    MainWindow.on('closed', () => {
        MainWindow = null;
    });
});

ipcMain.on("main-close",()=>{
    MainWindow.close();
});

ipcMain.on("main-hide",()=>{
    MainWindow.hide();
});