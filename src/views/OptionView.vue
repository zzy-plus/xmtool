<script setup>
import '@/assets/index.css'
import {ref, watch} from "vue";
const emit = defineEmits(['onPropsChange'])
const imgUrl1 = 'https://s11.ax1x.com/2024/01/09/pFpQN6g.jpg'

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

watch(props,(newProps)=>{
  //console.log(newProps)
  emit('onPropsChange', newProps)
},{
  deep:true
})

</script>

<template>

  <div style="height: 500px; border-radius: 10px; background-color: white; padding: 20px"
       :style="{boxShadow: `var(--el-box-shadow-light)`}">

    <div class="block text-center">
      <el-carousel height="180px" :style="{boxShadow: `var(--el-box-shadow-light)`}"
                   style="background-color: #dcf5bb; border-radius: 10px; border: 3px solid #93f3d9">
        <el-carousel-item >
          <div style="height: 180px; display: flex; justify-content: space-around; align-items: center">
            <div style="display: flex; flex-direction: column; align-items: center">
              <img src="@/assets/free.png" style="height: 180px; width: 79vh; object-fit: cover"/>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item >
          <div style="height: 180px; display: flex; justify-content: space-around; align-items: center">
            <div style="display: flex; flex-direction: column; align-items: center; padding: 8px">

              <div style="font-size: medium; font-weight: bold; color: #2d84d9;">
                使用教程
              </div>
              <div style="font-size: small; font-weight: normal; color: #1f1d1d;">
                准备工作：打开游戏→现在需要修改的档案→点击档案→取<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;消勾选使用"Steam云端"<br/>
                1.&nbsp;在游戏内保存好一个存档最好命个名<br/>
                2.&nbsp;打开XM修改器→选择需<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;要修改的档案和存档→勾选自己需要修改的选项→保存<br/>
                3.&nbsp;返回游戏→加载修改后的档案和存档→完成!
              </div>

            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item >
          <div style="height: 180px; display: flex; justify-content: space-around; align-items: center">
            <div style="display: flex; flex-direction: column; align-items: center; padding: 8px;">
              <img src="@/assets/info.png" style="object-fit: cover; height: 180px; width: 65vh"/>

            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item >
          <div style="height: 180px; display: flex; justify-content: space-around; align-items: center">
            <div style="display: flex; flex-direction: column; align-items: center; padding: 8px;">
              <el-image :src="imgUrl1" style="object-fit: cover; height: 180px; width: 65vh"/>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>


    <el-divider />

    <el-row>
      <el-col :span="12">
        <div style="display: flex; flex-direction: column; justify-content: space-around; align-items: flex-start;
             height: 230px;">
          <el-checkbox v-model="props.money" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >&nbsp;&nbsp;&nbsp;&nbsp;金币1亿&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.level" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >&nbsp;&nbsp;&nbsp;&nbsp;等级100&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.skill" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >解锁全部技能</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.city" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >解锁全部城市</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.mass" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >货物改为一吨</span>
              </el-tag>
            </template>
          </el-checkbox>
        </div>
      </el-col>

      <el-col :span="12">
        <div style="display: flex; flex-direction: column; justify-content: space-around; align-items: flex-start;
            height: 230px;">
          <el-checkbox v-model="props.garage" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >解锁全部车库</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.truckVendors" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >&nbsp;解锁销售商&nbsp;&nbsp;</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.fixAll" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >修复全部车辆</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.fuelling" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >全部车辆满油</span>
              </el-tag>
            </template>
          </el-checkbox>
          <el-checkbox v-model="props.engine" size="large" border :style="{boxShadow: `var(--el-box-shadow-light)`}">
            <template #default>
              <el-tag effect="dark" type="warning">
                <span style="font-weight: bold; font-size: medium" >&nbsp;&nbsp;750发动机&nbsp;&nbsp;</span>
              </el-tag>
            </template>
          </el-checkbox>


        </div>
      </el-col>
    </el-row>

  </div>
</template>
