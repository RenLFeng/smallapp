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
    },

// errImg: function (e) {
//   var that=this
//   console.log( "-出错啦-" );
//     var _errImg = e.target.dataset.errImg;
//     var _objImg = "'" + _errImg + "'";
//     var _errObj = {};
//     _errObj[_errImg] = "http://192.168.0.2:9982/downloads/avatar/2019-12-18/772356fa2f31e703f33bd33c14b17410.jpg";
  
//   that.setData(_errObj);//注意这里的赋值方式...  
//   }
  },
  observers: {
    'listData': function (listData) {
      // 在 rate被设置时，执行这个函数
      // console.log('监听', listData)
      this.updata(listData);
    }
  }

})