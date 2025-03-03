// 账本列表页面
const tripModel = require('../../models/trip')
const userModel = require('../../models/user')
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    trips: [],
    loading: true
//     tempUserInfo: {
//       avatarUrl: '',
//       nickName: ''
//     }
  },

  // 处理选择头像事件
//   onChooseAvatar(e) {
//     const { avatarUrl } = e.detail
//     this.setData({
     //  'tempUserInfo.avatarUrl': avatarUrl
//     })
//   },

  // 处理输入昵称事件
  onInputNickname(e) {
    const nickName = e.detail.value
    this.setData({
      'tempUserInfo.nickName': nickName
    })
  },

  // 用户登录
//   `async onLogin() {
//     if (!this.data.tempUserInfo.avatarUrl || !this.data.tempUserInfo.nickName) {
//       wx.showToast({
//         title: '请选择头像并输入昵称',
//         icon: 'none'
//       })
//       return
//     }

//     try {
//       wx.showLoading({ title: '登录中...' })
      
//       // 使用用户选择的头像和输入的昵称
//       const userInfo = {
//         avatarUrl: this.data.tempUserInfo.avatarUrl,
//         nickName: this.data.tempUserInfo.nickName
//       }
      
//       // 保存用户信息
//       await userModel.saveUserInfo(userInfo)
      
//       // 更新全局数据
//       app.globalData.userInfo = userInfo
//       app.globalData.isLoggedIn = true
      
//       // 更新页面状态
//       this.setData({
//         userInfo,
//         isLoggedIn: true
//       })
      
//       wx.hideLoading()
      
//       // 加载账本列表
//       this.loadTripList()
//     } catch (error) {
//       wx.hideLoading()
//       console.error('登录失败：', error)
//       wx.showToast({
//         title: '登录失败，请重试',
//         icon: 'none'
//       })
//     }
//   },`
  async onLogin(e) {
    if (!e || !e.type) {
      console.error('onLogin必须由用户点击事件触发')
      return
    }
    console.log('触发微信授权登录弹窗')
    try {
      wx.showLoading({ title: '登录中...' })
      
      // 使用wx.getUserProfile获取用户信息
      const userProfileRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善会员资料',
          lang: 'zh_CN',
          success: resolve,
          fail: reject
        })
      })
      
      const userInfo = userProfileRes.userInfo
      
      // 保存用户信息
      await userModel.saveUserInfo(userInfo)
      
      // 更新全局数据
      app.globalData.userInfo = userInfo
      app.globalData.isLoggedIn = true
      app.updateUserInfo(userInfo);
      
      // 更新页面状态
      this.setData({
        userInfo,
        isLoggedIn: true
      })
      
      wx.hideLoading()
      
      // 加载账本列表
      this.loadTripList()
      
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      wx.hideLoading()
      console.error('登录失败：', error)
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  },
  // 加载账本列表
  async loadTripList() {
    try {
      this.setData({ loading: true })
      const trips = await tripModel.getUserTrips()
      this.setData({
        trips,
        loading: false
      })
    } catch (error) {
      console.error('加载账本列表失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },
  // 处理退出登录
  handleLogout() {
    const userModel = require('../../models/user.js')
    userModel.clearUserInfo()
    this.setData({
      userInfo: null,
      isLoggedIn: false,
      trips: []
    })
  },
  // 创建新账本
  onCreateTrip() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/expense-form/expense-form'
    })
  },

  // 查看账本详情
  onViewTrip(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/trip-detail/trip-detail?id=${id}`
    })
  }
})