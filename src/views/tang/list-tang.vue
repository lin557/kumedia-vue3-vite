<template>
  <div v-loading="loading" class="tang-container common-container">
    <el-scrollbar height="100%">
      <div
        v-for="(item, index) in listJson.rows"
        :key="index"
        class="tang-item"
        @click="handleClick(item)"
      >
        <span class="tang-index">{{ item.tang_id }}.</span>
        <span class="tang-title" :title="item.title">{{ item.title }}</span>
        <span class="tang-author">{{ item.writer }}</span>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getTangList, TangList, TangWork } from '~/api/tang'

const router = useRouter()

let _listJson: TangList = {
  total: 0,
  rows: []
}

let listJson = reactive(_listJson)
let loading = ref(false)

const getJson = async () => {
  return await getTangList()
}

// const compare = (obj1: TangWork, obj2: TangWork) => {
//   const val1 = obj1.id
//   const val2 = obj2.id
//   if (val1 < val2) {
//     return -1
//   } else if (val1 > val2) {
//     return 1
//   } else {
//     return 0
//   }
// }

// const rowsToList = (...items: Array<TangItem>) => {
//   let out = []
//   for (let i = 0; i < items.length; i++) {
//     out.push(...items[i].works)
//   }
//   out.sort(compare)
//   let ret: TangItem = {
//     author: '唐诗三百首',
//     works: out
//   }
//   return ret
// }

const handleClick = (work: TangWork) => {
  router.push({
    path: work.path
  })
}

onMounted(() => {
  loading.value = true
  getJson()
    .then(res => {
      listJson.total = res.result.total
      listJson.rows.length = 0
      listJson.rows.push(...res.result.rows)
      // const list = rowsToList(...res.result.rows)
      // listJson.rows.push(list)
      // listJson.rows.push(...res.result.rows)
      // console.log(res.result)
      loading.value = false
    })
    .catch((err: unknown) => {
      console.log(err)
      loading.value = false
    })
})
</script>

<style lang="scss">
.tang-container {
  height: 100%;
  padding: 12px 0;

  .tang-item {
    font-size: 14px;
    margin: 5px;
    padding: 7px 5px;
    box-sizing: border-box;
    // width: 228px;
    display: inline-block;
    border: var(--ep-border);
    border-radius: 5px;
    // color: var(--ep-text-color-regular);
    cursor: pointer;

    span {
      display: inline-block;
      vertical-align: middle;
    }

    .tang-index {
      width: 28px;
      text-align: right;
      padding-right: 3px;
    }

    .tang-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tang-author {
      width: 50px;
      float: right;
      text-align: center;
    }
  }

  .tang-item:hover {
    color: var(--ep-color-warning);
    border-color: var(--ep-color-warning);
  }
}
</style>
