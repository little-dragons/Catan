import { defineStore } from "pinia";
import { ref } from "vue";

export enum ModalType {
    Login, CreateRoom
}

export const useModalStore = defineStore('modalStore', () => {
    const value = ref<ModalType | undefined>(undefined)
    return { value }
})