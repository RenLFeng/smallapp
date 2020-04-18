// pages/scan.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: {},
    Location: {},
    hasshown:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

  },
  message() {
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['LkMTFyk27pmW9fwC9bSx5pDsvTKw167sd0l7wbDBBDE'],
      success(res) {
        console.log('订阅', res);
      },
      fail(err) {
        console.log('失败', err);
      },
    })
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
        } else {
          //! cjy: 当所扫的码为当前小程序二维码时，会返回此字段，内容为二维码携带的 path
            //! cjy: 目前不处理自身小程序的扫一扫; 因为有scene和path 2场景
         // scanResult = 1040;
         // that.toSign(scanResult);
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
  // toSign(bankeid) {
  //   let argobj = {
  //     bankeid: bankeid,
  //     role: 5,
  //   };
  //   let signurl = '/pages/location/sign';
  //   signurl += '?args=' + encodeURIComponent(JSON.stringify(argobj));
  //   wx.redirectTo({
  //     url: signurl,
  //   })
  // },
  getLocation(that) {
      wx.showLoading({
          title: '获取地理位置中...',
          mask: true
      })
    wx.getLocation({
      type: 'wgs84',
        //! cjy： 貌似非高精度偏差也不太大 --不使用高精度，会相差500米？
       isHighAccuracy: true,
       highAccuracyExpireTime: 8000,
      success(res) {
          wx.hideLoading();
        let gpsinfo = {};
        console.log('Location', res);
        //! cjy: 因为选择位置偏差有点大， 目前暂不使用
          gpsinfo.latitude = res.latitude;
          gpsinfo.longitude = res.longitude;
          gpsinfo.address = '';
          gpsinfo.name = '';
          gpsinfo.accuracy = res.accuracy;

          let tips = '';
          if (res.accuracy < 15){
            tips = '精度不够，当前精度：' + res.accuracy;
          }
          if (tips){
              wx.showToast({
                  title: tips,
                  icon: 'none',
                  duration: 3000
              })
          }
          else{
              that.setData({
                  Location: gpsinfo
              });
              that.postdapingmsg(that)
          }


        // wx.chooseLocation({
        //   latitude: res.latitude || '',
        //   longitude: res.longitude || '',
        //   success(res) {
        //     console.log('具体位置', res);
        //     gpsinfo.latitude = res.latitude;
        //     gpsinfo.longitude = res.longitude;
        //     gpsinfo.address = res.address;
        //     gpsinfo.name = res.name;
        //     that.setData({
        //       Location: gpsinfo
        //     });
        //     that.postdapingmsg(that)
        //   },
        //   fail(err) {
        //       wx.hideLoading();
        //   },
        // })
      },
      fail(err) {
        wx.hideLoading();
        that.checkLocation()
      },
    })
  },
  postdapingmsg(that) {
    let postData = {
      "bankeid": that.data.params.bankeid,
      "ecode": that.data.params.code,
      "data": that.data.Location,
      "cmd": 'location'
    };
    postData.data = JSON.stringify(postData.data);
    console.log('扫码设置位置', postData);
    app.httpPost({
      url: app.getapiurl('/api/banke/postdapingmsg'),
      data: postData,
      success: res => {
        if (res.data.code == '0') {
          //wx.navigateBack();
            wx.showToast({
                title: '更新位置成功，三秒后自动返回',
                icon: 'none',
                duration: 3000
            })
            setTimeout(()=>{
                wx.navigateBack(); //! 自动关闭此页面
            }, 3000);
        } else {
            wx.showToast({
                title: '异常，请检测权限',
                icon: 'none',
                duration: 3000
            })
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
    if (!this.data.hasshown){
      this.setData({
          hasshown:true
      })
        this.scanCode();
    }
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