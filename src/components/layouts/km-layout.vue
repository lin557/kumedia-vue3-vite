<template>
  <div class="km-layout" :class="appCls">
    <base-header />
    <base-body />
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, onBeforeMount, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { toggleDark } from '../../composables/index'
const route = useRoute()

let isTangPage = ref(false)
const appCls = computed(() => {
  if (isTangPage.value) {
    return 'km-page-tang'
  }
  return ''
})

const doResize = () => {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  document.documentElement.style.setProperty('--km-client-width', width + 'px')
  document.documentElement.style.setProperty(
    '--km-client-height',
    height + 'px'
  )
}

onBeforeMount(() => {
  doResize()
})

onMounted(() => {
  window.onresize = () => {
    doResize()
  }
})

watch(
  () => route,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (val, preVal) => {
    if (route.path.indexOf('/tang') >= 0) {
      toggleDark(true)
      isTangPage.value = true
    } else {
      toggleDark(true)
      isTangPage.value = false
    }
  },
  {
    // 这个参数代表监听对象时，可以监听深度嵌套的对象属性
    // 比如message是一个对象的话，可以监听到message.a.b.c，也就是message下的所有属性
    deep: true,
    // 值为true的话，就消除了惰性，watch会在创建后立即执行一次
    // 那么首次执行，val为默认值,preVal为undefined
    immediate: true
  }
)
</script>
<style lang="scss">
:root {
  --km-client-width: 1024px;
  --km-client-height: 768px;
}
.km-layout {
  height: 100%;
}

.km-page-tang {
  // background-image: url(/src/assets/tang-bk.jpg);
  // background-repeat: no-repeat;
  // background-size: cover;
  // background-position: top;

  .ep-card {
    background-color: transparent;
  }
}
</style>
