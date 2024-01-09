const {contextBridge, ipcRenderer} = require('electron')
const os = require('os')

//获取主要路径
const user_home = os.homedir()
const ets_path = user_home + '\\Documents\\Euro Truck Simulator 2\\profiles'
const ats_path = user_home + '\\Documents\\American Truck Simulator\\profiles'

contextBridge.exposeInMainWorld('myApi',
    {
        ipc: ipcRenderer,
        ets_path: ets_path,
        ats_path: ats_path,
    })