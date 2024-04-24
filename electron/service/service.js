const fs = require('fs')
const keymap = require('./keymap')
const os = require('os')
const {execSync} = require('child_process')

const engine_750 = "/def/vehicle/truck/scania.s_2016/engine/dc16_730.sii"

//读取文件内容
const readFile = (filePath)=>{
    try {
        return fs.readFileSync(filePath,'utf8')
    }catch (e) {
        console.log(e)
        return undefined
    }
}

//修改文件数据
const updateFile = (data, props, licensePlate)=>{
    const {money, level, skill, city, garage, truckVendors, fixAll, fuelling, mass, engine} = props
    let __engine = engine   //分身？
    const fileArr = data.split('\r\n')
    let index = 0
    let hqCity = ''
    const cityName = new Set()
    const dealerCities = new Set()
    const temp_level = []
    const temp_skill = []
    const visitedCity = []
    const visitedIndex = {
        city: 0,
        count: 0,
        company: []
    }
    const temp_garage = []
    const unlockedDealers = []
    let unlockedDealersIndex = 0

    let engine_flag = false


    for (const line of fileArr) {
        if (line.startsWith(' hq_city: ')) {
            hqCity = line.split(': ')[1]
        } else if (line.startsWith(' companies[')) {
            if (city) {
                cityName.add(line.split('.')[3])
            }
            if (truckVendors) {
                dealerCities.add(line.split('.')[3])
            }
        }

        if(mass && line.startsWith(' cargo_mass:')){
            fileArr[index] = line.replace(/cargo_mass: &*[0-9a-z]+/, 'cargo_mass: 1000')
        }

        //匹配车牌
        if(__engine && line.startsWith(' license_plate:')){

            //这样理论上效率高，但是不保险
            // const plates = licensePlate.trim().split(' ')
            // const regex = new RegExp(plates.join('.*'))
            //稳妥做法：
            const plates = licensePlate.replace(/\s/g, '')
            let regex = ''
            for (const c of plates) {
                regex += `${c}.*`
            }
            const match = line.match(regex)
            if(match){
                engine_flag = true
                console.log("matched line: ", match[0])
            }
        }

        //匹配到车牌才开始检索要修改的行，修改完屏蔽engine选项防止多次修改
        if(engine_flag && line.includes('engine')){
            fileArr[index] = ' data_path: \"/def/vehicle/truck/volvo.fh16_2012/engine/d16g750.sii\"'
            engine_flag = false
            __engine = false
        }

        if(money && line.startsWith(' money_account')){
            fileArr[index] = line.replace(/money_account: [^,\n]+/, 'money_account: 100000000')
        }
        if(level && line.startsWith(' experience_points')){
            temp_level.push(index)
        }
        if(skill){
            if(line.startsWith('adr')){
                temp_skill.push(index)
            }else if(line.startsWith(' screen_access_list:')){
                fileArr[index] = line.replace(/screen_access_list: [^,\n]+/, 'screen_access_list: 0')
            }else if(line.startsWith(' screen_access_list[')){
                fileArr[index] = ''
            }
        }
        if(city){
            if(line.startsWith(' visited_cities[')){
                visitedCity.push(line.split(': ')[1])
            }else if(line.startsWith(' visited_cities: ')){
                visitedIndex.city = index
            }else if(line.startsWith(' visited_cities_count: ')){
                visitedIndex.count = index
            }else if(line.startsWith(' reserved_trailer_slot: ')){
                visitedIndex.company.push(index - 1)
            }
        }
        if(garage && line.startsWith('garage : garage.')){
            if (!line.startsWith('garage : garage.' + hqCity)) {
                temp_garage.push(index)
            }
        }
        if(truckVendors){
            if(line.startsWith(' unlocked_dealers[')){
                unlockedDealers.push(line.split(': ')[1])
            }else if(line.startsWith(' unlocked_dealers: ')){
                unlockedDealersIndex = index
            }
        }
        if(fixAll){
            if(line.startsWith(' trailer_body_wear:')){
                fileArr[index] = line.replace(/_wear: [^,\n]+/, '_wear: 0')
            }else if(line.startsWith(' trailer_body_wear_unfixable:')){
                fileArr[index] = line.replace(/_wear_unfixable: [^,\n]+/, '_wear_unfixable: 0')
            }else if(line.startsWith(' chassis_wear:')){
                fileArr[index] = line.replace(/_wear: [^,\n]+/, '_wear: 0')
            }else if(line.startsWith(' chassis_wear_unfixable:')){
                fileArr[index] = line.replace(/_wear_unfixable: [^,\n]+/, '_wear_unfixable: 0')
            }else if(line.startsWith(' engine_wear:')){
                fileArr[index] = line.replace(/_wear: [^,\n]+/, '_wear: 0')
            }else if(line.startsWith(' engine_wear_unfixable:')){
                fileArr[index] = line.replace(/_wear_unfixable: [^,\n]+/, '_wear_unfixable: 0')
            }else if(line.startsWith(' transmission_wear:')){
                fileArr[index] = line.replace(/_wear: [^,\n]+/, '_wear: 0')
            }else if(line.startsWith(' transmission_wear_unfixable:')){
                fileArr[index] = line.replace(/_wear_unfixable: [^,\n]+/, '_wear_unfixable: 0')
            }else if(line.startsWith(' cabin_wear:')){
                fileArr[index] = line.replace(/_wear: [^,\n]+/, '_wear: 0')
            }else if(line.startsWith(' cabin_wear_unfixable:')){
                fileArr[index] = line.replace(/_wear_unfixable: [^,\n]+/, '_wear_unfixable: 0')
            }else if(line.startsWith(' wheels_wear:')){
                fileArr[index] = line.replace(/_wear: [^,\n]+/, '_wear: 0')
            }else if(line.startsWith(' wheels_wear_unfixable:')){
                fileArr[index] = line.replace(/_wear_unfixable: [^,\n]+/, '_wear_unfixable: 0')
            }else if(line.startsWith(' wheels_wear[')){
                fileArr[index] = ''
            }else if(line.startsWith(' wheels_wear_unfixable[')){
                fileArr[index] = ''
            }
        }
        if(fuelling && line.startsWith(' fuel_relative')){
            fileArr[index] = line.replace(/fuel_relative: [^,\n]+/, 'fuel_relative: 1')
        }
        index ++
    }

    if (temp_level.length > 0) {
        fileArr[temp_level[0]] = fileArr[temp_level[0]].replace(/experience_points: [^,\n]+/, 'experience_points: 582499')
    }
    if (temp_skill.length > 0) {
        const flag = temp_skill[0]
        fileArr[flag] = fileArr[flag].replace(/adr: [^,\n]+/, 'adr: 63')
        fileArr[flag + 1] = fileArr[flag + 1].replace(/long_dist: [^,\n]+/, 'long_dist: 6')
        fileArr[flag + 2] = fileArr[flag + 2].replace(/heavy: [^,\n]+/, 'heavy: 6')
        fileArr[flag + 3] = fileArr[flag + 3].replace(/fragile: [^,\n]+/, 'fragile: 6')
        fileArr[flag + 4] = fileArr[flag + 4].replace(/urgent: [^,\n]+/, 'urgent: 6')
        fileArr[flag + 5] = fileArr[flag + 5].replace(/mechanical: [^,\n]+/, 'mechanical: 6')
    }
    if (cityName.size > 0) {
        visitedCity.forEach(element => {
            cityName.delete(element)
        })
        const cityNum = Number(fileArr[visitedIndex.city].split(': ')[1])
        const num = cityNum + cityName.size
        const arrCityName = [...cityName]

        if (cityNum === 0) {
            let str = '\r\n'
            let strCount = '\r\n'
            for (let j = 0; j < arrCityName.length; j++) {
                if (j === arrCityName.length - 1) {
                    str += ` visited_cities[${j}]: ${arrCityName[j]}`
                    strCount += ` visited_cities_count[${j}]: 1`
                } else {
                    str += ` visited_cities[${j}]: ${arrCityName[j]}\r\n`
                    strCount += ` visited_cities_count[${j}]: 1\r\n`
                }
            }
            fileArr[visitedIndex.city] = ' visited_cities: ' + num + str
            fileArr[visitedIndex.count] = ' visited_cities_count: ' + num + strCount
        } else if (num > cityNum) {
            let str = '\r\n'
            let strCount = '\r\n'
            for (let j = 0; j < arrCityName.length; j++) {
                const num = j + cityNum
                str += ` visited_cities[${num}]: ${arrCityName[j]}`
                strCount += ` visited_cities_count[${num}]: 1`
                if (j < arrCityName.length - 1) {
                    str += '\r\n'
                    strCount += '\r\n'
                }
            }
            fileArr[visitedIndex.city] = ' visited_cities: ' + num
            fileArr[visitedIndex.count] = ' visited_cities_count: ' + num

            fileArr[visitedIndex.city + cityNum] += str
            fileArr[visitedIndex.count + cityNum] += strCount
        }

        for (let i = 0; i < visitedIndex.company.length; i++) {
            fileArr[visitedIndex.company[i]] = fileArr[visitedIndex.company[i]].replace(/discovered: [^,\n]+/, 'discovered: true')
        }
    }

    if (temp_garage.length > 0) {
        for (let i = 0; i < temp_garage.length; i++) {
            const vehiclesNum = Number(fileArr[temp_garage[i] + 1].split(': ')[1])
            if (vehiclesNum === 0) {
                let str = '\r\n'
                for (let j = 0; j < 5; j++) {
                    if (j === 4) {
                        str += ` vehicles[${j}]: null`
                    } else {
                        str += ` vehicles[${j}]: null\r\n`
                    }
                }
                fileArr[temp_garage[i] + 1] = ' vehicles: 5' + str
            } else if (vehiclesNum < 5) {
                let str = '\r\n'
                for (let j = vehiclesNum; j < 5; j++) {
                    if (j === 4) {
                        str += ` vehicles[${j}]: null`
                    } else {
                        str += ` vehicles[${j}]: null\r\n`
                    }
                }
                fileArr[temp_garage[i] + 1] = ' vehicles: 5'
                fileArr[temp_garage[i] + 1 + vehiclesNum] += str
            }
            const driversNum = Number(fileArr[temp_garage[i] + 2 + vehiclesNum].split(': ')[1])
            if (driversNum === 0) {
                let str = '\r\n'
                for (let j = 0; j < 5; j++) {
                    if (j === 4) {
                        str += ` drivers[${j}]: null`
                    } else {
                        str += ` drivers[${j}]: null\r\n`
                    }
                }
                fileArr[temp_garage[i] + 2 + vehiclesNum] = ' drivers: 5' + str
            } else if (driversNum < 5) {
                let str = '\r\n'
                for (let j = driversNum; j < 5; j++) {
                    if (j === 4) {
                        str += ` drivers[${j}]: null`
                    } else {
                        str += ` drivers[${j}]: null\r\n`
                    }
                }
                fileArr[temp_garage[i] + 2 + vehiclesNum] = ' drivers: 5'
                fileArr[temp_garage[i] + 2 + vehiclesNum + driversNum] += str
            }
            for (let t = 1; t < 6; t++) {
                const statusIndex = temp_garage[i] + 2 + vehiclesNum + driversNum + t
                if (fileArr[statusIndex].startsWith(' status: ')) {
                    fileArr[statusIndex] = ' status: 3'
                    break
                }
            }
        }
    }

    if (dealerCities.size > 0) {
        unlockedDealers.forEach(element => {
            dealerCities.delete(element)
        })
        const dealerNum = Number(fileArr[unlockedDealersIndex].split(': ')[1])
        const num = dealerNum + dealerCities.size
        const arrDealerCity = [...dealerCities]

        if (dealerNum === 0) {
            let str = '\r\n'
            for (let j = 0; j < arrDealerCity.length; j++) {
                if (j === arrDealerCity.length - 1) {
                    str += ` unlocked_dealers[${j}]: ${arrDealerCity[j]}`
                } else {
                    str += ` unlocked_dealers[${j}]: ${arrDealerCity[j]}\r\n`
                }
            }
            fileArr[unlockedDealersIndex] = ' unlocked_dealers: ' + num + str
        } else if (num > dealerNum) {
            let str = '\r\n'
            for (let j = 0; j < arrDealerCity.length; j++) {
                const num = j + dealerNum
                str += ` unlocked_dealers[${num}]: ${arrDealerCity[j]}`
                if (j < arrDealerCity.length - 1) {
                    str += '\r\n'
                }
            }
            fileArr[unlockedDealersIndex] = ' unlocked_dealers: ' + num
            fileArr[unlockedDealersIndex + dealerNum] += str
        }
    }

    return fileArr.join('\r\n')
}

