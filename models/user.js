const db = wx.cloud.database()
const { userSchema } = require('./db')

// 用户数据模型
class UserModel {
  constructor() {
    this.userInfo = null
    this.collection = 'users'
  }
  // 获取数据库实例
  getDB() {
    if (!this.db) {
      this.db = wx.cloud.database()
    }
    return this.db
  }
  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.userInfo) {
        resolve(this.userInfo)
        return
      }

      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途
        lang: 'zh_CN',
        success: async (res) => {
          try {
            const userInfo = res.userInfo
            await this.saveUserInfo(userInfo)
            this.userInfo = userInfo
            resolve(userInfo)
          } catch (error) {
            console.error('保存用户信息失败：', error)
            reject(error)
          }
        },
        fail: (err) => {
          console.error('获取用户信息失败：', err)
          wx.showToast({
            title: '请允许授权以继续使用',
            icon: 'none',
            duration: 2000
          })
          reject(new Error('用户拒绝授权'))
        }
      })
    })
  }

  // 保存用户信息到云数据库
  async saveUserInfo(userInfo) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenId',
        config: {
          timeout: 10000 // 设置云函数调用超时时间
        }
      })
      console.log(result);
      
      if (!result) {
        throw new Error('云函数调用失败，请检查网络连接')
      }
      
      // 直接使用result.openid
      const openid = result.userInfo.openId
      if (!openid) {
        throw new Error('获取openid失败，请重新登录')
      }
      
      const userData = {
        openid,
        ...userInfo,
        createTime: new Date(),
        updateTime: new Date()
      }

      await this.getDB().collection(this.collection).doc(openid).set({
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
      const { data } = await this.getDB().collection(this.collection).doc(openid).get()
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
    wx.removeStorageSync('userInfo')
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  }
}

module.exports = new UserModel()