<!-- eslint-disable no-irregular-whitespace -->
<template>
  <div class="tang-player">
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TangJson } from '~/api/tang'

const audioRef = ref()
const MAX_DURATION = 999.9
let stopTime = MAX_DURATION

let _dataJson: TangJson = {
  title: '',
  audio: '',
  rows: [],
}

let dataTang = reactive(_dataJson)

const play = (data: TangJson) => {
  dataTang.audio = data.audio
  dataTang.title = data.title
  dataTang.rows.length = 0
  dataTang.rows.push(...data.rows)
}

const handleAudio = (start: number, stop: number) => {
  audioRef.value.currentTime = start
  audioRef.value.play()
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
  play,
})
</script>

<style lang="scss">
.tang-player {
  text-align: center;

  .tang-row {
    padding: 5px 0;
    margin: 8px 0;
    .tang-col {
      display: inline-block;
      padding: 6px 5px;
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
      background-color: var(--ep-color-primary-light-7);
      border-radius: 5px;
    }
  }

  .tang-audio {
    margin: 15px 0;
  }
}
</style>
