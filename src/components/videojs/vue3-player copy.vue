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
      <div class="vjs-loading-spinner">
        <span class="vvp-speed">{{ kb }}</span>
      </div>
      <div class="vvp-occupy">{{ infoText }}</div>
      <div class="vvp-error-ctx">
        <div class="vvp-error-button">
          <span @click="close()"></span>
        </div>
        <div class="vvp-error-text" v-html="self.error"></div>
      </div>
    </div>
    <div class="vvp-focus" :class="focusCls"></div>
    <div class="vvp-footer">
      <button
        class="vvp-control vvp-button vvp-control-mute"
        :class="mutedCls"
        type="button"
        title="Pause"
        aria-disabled="false"
        @click="toggleMuted()"
      >
        <span class="vvp-icon-placeholder" aria-hidden="true"></span>
      </button>
      <div class="vvp-control vvp-control-text vvp-control-info">
        {{ infoText }}
      </div>
      <div class="vvp-control vvp-control-text vvp-control-speed">
        {{ kbps }}
      </div>
      <button
        class="vvp-control vvp-button vvp-control-record"
        :class="recordCls"
        type="button"
        title="record"
        aria-disabled="false"
        @click="toggleRecord()"
      >
        <span class="vvp-icon-placeholder" aria-hidden="true"></span>
      </button>
      <button
        class="vvp-control vvp-button vvp-control-fullscreen"
        type="button"
        title="Fullscreen"
        aria-disabled="false"
        @click="fullscreen()"
      >
        <span class="vvp-icon-placeholder" aria-hidden="true"></span>
      </button>
      <button
        class="vvp-control vvp-button vvp-control-close"
        type="button"
        title="Close"
        aria-disabled="false"
        @click="close()"
      >
        <span class="vvp-icon-placeholder" aria-hidden="true"></span>
      </button>
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
import '@digitaltheatre/videojs-theme-dt/dist/theme/index.css'
import 'videojs-flvjs-es6'
import 'videojs-fetch-flv'
import 'videojs-fetch-flv/dist/videojs-fetch-flv.css'
import 'videojs-contextmenu-pt'
import 'videojs-contextmenu-pt/dist/videojs-contextmenu-pt.css'
import flvjs from 'flv.js'

flvjs.LoggingControl.enableDebug = false
flvjs.LoggingControl.enableVerbose = false
flvjs.LoggingControl.enableWarn = false
flvjs.LoggingControl.enableError = false

// console.log(flvjs.Events.STATISTICS_INFO)
// const FLVJS_EVENTS_STATISTICS_INFO = 'statistics_info'
// const FLVJS_EVENTS_ERROR = 'error'

interface fetchParam {
  isLive: boolean
}

interface FetchObj {
  fetching: boolean
  hide(): void
  show(): void
  start(): void
  stop(isSaveFile: boolean): void
  updateIsLive(value: boolean): void
}

interface PlayerX extends videojs.Player {
  header: {
    el: {
      container: HTMLDivElement
      title: HTMLDivElement
      speed: HTMLDivElement
    }
  }
  fetchObj: FetchObj
  fetchFlv(param: fetchParam): FetchObj
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
    closeButton: true,
    subsCapsButton: false,
  },
  // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md
  flvjs: {
    mediaDataSource: {
      isLive: true,
      cors: true,
      withCredentials: false,
      hasAudio: true,
    },
    config: {
      // 启用IO存储缓冲区。如果您需要实时流播放的实时（最小延迟），则设置为false
      enableStashBuffer: false,
      // 禁用音视频同步
      fixAudioTimestampGap: false,
    },
  },
  // 是否静音 这里默认为true 跳过chrome的自动阻止策略
  muted: true,
  poster: '',
}

interface PlayOptions {
  src: string
  isLive?: boolean
  record?: {
    enabled: boolean
    isLive?: boolean
  }
  // 上下文菜单
  content?: object
  data?: {
    // 唯一值
    unique?: string
    // 用户数据
    user?: object
  }
  hasAudio?: boolean
  text?: string
}

