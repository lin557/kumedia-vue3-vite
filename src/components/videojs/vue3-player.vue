<template>
  <!-- 默认不开启声音 跳过chrome的自动阻止策略 -->
  <div
    ref="vvpRef"
    class="vvp-player"
    :class="fillCls"
    @click="handleClick"
    @dblclick="handleDblClick"
  >
    <div class="vvp-shade" :class="loadingCls" :style="posterImg">
      <div class="vjs-loading-spinner"></div>
      <div class="vvp-occupy">{{ infoText }}</div>
      <div class="vvp-error-ctx">
        <div class="vvp-error-button">
          <span @click="close()"></span>
        </div>
        <div class="vvp-error-text">{{ self.error }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  defineEmits,
} from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.min.css'
import 'videojs-hotkeys'
import './css/videojs-filmgardi.css'

interface PlayerX extends videojs.Player {
  header: {
    el: {
      container: HTMLDivElement
      title: HTMLDivElement
    }
  }
}

// 超过5个process 都没有收到音频流 自动重载播放器
const ERR_MAX_AUDIO_COUNT = 6

const defaultVideoJsPlayerOptions = {
  autoplay: true,
  // fill: true,
  // responsive: true,
  // 是否显示控制条
  controls: true,
  controlBar: {
    pictureInPictureToggle: false,
    closeButton: false,
    subsCapsButton: false,
  },
  nativeControlsForTouch: true,
  // preferFullWindow: true,
  // userActions: {
  //   click: false,
  // },
  plugins: {
    hotkeys: {
      volumeStep: 0.05,
      seekStep: 10,
      enableModifiersForNumbers: false,
    },
  },
}

interface PlayOptions {
  src: string
  isLive?: boolean
  hasAudio?: boolean
  text?: string
}

const defaultV3PlayOptions: PlayOptions = {
  src: '',
  isLive: true,
  hasAudio: true,
  text: '',
}

const props = defineProps({
  // 自动追帧
  autoRate: {
    type: Object,
    default() {
      return {
        enabled: true,
        max: 9.0,
        min: 3.0,
      }
    },
  },
  // 当出错时自动重连
  connect: {
    type: Object,
    default() {
      return {
        auto: false,
        interval: 15,
      }
    },
  },
  options: {
    type: Object,
    default() {
      return {}
    },
  },
  poster: {
    type: String,
    default: '',
  },
  fill: {
    type: Boolean,
    default: false,
  },
})

const vvpRef = ref()

const emits = defineEmits(['click', 'dblclick', 'vvperror'])

let player: PlayerX

interface VueData {
  id: string
  created: boolean
  // 0=空闲 1=占用中 2=请求中 3=播放中/缓冲中 4=错误
  status: number
  focused: false
  error: string
  // 当http-flv头有音视频 但http-flv没有音频流时 自动重置播放器
  autoAudio: boolean
  progress: number
  lastOptions: PlayOptions
  filename: string
  muted: boolean
  suffix: string
  poster: string
  // 播放速率
  rate: number
  lastDecodedFrame: number
  lastDecodedCount: number
}

const _data: VueData = {
  id: '',
  created: false,
  // 0=空闲 1=占用中 2=请求中 3=播放中/缓冲中 4=错误
  status: 0,
  focused: false,
  error: '',
  // 当http-flv头有音视频 但http-flv没有音频流时 自动重置播放器
  autoAudio: true,
  progress: 0,
  lastOptions: defaultV3PlayOptions,
  filename: '',
  muted: false,
  suffix: '',
  poster: '',
  // 播放速率
  rate: 1.0,
  lastDecodedFrame: 0,
  lastDecodedCount: 0,
}

let self = reactive(_data)

const loadingCls = computed(() => {
  switch (self.status) {
    case 0:
      return ''
    case 1:
    case 2:
      return 'vjs-waiting'
    case 4:
      return 'vvp-error'
    default:
      return 'vvp-hide'
  }
})

const fillCls = computed(() => {
  let cls = ''
  if (props.fill) {
    return cls + ' vvp-fill'
  } else {
    return cls
  }
})

