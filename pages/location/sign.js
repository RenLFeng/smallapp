// pages/location/sign.js

const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    locationinfo: '11',
    bankeinfo: '2',
    distance: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let args = util.parseNativeArgs(options.args);
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: res => {
        console.log(res);
        let location = wx.getStorageSync('location');
        this.setData({
          distance: this.getDisance(res.latitude, res.longitude, location.latitude, location.longitude)
        })
        wx.setStorage('location', {
          latitude: res.latitude,
          longitude: res.longitude
        })
        this.setData({
          locationinfo: JSON.stringify(res),
          bankeinfo: JSON.stringify(args)
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  toRad(d) {
    return d * Math.PI / 180;
  },
  getDisance(lat1, lng1, lat2, lng2) {
    const PI = Math.PI
    const EARTH_RADIUS = 6378137.0

    function getRad(d) {
      return d * PI / 180.0
    }
    let f = getRad((lat1 + lat2) / 2)
    let g = getRad((lat1 - lat2) / 2)
    let l = getRad((lng1 - lng2) / 2)
    let sg = Math.sin(g)
    let sl = Math.sin(l)
    let sf = Math.sin(f)

    let s, c, w, r, d, h1, h2
    let a = EARTH_RADIUS
    let fl = 1 / 298.257

    sg = sg * sg
    sl = sl * sl
    sf = sf * sf

    s = sg * (1 - sl) + (1 - sf) * sl
    c = (1 - sg) * (1 - sl) + sf * sl

    w = Math.atan(Math.sqrt(s / c))
    r = Math.sqrt(s * c) / w
    d = 2 * w * a
    h1 = (3 * r - 1) / 2 / c
    h2 = (3 * r + 1) / 2 / s

    return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))


    // var dis = 0;
    // var radLat1 = this.toRad(lat1);
    // var radLat2 = this.toRad(lat2);
    // var deltaLat = radLat1 - radLat2;
    // var deltaLng = this.toRad(lng1) - this.toRad(lng2);
    // var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    // return dis * 6378137;
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