//写入文件
const writeFile = (filePath, data) =>{
    try{
        fs.writeFileSync(filePath, data, 'utf8')
        return true
    }catch (e){
        console.log(e)
        return false
    }
}

//开启飞行
const enableFlyMode = (gamePath)=>{

    const configPath = gamePath + 'config.cfg'
    try{
        const lines = fs.readFileSync(configPath, 'utf8').split('\r\n')

        for (let i = 1; i < lines.length; i++){
            if(lines[i].trim().startsWith('uset g_developer ')){
                lines[i] = lines[i].replace('0', '1')
            }
            if(lines[i].trim().startsWith('uset g_console ')){
                lines[i] = lines[i].replace('0', '1')
                break
            }
        }

        fs.writeFileSync(configPath,lines.join('\r\n'),'utf8')
        console.log('Success to Enable Fly Mode!')
        return true
    }catch (e){
        console.log(e.message)
        return false
    }
}

//修改飞行模式按键
const setKeys = (controlsPath, keys)=>{

    const lines = fs.readFileSync(controlsPath, 'utf8').split('\r\n')
    for (let i = 0; i<lines.length; i++){
        if(lines[i].includes('dbgfwd') && keys['fwd'] !== ''){
            const index1 = lines[i].indexOf('\`',0)
            const code = keymap[keys['fwd'].toLowerCase()]
            if(!code) continue;
            lines[i] = lines[i].substring(0, index1) + `\`${code}?0\`\"`
        }else if(lines[i].includes('dbgback') && keys['back'] !== ''){
            const index1 = lines[i].indexOf('\`',0)
            const code = keymap[keys['back'].toLowerCase()]
            if(!code) continue;
            lines[i] = lines[i].substring(0, index1) + `\`${code}?0\`\"`
        }else if(lines[i].includes('dbgleft') && keys['left'] !== ''){
            const index1 = lines[i].indexOf('\`',0)
            const code = keymap[keys['left'].toLowerCase()]
            if(!code) continue;
            lines[i] = lines[i].substring(0, index1) + `\`${code}?0\`\"`
        }else if(lines[i].includes('dbgright') && keys['right'] !== ''){
            const index1 = lines[i].indexOf('\`',0)
            const code = keymap[keys['right'].toLowerCase()]
            if(!code) continue;
            lines[i] = lines[i].substring(0, index1) + `\`${code}?0\`\"`
        }else if(lines[i].includes('dbgup') && keys['up'] !== ''){
            const index1 = lines[i].indexOf('\`',0)
            const code = keymap[keys['up'].toLowerCase()]
            if(!code) continue;
            lines[i] = lines[i].substring(0, index1) + `\`${code}?0\`\"`
        }else if(lines[i].includes('dbgdown') && keys['down'] !== ''){
            const index1 = lines[i].indexOf('\`',0)
            const code = keymap[keys['down'].toLowerCase()]
            if(!code) continue;
            lines[i] = lines[i].substring(0, index1) + `\`${code}?0\`\"`
            break
        }
    }
    fs.writeFileSync(controlsPath, lines.join('\r\n'), 'utf8')
}

