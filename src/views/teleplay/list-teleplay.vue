<template>
  <div class="teleplay-container common-container">
    <el-empty v-if="listJson.rows.length === 0" description="无数据" />
    <template v-for="item in listJson.rows" :key="item.id">
      <div class="g-col">
        <thumb-box :info="item" />
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { getTeleplayList, MdeiaList } from '~/api/media'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const prefixInteger = (num: number, length: number) => {
  return (Array(length).join('0') + num).slice(-length)
}

let _listJson: MdeiaList = {
  total: 0,
  rows: [],
}

let listJson = reactive(_listJson)

const getJson = async () => {
  return await getTeleplayList()
}

onMounted(() => {
  getJson().then((res) => {
    listJson.total = res.result.total
    listJson.rows.length = 0
    listJson.rows.push(...res.result.rows)
    // console.log(res.result)
  })
})
</script>

<style lang="scss">
.teleplay-container {
  padding-top: 15px;
}
</style>
