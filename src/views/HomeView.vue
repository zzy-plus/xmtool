<script setup>
import {ref, onMounted, watch} from "vue";
import '@/assets/index.css'
import OptionView from "@/views/OptionView.vue";

const imgUrl = 'https://imgse.com/i/piqFTun'

const ipc = myApi.ipc
const userHome = myApi.home
const etsPath = myApi.ets_path

//两个选择器
const document_opts = ref(null) //档案
const save_opts = ref(null) //存档
const document_selected = ref(null)
const save_selected = ref(null)
const onChangeDoc = async (doc) => {
  document_selected.value = doc
  const docPath = etsPath + '\\' + doc + '\\save'
  save_opts.value = await ipc.invoke('event_get_saves', docPath)
}
const onChangeSave = (save) => {
  save_selected.value = save
  console.log(save_selected.value)
}

const props = ref({
  money: false,
  level: false,
  skill: false,
  city: false,
  garage: false,
  truckVendors: false,
  fixAll: false,
  fuelling: false
})

const onSave = async () => {
  const savePath = etsPath + '\\' + document_selected.value + '\\save\\' + save_selected.value
  const val = JSON.stringify({...props.value, savePath: savePath})
  if (document_selected.value && save_selected.value) {
    const {status, msg} = await ipc.invoke('event_save', val)

    console.log(status, msg)

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

const handleProps = (newProps)=>{
  props.value = newProps
  console.log(newProps)
}

onMounted(() => {
  document_opts.value = myApi.getDoc()
  if (!document_opts.value) {
    ElMessage.error('路径错误x')
    document_opts.value = []
  }
})


const open = ()=>{
  ipc.invoke('event_open','')
}

</script>

<template>

  <el-row :gutter="0">
    <el-col :span="10">
      <div
          style="height: 500px; background-color: white; display: flex; border-radius: 10px;
          flex-direction: column; justify-content: space-around; align-items: center"
          :style="{boxShadow: `var(--el-box-shadow-light)`}">

        <!--LOGO-->
        <div style="display: flex; flex-direction: column; align-items: center;">
          <img src="@/assets/logo.png" style="object-fit: contain; width: 235px; border-radius: 15px; cursor: pointer;"
                    @click="open"/>
        </div>

        <!--提示-->
        <div
            class="radius"
            :style="{
              borderRadius: `var(--el-border-radius-small)`,
              boxShadow: `var(--el-box-shadow-light)`
            }"
            style="display: flex; flex-direction: column ;align-items: center; padding: 3px"
        >
          <el-text class="mx-1" type="warning" size="large">
            <template #default>
              <div style="font-size: medium; font-weight: bold">选&nbsp;择&nbsp;存&nbsp;档</div>
            </template>
          </el-text>
        </div>

        <div :style="{boxShadow: `var(--el-box-shadow)`}">
          <el-select v-model="document_selected" class="m-2" placeholder="请选择档案" size="large" @change="onChangeDoc">
            <el-option
                v-for="item in document_opts"
                :key="item.profile"
                :label="item.profile_name"
                :value="item.profile"
            />
          </el-select>
        </div>

        <div :style="{boxShadow: `var(--el-box-shadow)`}">
          <el-select v-model="save_selected" class="m-2" placeholder="请选择存档" size="large" @change="onChangeSave">
            <el-option
                v-for="item in save_opts"
                :key="item.save"
                :label="item.save_name"
                :value="item.save"
            />
          </el-select>
        </div>

        <el-button type="warning" @click="onSave" plain>&nbsp;&nbsp;&nbsp;保存&nbsp;&nbsp;&nbsp;</el-button>


      </div>
    </el-col>
    <el-col :span="1"></el-col>

    <!-- *************************** 分割线 *************************************************************-->

    <el-col :span="13">
      <OptionView @onPropsChange="handleProps"/>
    </el-col>

  </el-row>

</template>
