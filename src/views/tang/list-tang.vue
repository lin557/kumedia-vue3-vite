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
          <div
            v-for="item in tang.works"
            :key="item.title"
            class="tang-item"
            @click="handleClick(item)"
          >
            <span class="tang-index">{{ item.id }}.</span>
            <span class="tang-title">{{ item.title }}</span>
            <span class="tang-author">{{ item.author }}</span>
          </div>
        </el-card>
        <!-- </template> -->
      </template>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getTangList, TangList, TangItem, TangWork } from '~/api/tang'

const router = useRouter()

let _listJson: TangList = {
  total: 0,
  rows: [],
}

let listJson = reactive(_listJson)
let loading = ref(false)

const getJson = async () => {
  return await getTangList()
}

const compare = (obj1: TangWork, obj2: TangWork) => {
  const val1 = obj1.id
  const val2 = obj2.id
  if (val1 < val2) {
    return -1
  } else if (val1 > val2) {
    return 1
  } else {
    return 0
  }
}

const rowsToList = (...items: Array<TangItem>) => {
  let out = []
  for (let i = 0; i < items.length; i++) {
    out.push(...items[i].works)
  }
  out.sort(compare)
  let ret: TangItem = {
    author: '唐诗三百首',
    works: out,
  }
  return ret
}

const handleClick = (work: TangWork) => {
  router.push({
    path: work.path,
  })
}

onMounted(() => {
  loading.value = false
  getJson()
    .then((res) => {
      listJson.total = res.result.total
      listJson.rows.length = 0
      const list = rowsToList(...res.result.rows)
      listJson.rows.push(list)
      // listJson.rows.push(...res.result.rows)
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
      font-size: 14px;
    }
  }

  .tang-item {
    margin: 5px;
    padding: 7px 5px;
    // width: 228px;
    display: inline-block;
    border: 1px solid var(--ep-color-primary-light-7);
    border-radius: 5px;
    color: var(--ep-menu-active-color);
    cursor: pointer;

    span {
      display: inline-block;
      vertical-align: middle;
    }

    .tang-index {
      width: 30px;
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
    background-color: var(--ep-color-primary-light-9);
  }
}
</style>
