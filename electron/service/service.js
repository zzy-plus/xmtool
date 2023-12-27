const fs = require('fs')


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
const updateFile = (data, props)=>{
    const {money, level, skill, city, garage, truckVendors, fixAll, fuelling} = props
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


module.exports = {
    readFile,
    updateFile,
    writeFile
}

