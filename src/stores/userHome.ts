import { defineStore } from 'pinia'

export const useUserHomeStore = defineStore('userHome',{
    state:()=>({
        postCount:0,
        categoryCount:0
    })
})