<template>
  <div class="navbar">
    <div v-for="(item, index) in data.menu" :key="index" :class="item.cls">
      <router-link v-if="item.path !== ''" :to="item.path">
        {{ item.title }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const data = reactive({
  menu: [
    {
      title: '首页',
      path: '/',
      cls: 'navbar-item'
    },
    {
      title: '',
      path: '',
      cls: 'navbar-grow'
    },
    {
      title: '电影',
      path: '/movie',
      cls: 'navbar-item'
    },
    {
      title: '电视',
      path: '/teleplay',
      cls: 'navbar-item'
    },
    {
      title: '唐诗',
      path: '/tang',
      cls: 'navbar-item'
    }
  ]
})
</script>

<style lang="scss">
.navbar {
  top: 0;
  left: 0;
  position: relative;
  padding: 0;
  height: var(--km-narbar-height);
  overflow: hidden;
  display: flex;
  font-size: 14px;
  box-sizing: border-box;
  // border-bottom: var(--ep-border);
  // box-shadow: var(--ep-box-shadow-light);
  margin: 0 auto;

  .navbar-item {
    display: inline-flex;

    a {
      line-height: var(--km-narbar-height);
      padding: 0 16px;
      transition: background-color 0.3s;
    }

    .router-link-exact-active {
      color: var(--ep-color-warning) !important;
      border-bottom: 2px solid var(--ep-color-warning);
    }
  }

  .navbar-grow {
    flex-grow: 1;
  }
}
</style>
