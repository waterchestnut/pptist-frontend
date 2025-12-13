import {createRouter, createWebHistory} from 'vue-router'

const App = () => import('@/App.vue')
const Preview = () => import('@/Preview.vue')
const FirstSlide = () => import('@/FirstSlide.vue')

const routes = [
    {
        path: '/',
        name: 'app',
        component: App,
        meta: {title: '在线课件'}
    },
    {
        path: '/preview',
        name: 'preview',
        component: Preview,
        meta: {title: '课件预览'}
    },
    {
        path: '/first-slide',
        name: 'firstSlide',
        component: FirstSlide,
        meta: {title: '首页预览'}
    }
]

const router = createRouter({
    // 使用History模式
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 滚动行为控制
        return savedPosition || {top: 0}
    }
})

router.beforeEach((to, from) => {
    // @ts-ignore
    document.title = to.meta.title || '在线演示文稿'
})

export default router