Component({
  properties: {
    // 组件的对外属性
    title: {
      type: String,
      value: '默认标题'
    }
  },
  data: {
    // 组件的内部数据
  },
  methods: {
    // 组件的方法
    onTap() {
      const myEventDetail = {} // detail对象，提供给事件监听函数
      const myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    }
  }
})