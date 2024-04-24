<script setup>
import {ref, onMounted, computed, watch} from "vue";
import '@/assets/index.css'
import OptionView from "@/views/OptionView.vue";
import {DocumentChecked, FolderOpened} from '@element-plus/icons-vue';
import UpdateView from "@/views/UpdateView.vue";

const _version = '0.3.0'

const ipc = myApi.ipc
let etsPath = ''
let atsPath = ''
let gamePath = ''
const radio_game = ref('ets')
const onGameChange = async (game) => {
  if (game === 'ets') {
    gamePath = etsPath
  } else {
    gamePath = atsPath
  }
  //游戏选择发生变化，清除下拉选框
  document_selected.value = null
  save_selected.value = null
  document_opts.value = []
  save_opts.value = []
  //重新获取档案
  const result = await getDocs()
  if(!result){
    dialogVisible.value = true
  }
}

//两个选择器
const document_opts = ref(null) //档案
const save_opts = ref(null) //存档
const document_selected = ref(null)
const save_selected = ref(null)

const getDocs = async () => {
  const {status, data, msg} = await ipc.invoke('event_get_docs', gamePath)
  if (!status) {
    document_opts.value = []
    ElMessage.error(msg)
    return false
  } else {
    document_opts.value = data
    return true
  }
}
const onChangeDoc = async (doc) => {
  document_selected.value = doc
  save_selected.value = null
  const docPath = gamePath + '\\' + doc + '\\save'
  save_opts.value = await ipc.invoke('event_get_saves', docPath)
}
const onChangeSave = (save) => {
  save_selected.value = save
}

const props = ref({
  money: false,
  level: false,
  skill: false,
  city: false,
  garage: false,
  truckVendors: false,
  fixAll: false,
  fuelling: false,
  mass: false,
  engine: false
})
const handleProps = (newProps) => {
  props.value = newProps
}

const licensePlateDlgShow = ref(false)
watch(()=> props.value.engine, (val)=>{
  if (val){
    //显示dlg
    licensePlateDlgShow.value = true
  }
})
const licensePlate = ref('')
const confirmLicensePlate = ()=>{
  if(licensePlate.value.trim().length === 0){
    props.value.engine = false
    ElMessage.error("车牌不能为空！")
  }
  licensePlateDlgShow.value = false
}


const onSave = async () => {
  const savePath = gamePath + '\\' + document_selected.value + '\\save\\' + save_selected.value
  const val = JSON.stringify({...props.value, savePath: savePath, licensePlate: licensePlate.value.trim()})
  if (document_selected.value && save_selected.value) {
    const {status, msg} = await ipc.invoke('event_save', val)
    if (status) {
      ElMessage({
        message: msg,
        type: 'success'
      })
    } else {
      ElMessage.error(msg)
    }
  }
}

onMounted(async () => {
  await initApp()
  getUpdateInfo()
})

const initApp = async ()=>{
  const res = await ipc.invoke('event_get_path','')
  etsPath = res.ets_path
  atsPath = res.ats_path
  document_selected.value = null
  save_selected.value = null
  gamePath = etsPath //默认选择欧卡
  console.log('[DEBUG]获取到的路径：', gamePath)
  const result = await getDocs()
  if(!result){
    dialogVisible.value = true
  }
}

const getUpdateInfo = ()=>{
  fetch('http://121.37.222.191:8020/xmtool/update', {
        method: 'GET'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('请求失败：' + response.status)
        }
        return response.json()
      })
      .then(data => {
        updateInfo.value = {...data, 'curVersion': _version}
        if(_version < updateInfo.value.version){
          updateDlgShow.value = true
        }
      })
      .catch(error => {
        console.log(error.message)
      })
}

const onDecrypt = async () => {
  if (!document_selected.value || !save_selected.value) return;
  const savePath = gamePath + '\\' + document_selected.value + '\\save\\' + save_selected.value
  const {status} = await ipc.invoke('event_decrypt', savePath)
  if (status) {
    ElMessage({
      message: '解密成功.',
      type: 'success'
    })
  } else {
    ElMessage.error('解密失败')
  }
}

const onOpenFolder = async () => {
  if (!document_selected.value || !save_selected.value) return;
  const savePath = gamePath + '\\' + document_selected.value + '\\save\\' + save_selected.value
  const {status} = await ipc.invoke('event_openfolder', savePath)
}

const open = () => {
  ipc.invoke('event_open', '')
}

const dialogVisible = ref(false)
const selectPath = async ()=>{
  const {status, path} = await ipc.invoke('event_man_select','')
  if(!status) return;
  gamePath = path + '\\profiles'
  const result = await getDocs()
  if(result){
    dialogVisible.value = false
  }
}

const ignored = ()=>{
  dialogVisible.value = false
}

