
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const DataStore = require("./renderer/musicDataStore");

const myStore = new DataStore({ name: 'Music Data' });
Menu.setApplicationMenu(null)

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 1000,
      height: 800,
      show: false,
      webPreferences: {
        nodeIntegration: true,//可以使用nodeapi
        contextIsolation: false,//在渲染进程使用require
      }
    };
    // 两种写法都可
    // const finalConfig = Object.assign(basicConfig, config);
    const finalConfig = { ...basicConfig, ...config };

    super(finalConfig);

    // this.webContents.openDevTools(); //自动打开调试工具

    this.loadFile(fileLocation);
    this.once("ready-to-show", () => {
      this.show();
    })
  }
}

app.on("ready", () => {
  const mainWindow = new AppWindow({}, "./renderer/index.html");
  mainWindow.webContents.on("did-finish-load", (e) => {
    e.sender.send("getTracks", myStore.getTracks());
  })
  let addWindow
  // 打开添加音乐窗口
  ipcMain.on("add-music-window", (e, arg) => {
    addWindow = new AppWindow({
      width: 800,
      height: 600,
      parent: mainWindow
    }, "./renderer/add.html");
  })
  // 导入音乐
  ipcMain.on("add-tracks", (e, tracks) => {
    const updateedTracks = myStore.addTracks(tracks).getTracks();
    // e.sender.send("getTracks", updateedTracks);
    mainWindow.send("getTracks", updateedTracks);
    addWindow.close()
    mainWindow.show()
  })
  // 删除音乐
  ipcMain.on("delete-track", (event, id) => {
    const updateedTracks = myStore.deleteTrack(id).getTracks();
    mainWindow.send("getTracks", updateedTracks);
  })
  // 选择音乐文件
  ipcMain.on("open-music-file", async (e, arg) => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Music", extensions: ["mp3"]
        }
      ]
    });
    if (filePaths) {
      e.sender.send("selected-file", filePaths);
    }
  })
})
