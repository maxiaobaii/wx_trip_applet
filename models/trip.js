// 账本数据模型
const db = wx.cloud.database()
const tripCollection = db.collection('trips')
const expenseCollection = db.collection('expenses')
const _ = db.command

// 创建新账本
const createTrip = async (tripData) => {
  try {
    const now = new Date()
    const result = await tripCollection.add({
      data: {
        ...tripData,
        totalAmount: 0,
        createTime: now,
        updateTime: now
      }
    })
    return result._id
  } catch (error) {
    console.error('创建账本失败：', error)
    return null
  }
}

// 获取用户的账本列表
const getUserTrips = async (userId) => {
  try {
    const { data } = await tripCollection.where({
      members: _.elemMatch({
        userId: userId
      })
    })
    .orderBy('createTime', 'desc')
    .get()
    return data
  } catch (error) {
    console.error('获取账本列表失败：', error)
    return []
  }
}

// 获取账本详情
const getTripDetail = async (tripId) => {
  try {
    const { data } = await tripCollection.doc(tripId).get()
    return data
  } catch (error) {
    console.error('获取账本详情失败：', error)
    return null
  }
}

// 更新账本信息
const updateTrip = async (tripId, updateData) => {
  try {
    await tripCollection.doc(tripId).update({
      data: {
        ...updateData,
        updateTime: new Date()
      }
    })
    return true
  } catch (error) {
    console.error('更新账本失败：', error)
    return false
  }
}

// 删除账本
const deleteTrip = async (tripId) => {
  try {
    // 删除账本下的所有消费记录
    await expenseCollection.where({
      tripId: tripId
    }).remove()
    
    // 删除账本
    await tripCollection.doc(tripId).remove()
    return true
  } catch (error) {
    console.error('删除账本失败：', error)
    return false
  }
}

module.exports = {
  createTrip,
  getUserTrips,
  getTripDetail,
  updateTrip,
  deleteTrip
}