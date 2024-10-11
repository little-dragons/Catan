import { defineStore } from "pinia"
import { ref, toRaw } from "vue"

export enum PopupSeverity {
    Info, Warning, Error
}

export type Popup = {
    title: string
    message: string
    severity: PopupSeverity
    autoCloses: boolean
}

export const popupLifetime = 10000

export const usePopups = defineStore('popups', () => {
    const currentPopups = ref<{ info: Popup, insertTime: number }[]>([])

    function insert(popup: Popup) {
        currentPopups.value.push({ info: toRaw(popup), insertTime: Date.now() })

        if (popup.autoCloses)
            setTimeout(() => remove(popup), popupLifetime)
    }
    function remove(popup: Popup) {
        const idx = currentPopups.value.findIndex(x => toRaw(x.info) == toRaw(popup))
        if (idx < 0)
            return
    
        currentPopups.value.splice(idx, 1)
    }

    return { popups: currentPopups, insert, remove }
})
