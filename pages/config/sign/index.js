// pages/config/sign-confin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wifi: false,
    gps: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = JSON.parse(wx.getStorageSync('signType')) || [];
    if (type.length) {
      for (let v of type) {
        if (v == 'wifi') {
          this.setData({
            wifi: true
          })
        } else if (v == 'gps') {
          this.setData({
            gps: true
          })
        }
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  wifiSwitch1Change(e) {
    this.setData({
      wifi: e.detail.value,
    })
    let wifi = this.data.wifi ? 'wifi' : '';
    let gps = this.data.gps ? 'gps' : ''
    wx.setStorageSync('signType', JSON.stringify([wifi, gps]));
  },
  gpsSwitch1Change(e) {
    this.setData({
      gps: e.detail.value,
    })
    let wifi = this.data.wifi ? 'wifi' : '';
    let gps = this.data.gps ? 'gps' : ''
    wx.setStorageSync('signType', JSON.stringify([wifi, gps]));
  },
  getwifi() {},
  getLocation() {

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