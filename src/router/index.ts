import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { close, start } from '~/utils/nprogress'
import Layout from '~/components/layouts/km-layout.vue'

const routes: Array<RouteRecordRaw> = [
  // 未匹配的路径名称导航到该路径
  // @see https://router.vuejs.org/zh/guide/migration/index.html#%E5%88%A0%E9%99%A4%E4%BA%86-%EF%BC%88%E6%98%9F%E6%A0%87%E6%88%96%E9%80%9A%E9%85%8D%E7%AC%A6%EF%BC%89%E8%B7%AF%E7%94%B1
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('~/views/error/404.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: Layout,
    redirect: '/teleplay',
    meta: {
      title: '首页',
    },
    children: [
      {
        path: '404',
        component: () => import('~/views/error/404.vue'),
        meta: {
          title: '404',
        },
      },
      {
        path: 'index',
        component: () => import('~/views/home-view.vue'),
        meta: {
          title: '索引',
        },
      },
      {
        path: 'tang',
        component: () => import('~/views/tang-shi/list-ts.vue'),
        meta: {
          title: '唐诗',
        },
      },
      {
        path: 'tang/:id',
        component: () => import('~/views/tang-shi/view-ts.vue'),
        meta: {
          title: '唐诗',
          parent: '/tang',
        },
      },
      {
        path: 'teleplay',
        component: () => import('~/views/teleplay/list-teleplay.vue'),
        meta: {
          title: '电视',
        },
      },
      {
        path: 'teleplay/:id',
        component: () => import('~/views/teleplay/view-teleplay.vue'),
        meta: {
          title: '电视',
          parent: '/teleplay',
        },
      },
      {
        path: 'movie',
        component: () => import('~/views/movie/list-movie.vue'),
        meta: {
          title: '电影',
        },
      },
      // {
      //   path: 'movie/:id',
      //   component: () => import('~/views/movie/view-tv.vue'),
      //   meta: {
      //     title: '电影',
      //   },
      // },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeEach((pre, next) => {
  start()
})

router.afterEach(() => {
  close()
})

export default router
