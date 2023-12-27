const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const {readFile, updateFile, writeFile} = require('./service/service')

const env = ''

const createWindow = ()=>{
    const win = new BrowserWindow({
        width:800,
        height:600,
        webPreferences:{
            preload: path.resolve(__dirname,'preload.js'),
            sandbox: false
        }
    })

    if(env === 'dev'){
        win.loadURL('http://localhost:5173/')
        win.webContents.openDevTools()
    }else {
        win.loadFile('dist/index.html')
    }
}


app.whenReady().then(()=>{
    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})


ipcMain.handle('event_get_saves',(event,path)=>{
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
})

ipcMain.handle('event_save',(event,_props)=>{
    const props = JSON.parse(_props)
    const {savePath} = props
    //console.log(props)

    return new Promise((resolve,reject)=>{
        const filePath = savePath + '\\game.sii'
        //检查文件是否存在
        fs.access(filePath,fs.constants.F_OK, (err)=>{
            if(err){
                console.log('No Such File')
                resolve({status:false, msg: '文件不存在'})
            }
        })
        //解密文件
        const command = `SII_Decrypt \"${filePath}\"`
        exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
            if(stdout.includes('Data contain a plain-text SII')){
                1 === 1;
            }else{
                console.log(111)
                console.log(stdout)
                console.log('File Decrypt Failed')
                resolve({status:false, msg:'文件解密失败.'})
            }
        }

        //修改文件
        const fileData = readFile(filePath)
        if(!fileData) resolve({status: false, msg: '文件读取失败'})

        const newFileData = updateFile(fileData,props)

        const status = writeFile(filePath, newFileData)
        if(status){
            resolve({status:true, msg:'保存成功.'})
            console.log('saved..')
        }else {
            resolve({status:false, msg:'保存失败.'})
            console.log('Fail to Save')
        }


        })
    })
})



