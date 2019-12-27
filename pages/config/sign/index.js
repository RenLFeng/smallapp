// pages/config/sign-confin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wifi: false,
    gps: false,
    signType: {
      WiFi: {
        isTrue: false,
        wifiInfi: {}
      },
      gps: {
        isTrue: false,
        gpsInfi: {}
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  wifiSwitch1Change(e) {
    this.setData({
      wifi: e.detail.value,
      'signType[0]': e.detail.value ? 'wifi' : ''
    })
    wx.setStorageSync('signType', JSON.stringify(this.data.signType));
  },
  gpsSwitch1Change(e) {
    this.setData({
      gps: e.detail.value,
      'signType[1]': e.detail.value ? 'gps' : ''
    })
    wx.setStorageSync('signType', JSON.stringify(this.data.signType));
  },
  getwifi() {
    wx.getConnectedWifi({
      success: res => {
        console.log('cg', res);
        let wifiInfo = {
          SSID: res.wifi.SSID,
          BSSID: res.wifi.BSSID
        }
        return wifiInfo
      },
      fail: err => {
        return {}
      }
    })
  },
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