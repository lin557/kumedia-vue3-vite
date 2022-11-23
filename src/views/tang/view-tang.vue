<template>
  <div class="tang-view">
    <el-scrollbar height="100%">
      <div class="tang-group">
        <div class="tang-btn tang-prev" :class="prevCls" @click="handlePrev">
          上一首
        </div>
        <div class="tang-btn tang-next" :class="nextCls" @click="handleNext">
          下一首
        </div>
      </div>

      <tang-player ref="tangRef" />
    </el-scrollbar>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTangJson, TangJson } from '~/api/tang'
import TangPlayer from '~/components/tang-player.vue'

const router = useRouter()

const tangRef = ref<InstanceType<typeof TangPlayer>>()

let listJson: TangJson = reactive({
  prev: undefined,
  next: undefined,
  title: '',
  audio: '',
  video: '',
  rows: []
})

const prevCls = computed(() => {
  if (listJson.prev) {
    return ''
  }
  return 'tang-disable'
})

const nextCls = computed(() => {
  if (listJson.next) {
    return ''
  }
  return 'tang-disable'
})

const getJson = async (id: string) => {
  return await getTangJson(id)
}

const handlePrev = () => {
  if (listJson.prev) {
    router.push({
      path: listJson.prev.path
    })
  }
}

const handleNext = () => {
  if (listJson.next) {
    router.push({
      path: listJson.next.path
    })
  }
}

onMounted(() => {
  const route = useRoute()
  const idParam = route.params.id
  let id: string
  if (typeof idParam === 'string') {
    id = idParam
  } else {
    id = idParam[0]
  }
  getJson(id).then(res => {
    listJson.title = res.result.title
    listJson.audio = res.result.audio
    listJson.video = res.result.video
    listJson.prev = res.result.prev
    listJson.next = res.result.next
    listJson.rows.length = 0
    listJson.rows.push(...res.result.rows)
    tangRef.value?.play(listJson)
  })
})
</script>
<style lang="scss">
.tang-view {
  padding: 12px 0;
  box-sizing: border-box;
  position: relative;
  height: 100%;

  .tang-group {
    position: relative;
  }

  .tang-btn {
    width: 68px;
    font-size: 12px;
    color: var(--ep-color-info);
    border: 1px solid var(--ep-color-info-light-3);
    margin: 0 5px;
    border-radius: 5px;
    height: 28px;
    line-height: 28px;
    transition: none;
    text-align: center;
    position: absolute;
    box-sizing: border-box;
    z-index: 3;
    cursor: pointer;
  }

  .tang-prev {
    left: calc(50% - 155px);
  }

  .tang-next {
    left: calc(50% + 75px);
  }

  .tang-btn:hover {
    border-color: var(--ep-color-warning-light-3);
    color: var(--ep-color-warning);
  }

  .tang-disable {
    border-color: var(--ep-text-color-placeholder) !important;
    color: var(--ep-text-color-disabled) !important;
  }
}
</style>
