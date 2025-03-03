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
  },

  onLoad() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const { userInfo, isLoggedIn } = app.globalData
    this.setData({
      userInfo,
      isLoggedIn
    })

    if (isLoggedIn) {
      this.loadTripList()
    } else {
      this.setData({ loading: false })
    }
  },

  // 用户登录
  async onLogin() {
    try {
      const userInfo = await app.login()
      this.setData({
        userInfo,
        isLoggedIn: true
      })
      this.loadTripList()
    } catch (error) {
      console.error('登录失败：', error)
      wx.showToast({
        title: '登录失败',
        icon: 'error'
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