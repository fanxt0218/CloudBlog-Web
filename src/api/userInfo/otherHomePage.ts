import request from "@/utils/request";
import { da } from "element-plus/es/locales.mjs";

/**
 * 关注
 */
export const focusUser = (
    data:{
        userId:number,
        focusUserId:number,
        status:number,
        source:string
    }
) => {
    return request.post(`/content/focus/followUser`,data);
}

/**
 * 获取关注状态
 */
export const getFocusStatus = (
    data:{
        userId:number,
        focusUserId:number,
    }
) => {
    return request.post(`/content/focus/getFollowStatus`,data);
}