const title = computed(()=>{
  return radio_game.value === 'ets'? '请手动选择欧卡2文档路径': '请手动选择美卡文档路径'
})

const keyset = ref({
  fwd: '',
  back: '',
  left: '',
  right: '',
  up: '',
  down: ''
})
const flyDlgShow = ref(false)
myApi.ipcListen('cmd_show_flymode_dlg',async (e,params)=>{
  const {keys} = await ipc.invoke('event_read_keys', '')
  keyset.value = keys
  flyDlgShow.value = true
})

const flyModeConfirm = async ()=>{
  flyDlgShow.value = false
  let {status, msg} = await ipc.invoke('event_enable_fly',
      JSON.stringify({gamePath: etsPath, keys: keyset.value}))
  msg = '欧卡：' + msg
  if(status){
    ElMessage({
      message: msg,
      type: 'success'
    })
  }else {
    ElMessage.error(msg)
  }
  ({status, msg} = await ipc.invoke('event_enable_fly',
      JSON.stringify({gamePath: atsPath, keys: keyset.value})))
  msg = '美卡：' + msg
  if(status){
    ElMessage({
      message: msg,
      type: 'success'
    })
  }else {
    ElMessage.error(msg)
  }
}

const openKeyMap = ()=>{
  ipc.invoke('event_keys_map', '')
}

//控制更新对话框是否显示
const updateDlgShow = ref(false)
const updateInfo = ref({})

const teleport = ()=>{
  if(document_selected.value){
    const euro2Path = gamePath.substring(0, gamePath.length - 9)
    const camsTxtPath = euro2Path + '\\cams.txt'
    const profilePath = gamePath + '\\' + document_selected.value + '\\save'
    ipc.invoke('event_fly_teleport', JSON.stringify({
      camsTxtPath: camsTxtPath,
      profilePath: profilePath
    }))
    ElMessage({
      type: 'success',
      message: '传送成功！'
    })
  }
}

</script>

