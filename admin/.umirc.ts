/*
 * @Author: 钟媛
 * @Date: 2021-09-03 12:19:32
 * @LastEditTime: 2021-09-08 19:48:01
 * @Description: 配置文件
 */
import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    // { path: '/', component: '@/pages/index' },
    { path: '/', redirect: '/learn' },
    // 学习路径
    { path: '/learn', component: '@/pages/Learning' },
  ],
  fastRefresh: {},
});
