<template>
  <div>
    <tang-player ref="tangRef" />
    <div>上一首</div>
    <div>下一首</div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getTangJson, TangJson } from '~/api/tang'
import TangPlayer from '~/components/tang-player.vue'

const tangRef = ref<InstanceType<typeof TangPlayer>>()

let listJson: TangJson = reactive({
  title: '',
  audio: '',
  rows: [],
})

const getJson = async (id: string) => {
  return await getTangJson(id)
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
  getJson(id).then((res) => {
    listJson.title = res.result.title
    listJson.audio = res.result.audio
    listJson.rows.length = 0
    listJson.rows.push(...res.result.rows)
    tangRef.value?.play(listJson)
  })
})
</script>
<style lang="scss">
.tsv-wrapper {
  .ep-breadcrumb {
    padding: 20px;
  }
}
</style>
