import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    isLoggedIn: false,
    userId: Number(localStorage.getItem('userId')) || 0,
    userName: localStorage.getItem('userName') || '',
    token: localStorage.getItem('token') || '',
    avatar: '',
    isVip: Number(localStorage.getItem('isVip')) || 0,
    permissionId: Number(localStorage.getItem('permissionId')) || 1,
  }),
  actions: {
    // 初始化，同步登录状态
    init() {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (userId && token) {
        this.isLoggedIn = true;
        this.userId = Number(userId);
        this.token = token;
        // 同步权限和VIP状态
        this.isVip = Number(localStorage.getItem('isVip')) || 0;
        this.permissionId = Number(localStorage.getItem('permissionId'));
      } else {
        this.isLoggedIn = false;
        this.userId = 0;
        this.token = '';
        this.isVip = 0;
        this.permissionId = 1;
      }
    },
    // 登录成功设置状态
    login(data: { userId: number, token: string, userName?: string }) {
      this.isLoggedIn = true;
      this.userId = data.userId;
      this.token = data.token;
      if (data.userName) this.userName = data.userName;

      localStorage.setItem('userId', String(data.userId));
      localStorage.setItem('token', data.token);
      if (data.userName) localStorage.setItem('userName', data.userName);
    },
    // 退出或 Token 过期清理状态
    logout() {
      this.isLoggedIn = false;
      this.userId = 0;
      this.token = '';
      this.userName = '';
      this.avatar = '';
      this.isVip = 0;
      this.permissionId = 1;

      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('isVip');
      localStorage.removeItem('permissionId');
    },
    // 设置通用用户信息
    setUserInfo(data: { userName?: string, avatar?: string, isVip?: number, permissionId?: number }) {
      if (data.userName !== undefined) {
        this.userName = data.userName;
        localStorage.setItem('userName', data.userName);
      }
      if (data.avatar !== undefined) this.avatar = data.avatar;
      if (data.isVip !== undefined) {
        this.isVip = data.isVip;
        localStorage.setItem('isVip', String(data.isVip));
      }
      if (data.permissionId !== undefined) {
        this.permissionId = data.permissionId;
        localStorage.setItem('permissionId', String(data.permissionId));
      }
    }
  }
})