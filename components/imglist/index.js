Component({
  /**
   * Component properties
   */
  properties: {
    listData: {
      type: Object,
      value: [],
    },
  },

  /**
   * Component initial data
   */
  data: {
    list: []
  },

  /**
   * Component methods
   */
  methods: {
    updata: function (listData) {
      this.setData({
        list: listData
      })
    },
    bindSelect: function (e) {
      let studentInfo = e.currentTarget.dataset['item'];
      this.triggerEvent("studentChage", studentInfo)
    }

  },
  observers: {
    'listData': function (listData) {
      // 在 rate被设置时，执行这个函数
      // console.log('监听', listData)
      this.updata(listData);
    }
  }

})