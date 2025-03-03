const db = require('./db')

// 用户数据模型
class UserModel {
  constructor() {
    this.userInfo = null
    this.collection = 'users'
  }

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.userInfo) {
        resolve(this.userInfo)
        return
      }

      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: async (res) => {
          try {
            // 保存用户信息到云数据库
            const userInfo = res.userInfo
            await this.saveUserInfo(userInfo)
            this.userInfo = userInfo
            resolve(userInfo)
          } catch (error) {
            reject(error)
          }
        },
        fail: reject
      })
    })
  }

  // 保存用户信息到云数据库
  async saveUserInfo(userInfo) {
    try {
      const { openid } = await wx.cloud.callFunction({
        name: 'getOpenId'
      })

      const userData = {
        _id: openid,
        ...userInfo,
        createTime: new Date(),
        updateTime: new Date()
      }

      await db.collection(this.collection).doc(openid).set({
        data: userData
      })

      return userData
    } catch (error) {
      console.error('保存用户信息失败：', error)
      throw error
    }
  }

  // 从云数据库获取用户信息
  async fetchUserInfo(openid) {
    try {
      const { data } = await db.collection(this.collection).doc(openid).get()
      if (data) {
        this.userInfo = data
        return data
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败：', error)
      return null
    }
  }

  // 清除用户信息
  clearUserInfo() {
    this.userInfo = null
  }
}

module.exports = new UserModel()