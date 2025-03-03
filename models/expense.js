// 消费记录数据模型
const db = wx.cloud.database()
const expenseCollection = db.collection('expenses')
const tripCollection = db.collection('trips')
const _ = db.command

// 创建新消费记录
const createExpense = async (expenseData) => {
  try {
    const now = new Date()
    const { tripId, amount } = expenseData

    // 开始数据库事务
    const result = await db.runTransaction(async transaction => {
      // 创建消费记录
      const expenseResult = await transaction.collection('expenses').add({
        data: {
          ...expenseData,
          createTime: now,
          updateTime: now
        }
      })

      // 更新账本总金额
      await transaction.collection('trips').doc(tripId).update({
        data: {
          totalAmount: _.inc(amount),
          updateTime: now
        }
      })

      return expenseResult
    })

    return result._id
  } catch (error) {
    console.error('创建消费记录失败：', error)
    return null
  }
}

// 获取账本的消费记录列表
const getTripExpenses = async (tripId) => {
  try {
    const { data } = await expenseCollection.where({
      tripId: tripId
    })
    .orderBy('date', 'desc')
    .get()
    return data
  } catch (error) {
    console.error('获取消费记录列表失败：', error)
    return []
  }
}

// 获取消费记录详情
const getExpenseDetail = async (expenseId) => {
  try {
    const { data } = await expenseCollection.doc(expenseId).get()
    return data
  } catch (error) {
    console.error('获取消费记录详情失败：', error)
    return null
  }
}

// 更新消费记录
const updateExpense = async (expenseId, updateData) => {
  try {
    const oldExpense = await getExpenseDetail(expenseId)
    if (!oldExpense) return false

    const now = new Date()
    const amountDiff = updateData.amount - oldExpense.amount

    // 开始数据库事务
    await db.runTransaction(async transaction => {
      // 更新消费记录
      await transaction.collection('expenses').doc(expenseId).update({
        data: {
          ...updateData,
          updateTime: now
        }
      })

      // 更新账本总金额
      if (amountDiff !== 0) {
        await transaction.collection('trips').doc(oldExpense.tripId).update({
          data: {
            totalAmount: _.inc(amountDiff),
            updateTime: now
          }
        })
      }
    })

    return true
  } catch (error) {
    console.error('更新消费记录失败：', error)
    return false
  }
}

// 删除消费记录
const deleteExpense = async (expenseId) => {
  try {
    const expense = await getExpenseDetail(expenseId)
    if (!expense) return false

    const now = new Date()

    // 开始数据库事务
    await db.runTransaction(async transaction => {
      // 删除消费记录
      await transaction.collection('expenses').doc(expenseId).remove()

      // 更新账本总金额
      await transaction.collection('trips').doc(expense.tripId).update({
        data: {
          totalAmount: _.inc(-expense.amount),
          updateTime: now
        }
      })
    })

    return true
  } catch (error) {
    console.error('删除消费记录失败：', error)
    return false
  }
}

module.exports = {
  createExpense,
  getTripExpenses,
  getExpenseDetail,
  updateExpense,
  deleteExpense
}