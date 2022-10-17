<template>
  <div class="base-body">
    <el-scrollbar height="100%">
      <!-- 路由匹配到的组件将渲染在这里 -->
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, computed } from 'vue'
import { useRoute, RouteLocationMatched } from 'vue-router'

let levelList: RouteLocationMatched[] = reactive([])
const routeData = useRoute()
const initBreadcrumbList = () => {
  // 当前路由的完整路由表
  levelList.length = 0
  levelList.push(...routeData.matched)

  // console.log(levelList)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const lt = computed(() => {
  return levelList[1].meta.title
})

watch(
  () => routeData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (val, preVal) => {
    initBreadcrumbList()
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
.base-body {
  height: calc(100% - 60px);
  overflow-y: hidden;
  background-color: var(--ep-color-success-light-9);

  .ep-scrollbar__bar.is-horizontal {
    display: none;
  }
}
</style>
