<template>
  <div class="thumb-box">
    <div class="thumb">
      <router-link :to="props.info.path">
        <el-image :src="props.info.thumb" fit="fill" lazy />
        <div class="thumb_bg"></div>
        <span class="thumb_rb">
          <span> {{ leftBottom }} </span>
        </span>
      </router-link>
    </div>
    <div class="info">
      <div class="title">
        <router-link :to="props.info.path">
          {{ props.info.title }}
        </router-link>
      </div>
      <div class="subtitle">{{ props.info.profile }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        id: '',
        title: '',
        profile: '',
        rating: '',
        thumb: '',
        path: ''
      }
    }
  }
})

const leftBottom = computed(() => {
  return props.info.rating.toFixed(1)
})
</script>

<style lang="scss">
.thumb-box {
  margin-bottom: 16px;

  .thumb {
    position: relative;
    padding-top: 133.33%;

    a {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      text-decoration: none;
      background-color: #333;
      z-index: 2;
      overflow: hidden;
      border-radius: 7px;

      .ep-image {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
        img {
          transition: all 0.25s ease-in-out;
        }
      }
    }

    .thumb_bg {
      position: absolute;
      top: auto;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 46px;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAuCAYAAADp73NqAAAAAXNSR0IArs4c6QAAAC1JREFUCB1jYCAEWJiAKtAIZpAYKxYJsDqwBFgJmjacXDTz0Likm4ewCKyXCQBc7QDuqt9S0QAAAABJRU5ErkJggg==)
        repeat-x;
      border-radius: 0 0 4px 4px;
      z-index: 10;
    }

    .thumb_rb {
      position: absolute;
      color: var(--ep-color-warning);
      font-size: 20px;
      font-weight: 600;
      z-index: 15;
      line-height: 28px;
      right: 8px;
      bottom: 0;
    }
  }

  .info {
    position: relative;
    margin-top: 2px;
    padding: 7px 0 0;
    color: #999;
    z-index: 10;

    .title {
      height: 22px;
      overflow: hidden;

      a {
        display: block;
        height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        line-height: 22px;
        font-size: 16px;
      }
    }

    .subtitle {
      height: 20px;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 5px;
    }
  }
}

.thumb-box:hover {
  .thumb {
    // box-shadow: 0 2px 6px 0 rgb(0 0 0 / 40%);
    a {
      .ep-image {
        img {
          transform: scale(1.05);
        }
      }
    }
  }
  .info {
    .title {
      a {
        color: var(--ep-color-warning);
      }
    }
  }
}
</style>