const infoText = computed(() => {
  if (self.lastOptions && self.lastOptions.text) {
    return self.lastOptions.text
  } else {
    return ''
  }
})

const posterImg = computed(() => {
  return 'background-image: url(' + props.poster + ');'
})

const close = () => {
  self.status = 0
  destoryPlayer()
  self.autoAudio = true
  self.error = ''
  self.filename = ''
  self.progress = 0
  self.lastOptions = defaultV3PlayOptions
  self.rate = 1.0
  self.muted = true
  self.lastDecodedCount = 0
  self.lastDecodedFrame = 0
}

const createHeader = (player: PlayerX) => {
  const el = player.el()
  // Create div element
  const div = document.createElement('div')
  div.classList.add('vjs-header')
  const info = document.createElement('div')
  // infoEl.classList.add('vjs-h-info')
  // infoEl.innerText = ''
  div.appendChild(info)
  player.header = {
    el: {
      container: div,
      title: info,
    },
  }
  el.appendChild(div)
}

const createPlayer = () => {
  const el = document.createElement('video')
  el.id = self.id
  // vjs-theme-dt
  el.className = 'video-js vjs-big-play-centered vjs-filmgardi'
  el.setAttribute('preload', '')
  el.innerHTML =
    '<p class="vjs-no-js">Please consider upgrading to a web browser that supports HTML5 video</p>'
  vvpRef.value.appendChild(el)
  const options = videojs.mergeOptions(
    defaultVideoJsPlayerOptions,
    props.options
  )
  player = videojs(el, options) as PlayerX
  self.created = true
  if (options.controlBar.closeButton) {
    const ctrl = player.controlBar.getChild(
      'CloseButton'
    ) as videojs.CloseButton
    ctrl.on('close', () => {
      close()
    })
  }
  // 创建顶部显示条
  createHeader(player)

  player.on('loadeddata', () => {
    self.status = 3
  })
  player.on('progress', () => {
    // console.log('progress')
    if (self.autoAudio && self.lastOptions.hasAudio) {
      // 如果 m3u8 关闭这个功能
      if (self.filename) {
        if (self.suffix === 'm3u8') {
          self.autoAudio = false
        }
      }

      self.progress++
      if (self.progress >= ERR_MAX_AUDIO_COUNT) {
        window.console.warn(
          self.lastOptions.src +
            ' has no audio data, video will auto reset to play.'
        )
        // 关掉音频 自动重载
        self.lastOptions.hasAudio = false
        play(self.lastOptions)
      }
    }
  })
  player.on('canplay', () => {
    // console.log('canplay')
    self.autoAudio = false
  })
  player.on('timeupdate', () => {
    if (props.autoRate.enabled && self.lastOptions.isLive) {
      // 当前播放时间
      const cur = player.currentTime()
      // 缓冲区尾部时间
      const end = player.bufferedEnd()

      if (end - cur > props.autoRate.max) {
        playbackRate(1.5)
      }
      if (end - cur < props.autoRate.min) {
        playbackRate(1.0)
      }
    }
  })
  player.on('fullscreenchange', () => {
    if (player.isFullscreen()) {
      player.controlBar.show()
      player.header.el.container.setAttribute('style', 'display: flex')
    }
  })
  player.on('volumechange', () => {
    self.muted = player.muted()
  })

  player.on('error', (e) => {
    // 播放mp4/m3u8时可以捕获 flv不行
    self.status = 4
    const playerError = player.error()
    if (playerError) {
      switch (playerError.code) {
        case 0:
          self.error = getError('MEDIA_ERR_CUSTOM')
          break
        case 1:
          self.error = getError('MEDIA_ERR_ABORTED')
          break
        case 2:
          self.error = getError('MEDIA_ERR_NETWORK')
          break
        case 3:
          self.error = getError('MEDIA_ERR_DECODE')
          // 重连接 这里用定时器 防止跟上面的flv.error冲突
          if (props.connect && props.connect.auto) {
            player.setTimeout(() => {
              window.console.warn(
                self.lastOptions.src +
                  ' will reset and reconnect. ' +
                  playerError.message
              )
              play(self.lastOptions)
            }, 1280)
          }
          break
        case 4:
          self.error = getError('network failed or format no supported')
          break
        case 5:
          self.error = getError('MEDIA_ERR_ENCRYPTED')
          break
        default:
          self.error = getError('unknow error')
      }
    } else {
      self.error = getError(e.type)
    }
  })
  // this.player.on('abort', () => {
  //   console.log('abort')
  // })
  // })
  console.log(player)
}

