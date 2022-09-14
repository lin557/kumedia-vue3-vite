<template>
  <div v-loading="loading" class="tang-container common-container">
    <el-row>
      <template v-for="tang in listJson.rows" :key="tang.author">
        <el-card shadow="never">
          <template #header>
            <div>
              <span>{{ tang.author }}</span>
            </div>
          </template>
          <div v-for="item in tang.works" :key="item.title" class="tang-item">
            <router-link :to="item.path">{{ item.title }}</router-link>
          </div>
        </el-card>
        <!-- </template> -->
      </template>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { getTangList, TangList } from '~/api/tang'

let _listJson: TangList = {
  total: 0,
  rows: [],
}

let listJson = reactive(_listJson)
let loading = ref(false)

const getJson = async () => {
  return await getTangList()
}

onMounted(() => {
  loading.value = false
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
.tang-container {
  padding-top: 15px;
  padding-bottom: 15px;

  .ep-card {
    margin-bottom: 10px;
    width: 100%;
    .ep-card__body {
      padding: 10px;
    }
  }

  .tang-item {
    margin: 5px;
    padding: 5px;
    // width: 228px;
    display: inline-block;
    vertical-align: top;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tang-item:hover {
    background-color: var(--ep-color-primary-light-9);
    border-radius: 5px;
  }
}
</style>
