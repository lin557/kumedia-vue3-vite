<template>
  <div v-loading="loading" class="media-player common-container">
    <el-scrollbar height="100%">
      <div class="player-box" v-if="!loading">
        <v3d-player
          ref="playerRef"
          :poster="listJson.poster"
          @volumechange="handleVolumechange"
        />
      </div>
      <div class="player-side" v-if="!loading">
        <div class="video-title">{{ listJson.title }}</div>
        <div class="video-sub">{{ listJson.performer }}</div>
        <div class="video-ep">
          <el-scrollbar height="100%">
            <template
              v-for="(item, index) in listJson.episodes"
              :key="item.title"
            >
              <span
                class="video-ep-item"
                :class="getActiveClass(index)"
                @click="handleClick(index)"
              >
                {{ item.title }}
              </span>
            </template>
          </el-scrollbar>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getTeleplayJson, MediaJson } from '~/api/media'
import storage from '~/utils/storage'
import V3dPlayer from 'v3d-player'
import 'v3d-player/dist/style.css'
import '~/styles/media.scss'

let _listJson: MediaJson = {
  title: '',
  poster: '',
  performer: '',
  episodes: []
}
let listJson = reactive(_listJson)
let playInfo = reactive({
  title: ''
})

let activeIndex = ref('')
let loading = ref(false)

const getActiveClass = (index: number) => {
  const ep = getEpisode(index)
  if (ep.title === activeIndex.value) {
    return 'video-ep-active'
  } else {
    return ''
  }
}

const getJson = async (id: string) => {
  return await getTeleplayJson(id)
}

const playerRef = ref<InstanceType<typeof V3dPlayer>>()

/**
 * 写入存储
 */
const handleVolumechange = () => {
  let value = playerRef.value?.volume()
  if (value === undefined) {
    value = 0
  }
  storage.setVolume(value)
}

const play = (title: string, url: string) => {
  const opt = {
    src: url,
    autoplay: true,
    volume: storage.getVolume(),
    preventClickToggle: true
  }
  activeIndex.value = title
  playInfo.title = listJson.title + ' (' + title + ')'
  playerRef.value?.play(opt)
}

const playEpisode = (index: number) => {
  const ep = getEpisode(index)
  play(ep.title, ep.url)
}

const getEpisode = (index: number) => {
  return listJson.episodes[index]
}

const handleClick = (index: number) => {
  playEpisode(index)
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
  loading.value = true
  getJson(id).then(res => {
    listJson.title = res.result.title
    listJson.poster = res.result.poster
    listJson.performer = res.result.performer
    listJson.episodes.length = 0
    listJson.episodes.push(...res.result.episodes)
    loading.value = false
  })
})
</script>