const destoryPlayer = () => {
  if (self.created) {
    player.dispose()
    self.created = false
  }
}

const getError = (error: string) => {
  return '<p>' + self.lastOptions.text + '</p><p>' + error + '</p>'
}

const getMediaType = (url: string) => {
  if (url === null) {
    return 'video/x-flv'
  }
  const sTmp = url.toLowerCase()
  if (sTmp.indexOf('rtmp') == 0) {
    return 'rtmp/mp4'
  } else if (sTmp.indexOf('.flv') > 0) {
    return 'video/x-flv'
  } else if (sTmp.indexOf('.m3u8') > 0) {
    return 'application/x-mpegURL'
  } else if (sTmp.indexOf('.mp4') > 0) {
    return 'video/mp4'
  } else {
    // 什么都没有，默认flv
    return 'video/x-flv'
  }
}

const getOptions = () => {
  return self.lastOptions
}

const handleClick = () => {
  emits('click', this)
}

const handleDblClick = () => {
  emits('dblclick', this)
}

const mute = () => {
  player.volume(0)
}

const play = (option: PlayOptions) => {
  close()
  createPlayer()
  const options = videojs.mergeOptions(defaultV3PlayOptions, option)
  console.log(options)
  if (!options.hasAudio) {
    const ctrl = player.controlBar.getChild(
      'VolumePanel'
    ) as videojs.VolumePanel
    ctrl.hide()
  }
  self.status = 2
  const type = getMediaType(options.src)
  self.filename = url2Filename(options.src)
  const item = self.filename.split('.').pop()
  if (item === undefined) {
    self.suffix = ''
  } else {
    self.suffix = item.toLowerCase()
  }

  let text = self.filename
  if (options.text && options.text !== '') {
    text = options.text
  } else {
    options.text = text
  }
  updateHeaderTitle(text)
  player.src([{ type: type, src: options.src }])
  player.autoplay()
  self.lastOptions = options
}

/**
 * 获取或设置当前播放速率
 * @param rateopt {number} 速率值 1.0 表正常播放 0.5表半速
 */
const playbackRate = (rateopt: number) => {
  if (rateopt === null) {
    return self.rate
  }
  if (player) {
    if (self.rate !== rateopt) {
      self.rate = rateopt
      player.playbackRate(self.rate)
      window.console.warn(
        self.lastOptions.src + ' playback rate change to ' + self.rate
      )
    }
  }
}

