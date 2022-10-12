<template>
  <div class="movie-container common-container">
    <div class="video-playbox">
      <v3d-player
        ref="playerRef"
        :poster="listJson.poster"
        :prototype="{}"
        @volumechange="handleVolumechange"
      />
      <div class="video-list-m">
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
import { onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getMovieJson, MediaJson } from '~/api/media'
import storage from '~/utils/storage'
import V3dPlayer from 'v3d-player'
import 'v3d-player/dist/style.css'

let _listJson: MediaJson = {
  title: '',
  poster: '',
  performer: '',
  episodes: [],
}
let listJson = reactive(_listJson)
let playInfo = reactive({
  title: '',
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
    screenshot: true,
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
  getJson(id).then((res) => {
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
  padding-top: 15px;

  .video-list-m {
    margin-top: 15px;
    width: 100%;
    border: 1px solid var(--ep-color-success-light-5);
    border-radius: 5px;
    box-sizing: border-box;
    vertical-align: top;
    background-color: var(--ep-color-success-light-9);

    .video-title {
      padding: 10px;
      height: 22px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-weight: 700;
      line-height: 22px;
      font-size: 16px;
      color: var(--ep-color-primary);
      text-align: center;
    }

    .video-sub {
      padding: 0 15px 5px 15px;
      height: 20px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      line-height: 22px;
      font-size: 14px;
      color: #999;
    }

    .video-ep {
      padding: 10px;
      height: calc(100% - 88px);
      .video-ep-item {
        display: inline-block;
        width: 80px;
        height: 36px;
        text-align: center;
        line-height: 34px;
        font-size: 13px;
        cursor: pointer;
        border-radius: 3px;
        box-sizing: border-box;
        border: 1px solid transparent;
        background-color: var(--ep-color-primary-light-7);
        color: var(--ep-menu-active-color);
        margin: 5px;
      }

      .video-ep-item:hover {
        border: 1px solid var(--ep-menu-active-color);
        background-color: var(--ep-color-primary-light-3);
      }

      .video-ep-active {
        border: 1px solid var(--ep-menu-active-color);
        background-color: var(--ep-color-primary-light-5);
      }
    }
  }
}
</style>
