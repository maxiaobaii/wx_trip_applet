// 云开发数据库模型定义

// 用户表结构
const userSchema = {
  _id: String, // 用户唯一标识
  openid: String, // 微信openid
  avatarUrl: String, // 头像URL
  nickName: String, // 昵称
  createTime: Date, // 创建时间
  updateTime: Date // 更新时间
}

// 账本表结构
const tripSchema = {
  _id: String, // 账本唯一标识
  title: String, // 账本标题
  date: Date, // 账本日期（月份）
  creatorId: String, // 创建者ID
  members: Array, // 参与成员列表 [{userId, avatarUrl, nickName}]
  totalAmount: Number, // 总费用
  createTime: Date, // 创建时间
  updateTime: Date // 更新时间
}

// 消费记录表结构
const expenseSchema = {
  _id: String, // 消费记录唯一标识
  tripId: String, // 所属账本ID
  title: String, // 消费项名称
  type: String, // 消费类型
  amount: Number, // 消费金额
  date: Date, // 消费日期时间
  payerId: String, // 付款人ID
  participants: Array, // 参与人列表 [{userId, avatarUrl, nickName}]
  note: String, // 备注
  createTime: Date, // 创建时间
  updateTime: Date // 更新时间
}

module.exports = {
  userSchema,
  tripSchema,
  expenseSchema
}