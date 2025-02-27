import { createRouter, createWebHistory, type RouteNamedMap, type RouteRecordInfo, type RouteRecordRaw } from 'vue-router'
import Home from '@/home/Home.vue'
import Room from '@/room/Room.vue'
import RoomList from '../room/RoomList.vue'
import ScenarioEditor from '@/scenario/ScenarioEditor.vue'

declare module 'vue-router' {
    interface RouteNamedMap {
        home: RouteRecordInfo<'home', '/', Record<never, never>, Record<never, never>>,
        room: RouteRecordInfo<'room', '/room', Record<never, never>, Record<never, never>>,
        roomList: RouteRecordInfo<'roomList', '/roomList', Record<never, never>, Record<never, never>>,
        scenarioEditor: RouteRecordInfo<'scenarioEditor', '/scenarioEditor', Record<never, never>, Record<never, never>>
    }
    
    interface TypesConfig {
        RouteNamedMap: RouteNamedMap
    }
}

type RouteRecordsFromMap = {
    [Key in keyof RouteNamedMap]: 
        RouteNamedMap[Key] extends RouteRecordInfo<infer Name, infer Path, infer RawParams, infer NormalizedParams> ? 
            Name extends Key ? Key extends Name ? 
                RouteRecordRaw & { name: Name, path: Path }
            : never : never
        : never
}[keyof RouteNamedMap][]

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/room',
        name: 'room',
        component: Room
        // Lazily initializing components like this is surely not a bad way
        // However, playwright tests do no longer recognize this as an instant navigation
        // and test may fail. (This can be circumvented with page.waitForUrl(...))
        // For now, preloading all components is absolutely fine.
        // component: () => import('../room/Room.vue')
    },
    {
        path: '/roomList',
        name: 'roomList',
        component: RoomList
    },
    {
        path: '/scenarioEditor',
        name: 'scenarioEditor',
        component: ScenarioEditor
    }
] satisfies RouteRecordsFromMap

type AssertAllRoutesValid = typeof routes extends RouteRecordsFromMap ? true : never
const _assert1: AssertAllRoutesValid = true
type AssertAllRoutesContained = RouteRecordsFromMap extends Omit<(typeof routes)[number], 'component'>[] ? true : never
const _assert2: AssertAllRoutesContained = true

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})
export default router

