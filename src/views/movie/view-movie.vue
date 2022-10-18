<template>
  <div class="movie-container common-container">
    <div class="video-playbox">
      <v3d-player
        ref="playerRef"
        :poster="listJson.poster"
        @volumechange="handleVolumechange"
      />
      <div class="video-list" :class="playingCls">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMovieJson, MediaJson } from '~/api/media'
import storage from '~/utils/storage'
import V3dPlayer from 'v3d-player'
import 'v3d-player/dist/style.css'

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

const getActiveClass = (index: number) => {
  const ep = getEpisode(index)
  if (ep.title === activeIndex.value) {
    return 'video-ep-active'
  } else {
    return ''
  }
}

const getJson = async (id: string) => {
  return await getMovieJson(id)
}

const playerRef = ref<InstanceType<typeof V3dPlayer>>()

const playingCls = computed(() => {
  if (playerRef.value) {
    if (playerRef.value.status() > 1) {
      return 'video-playing'
    } else {
      return ''
    }
  } else {
    return ''
  }
})

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
    screenshot: true
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
  getJson(id).then(res => {
    listJson.title = res.result.title
    listJson.poster = res.result.poster
    listJson.performer = res.result.performer
    listJson.episodes.length = 0
    listJson.episodes.push(...res.result.episodes)
  })
})
</script>
<style lang="scss">
.movie-container {
  .video-playbox {
    box-sizing: border-box;
    height: calc(100vh - 50px);

    .v3d-player {
      // width: calc(100% - 336px);
      height: 100%;
      display: inline-block;

      .v3d-center {
        display: none;
      }
    }

    .video-list {
      box-sizing: border-box;
      position: absolute;
      width: 100%;
      left: 0;
      top: calc(50% - 110px);
      z-index: 10;
      text-align: center;

      .video-title {
        padding: 10px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: 700;
        font-size: 36px;
        color: var(--ep-color-warning);
      }

      .video-sub {
        padding: 0 15px 5px 15px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        line-height: 22px;
        font-size: 16px;
        color: var(--ep-color-danger);
      }

      .video-ep {
        padding: 10px;
        text-align: center;

        .video-ep-item {
          display: inline-block;
          min-width: 120px;
          height: 38px;
          text-align: center;
          line-height: 38px;
          font-size: 14px;
          cursor: pointer;
          border-radius: 3px;
          border: 1px solid var(--ep-color-warning-dark-2);
          background-color: var(--ep-color-primary-light-9);
          color: var(--ep-color-warning);
          margin: 5px;
        }

        .video-ep-item:hover {
          border: 1px solid var(--ep-color-warning-dark-2);
          background-color: var(--ep-color-primary-light-7);
          color: var(--ep-color-warning);
        }

        .video-ep-active {
          border: 1px solid var(--ep-color-warning-dark-2);
          background-color: var(--ep-color-primary-light-8);
          color: var(--ep-color-warning);
        }
      }
    }

    .video-playing {
      top: calc(100vh - 50px);
    }
  }
}
</style>
