<template>
  <div class="tang-view">
    <tang-player ref="tangRef" />
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
  video: '',
  rows: []
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
  getJson(id).then(res => {
    listJson.title = res.result.title
    listJson.audio = res.result.audio
    listJson.video = res.result.video
    listJson.rows.length = 0
    listJson.rows.push(...res.result.rows)
    tangRef.value?.play(listJson)
  })
})
</script>
<style lang="scss">
.tang-view {
  background-image: url('~/assets/tang-bk.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  padding: 10px 0;
}
</style>
