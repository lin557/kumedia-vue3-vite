<template>
  <div v-loading="loading" class="vue-xplayer">
    <div ref="videoRef"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUpdate } from 'vue'
import Player from 'xgplayer'

let loading = ref(false)

const playProps = defineProps({
  url: {
    type: String,
    default: '',
  },
  poster: {
    type: String,
    default: '',
  },
})

// 声明dplayer中一个没有暴露的属性
// interface Controller {
//   setAutoHide(): void
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// interface DPlayerX extends DPlayer {
//   controller: Controller
// }

interface PlayOptions {
  url: string
}

const videoRef = ref()

let player: Player

const close = () => {
  if (player) {
    player.destroy(true)
  }
}

const createPlayer = (url: string, poster: string) => {
  close()
  let autoplay = false
  if (url) {
    autoplay = true
  }
  player = new Player({
    el: videoRef.value,
    url: url,
    cssFullscreen: true,
    lang: 'zh-cn',
    playsinline: true,
    poster: poster,
    autoplay: autoplay,
  })
  // dp = new DPlayer({
  //   //初始化视频对象
  //   container: videoRef.value, //指定视频容器节点
  //   video: {
  //     url: url,
  //     // 指定视频封面图
  //     pic: pic,
  //   },
  // })
  // videoRef.value.classList.remove('dplayer-mobile')
  // dp.on('play' as DPlayerEvents, () => {
  //   // 让播放器在手机上自动隐藏中间的按钮
  //   //const dpx = dp as DPlayerX
  //   // dpx.controller.setAutoHide()
  //   //dp.video.classList.remove()
  //   //videoRef.value.classList.remove('dplayer-mobile')
  //   //console.log(videoRef.value)
  //   xx.value = 'play'
  // })
  // dp.on('canplay' as DPlayerEvents, () => {
  //   loading.value = false
  //   xx.value = 'canplay'
  //   dp.play()
  //   console.log('canplay')
  // })
  // dp.on('loadstart' as DPlayerEvents, () => {
  //   console.log('loadstart')
  //   xx.value = 'loadstart'
  // })
  // dp.on('loadstart' as DPlayerEvents, () => {
  //   console.log('loadstart')
  //   xx.value = 'loadstart'
  // })
  // dp.on('loadeddata' as DPlayerEvents, () => {
  //   console.log('loadeddata')
  //   xx.value = 'loadeddata'
  // })
  // console.log(dp)
}

const play = (option: PlayOptions) => {
  createPlayer(option.url, playProps.poster)
  // loading.value = true
}

onMounted(() => {
  //
})

onBeforeUpdate(() => {
  createPlayer(playProps.url, playProps.poster)
})

defineExpose({
  play,
})
</script>
<style lang="scss">
.vue-xplayer {
  .xgplayer {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
