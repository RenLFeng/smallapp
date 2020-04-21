// pages/share/gzh.js

const util = require('../../utils/util.js')
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    skipgzh: false,
    src:'../../images/gz.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let skipgzh = wx.getStorageSync('skipgzh');
    if (skipgzh) {
      this.setData({
        skipgzh: true
      })
    }
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    let skip = false;
    if (e.detail.value.length) {
      skip = true;
    }
    wx.setStorageSync("skipgzh", skip);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  setskipgzh: function (doskip) {
    this.setData({
      skipgzh: doskip
    });
    wx.setStorageSync('skipgzh', doskip);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this.data.skipgzh) {
      //! 检测是否已绑定了微信
      // this.checkgzhbind();
    }

  },

  checkgzhbind: function () {
    let url = app.getapiurl('/api/weixin/gzbind');
    app.httpPostCatch({
      url: url,
      data: {},
      success: res => {
        console.log(res);
        if (res.data.code == 0) {
          //! 已绑定
          this.setskipgzh(true);
          wx.showToast({
            title: '您已关注，三秒后自动返回',
            icon: 'none',
            duration: 3000
          })
          setTimeout(() => {
            wx.navigateBack(); //! 自动关闭此页面
          }, 3000);

        } else {
          //！ 未绑定
          this.setskpgzh(false);
        }
      },
      catch: res => {

      }
    })
  },
  gz: function (e) {
    // let page = e.currentTarget.dataset.page;
    wx.navigateTo({
      url: '../weixinlink/weixinlink'
    })
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