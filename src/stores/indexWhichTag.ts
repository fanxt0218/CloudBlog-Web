import { defineStore } from 'pinia'

export const useWhichTagStore = defineStore('whichTag', {
    state: () => ({
        whichTag: ''
    }),
    actions: {
        setWhichTag(tagKey: string) {
            this.whichTag = tagKey
        }
    }
})