<template>

  <el-dialog
  v-model="dialogVisible"
  :title="title"
  width="60%"
  :close-on-click-modal="false"
  :show-close="false"
  >
    <span>在默认位置寻找文档时出现问题，请手动选择：</span><br/>
    <span>
      示例：C:\Users\username\Documents\{{radio_game === 'ets'? 'Euro Truck Simulator 2': 'American Truck Simulator'}}
    </span>
    <template #footer>
      <el-button type="primary" @click="selectPath">浏览..</el-button>
      <el-button type="danger" @click="ignored">保持忽略</el-button>
    </template>
  </el-dialog>

  <el-row :gutter="0">
    <el-col :span="10">
      <div
          style="height: 500px; background-color: white; display: flex; border-radius: 10px;
          flex-direction: column; justify-content: space-around; align-items: center"
          :style="{boxShadow: `var(--el-box-shadow-light)`}">

        <!--LOGO-->
        <el-popover
            placement="top"
            :width="150"
            trigger="hover"
            content="点击前往xm官网"
        >
          <template #reference>
            <div style="display: flex; flex-direction: column; align-items: center; position: relative; top: 10px">
              <img src="@/assets/logo.png"
                   style="object-fit: contain; width: 235px; border-radius: 15px; cursor: pointer;"
                   @click="open"/>
            </div>
          </template>
        </el-popover>


        <!--选择存档-->
        <div style="display: flex; flex-direction: column; align-items: center">
          <div
              class="radius"
              :style="{
              borderRadius: `var(--el-border-radius-small)`,
              boxShadow: `var(--el-box-shadow-light)`
            }"
              style="display: flex; flex-direction: column ;align-items: center; padding: 3px; cursor: pointer"
          >
            <el-text class="mx-1" type="warning" size="large">
              <template #default>
                <div style="font-size: medium; font-weight: bold" @click="initApp">选&nbsp;择&nbsp;存&nbsp;档</div>
              </template>
            </el-text>
          </div>
          <!--欧卡 美卡 选择-->
          <div style="position: relative; left: -7px">
            <el-radio-group v-model="radio_game" @change="onGameChange" style="margin-top: 8px">
              <el-radio label="ets" size="default">
                <template #default>
                  <el-tag :effect="radio_game == 'ets'?'dark':'light'" type="danger" size="default">ETS2</el-tag>
                </template>
              </el-radio>
              <el-radio label="ats" size="default">
                <template #default>
                  <el-tag :effect="radio_game == 'ats'?'dark':'light'" type="danger" size="default">ATS</el-tag>
                </template>
              </el-radio>
            </el-radio-group>
          </div>

        </div>


        <!--两个选择框-->
        <div>
          <div :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <el-select v-model="document_selected" class="m-2" placeholder="请选择档案" size="large"
                       @change="onChangeDoc">
              <el-option
                  v-for="item in document_opts"
                  :key="item.profile"
                  :label="item.profile_name"
                  :value="item.profile"
              />
            </el-select>
          </div>

          <div :style="{boxShadow: `var(--el-box-shadow-light)`}" style="margin-top: 10px">
            <el-select v-model="save_selected" class="m-2" placeholder="请选择存档" size="large" @change="onChangeSave">
              <el-option
                  v-for="item in save_opts"
                  :key="item.save"
                  :label="item.save_name"
                  :value="item.save"
              />
            </el-select>
          </div>
        </div>

        <!--按钮-->
        <div style="display: flex; flex-direction: column; align-items: center; position: relative; bottom: 10px">
          <el-button-group class="ml-4">
            <el-button type="success" :icon="DocumentChecked" size="small" @click="onDecrypt">解密</el-button>
            <el-button type="success" :icon="FolderOpened" size="small" @click="onOpenFolder">浏览</el-button>
          </el-button-group>

          <el-button-group style="position: relative; top: 10px">
            <el-button type="warning" @click="onSave" >&nbsp;&nbsp;&nbsp;保存&nbsp;&nbsp;&nbsp;
            </el-button>
            <el-button type="danger" @click="teleport">飞行传送</el-button>
          </el-button-group>

        </div>


      </div>
    </el-col>
    <el-col :span="1"></el-col>

    <!-- *************************** 分割线 *************************************************************-->

    <el-col :span="13">
      <OptionView @onPropsChange="handleProps"/>
    </el-col>

  </el-row>


  <el-dialog
      v-model="flyDlgShow"
      title="飞行模式按键设置"
      width="400"
      style="position: relative"
  >
    <div style="display: flex; flex-direction: column; justify-content: space-around;
          height: 230px;width: 200px; position: relative; left: 20px">
      <div>
        <span>前：</span>
        <el-input v-model="keyset.fwd" style="width: 70px" placeholder="请输入" />
      </div>
      <div>
        <span>后：</span>
        <el-input v-model="keyset.back" style="width: 70px" placeholder="请输入" />
      </div>
      <div>
        <span>左：</span>
        <el-input v-model="keyset.left" style="width: 70px" placeholder="请输入" />
      </div>
      <div>
        <span>右：</span>
        <el-input v-model="keyset.right" style="width: 70px" placeholder="请输入" />
      </div>
      <div>
        <span>升：</span>
        <el-input v-model="keyset.up" style="width: 70px" placeholder="请输入" />
      </div>
      <div>
        <span>降：</span>
        <el-input v-model="keyset.down" style="width: 70px" placeholder="请输入" />
      </div>

    </div>
    <template #footer>
      <div style="height: 35px">
        <span style="font-size: 16px; font-weight: bold;color: red">
          这里会同时设置欧卡2和美卡！
        </span>
        <el-button @click="flyDlgShow = false">取消</el-button>
        <el-button type="primary" @click="flyModeConfirm">
          确定
        </el-button>
      </div>
    </template>

    <div style="height: 220px; width: 210px; position: absolute; left: 160px; top:90px; border: 1px #56b0c5 solid; padding: 5px">
      <div style="color: black; font-size: large; font-weight: bold"> 说明: </div>
      <div>不知道支持哪些键？点这里👇</div>
      <div style="width: 100%; height: 55px; background-color: #c6e2ff; cursor: pointer; border-radius: 10px;" @click="openKeyMap">
        <div style="position: relative; left: 22px; top: 15px; font-weight: bold; color: #c45656;">点击此处查看按键映射表</div>
      </div>
      <div style="color: #1f1d1d; margin-top: 10px">
        <span style="color: darkorange; font-weight: bolder">▲</span>
        飞行模式只需开启
        <span style="color: darkorange; font-weight: bold">一次</span>
        即可对所有存档
        <span style="color: darkorange; font-weight: bold">永久生效</span>。
      </div>
      <div>
        <span style="color: darkorange; font-weight: bold">N:</span>
        新建
        <span style="color: darkorange; font-weight: bold">档案</span>
        后，需要再次设置飞行按键！否则新档案不生效。
      </div>
    </div>
  </el-dialog>

  <UpdateView :dlgShow="updateDlgShow" @done="updateDlgShow = false" :updateInfo="updateInfo"/>

  <el-dialog
      v-model="licensePlateDlgShow"
      title="修改引擎马力需要填入车牌"
      width="300"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
  >
    <span>可忽略空格:</span>
    <el-input v-model="licensePlate" placeholder="一定要填完整的车牌！区分大小写！"/>
    <template #footer>
      <el-button type="primary" @click="confirmLicensePlate">
        确认
      </el-button>
    </template>
  </el-dialog>

</template>
