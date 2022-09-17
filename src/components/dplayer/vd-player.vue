<template>
  <div class="vd-player" :style="posterImg">
    <div ref="refVideo"></div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import Dplayer from 'dplayer'
import { DPlayerEvents } from 'dplayer'

// 获取视频容器
const refVideo = ref()

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  poster: {
    type: String,
    default: '',
  },
})

interface PlayOptions {
  src: string
  poster?: string
}

interface Data {
  created: boolean
}

const _data: Data = {
  created: false,
}

let self = reactive(_data)

interface DplayerX extends Dplayer {
  controller: {
    setAutoHide(): void
  }
}

let player: DplayerX

const posterImg = computed(() => {
  return 'background-image: url(' + props.poster + ');'
})

const createPlayer = (option: PlayOptions) => {
  destoryPlayer()
  // 初始化视频对象
  player = new Dplayer({
    // 指定视频容器节点
    container: refVideo.value,
    video: {
      // 指定视频播放链接
      url: option.src,
      // 指定视频封面图
      pic: option.poster,
    },
  }) as DplayerX
  //自动播放状态也要隐藏
  player.on('playing' as DPlayerEvents, function () {
    player.controller.setAutoHide()
  })
  player.play()
  self.created = true
}

const destoryPlayer = () => {
  if (self.created) {
    player.destroy()
    self.created = false
  }
}

const play = (option: PlayOptions) => {
  if (option.poster === undefined && props.poster !== undefined) {
    option.poster = props.poster
  }
  createPlayer(option)
}

onBeforeUnmount(() => {
  destoryPlayer()
})

defineExpose({
  play,
})
</script>
<style lang="scss">
.vd-player {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: black;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;

  .dplayer {
    width: 100%;
    height: 100%;
  }
}
</style>
