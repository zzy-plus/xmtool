const {contextBridge, ipcRenderer} = require('electron')


contextBridge.exposeInMainWorld('myApi',
    {
        ipc: ipcRenderer,
        ipcListen: (event, callback) => ipcRenderer.on(event, callback)
    })