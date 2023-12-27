const {contextBridge, ipcRenderer, app} = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')



//获取主要路径
const user_home = os.homedir()
const ets_path = user_home + '\\Documents\\Euro Truck Simulator 2\\profiles'
let documents;

fs.readdir(ets_path,(err,files)=>{
    if(err){
        console.log('读取文件路径错误')
        documents = undefined
        return
    }
    documents = files
})



contextBridge.exposeInMainWorld('myApi',
    {
        ipc: ipcRenderer,
        home: user_home,
        ets_path: ets_path,
        getDoc: ()=> documents  //注意不能直接返回数组的引用，而要返回其副本
    })