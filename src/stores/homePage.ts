import { defineStore } from 'pinia'

export const useHomePageStore = defineStore('homePage', {
    state: () => ({
        // 搜索栏内容
        searchKey: '',
    }),
    actions: {
        // 设置搜索栏内容
        setSearchKey(searchKey: string) {
            this.searchKey = searchKey;
        },
    },
    getters: {

    }
})