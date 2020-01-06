// pages/share/banke.js

const util = require('../../utils/util.js')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banke:{
      id:0,
        name:'班课名',
        avatar:'',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let args = util.parseNativeArgs(options.args);
      this.setData({
          banke:args
      })
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
     let url = '/pages/index/index';
     let shareobj = {
       action:'joinbanke',
         data:{
         id:this.data.banke.id
         }
     };
     url += '?shareobj=' + encodeURIComponent(JSON.stringify(shareobj));
     let imgurl = '/images/banke_default.png';
     if (this.data.banke.avatar && this.data.banke.avatar.length > 0){
         imgurl = app.getfullurl(this.data.banke.avatar);
     }
     let tips = '快来加入班课' + '['+ this.data.banke.name+']' + '吧';
      return {
        title:tips,
          path:url,
          imageUrl:imgurl
      }
  }
})