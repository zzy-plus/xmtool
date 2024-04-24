const {app, BrowserWindow, ipcMain, Menu, dialog} = require('electron')
const path = require('path')
const fs = require('fs')
const {execSync, exec} = require('child_process')
const {readFile, updateFile, writeFile,
    enableFlyMode, setKeys, getGuideUrl,
    saveKeySet, readKeySet, flyTeleport } = require('./service/service')


const env = ''

let guideUrl = 'https://www.baidu.com'
const mainMenu = Menu.buildFromTemplate([
    {
        label: '菜单',
        submenu: [
            {
                label: '关闭窗口',
                role: 'quit'
            },
            {
                label: '关于',
                click: () => showDlg()
            }
        ]
    },
    {
        label: '工具',
        submenu: [
            {
                label: '飞行模式',
                click: ()=> showFlyModeDlg()
            },
            {
                label: '调试[DeBug]',
                role: 'toggledevtools'
            }
        ]
    },
    {
      label: '帮助',
      submenu: [
          {
              label: '使用教程[视频]',
              click: ()=> {execSync(`start ${guideUrl}`)}
          }
      ]
    }
])

let win
const createWindow = () => {
    win = new BrowserWindow({
        width: 800, //800
        height: 613,
        backgroundColor: '#ffffff',
        resizable: false,
        // title: 'XM修改工具',
        //icon: path.resolve(__dirname, '../src/assets/favicon_m.ico'), // 指定图标路径
        icon: './assets/favicon_m.ico',
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            sandbox: false
        }
    })

    if (env === 'dev') {
        win.loadURL('http://localhost:5173/')
        //win.webContents.openDevTools()
    } else if (env === 'dev2') {
        win.loadFile('dist/index.html')
        // win.webContents.openDevTools()
    } else {
        win.loadFile('dist/index.html')
        //win.webContents.openDevTools()
    }

    Menu.setApplicationMenu(mainMenu)
    //在这里设置标题无效，需要去index.html修改
    win.setTitle('XM修改工具')
}

const showDlg = async () => {
    const options = {
        type: 'info',
        title: '关于这款软件',
        message: '开源地址：https://github.com/zzy-plus/xmtool\n' +
            '车队交流群：685297275\n' +
            '@zzy77',
        buttons: ['关闭']
    };

    await dialog.showMessageBox(options);
}


const showFlyModeDlg = ()=>{
    win.webContents.send('cmd_show_flymode_dlg', '')
}

app.whenReady().then(async () => {
    createWindow()
    const res = await getGuideUrl()
    if(res !== 0){
        guideUrl = res
    }
})

app.on('window-all-closed', () => {
    app.quit()
})

ipcMain.handle('event_get_docs', (event, path) => {
    return new Promise((resolve, reject) => {
        try {
            const profiles = fs.readdirSync(path)
            const documents = []
            for (const profile of profiles) {
                let profile_sii_path = path + '\\' + profile + '\\profile.sii'
                try {
                    execSync(`SII_Decrypt \"${profile_sii_path}\"`);
                } catch (error) {
                }
                //
                try {
                    let content = fs.readFileSync(profile_sii_path, 'utf8')
                    let lines = content.split('\n');
                    for (let i = lines.length - 1; i > 0; i--) {
                        if (lines[i].startsWith(' profile_name')) {
                            let item = lines[i].split(':')[1].trim().replace(/"/g, '')
                            let profile_name = decodeURIComponent(item.replace(/\\x/g, "%"));
                            documents.push({
                                profile: profile,
                                profile_name: profile_name
                            })
                            break
                        }
                    }
                } catch (err) {
                    console.log(err.message)
                }
            }
            resolve({status: true, data: documents, msg: 'success'})
        } catch (err) {
            console.log(err.message)
            resolve({status: false, data: null, msg: '文件路径错误'})
        }
    })
})

ipcMain.handle('event_get_saves', (event, path) => {
    return new Promise((resolve, reject) => {
        const files = fs.readdirSync(path)
        const saves = []
        for (const file of files) {
            if (file.startsWith('auto') || file.startsWith('multi'))
                continue;
            let info_sii_path = path + '\\' + file + '\\info.sii'
            try {
                // 在这里执行你的CMD命令
                execSync(`SII_Decrypt \"${info_sii_path}\"`);
            } catch (error) {
                // 处理错误
                console.log('Error executing command:', error.message);
            }
            try{
                let content = fs.readFileSync(info_sii_path, 'utf8')
                let lines = content.split('\n')
                for (const line of lines) {

                    if (line.startsWith(' name:')) {
                        let item = line.split(':')[1].trim().replace(/"/g, '')
                        let save_name = decodeURIComponent(item.replace(/\\x/g, "%"));
                        saves.push({
                            save: file,
                            save_name: save_name
                        })
                        break
                    }
                }
            }catch (error){
                console.log('Illegal Save and Ignored.')
            }
        }
        resolve(saves)
    });
})

ipcMain.handle('event_save', (event, _props) => {
    const props = JSON.parse(_props)
    const {savePath, licensePlate} = props
    //console.log(props)

    return new Promise((resolve, reject) => {
        const filePath = savePath + '\\game.sii'
        //检查文件是否存在
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log('No Such File')
                resolve({status: false, msg: '文件不存在'})
            }
        })
        //解密文件
        const command = `SII_Decrypt \"${filePath}\"`
        exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                if (stdout.includes('Data contain a plain-text SII')) {
                    1 === 1;
                } else {
                    console.log('File Decrypt Failed')
                    resolve({status: false, msg: '文件解密失败.'})
                }
            }

            //修改文件
            const fileData = readFile(filePath)
            if (!fileData) resolve({status: false, msg: '文件读取失败'})

            const newFileData = updateFile(fileData, props, licensePlate)

            const status = writeFile(filePath, newFileData)
            if (status) {
                resolve({status: true, msg: '保存成功.'})
                console.log('saved..')
            } else {
                resolve({status: false, msg: '保存失败.'})
                console.log('Fail to Save')
            }
        })
    })
})

