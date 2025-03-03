// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloudbase-1g1rzwmkda1c47e9',
  region: 'ap-shanghai',
  traceUser: true
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    tcbContext: {},
    userInfo: {
      appId: wxContext.APPID,
      openId: wxContext.OPENID
    }
  }
}