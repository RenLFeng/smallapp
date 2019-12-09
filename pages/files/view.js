// pages/files/view.js

const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileurl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     //console.log(options);
     // app.dowxlogin();
      let args = util.parseNativeArgs(options.args);
      console.log(args);
      if (args.funname == 'jsFileLink'){
       // this.data.fileurl = args.argobj.downurl;
       // console.log(this.data.fileurl);
          let fullurl = app.getfileurl(args.argobj.url);
          this.setData({
            fileurl:fullurl
          });
          wx.setNavigationBarTitle({
            title: '文件查看'
           })
      }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})