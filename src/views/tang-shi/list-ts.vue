<template>
  <div class="ts-container">
    <div class="ts-title">唐诗三百首</div>
    <el-row>
      <el-card v-for="tang in dataTang" :key="tang.author" shadow="never">
        <template #header>
          <div>
            <span>{{ tang.author }}</span>
          </div>
        </template>
        <div
          v-for="(item, index) in tang.works"
          :key="item.title"
          class="tv-item"
        >
          <router-link :to="item.data"
            >{{ index + 1 }}. {{ item.title }}</router-link
          >
        </div>
      </el-card>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
const dataTang = [
  {
    author: '李白',
    works: [
      {
        title: '黄鹤楼送孟浩然之广陵',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
      {
        title: '早发白帝城',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
      {
        title: '夜宿山寺',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
      {
        title: '赠汪伦',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
      {
        title: '望庐山瀑布',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
      {
        title: '静夜思',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
    ],
  },
  {
    author: '李商隐',
    works: [
      {
        title: '北青萝',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
      {
        title: '瑶池',
        data: {
          path: '/tang/126',
          meta: {
            aa: 'aaa',
          },
        },
      },
    ],
  },
]
</script>

<style lang="scss">
.ts-container {
  padding: 20px 10px;

  .ts-title {
    text-align: center;
    font-weight: 600;
    font-size: 28px;
    padding-bottom: 20px;
  }

  .ep-card {
    margin: 6px;
    min-width: 220px;
  }

  .tv-item {
    padding: 3px 0px;
  }
}

/**
 * 修复小屏弹出位置bug
 */
@media only screen and (max-width: 548px) {
  .tv-container {
    .ep-card {
      min-width: calc(100% - 12px);
    }
  }
}
</style>