const randomString = (len: number) => {
  len = len || 32
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

const updateHeaderTitle = (text: string) => {
  if (player.header) {
    player.header.el.title.innerText = text
  }
}

const url2Filename = (url: string) => {
  if (url) {
    const vlist = url.split('?')
    if (vlist.length === 0) {
      return ''
    }
    let item = vlist[0].split('\\').pop()
    if (item === undefined) {
      return ''
    }
    let out = item.split('/').pop()
    if (out === undefined) {
      return ''
    }
    return out
  } else {
    return ''
  }
}

onMounted(() => {
  self.id = 'vvp-' + randomString(16)
})

onBeforeUnmount(() => {
  destoryPlayer()
})

defineExpose({
  getOptions,
  mute,
  play,
})
</script>

<style lang="scss">
$footerHeight: 30px;

.vvp-player {
  // cif
  width: 100%;
  height: 100%;
  position: relative;

  .vvp-shade {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 3;
    background-color: black;
    // background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFgklEQVRoge2ZX4hc1R3HP7+785AlSCMigiJZggX/tVRbqqSL/7oJSfRBH7IVShVRX9qQiLvn3Jn4kPElM/ecyaqY+OI/VARNSkOpbSSLGol/ah5CK6W+aFiFiBJKAnmoxZ3782HPLbM7d3bn3pm1D80XhuXec36/7+c7dy9z7zlwQRc0kGRYjZIkuUhEtgA3AutEZJ2qrgMQkXOqeg44B5xU1TfjOD4/DN+BAuzdu/eSSqUyCdwObC9Yfgh4Z35+/uDu3bv/VZahdADn3H1AFbim4/S/gXdV9RRwKoqiUwBpmm4ANojIBuBWYLSj5hOgaa19uQxH4QDOuZ+oak1EJgFU9WsROZim6ZFqtXqknx7NZnNrFEVbVXVSRC4LfQ6KSMNa+7dVC5AkySMisgdYB3wD7I+iaP/09PTnRfpkarVa69M03QHsANYA51T18TiOn+y3R98BvPcvq+pvAFT1tSiKGsaYjwtT5/f+cZqmNRG5F0BEXjHG3NdPbV8BvPfPqeqDofkzxpjflcdd1ueAqv42+DxvjHlopZoVA3jvJ1X19dD0LmPMnwdHXdbvTlV9I/j9yhhzcLn5ywZwzv0CeC8cTlprDw0Hc3k557YDGfi4tfb9XnOjXgPe+7Ui8jSAiCTfFzyAtfaQiCTB+2nv/dpec3sGUNWqqt4AnDDGVFeBc1kFzxOqeoOq9vTPDZAkyc0s/EihqvtXB3FldXhXA1OXcgOISBWoAEfjOH5llfhWVPA+ClQCU5e6AoT/twkAEfmfffuZOhgm8u6FrgAiMg6sBb4yxvypqKFzbrtz7nCz2byuMG2OAsNXwNrAtkhdAdI0HQcQkWNlDEXkWuDuKIrecs6t+EPUZ89jnWydyrsHxgFU9Q8D+l4GPJskyQvNZvMHgzTqYOkrwBjAyMjI3wcxzSQiD0RR9Ffv/Z1le3SwjC0d6xng/Pnzp8oa5uhqVX3DOdcoU9zBMrZ0bFGARqORTfiiXq/PlzFbQVXv/fFms/mjIkWB5QtYxAh0X4FscJjf/iKp6ngURR+3Wq1rC5bmXoWlAebC3x8WRyukA9PT0/8sWJMxzXWeXBSgVqtlg1fMzMx0vrcOS1+r6nZr7Y4iRYHlCljECOTfxHMA7XZ72Ffh9Uql8tM4jn9ftLCDZW7pWCVn/hwwpqo/A4bxytgGdllrD5RtEFgytkXKuwLZysJEWcMOvaWqGweBX8LSteqR9yx0HEBVJ+r1et4V6kthiWQijuMTZXsA1Ov1iqpmD5fHl453BTDGfAicFpFLR0dHtxU1NMY83m63bzfG7C5FvESjo6PbRORS4HRgW6Tc9wFV/SNAFEVTZUxrtdqxMnV5yhgypq7xvJMiMqOqZ1T1FufcrmHBFJVzbpeq3qKqZ0RkJm9ObgBr7WcdBVOtVuvqVaPsoeA5BQtfqLX2s7x5PV/q16xZ8wRwErgyTdMXV4VyGQXPK4GTgSVXPQPs3LnzP0AtHN7snOtr4XYYCl7ZS3wtsOSqZwAAa+1R4OFwuMV7v2c4iL0VPLaEw4cDQ0+NrNRwdnb25KZNm74FfgnctnnzZmZnZ98dHLVb3vs9qloPh49Za59aqabv1emwpv+XcPiqiLhhrk6rqgV+DZCm6bZ+9xoK7Q/s27dv4/z8/EsichWrsD+gqp9WKpX7p6amPui3R+EdGu/99cCjqvoA/HeH5jDwdr/rp2Hx9g5VvSfboRGRF4EZY8w/ivCU3iNrNBp3jIyM7ADu6Tj9DQur2WeBsyJyFkBVLwayzzgLuzGZDrfb7f21Wu3tMhwDb7N6728CtqjqVuCmPss+EpEjwJvGmI8G8R/aPjFAkiSXAz8HxqIoWq+qYwAiMpem6ecsPM+fiOP4y2H6XtAF/T/rO5a/KSO6RwxkAAAAAElFTkSuQmCC');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    // background-image: url(//1lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/byted-player-videos/1.0.0/poster.jpg);
    font-family: VideoJs;
    &:before {
      display: block;
      content: '\f102';
      font-size: 72px;
      line-height: 72px;
      color: gray;
      opacity: 0.8;
      top: calc(50% - 36px);
      left: calc(50% - 36px);
      position: absolute;
    }

    &.vjs-waiting {
      &:before {
        content: '';
      }

      .vjs-loading-spinner {
        margin: -27px 0 0 -27px;
        width: 54px;
        height: 54px;
        border-radius: 27px;
      }

      .vvp-occupy {
        display: block;
      }
    }

    .vvp-speed {
      position: absolute;
      color: #aaa;
      text-align: center;
      width: 42px;
      top: 15px;
      font-family: Avenir, Helvetica, Arial, sans-serif;
      font-size: 10px;
    }

    .vvp-occupy {
      display: none;
      position: absolute;
      width: 100%;
      top: calc(50% + 33px);
      color: #aaa;
      text-align: center;
    }

    .vvp-error-ctx {
      display: none;
    }

    &.vvp-error {
      &:before {
        content: '';
      }

      display: table;

      .vvp-error-ctx {
        display: table-cell;
        vertical-align: middle;
        font-family: VideoJs;
        text-align: center;
        opacity: 0.8;
        &:before {
          display: block;
          content: '\f115';
          font-size: 48px;
          color: gray;
        }

        .vvp-error-text {
          font-size: 12px;
          color: #aaa;
          position: absolute;
          top: calc(50% + 25px);
          width: 100%;

          p {
            margin: 3px 0;
          }
        }

        .vvp-error-button {
          position: absolute;
          top: calc(50% - 24px);
          width: 100%;

          span {
            cursor: pointer;
            display: block;
            height: 48px;
            width: 48px;
            margin: 0 auto;
          }
        }
      }
    }
  }

  .video-js {
    width: 100%;
    height: 100%;

    /**
    * 禁用单击暂停
    */
    &.vjs-playing .vjs-tech {
      pointer-events: none;
    }

    .vjs-close-button {
      position: relative;
      height: 100%;
      top: 3px;
      font-size: 0.85em;
    }

    .vvp-live {
      .vjs-live-display {
        padding-left: 6px;
      }
    }
  }

  .vjs-theme-dt {
    .vjs-volume-vertical {
      .vjs-volume-bar {
        margin: 1.35em auto;
      }
      .vjs-volume-level:before {
        left: -0.5em;
      }
    }
  }
  .vjs-header {
    position: absolute;
    top: 0px;
    display: none;
    flex-flow: row nowrap;
    justify-content: space-between;
    width: 100%;
    height: 3em;
    background-color: rgba(43, 51, 63, 0.7);
    pointer-events: none;

    > div {
      width: 100%;
      line-height: 3em;
      padding: 0 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
  }

  .vjs-has-started .vjs-header {
    display: flex;
    visibility: visible;
    opacity: 1;
    transition: visibility 0.1s, opacity 0.1s;
  }

  .vjs-has-started .vjs-fetch-flv-ctx {
    top: 25px !important;
  }

  .vjs-has-started.vjs-user-inactive.vjs-playing .vjs-header {
    visibility: visible;
    opacity: 0;
    pointer-events: none;
    transition: visibility 1s, opacity 1s;
  }

  .vjs-has-started.vjs-user-inactive.vjs-playing .vjs-fetch-flv-ctx {
    top: 0px !important;
    transition: top 1.1s;
  }

  .vvp-hide {
    display: none !important;
  }

  /**
   * 视频图像全屏显示 不支持ie
   */
  &.vvp-fill {
    .video-js {
      .vjs-tech {
        object-fit: fill;
      }
    }
  }
}
</style>
