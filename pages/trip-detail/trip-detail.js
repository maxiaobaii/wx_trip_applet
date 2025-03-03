// 账本详情页面
const tripModel = require('../../models/trip')
const expenseModel = require('../../models/expense')

Page({
  data: {
    tripId: '',
    tripInfo: null,
    expenses: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        tripId: options.id
      })
      this.loadTripData()
    }
  },

  // 加载账本数据
  async loadTripData() {
    try {
      const tripInfo = await tripModel.getTripDetail(this.data.tripId)
      const expenses = await expenseModel.getTripExpenses(this.data.tripId)

      this.setData({
        tripInfo,
        expenses,
        loading: false
      })
    } catch (error) {
      console.error('加载账本数据失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 添加消费记录
  onAddExpense() {
    wx.navigateTo({
      url: `/pages/expense-form/expense-form?tripId=${this.data.tripId}`
    })
  },

  // 查看消费记录详情
  onViewExpense(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/expense-detail/expense-detail?id=${id}`
    })
  },

  // 编辑账本信息
  onEditTrip() {
    wx.navigateTo({
      url: `/pages/trip-form/trip-form?id=${this.data.tripId}`
    })
  },

  // 删除账本
  async onDeleteTrip() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '删除账本将同时删除所有消费记录，确定要删除吗？',
      confirmText: '删除',
      confirmColor: '#ff4d4f'
    })

    if (res.confirm) {
      try {
        await tripModel.deleteTrip(this.data.tripId)
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        wx.navigateBack()
      } catch (error) {
        console.error('删除账本失败：', error)
        wx.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    }
  }
})