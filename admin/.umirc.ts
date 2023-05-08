import { defineConfig } from 'umi';

export const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  antd: {},
  exportStatic: {},
  externals: {
    axios: 'window.axios',
  },
  scripts: [
    'https://cdn.bootcdn.net/ajax/libs/axios/0.27.2/axios.min.js',
  ],
  // mfsu: isDev ? {} : { production: { output: '.mfsu-production' } },  // 提高热更新效率
  base: '/user/',
  publicPath: '/user/',
  outputPath: '../server/static/user',
  routes: [
    {
      path: '/login',
      component: '../pages/login',
    },
    {
      path: '/register',
      component: '../pages/register',
    },
    {
      exact: false,
      path: '/',
      component: '@/layouts/index',
      routes: [
        {
          path: '/dashboard',
          component: '../pages/dashboard',
        },
        {
          path: '/website',
          component: '../pages/website',
        },
        {
          path: '/institution',
          component: '../pages/gov',
        },
        {
          path: '/articles',
          component: '../pages/articles',
        },
        {
          path: '/articles/edit',
          component: '../pages/articles/editor',
        },
        {
          path: '/notes',
          component: '../pages/notes',
        },
        {
          path: '/note/edit',
          component: '../pages/notes/editor',
        },
        {
          path: '/products',
          component: '../pages/products',
        },
        {
          path: '/products/edit',
          component: '../pages/products/editor',
        },
        {
          path: '/videos',
          component: '../pages/videos',
        },
        {
          path: '/videos/edit',
          component: '../pages/videos/editor',
        },
      ]
    }
  ],
  theme: {
    "primary-color": "#2F54EB",
  },
  fastRefresh: {},
});
