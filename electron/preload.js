const {contextBridge, ipcRenderer} = require('electron')


contextBridge.exposeInMainWorld('myApi',
    {
        ipc: ipcRenderer,
    })