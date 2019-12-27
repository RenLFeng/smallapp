
Component({
  /**
   * Component properties
   */
  properties: {
    listData:{
      type:Object,
      value:[],
    },
    classSignId: {
      type: String,
      value:''
    },
    isTeacher:{
      type:Boolean,
      value:false
    }
  },

  /**
   * Component initial data
   */
  data: {
    
  },

  /**
   * Component methods
   */
  methods: {
    bindClick: function (e) {
      let signinfo=e.currentTarget.dataset['item'];
      console.log(signinfo)
      wx.setStorageSync('signinfo',JSON.stringify(signinfo));
      wx.navigateTo({
        url:'/pages/location/studentSignState/index?isTeacher='+this.properties.isTeacher,
      })
      // this.triggerEvent("bindClick", '难过的sfds快乐')
    }
  }
})