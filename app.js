// 初始化云开发环境
wx.cloud.init({
  env: 'cloudbase-1g1rzwmkda1c47e9',
  traceUser: true,
  timeout: 15000 // 设置更长的超时时间
})

const userModel = require('./models/user.js')
App({
  onLaunch() {
    // 检查用户登录状态
    this.checkLoginStatus()
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },

  // 用户登录
  async login() {
    try {
      const userInfo = await userModel.getUserInfo()
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
      wx.setStorageSync('userInfo', userInfo)
      return userInfo
    } catch (error) {
      console.error('登录失败：', error)
      throw error
    }
  },
  updateUserInfo(userInfo) {
     this.globalData.userInfo = userInfo;
     this.globalData.isLoggedIn = !!userInfo;
   }
})