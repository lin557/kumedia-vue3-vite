<!-- eslint-disable no-irregular-whitespace -->
<template>
  <div class="tang-player">
    <el-tabs type="card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="诗文" name="first">
        <div class="tang-text">
          <template v-for="item in dataTang.rows" :key="item.title">
            <div
              class="tang-col"
              @click="handleAudio(item.one)"
              @dblclick="handleAudio(item.two)"
            >
              <template v-for="(str, index) in item.text" :key="index">
                <ruby>
                  <rt>{{ item.pinyi[index] }}</rt>
                  {{ str }}
                </ruby>
              </template>
            </div>
            <div v-if="item.br == 1" class="tang-clear"></div>
          </template>
        </div>

        <div class="tang-audio">
          <audio
            ref="audioRef"
            controls
            height="100"
            width="100%"
            preload="auto"
            :src="dataTang.audio"
            @timeupdate="handleTimeUpdate"
            @pause="handlePause"
          ></audio>
        </div>
      </el-tab-pane>
      <el-tab-pane label="视频" name="third" v-if="hasVideo">
        <div class="tang-video">
          <v3d-player ref="playerRef" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import V3dPlayer from 'v3d-player'
import 'v3d-player/dist/style.css'
import { TangJson } from '~/api/tang'
import type { TabsPaneContext } from 'element-plus'

const audioRef = ref<HTMLAudioElement>()
const playerRef = ref<InstanceType<typeof V3dPlayer>>()
const MAX_DURATION = 999.9
let stopTime = MAX_DURATION

const activeName = ref('first')

let _dataJson: TangJson = {
  title: '',
  audio: undefined,
  video: undefined,
  rows: []
}

let dataTang = reactive(_dataJson)

let _options = {
  autoplay: true,
  muted: false,
  screenshot: false,
  preventClickToggle: true,
  theme: '#ff3366',
  volume: 0.7,
  src: ''
}

let options = reactive(_options)

const hasVideo = computed(() => {
  if (options.src === '' || options.src === undefined || options.src === null) {
    return false
  } else {
    return true
  }
})

const closeAudio = () => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
}

const closeVideo = () => {
  if (dataTang.video) {
    playerRef.value?.close()
  }
}

const handleClick = (tab: TabsPaneContext) => {
  switch (tab.index) {
    case '0':
      closeVideo()
      break
    case '1':
      closeAudio()
      if (dataTang.video) {
        playerRef.value?.play(options)
      }
      break
  }
}

const play = (data: TangJson) => {
  dataTang.audio = data.audio
  dataTang.title = data.title
  dataTang.video = data.video
  dataTang.rows.length = 0
  dataTang.rows.push(...data.rows)
  if (dataTang.video) {
    options.src = dataTang.video
  }
}

const handleAudio = (times: Array<number>) => {
  if (audioRef.value) {
    audioRef.value.currentTime = times[0]
    audioRef.value.play()
  }
  stopTime = times[1]
}

const handleTimeUpdate = () => {
  if (audioRef.value && audioRef.value.currentTime) {
    console.log(audioRef.value.currentTime)
    if (audioRef.value.currentTime >= stopTime) {
      audioRef.value.pause()
      audioRef.value.currentTime = 0
      stopTime = MAX_DURATION
    }
  }
}

const handlePause = () => {
  stopTime = MAX_DURATION
}

defineExpose({
  play
})
</script>

<style lang="scss">
.tang-player {
  text-align: center;

  .tang-text {
    color: var(--ep-text-color-regular);
    .tang-col {
      display: inline-block;
      margin: 3px 8px;
      border: 1px solid transparent;
      border-radius: 5px;
      cursor: pointer;

      ruby {
        width: 42px;
        display: inline-block;
        font-family: '楷体';
        font-size: 18px;
        font-weight: bold;

        rt {
          font-family: '微软雅黑';
          font-weight: 400;
          font-size: 14px;
          width: 40px;
          text-align: center;
          padding-bottom: 6px;
        }
      }
    }
    .tang-col:hover {
      color: var(--ep-color-warning);
    }
    .tang-clear {
      width: 100%;
      height: 3px;
    }
  }

  .tang-audio {
    position: fixed;
    bottom: 5px;
    text-align: center;
    width: 100%;
  }

  .tang-video {
    margin-bottom: 20px;
    .v3d-player {
      display: inline-block;
      width: 800px;
      // height: 280px;
    }
  }

  .ep-tabs {
    .ep-tabs__header {
      border-bottom: none;
      margin-bottom: 0px;

      .ep-tabs__nav {
        border: none;
        float: none;
      }

      .ep-tabs__item {
        font-size: 12px;
        color: var(--ep-color-info);
        border: 1px solid var(--ep-color-info-light-3);
        margin: 0 5px;
        border-radius: 5px;
        height: 28px;
        line-height: 28px;
        transition: none;
      }

      .ep-tabs__item:hover {
        color: var(--ep-color-warning-light-3);
        border: 1px solid var(--ep-color-warning-light-5);
      }

      .is-active {
        color: var(--ep-color-warning);
        font-weight: 600;
        border: 1px solid var(--ep-color-warning-light-3);
      }
    }
  }

  .tang-tabs {
    padding: 5px 0;
    .ep-tag {
      margin: 5px;
      cursor: pointer;
    }
  }
}

@media screen and (max-width: 799px) {
  .tang-player {
    .tang-video {
      .v3d-player {
        width: 100%;
      }
    }
  }
}
</style>
