// pages/scan.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: {},
    GPS: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    this.scanCode();
  },
  scanCode() {
    let that = this;
    wx.scanCode({
      success(res) {
        console.log(res);
        let scanResult = res.result;
        if (!res.path) { 
          let params = {};
          let urlData = scanResult.split("getsign")[1].split("/");
          params.code = parseInt(urlData[1]);
          params.bankeid = parseInt(urlData[2]);
          that.setData({
            params: params
          })
          console.log('扫码解析成功', that.data.params);
          that.getLocation(that);
        } else { //! cjy: 当所扫的码为当前小程序二维码时，会返回此字段，内容为二维码携带的 path
          scanResult = 1040;
          that.toSign(scanResult);
        }

      },
      fail(err) {
        wx.showToast({
          title: '扫码解析失败',
          icon: 'none'
        })
      },
    })
  },
  toSign(bankeid) {
    let argobj = {
      bankeid: bankeid,
      role: 5,
    };
    let signurl = '/pages/location/sign';
    signurl += '?args=' + encodeURIComponent(JSON.stringify(argobj));
    wx.redirectTo({
      url: signurl,
    })
  },
  getLocation(that) {
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        let gpsinfo = {};
        gpsinfo.latitude = res.latitude
        gpsinfo.longitude = res.longitude
        that.setData({
          GPS: gpsinfo
        })
        console.log('GPS', that.data.GPS);
        that.postdapingmsg(that);
      },
      fail(err) {
        that.checkLocation()
      },
    })
  },
  postdapingmsg(that) {
    let postData = {
      "bankeid": that.data.params.bankeid,
      "ecode": that.data.params.code,
      "data": "",
      "cmd": {
        GPS: that.data.GPS
      }
    };
    postData.cmd = JSON.stringify(postData.cmd);
    app.httpPost({
      url: app.getapiurl('/api/banke/postdapingmsg'),
      data: postData,
      success: res => {
        if (res.data.code == '0') {
          console.log('大屏发送', res);
        }
      },
      fail: err => {}
    })
  },
  checkLocation() {
    let that = this;
    //选择位置，需要用户授权
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              wx.showToast({
                title: '授权成功！',
                duration: 1500
              })
            },
            fail() {
              that.showSettingToast('需要授权位置信息');
            }
          })
        }
      }
    })
  },
  // 打开权限设置页提示框
  showSettingToast: function (e) {
    wx.showModal({
      title: '提示！',
      confirmText: '去设置',
      // showCancel: false,
      content: e,
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success: function (dataAu) {
              console.log(dataAu);
            }
          })
        }
      }
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

  }
})