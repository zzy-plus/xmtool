<script setup>
import {ref, onMounted} from "vue";

const ipc = myApi.ipc

const emit = defineEmits(['done'])

const props = defineProps({
  dlgShow: Boolean,
  updateInfo: Object
})

const getNewVersion = (flag)=>{
  emit('done')
  if(!flag) return
  ipc.invoke('event_get_new_version')
}

</script>

<template>
  <el-dialog
      :model-value="dlgShow"
      title="有可用的更新"
      width="380"
      :modal="false"
      :close-on-click-modal="false"
  >
    <span>
      <span>当前版本：V{{updateInfo.curVersion}}</span> &nbsp;&nbsp;&nbsp;&nbsp;
      <span>最新版本：V{{updateInfo.version}}</span>
      <div>{{updateInfo.info}}</div>
    </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="getNewVersion(false)">忽略</el-button>
        <el-button type="primary" @click="getNewVersion(true)">
          前往更新
        </el-button>
      </div>
    </template>
  </el-dialog>


</template>
