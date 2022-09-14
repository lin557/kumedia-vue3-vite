<template>
  <div v-loading="loading" class="movie-container common-container">
    <el-empty
      v-if="listJson.rows.length === 0 && loading == false"
      description="无数据"
    />
    <template v-for="item in listJson.rows" :key="item.id">
      <div class="g-col">
        <thumb-box :info="item" />
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { getMovieList, MdeiaList } from '~/api/media'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const prefixInteger = (num: number, length: number) => {
  return (Array(length).join('0') + num).slice(-length)
}

let _listJson: MdeiaList = {
  total: 0,
  rows: [],
}

let listJson = reactive(_listJson)
let loading = ref(false)

const getJson = async () => {
  return await getMovieList()
}

onMounted(() => {
  loading.value = true
  getJson()
    .then((res) => {
      listJson.total = res.result.total
      listJson.rows.length = 0
      listJson.rows.push(...res.result.rows)
      // console.log(res.result)
      loading.value = false
    })
    .catch((err) => {
      console.log(err)
      loading.value = false
    })
})
</script>

<style lang="scss">
.movie-container {
  padding-top: 16px;
}
</style>
