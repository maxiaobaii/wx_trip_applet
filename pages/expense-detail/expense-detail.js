// 消费记录详情页面
const expenseModel = require('../../models/expense')

Page({
  data: {
    expenseId: '',
    expenseInfo: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        expenseId: options.id
      })
      this.loadExpenseData()
    }
  },

  // 加载消费记录数据
  async loadExpenseData() {
    try {
      const expenseInfo = await expenseModel.getExpenseDetail(this.data.expenseId)
      this.setData({
        expenseInfo,
        loading: false
      })
    } catch (error) {
      console.error('加载消费记录失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 编辑消费记录
  onEditExpense() {
    wx.navigateTo({
      url: `/pages/expense-form/expense-form?id=${this.data.expenseId}`
    })
  },

  // 删除消费记录
  async onDeleteExpense() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这条消费记录吗？',
      confirmText: '删除',
      confirmColor: '#ff4d4f'
    })

    if (res.confirm) {
      try {
        await expenseModel.deleteExpense(this.data.expenseId)
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        // 返回上一页并刷新数据
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage) {
          prevPage.loadTripData()
        }
        wx.navigateBack()
      } catch (error) {
        console.error('删除消费记录失败：', error)
        wx.showToast({
          title: '删除失败',
          icon: 'error'
        })
      }
    }
  }
})