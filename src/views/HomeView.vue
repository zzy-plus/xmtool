<script setup>
import {ref, onMounted, watch} from "vue";

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

const onSave = async ()=>{
  const savePath = etsPath + '\\' + document_selected.value + '\\save\\' + save_selected.value
  const val = JSON.stringify({...props.value, savePath: savePath})
  if(document_selected.value && save_selected.value){
    const {status, msg} = await ipc.invoke('event_save',val)

    console.log(status,msg)

    if(status){
      ElMessage({
        message: msg,
        type: 'success'
      })
    }else {
      ElMessage.error(msg)
    }
  }
}

onMounted(() => {
  document_opts.value = myApi.getDoc()
  if (!document_opts.value) {
    ElMessage.error('路径错误x')
    document_opts.value = []
  }
})


</script>

<template>

  <el-container>
    <el-aside width="400px">
      <div
          style="height: 400px; background-color: white; display: flex;
          flex-direction: column; justify-content: space-around; align-items: center">

        <el-select v-model="document_selected" class="m-2" placeholder="请选择档案" size="large" @change="onChangeDoc">
          <el-option
              v-for="item in document_opts"
              :key="item"
              :label="item"
              :value="item"
          />
        </el-select>

        <el-select v-model="save_selected" class="m-2" placeholder="请选择档案" size="large" @change="onChangeSave">
          <el-option
              v-for="item in save_opts"
              :key="item"
              :label="item"
              :value="item"
          />
        </el-select>

        <el-button type="primary" @click="onSave">保存</el-button>

      </div>
    </el-aside>
    <el-main>
      <div style="height: 400px; background-color: #b6e567; display: flex;
          flex-direction: column; justify-content: space-around; align-items: center">

        <el-checkbox v-model="props.money" label="金币1亿" size="large" border />
        <el-checkbox v-model="props.level" label="等级100" size="large" border />
        <el-checkbox v-model="props.skill" label="解锁全部技能" size="large" border />
        <el-checkbox v-model="props.city" label="解锁全部城市" size="large" border />
        <el-checkbox v-model="props.garage" label="解锁全部车库" size="large" border />
        <el-checkbox v-model="props.truckVendors" label="解锁卡车销售商" size="large" border />
        <el-checkbox v-model="props.fixAll" label="修复全部车辆" size="large" border />
        <el-checkbox v-model="props.fuelling" label="全部车辆满油" size="large" border />

      </div>
    </el-main>
  </el-container>

</template>
