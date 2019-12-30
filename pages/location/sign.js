// pages/location/sign.js

const util = require('../../utils/util.js')
const app = getApp();
let that = this;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    a: true,
    locationinfo: '11',
    bankeinfo: '2',

    isLoad: false,
    global: false,
    bankeid: 0,
    isSigning: false,
    isTeacher: false,
    SignStateText: '开始签到',
    teacherSignInfo: {},
    studentSginInfo: {},
    classSignId: '',
    teacherSignHistory: [],
    pagesize: 50,
    page: 0,

    signType: 0,
    wifiEnd: false,
    wifiSign: false,
    gpsSign: false,
    distance: 0,
    signTipsText: '',

    teacherSignTypeInfo:{
      wifi:null,
      gps:null,
      type:null
    },
    wifi: null,
    Location: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options', options);
    let args = util.parseNativeArgs(options.args);
    console.log('args', args);

    // args = {
    //   bankeid: 1001,
    //   role: 10
    // };

    if (args.role >= 10) {
      this.setData({
        isTeacher: true,
      })
    }
    
    this.setData({
      bankeid: args.bankeid
    });
    wx.setStorageSync('signType', JSON.stringify(['wifi','gps']));
  },
  //查询老师当前签到状态
  signquery(isTeacher) {
    let url, data;
    if (isTeacher) {
      url = "/api/sign/signquery"; //老师
    } else {
      url = "/api/sign/signqueryself"; //学生
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    app.httpPost({
      url: app.getapiurl(url),
      data: {
        bankeid: this.data.bankeid
      },
      success: res => {
        console.log("resresres", res);
        if (res.data.code == 0) {
          if (isTeacher) {
            if (res.data.data.sign) {
              this.setData({
                teacherSignInfo: res.data.data.sign,
                SignStateText: '正在等待学生签到...',
                isSigning: true,
                classSignId: res.data.data.sign.id
              })
            } else {
              this.setData({
                teacherSignInfo: {},
                SignStateText: '开始签到',
                isSigning: false,
                classSignId: ''
              })
            }
            wx.hideLoading();
            this.initRefresh();
          } else {
            if (res.data.data && res.data.data.signinfo.length) {
              let serveData = res.data.data.signinfo[0];
              serveData.starttime = res.data.data.signdata.starttime.split(" ")[1];
              serveData.info = JSON.parse(res.data.data.signdata.info);
              if (serveData.state > 0) {
                serveData.signtime = serveData.signtime.split(" ")[1];
              }
              this.setData({
                studentSginInfo: serveData,
                SignStateText: '正在等待学生签到...',
                isSigning: true,
                classSignId: serveData.signid,
                wifi: serveData.info.wifi,
                Location: serveData.info.gps,
              })
              if (serveData.state == '0') {
                this.studentSigndo();
              } else {
                wx.hideLoading();
                this.initRefresh();
              }
            } else {
              this.setData({
                isSigning: false,
              })
              wx.hideLoading();
              this.initRefresh();
            }
            console.log("学生签到", this.data.studentSginInfo);
          }
        } else {
          wx.hideLoading();
        }
        this.setData({
          isLoad: true
        })
      },
      fail: err => {
        this.setData({
          isLoad: true
        })
        wx.hideLoading();
        this.initRefresh();
        console.log("errerr", err);
      }
    })
  },
  //教师打卡历史
  signquerymember() {
    app.httpPost({
      url: app.getapiurl('/api/sign/signqueryhistory'),
      data: {
        bankeid: this.data.bankeid,
        pagesize: this.data.pagesize,
        page: this.data.page,
        order: "desc"
      },
      success: res => {
        if (res.data.code == 0) {
          if (res.data.data.count) {
            for (let i = 0; i < res.data.data.data.length; i++) {
              let v = res.data.data.data[i];
              let splitTime = v.starttime.split(" ");
              v.date = splitTime[0];
              v.time = splitTime[1];
              v.week = util.Whatweek(v.date)
            }
          }
          this.setData({
            teacherSignHistory: res.data.data.data
          }, () => {

          })
          console.log('教师打卡历史', this.data.teacherSignHistory);
        } else {}
      },
      fail: err => {

      }
    })
  },
  //老师签到
  teacherSignClass() {
    if (!this.data.isTeacher) return;
    let that = this;
    let signType = wx.getStorageSync('signType') || '[]';
    let isSignType = that.getSignType(signType);
    that.setData({
      'teacherSignTypeInfo.type':signType
    })
    wx.showModal({
      title: '提示',
      content: '您确认要签到吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          if (isSignType == '2') {
            that.teacherGetWifi(isSignType);
          } else if (isSignType == 'wifi') {
            that.teacherGetWifi(isSignType);
          } else if (isSignType == 'gps') {
            that.teacherGetLocation(isSignType);
          } else {
            that.teacherSignadd(isSignType);
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //老师签到
  teacherSignadd(isSignType) {
    let that =this;
    app.httpPost({
      url: app.getapiurl('/api/sign/signadd'),
      data: {
        bankeid: that.data.bankeid,
        info: isSignType ?JSON.stringify(that.data.teacherSignTypeInfo): ''
      },
      success: res => {
        if (res.data.code == '0') {
          wx.showToast({
            title: '打卡成功'
          })
          if (res.data.data.sign) {
            let signData = res.data.data.sign;
            let splitTime = signData.starttime.split(" ");
            signData.date = splitTime[0];
            signData.time = splitTime[1];
            that.setData({
              teacherSignInfo: signData,
              SignStateText: '正在等待学生签到...',
              isSigning: true,
              classSignId: res.data.data.sign.id,
              'teacherSignTypeInfo.wifi':null,
              'teacherSignTypeInfo.gps':null,
              'teacherSignTypeInfo.type':null
            });
            that.signquerymember();
          }
        } else {
          wx.showToast({
            title: '打卡失败'
          })
        }
        wx.hideLoading();
      },
      fail: err => {
        wx.hideLoading();
      }
    })
  },
  //学生签到
  studentSigndo() {
    let that = this;
    that.setData({
      signType: that.getSignType(that.data.studentSginInfo.info.type)
    })
    if (wx.getStorageSync('authSetting')) {
      let type = wx.getStorageSync('authSetting');
      that.setData({
        signType: type
      })
    }
    if (!that.data.signType) {
      wx.hideLoading();
      wx.showToast({
        title: '暂无法签到',
        icon: 'none'
      });
      that.setData({
        signTipsText: '等待老师开启签到校验'
      })
      that.initRefresh();
      return;
    }
    wx.showLoading({
      title: '签到中...',
      mask: true
    })
    if (that.data.signType == '2') {
      that.getWifi();
    } else if (that.data.signType == 'wifi') {
      that.getWifi();
    } else if (that.data.signType == 'gps') {
      that.getLocationinfo();
    } else {
      wx.hideLoading();
    }
  },
  studentSign() {
    let that = this;
    app.httpPost({
      url: app.getapiurl('/api/sign/signdo'),
      data: {
        signid: that.data.studentSginInfo.signid
      },
      success: res => {
        if (res.data.code == '0') {
          wx.showToast({
            title: '签到成功',
            duration: 1000
          })
          let serveData = res.data.data;
          serveData.signtime = serveData.signtime.split(" ")[1];
          that.setData({
            studentSginInfo: serveData,
            isSigning: true,
            classSignId: serveData.signid,
            signTipsText: ''
          })
        } else {
          wx.showToast({
            title: '签到失败',
            duration: 1000,
            icon: 'none'
          })
        }
        wx.hideLoading();
        that.initRefresh();
      },
      fail: err => {
        wx.hideLoading();
        that.initRefresh();
      }
    })
  },
  //签到设置
  confin: function (e) {
    wx.navigateTo({
      url: '/pages/config/sign/index',
    })
  },
  getSignType(type) {
    if (type.includes('wifi') && type.includes('gps')) {
      return 2;
    } else if (type.includes('wifi') || type.includes('gps')) {
      let Type = JSON.parse(type);
      for (let v of Type) {
        if (v) {
          return v
        }
      }
    } else {
      return 0
    }
  },
  showHistory() {
    this.setData({
      global: true
    })
  },
  checkNum(e) {
    console.log(e.detail)
  },
  getWifi() {
    let that = this;
    wx.getConnectedWifi({
      success: res => {
        console.log('Wifi cg', res)
        let wifi = {
          SSID: res.wifi.SSID,
          BSSID: res.wifi.BSSID
        };
        let LocationWifi = that.data.wifi;
        if (wifi.SSID == LocationWifi.SSID && wifi.BSSID == LocationWifi.BSSID) {
          that.setData({
            wifiSign: true,
          });
          that.studentSign();
        } else {
          if (that.data.signType == '2') {
            that.getLocationinfo();
          } else {
            wx.showModal({
              title: '签到失败',
              content: '请确认你已连接到指定wifi',
              showCancel: false,
              confirmText: '关闭'
            });
            that.setData({
              signTipsText: '您未连接到教室WiFi，无法完成签到。'
            })
            wx.hideLoading();
            that.initRefresh();
          }

        }
        console.log('wifiqd', that.data.wifiSign);
      },
      fail: err => {
        wx.hideLoading();
        that.initRefresh();
        if (that.data.signType == '2') {
          wx.showModal({
            title: '获取wifi失败',
            content: '你还可以使用GPS定位签到',
            success(res) {
              if (res.confirm) {
                that.setData({
                  wifiEnd: true
                })
                that.getLocationinfo();
              }
            }
          });
        } else {
          wx.showModal({
            title: '获取wifi失败',
            content: '请查看手机wifi设置,之后重新刷新签到',
            showCancel: false,
            confirmText: '关闭',
          });
        }
      }
    })
  },
  getLocationinfo() {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: res => {
        console.log('dinwei cg', res);
        that.setData({
          gpsSign: true,
          distance: that.getDisance(res.latitude, res.longitude, that.data.Location.latitude, that.data.Location.longitude),
        })
        if (that.data.distance < 600) {
          that.studentSign();
        } else if (that.data.signType == '2') {
          wx.showModal({
            title: '签到失败',
            content: '请确认你已连接到指定wifi或已到达目的地',
            showCancel: false,
            confirmText: '关闭'
          });
          that.setData({
            signTipsText: '您距离教室太远，或未连接到指定wifi。'
          })
          wx.hideLoading();
          that.initRefresh();
        } else {
          wx.showModal({
            title: '签到失败',
            content: '请确定已到达目的地',
            showCancel: false,
            confirmText: '关闭'
          });
          that.setData({
            signTipsText: '您距离教室太远，无法完成签到。'
          })
          wx.setStorageSync('authSetting', '');
          wx.hideLoading();
          that.initRefresh();
        }
        console.log('距离', that.data.distance);
      },
      fail: err => {
        wx.hideLoading();
        that.initRefresh();
        wx.showModal({
          title: '定位失败',
          content: '需要获取您的地理位置，请确认授权，否则无法签到',
          success(res) {
            if (res.confirm) {
              wx.openSetting({
                success: function (dataAu) {
                  if (dataAu.authSetting["scope.userLocation"] == true) {
                    if (that.data.signType == '2') {
                      wx.setStorageSync('authSetting', 'gps');
                    }
                    that.getLocationinfo()
                  }
                }
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        });
      }
    })
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
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.signquery(this.data.isTeacher);

  },
  initRefresh() {
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  teacherGetWifi(SignType) {
    let that = this;
    let wifi = {};
    wx.getConnectedWifi({
      success: res => {
        wifi = {
          SSID: res.wifi.SSID,
          BSSID: res.wifi.BSSID
        };
        that.setData({
          'teacherSignTypeInfo.wifi':wifi
        })
        if (SignType == 'wifi') {
          that.teacherSignadd(SignType);
        }
        console.log('wifiwifwifi', that.data.teacherSignTypeInfo);
      },
      fail: err => {},
      complete: () => {
        if (SignType == '2') {
          that.teacherGetLocation(SignType);
        }
      }
    })
  },
  teacherGetLocation(SignType) {
    let that = this;
    let Location = {};
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: res => {
        Location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        that.setData({
          'teacherSignTypeInfo.gps':Location
        })
        that.teacherSignadd(SignType);
        console.log('LocationLocation',that.data.teacherSignTypeInfo);
      },
      fail: err => {
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
    this.signquery(this.data.isTeacher);
    this.signquerymember();
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})