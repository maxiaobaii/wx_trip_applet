// 添加/编辑消费记录页面
const expenseModel = require('../../models/expense')
const tripModel = require('../../models/trip')

Page({
  data: {
    tripId: '',
    expenseId: '',
    formData: {
      title: '',
      amount: '',
      date: '',
      remark: ''
    },
    members: [],
    payerIndex: 0,
    loading: true
  },

  onLoad(options) {
    this.setData({
      tripId: options.tripId || '',
      expenseId: options.id || ''
    })

    if (this.data.expenseId) {
      this.loadExpenseData()
    } else {
      this.loadTripMembers()
    }
  },

  // 加载消费记录数据（编辑模式）
  async loadExpenseData() {
    try {
      const expenseInfo = await expenseModel.getExpenseDetail(this.data.expenseId)
      const tripMembers = await tripModel.getTripMembers(expenseInfo.tripId)
      
      // 设置支付者索引
      const payerIndex = tripMembers.findIndex(member => member.userId === expenseInfo.payer.userId)

      // 设置分摊成员选中状态
      const members = tripMembers.map(member => ({
        ...member,
        selected: expenseInfo.splitMembers.some(split => split.userId === member.userId)
      }))

      this.setData({
        tripId: expenseInfo.tripId,
        formData: {
          title: expenseInfo.title,
          amount: expenseInfo.amount,
          date: expenseInfo.date,
          remark: expenseInfo.remark || ''
        },
        members,
        payerIndex,
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

  // 加载账本成员（新建模式）
  async loadTripMembers() {
    try {
      const members = await tripModel.getTripMembers(this.data.tripId)
      this.setData({
        members: members.map(member => ({ ...member, selected: true })),
        loading: false
      })
    } catch (error) {
      console.error('加载成员列表失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 日期选择器变更
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  // 支付者选择器变更
  onPayerChange(e) {
    this.setData({
      payerIndex: e.detail.value
    })
  },

  // 切换分摊成员选中状态
  onToggleMember(e) {
    const { index } = e.currentTarget.dataset
    const member = this.data.members[index]
    
    this.setData({
      [`members[${index}].selected`]: !member.selected
    })
  },

  // 表单提交
  async onSubmit(e) {
    const formData = e.detail.value
    const { members, payerIndex } = this.data

    // 表单验证
    if (!formData.title.trim()) {
      return wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
    }

    if (!formData.amount || isNaN(formData.amount)) {
      return wx.showToast({
        title: '请输入正确的金额',
        icon: 'none'
      })
    }

    if (!formData.date) {
      return wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
    }

    // 获取选中的分摊成员
    const splitMembers = members.filter(member => member.selected)
    if (splitMembers.length === 0) {
      return wx.showToast({
        title: '请选择分摊成员',
        icon: 'none'
      })
    }

    // 计算每人分摊金额
    const amount = parseFloat(formData.amount)
    const splitAmount = (amount / splitMembers.length).toFixed(2)

    // 构建消费记录数据
    const expenseData = {
      tripId: this.data.tripId,
      title: formData.title.trim(),
      amount,
      date: formData.date,
      remark: formData.remark.trim(),
      payer: members[payerIndex],
      splitMembers: splitMembers.map(member => ({
        ...member,
        splitAmount
      }))
    }

    try {
      if (this.data.expenseId) {
        // 更新消费记录
        await expenseModel.updateExpense(this.data.expenseId, expenseData)
      } else {
        // 创建消费记录
        await expenseModel.createExpense(expenseData)
      }

      wx.showToast({
        title: '保存成功',
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
      console.error('保存消费记录失败：', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }
})