const defaultV3PlayOptions: PlayOptions = {
  src: '',
  isLive: true,
  record: {
    enabled: false,
    isLive: true,
  },
  data: {
    // 唯一值
    unique: '',
    // 用户数据
    user: undefined,
  },
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
  lockControlBar: {
    type: Boolean,
    default: false,
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
  index: {
    type: Number,
    default: null,
  },
  tag: {
    type: String,
    default: null,
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
  // 加载flv时用于显示加载网速
  speed: string
  poster: string
  // 创建时间(或占用时间)
  order: number
  // 播放速率
  rate: number
  lastDecodedFrame: number
  lastDecodedCount: number
  fetching: boolean
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
  muted: true,
  suffix: '',
  // 加载flv时用于显示加载网速
  speed: '',
  poster: '',
  // 创建时间(或占用时间)
  order: 0,
  // 播放速率
  rate: 1.0,
  lastDecodedFrame: 0,
  lastDecodedCount: 0,
  fetching: false,
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
  if (props.lockControlBar) {
    if (self.status > 0) {
      // 开始播放或占用时才显示控制栏
      cls = 'vvp-footer-show'
    }
  }
  if (props.fill) {
    return cls + ' vvp-fill'
  } else {
    return cls
  }
})

const focusCls = computed(() => {
  if (self.focused) {
    return 'vvp-focus-show'
  } else {
    return ''
  }
})

const kbps = computed(() => {
  if (self.speed === '') {
    return ''
  } else {
    return self.speed + ' kb/s'
  }
})

const kb = computed(() => {
  if (self.speed === '') {
    return ''
  } else {
    return self.speed + 'kb'
  }
})

const infoText = computed(() => {
  if (self.lastOptions && self.lastOptions.text) {
    return self.lastOptions.text
  } else {
    return ''
  }
})

const mutedCls = computed(() => {
  if (self.muted) {
    return 'vvp-vol-0'
  } else {
    return 'vvp-vol-3'
  }
})

const posterImg = computed(() => {
  return 'background-image: url(' + props.poster + ');'
})

const recordCls = computed(() => {
  let cls = ''
  if (
    self.lastOptions &&
    self.lastOptions.record &&
    self.lastOptions.record.enabled
  ) {
    if (self.fetching) {
      cls = 'vvp-fetching'
    }
  } else {
    cls = 'vvp-hide'
  }
  return cls
})

const close = () => {
  if (self.created) {
    // this.player.reset()
    // 如果在录像中 需要停止录像功能
    if (self.fetching) {
      player.fetchObj.stop(false)
    }
    self.order = 0
  }
  self.status = 0
  destoryPlayer()
  self.autoAudio = true
  self.error = ''
  self.speed = ''
  self.filename = ''
  self.progress = 0
  self.lastOptions = defaultV3PlayOptions
  self.rate = 1.0
  self.muted = true
  self.lastDecodedCount = 0
  self.lastDecodedFrame = 0
  self.fetching = false
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
  const speed = document.createElement('div')
  speed.classList.add('vjs-h-speed')
  div.appendChild(speed)
  player.header = {
    el: {
      container: div,
      title: info,
      speed: speed,
    },
  }
  el.appendChild(div)
}

const createPlayer = () => {
  const el = document.createElement('video')
  el.id = self.id
  el.className = 'video-js vjs-big-play-centered vjs-theme-dt'
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
  if (props.lockControlBar) {
    player.controlBar.hide()
  }
  // 正常加载流程 flv
  // ready -> loadstart -> loadedmetadata -> loadeddata -> playing
  // rtmp连接成功 但没图像
  // ready -> loadstart
  // rtmp mp4 连接不成功
  // ready -> error
  // hls连接不成功
  // ready -> loadstart -> error
  player.on('ready', () => {
    const _flvPlayer = (
      player.tech({
        IWillNotUseThisInPlugins: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    ).flvPlayer
    if (_flvPlayer) {
      const flvPlayer = _flvPlayer as flvjs.FlvPlayer
      flvPlayer.on(flvjs.Events.ERROR, (errType, errDetails, e) => {
        self.status = 4
        self.error = getError('(flv) ' + e.msg)
        switch (errType) {
          case flvjs.ErrorTypes.NETWORK_ERROR:
            // 存在多种情况 以下是常见几种
            // ERR_FAILED 504 连接到srs 超过1分钟一直没有等到流时提示  Exception
            // ERR_CONNECTION_REFUSED 访问到一个不存在的IP地址时 Exception
            // ERR_CONNECTION_TIMED_OUT IP地址存在 端口不存在时 Exception
            // ERR_INCOMPLETE_CHUNKED_ENCODING 服务器停止推流 UnrecoverableEarlyEof
            emits('vvperror', this, errType, errDetails, e)
            break
          case flvjs.ErrorTypes.MEDIA_ERROR:
            break
          case flvjs.ErrorTypes.OTHER_ERROR:
            break
        }
      })
      flvPlayer.on(flvjs.Events.STATISTICS_INFO, (info) => {
        self.speed = info.speed.toFixed(0)
        updateHeaderSpeed()
        if (self.lastDecodedFrame === 0) {
          self.lastDecodedFrame = info.decodedFrames
          return
        }
        if (self.lastDecodedFrame !== info.decodedFrames) {
          self.lastDecodedFrame = info.decodedFrames
          self.lastDecodedCount = 0
        } else {
          self.lastDecodedCount++
          // 30 约等于18秒 画面卡死时重连
          if (self.lastDecodedCount >= 30) {
            self.lastDecodedCount = 0
            self.lastDecodedFrame = 0
            if (props.connect && props.connect.auto) {
              player.setTimeout(() => {
                window.console.warn(
                  self.lastOptions.src + ' decoded error. reconnect. '
                )
                play(self.lastOptions)
              }, 300)
            }
          }
        }
      })
    }
    if (player.fetchObj === undefined) {
      player.fetchObj = player.fetchFlv({
        isLive: true,
      })
    }
    // 直接关不掉 需要这里使用定时器处理
    setTimeout(() => {
      if (self.lastOptions.record && self.lastOptions.record.enabled) {
        player.fetchObj.show()
        let isLive = false
        if (self.lastOptions.record.isLive) {
          isLive = true
        }
        player.fetchObj.updateIsLive(isLive)
      } else {
        player.fetchObj.hide()
      }
    }, 50)
  })

  player.on('loadeddata', () => {
    self.status = 3
  })

  player.on('durationchange', () => {
    const ctrl = player.controlBar.getChild(
      'LiveDisplay'
    ) as videojs.LiveDisplay
    if (!ctrl.hasClass('vjs-hidden')) {
      // 实时关掉 播放暂停按钮
      // const toggleCtl = player.controlBar.getChild('PlayToggle') as
      player.controlBar.playToggle.hide()
      ctrl.addClass('vvp-live')
    } else {
      ctrl.removeClass('vvp-live')
    }
  })

  player.on('pause', () => {
    // 不允许隐藏时暂停
    player.play()
  })
  // this.player.on('playing', () => {
  //   // console.log('playing')
  //   // 一直执行
  // })
  player.on('fetchStart', () => {
    self.fetching = true
  })
  player.on('fetchStop', () => {
    self.fetching = false
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
    } else {
      if (props.lockControlBar) {
        player.controlBar.hide()
        player.header.el.container.removeAttribute('style')
      }
    }
  })
  player.on('volumechange', () => {
    self.muted = player.muted()
  })
  // this.player.on('loadeddata', () => {
  //   console.log('loadeddata')
  // })
  // this.player.on('loadedmetadata', () => {
  //   console.log('loadedmetadata')
  // })
  // 开启音频 loadedmetadata progress > 5 canplay = false playing=false 重连
  // this.player.on('useractive', () => {
  //   console.log('useractive')
  // })
  // this.player.on('userinactive', () => {
  //   console.log('userinactive')
  // })
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
}

const destoryPlayer = () => {
  console.log(self.created)
  if (self.created) {
    player.dispose()
    self.created = false
  }
}

const fullscreen = () => {
  if (player) {
    if (!player.isFullscreen()) {
      player.requestFullscreen()
    }
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

/**
 * 占用
 * @param order {int} 创建顺序
 * @param text {string} 占用文本
 */
const occupy = (order: number, unique: string, text: string) => {
  if (self.status === 4) {
    close()
  }
  if (self.status === 0) {
    self.order = order
    self.status = 1
    self.lastOptions = {
      data: {
        unique: unique,
      },
      text: text,
    }
  }
}

const play = (option: PlayOptions) => {
  close()
  createPlayer()
  const options = videojs.mergeOptions(defaultV3PlayOptions, option)
  console.log(options)
  if (self.order === 0) {
    self.order = options.order
  }
  if (!options.hasAudio) {
    const ctrl = player.controlBar.getChild(
      'VolumePanel'
    ) as videojs.VolumePanel
    ctrl.hide()
    if (player.options().flvjs) {
      player.options().flvjs.mediaDataSource.hasAudio = false
    }
  }
  self.status = 2
  const type = getMediaType(options.src)
  if (options.content) {
    player.contextmenuUI({
      content: options.content,
    })
  }
  if (options.record && options.record.enabled) {
    if (type === 'rtmp/mp4' || type === 'application/x-mpegURL') {
      // rtmp/m3u8不支持下载
      options.record.enabled = false
    }
  }
  self.filename = url2Filename(options.src)
  self.suffix = self.filename.split('.').pop().toLowerCase()
  if (options.data.unique == null) {
    options.data.unique = self.filename
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
const updateHeaderSpeed = () => {
  if (player.header) {
    player.header.el.speed.innerText = kbps.value
  }
}

const url2Filename = (url: string) => {
  if (url) {
    const vlist = url.split('?')
    return vlist[0].split('\\').pop().split('/').pop()
  } else {
    return ''
  }
}

const toggleRecord = () => {
  if (self.created && player.fetchObj) {
    if (player.fetchObj.fetching) {
      player.fetchObj.stop(true)
    } else {
      player.fetchObj.start()
    }
  }
}

const toggleMuted = () => {
  if (self.created) {
    if (player.muted()) {
      player.muted(false)
    } else {
      player.muted(true)
    }
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
  occupy,
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

  .vvp-footer {
    position: absolute;
    bottom: 0;
    height: $footerHeight;
    width: 100%;
    background: rgba(30, 30, 30, 72%);
    display: none;

    .vvp-control {
      position: relative;
      text-align: center;
      margin: 0;
      padding: 0;
      height: 100%;
      flex: none;
      color: #aaa;
    }

    .vvp-button {
      background: 0 0;
      border: none;
      cursor: pointer;
      display: inline-block;
      text-transform: none;
      text-decoration: none;
      transition: none;
      appearance: none;
      width: 36px;
      font-size: 18px;
      line-height: $footerHeight;
    }

    .vvp-button:hover {
      text-shadow: 0 0 1em #fff;
      color: #ccc;
    }

    .vvp-button:active {
      text-shadow: 0 0 1em #fff;
      color: #fff;
    }

    .vvp-control-text {
      line-height: $footerHeight;
    }

    .vvp-control-speed {
      width: 55px;
    }

    .vvp-control-info {
      width: auto;
      flex-grow: 1;
      text-align: left;
      margin: 0 5px;
    }

    .vvp-icon-placeholder {
      font-family: VideoJS;
      font-weight: 400;
      font-style: normal;
    }

    .vvp-control-mute {
      .vvp-icon-placeholder:before {
        content: '\f104';
      }
    }

    .vvp-vol-0 {
      .vvp-icon-placeholder:before {
        content: '\f104';
      }
    }

    .vvp-vol-3 {
      .vvp-icon-placeholder:before {
        content: '\f107';
      }
    }

    .vvp-control-fullscreen {
      .vvp-icon-placeholder:before {
        content: '\f108';
        font-size: 22px;
        line-height: $footerHeight;
      }
    }

    .vvp-control-record {
      .vvp-icon-placeholder:before {
        content: '\f111';
      }
    }

    .vvp-fetching {
      .vvp-icon-placeholder:before {
        color: #f00;
      }
    }

    .vvp-control-close {
      .vvp-icon-placeholder:before {
        content: '\f115';
      }
    }

    .vvp-control-snap {
      .vvp-icon-placeholder:before {
        content: '\f10B';
      }
    }
  }

  .vvp-focus {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px green solid;
    box-sizing: border-box;
    z-index: 6;
    display: none;
    pointer-events: none;
  }

  .vvp-focus-show {
    display: block;
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
      display: inline-block;
      line-height: 3em;
      padding: 0 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .vjs-h-speed {
      min-width: 75px;
      text-align: right;
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

  .vjs-slider-horizontal .vjs-volume-level:before {
    top: -0.5em;
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

  &.vvp-footer-show {
    .vvp-shade {
      height: calc(100% - #{$footerHeight});
    }

    .vvp-footer {
      display: flex;
    }

    .video-js {
      height: calc(100% - #{$footerHeight});

      .vjs-header {
        display: none;
      }
    }

    .vjs-has-started .vjs-fetch-flv-ctx {
      top: 0px !important;
    }
  }
}
</style>
