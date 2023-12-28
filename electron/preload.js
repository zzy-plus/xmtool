const {contextBridge, ipcRenderer, app} = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process');



//获取主要路径
const user_home = os.homedir()
const ets_path = user_home + '\\Documents\\Euro Truck Simulator 2\\profiles'

const profiles = fs.readdirSync(ets_path)
const documents = []
for (const profile of profiles) {
    let profile_sii_path = ets_path + '\\' + profile + '\\profile.sii'
    try {
        // 在这里执行你的CMD命令
        execSync(`SII_Decrypt \"${profile_sii_path}\"`);
    } catch (error) {
        // 处理错误
        console.log('Error executing command:', error.message)
    }
    try{
        let content = fs.readFileSync(profile_sii_path,'utf8')
        let lines = content.split('\n');
        for (let i = lines.length - 1; i > 0; i--) {
            if(lines[i].startsWith(' profile_name')){
                let item = lines[i].split(':')[1].trim().replace(/"/g,'')
                let profile_name = decodeURIComponent(item.replace(/\\x/g, "%"));
                documents.push({
                    profile: profile,
                    profile_name: profile_name
                })
                console.log(profile_name)
                break
            }
        }
    }catch (err){
        console.log(err.message)
    }
}




contextBridge.exposeInMainWorld('myApi',
    {
        ipc: ipcRenderer,
        home: user_home,
        ets_path: ets_path,
        getDoc: ()=> documents  //注意不能直接返回数组的引用，而要返回其副本
    })