const getGuideUrl = ()=>{
    return new Promise((resolve, reject)=>{
        fetch('http://121.37.222.191:8020/get')
            .then(response => {
                if (!response.ok) {
                    throw new Error('请求失败：' + response.status)
                }
                return response.json()
            })
            .then(data => {
                resolve(data.xmToolGuideUrl)
            })
            .catch(error => {
                console.log(error.message)
                resolve(0)
            })
    })
}

//缓存按键设置
const saveKeySet = (keys)=>{
    const homedir = os.homedir();
    const keysFile = homedir + '\\AppData\\Roaming\\xmtool\\keys.json'
    fs.writeFileSync(keysFile,JSON.stringify(keys),'utf8')
}

//读取按键设置
const readKeySet = ()=>{
    const homedir = os.homedir();
    const keysFile = homedir + '\\AppData\\Roaming\\xmtool\\keys.json'
    if(fs.existsSync(keysFile)){
        const content = fs.readFileSync(keysFile,'utf8')
        const keys = JSON.parse(content)
        return keys
    }
    return {
        fwd: 'num8',
        back: 'num5',
        left: 'num4',
        right: 'num6',
        up: 'num9',
        down: 'num3'
    }
}

const flyTeleport = (camsTxtPath, profilePath)=>{
    const content = fs.readFileSync(camsTxtPath,'utf8')
    let lines = content.split('\r\n')
    let line = lines[lines.length - 2]

    let location = line.split(' ; ')[1]
    location = location.replaceAll(';', ',')
    console.log(location)
    let rotation = line.split(' ; ')[2]
    rotation = rotation.replaceAll(';', ',').replace(',', ';')
    console.log(rotation)

    // 解密
    const quicksaveGameSii = `${profilePath}\\quicksave\\game.sii`
    try {
        // 在这里执行你的CMD命令
        execSync(`SII_Decrypt \"${quicksaveGameSii}\"`)
    } catch (error) {}

    const gameSiiContent = fs.readFileSync(quicksaveGameSii, 'utf8')
    lines = gameSiiContent.split('\r\n')
    let index = 0
    for (const line of lines) {
        if(line.trim().startsWith('truck_placement:')){
            lines[index] = ` truck_placement: (${location}) (${rotation})`
        }
        if(line.trim().startsWith('trailer_placement:')){
            lines[index] = ` trailer_placement: (0, 0, 0) (${rotation})`
            break
        }
        index ++
    }
    fs.writeFileSync(quicksaveGameSii, lines.join('\r\n'), 'utf8')


}


module.exports = {
    readFile,
    updateFile,
    writeFile,
    enableFlyMode,
    setKeys,
    getGuideUrl,
    saveKeySet,
    readKeySet,
    flyTeleport
}

