<script setup>
import {ref} from "vue";

const ipc = myApi.ipc

const updateDlgShow = ref(true)

const getNewVersion = ()=>{

}

const props = defineProps({

})

</script>

<template>
  <el-dialog
      v-model="updateDlgShow"
      title="有可用的更新"
      width="500"
      :modal="false"
      :close-on-click-modal="false"
  >
    <span>This is a message{{count}}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="updateDlgShow = false">忽略</el-button>
        <el-button type="primary" @click="getNewVersion">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>


</template>
