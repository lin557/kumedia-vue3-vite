<template>
  <el-header class="navbar">
    <div class="navbar-wrapper">
      <el-menu
        router
        :default-active="activeIndex"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <div class="flex-grow" />
        <el-menu-item
          v-for="item in data.menu"
          :key="item.index"
          :index="item.index"
        >
          {{ item.title }}
        </el-menu-item>
      </el-menu>
    </div>
  </el-header>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'

const data = reactive({
  menu: [
    {
      title: '电影',
      index: '/movie'
    },
    {
      title: '电视',
      index: '/teleplay'
    },
    {
      title: '唐诗',
      index: '/tang'
    }
  ]
})
let activeIndex = ref('/')
const route = useRoute()

watch(
  () => route,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (val, preVal) => {
    if (JSON.stringify(route.params) === '{}') {
      activeIndex.value = route.path
    } else {
      activeIndex.value = route.meta.parent as string
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

const handleSelect = (key: string, keyPath: string[]) => {
  let test = false
  if (test) {
    console.log(key, keyPath)
  }
}
</script>

<style lang="scss">
.flex-grow {
  flex-grow: 1;
}
.navbar {
  top: 0;
  left: 0;
  position: relative;
  padding: 0;
  height: 59px;
  overflow: hidden;

  .navbar-wrapper {
    position: relative;
    background-color: var(--vt-c-bg);
    border-bottom: 1px solid var(--ep-menu-border-color);
    height: 58px;
    white-space: nowrap;
    transition: border-color 0.5s, background-color 0.5s;

    .ep-menu--horizontal {
      width: 960px;
      margin: 0 auto;
      transition: width 0.5s;
      height: 59px;
    }
  }
}
</style>
