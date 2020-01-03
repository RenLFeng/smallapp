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
    errImg: function(e){  
      var _errImg=e.target.dataset.errImg;  
      var _objImg="'"+_errImg+"'";  
      var _errObj={};  
      _errObj[_errImg]="../../images/account_default.png";  
      // console.log( e.detail.errMsg+"----"+ _errObj[_errImg] + "----" +_objImg );  
      this.setData(_errObj);
    },
    bindSelect: function (e) {
      let studentInfo = e.currentTarget.dataset['item'];
      this.triggerEvent("studentChage", studentInfo)
    },
  },
  observers: {
    'listData': function (listData) {
      // 在 rate被设置时，执行这个函数
      // console.log('监听', listData)
      this.updata(listData);
    }
  }

})