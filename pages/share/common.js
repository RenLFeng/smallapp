// pages/share/common.js

const util = require('../../utils/util.js')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      btnname:'分享',
      shareurl:'',
      image:'',
      text:'分享内容'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let args = util.parseNativeArgs(options.args);
    console.log('argsargs', args)
    this.setData({
      btnname: args.btnname,
     // shareaction:args.shareaction,
     // sharedata:args.sharedata,
     shareurl:args.shareurl,
      image:args.image,
      text:args.text
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
      action: 'commonshare',//this.data.shareaction,
      data: this.data.shareurl,//this.data.sharedata
    };
    url += '?shareobj=' + encodeURIComponent(JSON.stringify(shareobj));
    let imgurl = this.data.image;
    let tips = this.data.text;
    return {
      title: tips,
      path: url,
      imageUrl: imgurl
    }
  }
})