ipcMain.handle('event_open', () => {
    const urlToOpen = 'https://xmvtc.mysxl.cn/'
    execSync(`start ${urlToOpen}`)
})

ipcMain.handle('event_keys_map', ()=>{
    const urlToOpen = 'https://www.bilibili.com/read/cv33293743/?jump_opus=1'
    execSync(`start ${urlToOpen}`)
})

ipcMain.handle('event_decrypt', (__, savePath) => {
    const filePath = savePath + '\\game.sii'
    return new Promise((resolve, reject) => {
        try {
            execSync(`SII_Decrypt \"${filePath}\"`);
        } catch (error) {
            // (没)处理错误
        }
        resolve({status: true})  //
    })

})

ipcMain.handle('event_openfolder', (__, savePath) => {
    return new Promise((resolve, reject) => {
        try {
            execSync(`explorer ${savePath}`);
        } catch (error) {
            // (没)处理错误
        }
        resolve({status: true})
    })

})

ipcMain.handle('event_get_path',()=>{
    return new Promise((resolve,reject)=>{
        const command = 'reg query \"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders\" /v Personal'

        exec(command, (err,stdout, stderr)=>{
            if(err){
                console.log('Erro: ' + stderr)
                resolve({ets_path: 'ets_path', ats_path: 'ats_path'})
            }
            const user_doc = stdout.split(' ').pop().replace(/\r\n/g,'')
            const ets_path = user_doc + '\\Euro Truck Simulator 2\\profiles'
            const ats_path = user_doc + '\\American Truck Simulator\\profiles'
            resolve({ets_path: ets_path, ats_path: ats_path})
        })
    })
})

ipcMain.handle('event_man_select',()=>{

    return new Promise((resolve,reject)=>{
        dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                const path = result.filePaths[0]
                resolve({status: true, path: path})
            }
        }).catch(err => {
            resolve({status: false, path: ''})
            console.log(err)
        });
    })

})

ipcMain.handle('event_enable_fly', (event, params)=>{

    const {gamePath, keys} = JSON.parse(params)
    saveKeySet(keys)

    return new Promise((resolve,reject)=>{

        let flag = enableFlyMode(gamePath.replace('profiles',''))
        if(!flag) resolve({status: false, msg: '开启飞行模式失败！'})

        const profiles = fs.readdirSync(gamePath)
        for (const profile of profiles) {
            let controls_sii_path = gamePath + '\\' + profile + '\\controls.sii'
            try {
                setKeys(controls_sii_path, keys)
            }catch (e){
                console.log(e.message)
            }

        }
        resolve({status: true, msg: '设置成功！'})
    })
})

ipcMain.handle('event_read_keys',()=>{
    return new Promise((resolve,reject)=>{

        const keys = readKeySet()
        resolve({keys: keys})
    })
})


ipcMain.handle('event_get_new_version',()=>{
    try{
        const url = 'https://gitee.com/error-bear/xmtool-download/releases'
        execSync(`start ${url}`)
    }catch (e) {
        console.log(e.message)
    }
    return 0
})

ipcMain.handle('event_fly_teleport',(__, params)=>{
    const {camsTxtPath, profilePath} = JSON.parse(params)
    flyTeleport(camsTxtPath, profilePath)
})


