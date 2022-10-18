<!-- eslint-disable no-irregular-whitespace -->
<template>
  <div class="tang-player">
    <el-tabs type="card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="原文" name="first">
        <template v-for="row in dataTang.rows" :key="row.title">
          <template v-for="(s, index) in row" :key="index">
            <div class="tang-row">
              <template v-for="(si, index1) in s" :key="index1">
                <div
                  class="tang-col"
                  @click="handleAudio(si.start1, si.stop1)"
                  @dblclick="handleAudio(si.start2, si.stop2)"
                >
                  <template v-for="(item, index2) in si.text" :key="index2">
                    <ruby>
                      <rt>{{ si.pinyi[index2] }}</rt>
                      {{ item }}
                    </ruby>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </template>

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
      <el-tab-pane label="译文" name="second">无</el-tab-pane>
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
  screenshot: true,
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
      closeVideo()
      break
    case '2':
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

const handleAudio = (start: number, stop: number) => {
  if (audioRef.value) {
    audioRef.value.currentTime = start
    audioRef.value.play()
  }
  stopTime = stop
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

  .tang-row {
    margin: 3px 0;
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
      margin-top: 10px;
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
