// pages/web/page.js


const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    showurl:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let url = decodeURIComponent(options.url);
    let showurl = app.getfullurl(url);
    //! 添加cookie参数; 用于登陆
    if (showurl.indexOf('?') > 0){
      showurl += '&';
    }
    else{
      showurl += '?';
    }
    let onequery = 'cookie=' + app.LoginData.sessioncookie;
    showurl += onequery;

    console.log('pages/web/page:' + showurl);
    let title= '';
    if (options.title){
      title = decodeURIComponent(options.title);
    }
    else{
      title = app.getapptitle();
    }
    //! tudo. wx.setNavigationBarTitle({title:}) 或直接使用网页的title?
    wx.setNavigationBarTitle({
      title:title
    });
    this.setData({
      url: showurl,
      showurl:true
    });
  },

  changeshow:function(){
    this.setData({
      showurl:true
    });
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
  // onShareAppMessage: function () {
  //
  // }
})