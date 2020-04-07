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
    pagesize: 10,
    page: 0,

    signType: 0,
    wifiEnd: false,
    wifiSign: false,
    gpsSign: false,
    distance: 0,
    signTipsText: '',

    teacherSignTypeInfo: {
      wifi: null,
      gps: null,
      type: null
    },
    wifi: null,
    Location: null,
    lastLocation: null, //! 用于测试
    //! cjy: wx 不允许设置object为null？
    haswifi: false,
    hasLocation: false,
    signbtntext: '开始签到',
    signid: 0, //! 当前的签到id
    gpstimeout: 5000, //! gps获取的超时时间: cjy: 8000的值， 误差大概在0-15米
    signStateDesc: '',
    signTypeDesc: '',
    teasignnum: 0,
    teasignfinish: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let signqueryself = app.getCacheObject('signqueryself');
    if (signqueryself) {
      this.setData({
        isLoad: true
      })
      this.onstusignqueryret(signqueryself);
      return;
    }


    console.log('options', options);
    let args = util.parseNativeArgs(options.args);
    console.log('args', args);

    // args = {
    //   bankeid: 1040,
    //   role: 10
    // };
    let isteacher = false;
    if (args.role >= 10) {
      isteacher = true;
    }
    this.setData({
      bankeid: args.bankeid,
      isTeacher: isteacher
    });
    if (isteacher) {
      let signType = wx.getStorageSync('signType') || [];
      if (!signType.length) {
        //! 设置signtype的默认值
        wx.setStorageSync('signType', JSON.stringify(['wifi', 'gps']));
      }
    }

    this.signquery();
    if (isteacher) {
      //! cjy: 学生端一开始不去拉取历史数据
      // this.signquerymember();  //! cjy, cur拉取完后再去拉取member数据
    }

  },
  onstusignqueryret(resdata) {
    if (this.data.bankeid == 0) {
      if (resdata && resdata.signdata) {
        this.setData({
          bankeid: resdata.signdata.bankeid
        })
      }
    }
    if (resdata && resdata.signinfo.length) {
      //! 学生
      let serveData = resdata.signinfo[0];


      if (
        //serveData.state == '0'
        //! cjy: 判断有无签到， 只能依据signnum来判断； 因为教师可设置为未签到; 一旦教师设置， 则不再允许学生主动签到
        serveData.signnum == 0
      ) {
        serveData.info = {};
        serveData.starttime = resdata.signdata.starttime.split(" ")[1];
        if (resdata.signdata.info && typeof resdata.signdata.info == "string") {
          serveData.info = JSON.parse(resdata.signdata.info);
          //console.log(serveData);
          this.setData({
            wifi: serveData.info.wifi,
            Location: serveData.info.gps,
          });
        } else {
          serveData.info.type = '[]';
        }
        this.setData({
          studentSginInfo: serveData,
          SignStateText: '',
          isSigning: true,
          classSignId: serveData.signid,
          signid: serveData.signid
        })
        this.studentSigndo();
      } else {
        this.stuonsignok(serveData);
      }
    } else {
      this.setData({
        isSigning: false,
      })

    }
    console.log("学生签到", this.data.studentSginInfo);
  },
  onteasignqueryret(res) {
    //   if (res.data.data.sign)
    {
      this.onteacursign(res.data.data.sign);
    }
    //else {

    //   }
  },
  parseonesign(sign) {
    //  let signData = sign;
    let splitTime = sign.starttime.split(" ");
    sign.date = splitTime[0];
    sign.time = splitTime[1];
    sign.week = util.Whatweek(sign.date)
    return sign;
  },
  insertonesign(sign) {
    let ts = this.data.teacherSignHistory;
    let doinsert = true;
    // for (let v of ts) {
    //   if (v.id == sign.id) {
    //     v = sign;   //! cjy: 此方法在部分场景不能生效
    //     doinsert = false;
    //     console.log('replace in signhistory:');
    //     console.log(sign);
    //     break;
    //   }
    // }
    for(let i=ts.length-1; i>=0; i--){
      if(ts[i].id == sign.id){
        ts.splice(i, 1);
      }
    }
    if (doinsert) {
      ts.unshift(sign);
    }
    this.setData({
      teacherSignHistory: ts
    })
  },
  onteacursign(sign) {
    let hascursign = false;
    if (sign) {
      sign = this.parseonesign(sign);

      this.insertonesign(sign);
      if (sign.state == 0) {
        //! 当前开始的
        hascursign = true;
      }
    }
    if (hascursign) {
      this.setData({
        teacherSignInfo: sign,
        SignStateText: '正在签到...',
        isSigning: true,
        classSignId: sign.id,
      });
    } else {
      this.setData({
        teacherSignInfo: {},
        SignStateText: '开始签到',
        isSigning: false,
        classSignId: ''
      })
    }

  },
  //查询老师当前签到状态
  signquery() {
    let isTeacher = this.data.isTeacher;
    let url, data;
    if (isTeacher) {
      url = "/api/sign/signquery"; //老师
    } else {
      url = "/api/sign/signqueryself"; //学生
    }
    let silent = true;
    let postdata = {
      bankeid: this.data.bankeid
    };
    if (!isTeacher) {
      if (this.data.signid != 0) {
        //! 仅拉取当前id
        postdata = {
          id: this.data.signid
        };
        silent = true;
      } else {
        //! 首次加载, 显示ui
        silent = false;
      }
    }
    if (!silent) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
    }

    app.httpPost({
      url: app.getapiurl(url),
      data: postdata,
      success: res => {
        console.log("resresres", res);
        wx.hideLoading();
        this.initRefresh();
        if (res.data.code == 0) {
          if (isTeacher) {
            this.onteasignqueryret(res);
            //! 如果当前签到中， 则自动跳转到签到控制面板
            if (this.data.isSigning) {
              this.navigateToCurSign();
            }
            this.signquerymember();
          } else {
            //! stu.
            this.onstusignqueryret(res.data.data);
          }
        } else {
          //！ failed;
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
  signquerymember(showui = false) {
    // wx.showLoading({
    //
    // })
    if (showui) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
    }
    app.httpPost({
      url: app.getapiurl('/api/sign/signqueryhistory'),
      data: {
        bankeid: this.data.bankeid,
        pagesize: this.data.pagesize,
        page: this.data.page,
        order: "desc"
      },
      success: res => {
        if (showui) {
          wx.hideLoading();
        }
        if (res.data.code == 0) {
          if (res.data.data.count) {
            for (let i = 0; i < res.data.data.data.length; i++) {
              let v = res.data.data.data[i];
              // let splitTime = v.starttime.split(" ");
              // v.date = splitTime[0];
              // v.time = splitTime[1];
              // v.week = util.Whatweek(v.date)
              this.parseonesign(v);
            }
          }
          if (this.data.page == 0){
            this.setData({
              teacherSignHistory: [...res.data.data.data],
              page: this.data.page + 1
            })
          }
          else{
            this.setData({
              teacherSignHistory: [...this.data.teacherSignHistory, ...res.data.data.data],
              page: this.data.page + 1
            })
          }
          
          if (res.data.data.data.length < 10) {
            this.setData({
              HistoryisLoad: true
            });
          }
          console.log('教师打卡历史', this.data.teacherSignHistory);
        } else {}
        wx.hideLoading();
      },
      fail: err => {
        if (showui) {
          wx.hideLoading();
        }
      }
    })
  },

  navigateToCurSign() {
    if (this.data.teacherSignInfo) {
      wx.setStorageSync('signinfo', JSON.stringify(this.data.teacherSignInfo));
      wx.navigateTo({
        url: '/pages/location/studentSignState/index?isTeacher=' + this.data.isTeacher,
      })
    }
  },
  teasignfinishcheck() {
    this.setData({
      teasignfinish: this.data.teasignfinish + 1
    });
    if (this.data.teasignfinish >= this.data.teasignnum) {
      this.teacherSignadd();
    }
  },
  //老师签到
  teacherSignClass() {
    if (!this.data.isTeacher) return;

    if (this.data.teacherSignInfo.state == 0) {
      this.navigateToCurSign();
      return;
    }

    let that = this;
    let signType = wx.getStorageSync('signType') || '[]';
    // let isSignType = that.getSignType(signType);
    let signnum = 0;
    if (signType.indexOf('wifi') >= 0) {
      signnum++;
    }
    if (signType.indexOf('gps') >= 0) {
      signnum++;
    }
    that.setData({
      // 'teacherSignTypeInfo.type': signType,
      wifi: null,
      Location: null,
      teasignnum: signnum,
      teasignfinish: 0,
    })
    wx.showModal({
      title: '提示',
      content: '开始签到？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '获取信息中...',
            mask: true
          })
          // if (isSignType == '2' || isSignType == 'wifi')
          if (signType.indexOf('wifi') >= 0) {
            that.teacherGetWifi();
          }
          if (signType.indexOf('gps') >= 0) {
            that.teacherGetLocation();
          }
          if (signnum == 0) {
            //! 无任何校验
            that.teacherSignadd();
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //老师签到
  teacherSignadd() {
    let that = this;
    wx.hideLoading();

    if (this.data.teacherSignInfo.id && this.data.isSigning) {
      wx.showToast({
        title: '已开启签到'
      })
      return;
    }

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let postinfo = {};
    if (this.data.wifi) {
      postinfo.wifi = this.data.wifi;
    }
    if (this.data.Location) {
      postinfo.gps = this.data.Location;
    }
    app.httpPost({
      url: app.getapiurl('/api/sign/signadd'),
      data: {
        bankeid: that.data.bankeid,
        info: JSON.stringify(postinfo)
      },
      success: res => {
        wx.hideLoading();
        if (res.data.code == '0') {
          if (res.data.data.sign) {
            console.log(res.data.data);
            that.onteacursign(res.data.data.sign);
            that.navigateToCurSign();
            // that.signquerymember();
          }
        } else {
          wx.showToast({
            title: '失败:' + res.data.msg
          })
        }
        wx.hideLoading();
      },
      fail: err => {
        wx.hideLoading();
      }
    })
  },
  //! cjy: 当前学生是否能签到
  studentcansign() {
    //! 检测是否有wifi 或Location 信息； 如果均没有， 则当前学生不能签到
    if (!this.data.wifi && !this.data.Location) {
      return false;
    }
    return true;
  },
  //! cjy: 学生自动签到
  studentautosign() {
    let cansign = this.studentcansign();
    if (!cansign) {
      let tips = '无法签到，\n请教师手动更改您的签到状态';
      wx.showModal({
        title: '提示',
        content: tips,
        showCancel: false,
        complete: res => {
          this.signquery(); //! 拉取当前的签到状态， 例如， 查看教师是否已设置为签到状态
        }
      })
      // wx.showToast({
      //     title:tips,
      //     success:res=>{
      //       //! 拉取当前签到状态， 更新
      //         this.signquery();
      //     }
      // })
    } else {
      if (this.data.wifi) {
        //! 检测wifi信息
        this.stucheckwifi();
      } else if (this.data.Location) {
        this.stucheckgps();
      }
    }
  },
  //学生签到
  studentSigndo() {
    let that = this;
    let cansign = this.studentcansign();
    if (cansign) {
      this.setData({
        signbtntext: '开始签到'
      });
      this.studentautosign();
    } else {
      this.setData({
        signbtntext: '无法签到'
      })
    }

    that.initRefresh();

    //   that.setData({
    //       signTipsText: '无法签到'
    //   })
    //
    // that.setData({
    //   signType: that.getSignType(that.data.studentSginInfo.info.type)
    // })
    // if (wx.getStorageSync('authSetting')) {
    //   let type = wx.getStorageSync('authSetting');
    //   that.setData({
    //     signType: type
    //   })
    // }
    // if (!that.data.signType) {
    //   wx.hideLoading();
    //   wx.showToast({
    //     title: '暂无法签到',
    //     icon: 'none'
    //   });
    //   that.setData({
    //     signTipsText: '等待老师开启签到校验'
    //   })
    //  that.initRefresh();
    // return;
    // }
    // wx.showLoading({
    //   title: '签到中...',
    //   mask: true
    // })
    // if (that.data.signType == '2') {
    //   that.getWifi();
    // } else if (that.data.signType == 'wifi') {
    //   that.getWifi();
    // } else if (that.data.signType == 'gps') {
    //   that.getLocationinfo();
    // } else {
    //   wx.hideLoading();
    // }
  },
  stuonsignok(serveData) {
    // if (serveData.state == 0){
    //   return;
    // }
    let desc = util.signGetTypeDesc(serveData.signnum);
    if (serveData.signnum == 2) {
      //! gps
      desc += ',距离' + serveData.signinfo + '米';
    }
    serveData.signtime = serveData.signtime.split(" ")[1];
    this.setData({
      studentSginInfo: serveData,
      isSigning: true,
      classSignId: serveData.signid,
      signTipsText: '',
      signid: serveData.signid,
      signTypeDesc: desc,
      signStateDesc: util.signGetStateDesc(serveData.state)

    })
  },
  studentSign(signnum, signinfo = null) {
    let that = this;
    let postdata = {
      signid: that.data.studentSginInfo.signid,
      signnum: signnum
    };
    if (signinfo !== null) {
      postdata.signinfo = signinfo;
    }
    app.httpPost({
      url: app.getapiurl('/api/sign/signdo'),
      data: postdata,
      success: res => {
        if (res.data.code == '0') {
          wx.showToast({
            title: '签到成功'
          })
          let serveData = res.data.data;
          this.stuonsignok(serveData);
        } else {
          wx.showToast({
            title: '签到失败',
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
    if (!this.data.isTeacher) {
      //! cjy
      this.signquerymember(true);
    }
    this.setData({
      global: true
    })
  },
  checkNum(e) {
    console.log(e.detail)
  },

  stucheckwifi() {
    if (!this.data.wifi) {
      return;
    }
    wx.showLoading({
      title: '获取WIFI信息中...',
      mask: true
    });
    wx.startWifi({
      success: res => {
        wx.getConnectedWifi({
          success: res => {
            wx.hideLoading();
            console.log(res);
            let wificheckok = false;
            if (res.wifi) {
              let thiswifi = res.wifi;
              if (thiswifi.SSID == this.data.wifi.SSID && thiswifi.BSSID == this.data.wifi.BSSID) {
                wificheckok = true;
              }
            }
            if (wificheckok) {
              this.studentSign(1);
            } else {
              this.stuonwififail();
            }
          },
          fail: res => {
            wx.hideLoading();
            this.stuonwififail();
          }
        })
      },
      fail: res => {
        wx.hideLoading();
        this.stuonwififail();
      }
    })

  },
  stuonwififail() {
    if (this.data.Location) {
      this.stucheckgps();
    } else {
      let tips = '请确认您已连接到指定WIFI:' + this.data.wifi.SSID;
      wx.showModal({
        title: '签到失败',
        content: tips,
        showCancel: false,
        confirmText: '关闭'
      });
    }
  },
  getWifi() {
    // let that = this;
    // wx.getConnectedWifi({
    //   success: res => {
    //     console.log('Wifi cg', res)
    //     let wifi = {
    //       SSID: res.wifi.SSID,
    //       BSSID: res.wifi.BSSID
    //     };
    //     let LocationWifi = that.data.wifi;
    //     if (wifi.SSID == LocationWifi.SSID && wifi.BSSID == LocationWifi.BSSID) {
    //       that.setData({
    //         wifiSign: true,
    //       });
    //       that.studentSign();
    //     } else {
    //       if (that.data.signType == '2') {
    //         that.getLocationinfo();
    //       } else {
    //         wx.showModal({
    //           title: '签到失败',
    //           content: '请确认你已连接到指定wifi',
    //           showCancel: false,
    //           confirmText: '关闭'
    //         });
    //         that.setData({
    //           signTipsText: '您未连接到教室WiFi，无法完成签到。'
    //         })
    //         wx.hideLoading();
    //         that.initRefresh();
    //       }
    //
    //     }
    //     console.log('wifiqd', that.data.wifiSign);
    //   },
    //   fail: err => {
    //     wx.hideLoading();
    //     that.initRefresh();
    //     if (that.data.signType == '2') {
    //       wx.showModal({
    //         title: '获取wifi失败',
    //         content: '你还可以使用GPS定位签到',
    //         success(res) {
    //           if (res.confirm) {
    //             that.setData({
    //               wifiEnd: true
    //             })
    //             that.getLocationinfo();
    //           }
    //         }
    //       });
    //     } else {
    //       wx.showModal({
    //         title: '获取wifi失败',
    //         content: '请查看手机wifi设置,之后重新刷新签到',
    //         showCancel: false,
    //         confirmText: '关闭',
    //       });
    //     }
    //   }
    // })
  },
  stucheckgps() {
    if (!this.data.Location) {
      return;
    }
    wx.showLoading({
      title: '获取地理位置中...',
      mask: true
    })
    wx.getLocation({
      type: 'wgs84',
        //! cjy： 貌似非高精度偏差也不太大  --不使用高精度，会相差500米？
     isHighAccuracy: true,
     highAccuracyExpireTime: this.data.gpstimeout,
      success: res => {
        wx.hideLoading();
        console.log(res);
        console.log(this.data.Location);
        let dist = this.getDistance(res.latitude, res.longitude,
          this.data.Location.latitude, this.data.Location.longitude);
        dist = parseInt(dist);

        let mustdist = 100;
        if (typeof this.data.Location.gpsdist != 'undefined') {
          let setdist = parseInt(this.data.Location.gpsdist);
          if (setdist >= 0) {
            mustdist = setdist;
          }
        }

        if (dist <= mustdist) {
          let signinfo = dist + '';
          console.log('dist in valid range:' + signinfo);
          this.studentSign(2, signinfo);
        } else {

          let tips = '距离太远：' + (dist) + '米, 限制' + mustdist + '米';

          //! 测试
          //   if (this.data.lastLocation){
          //       let dist2 = this.getDistance(res.latitude, res.longitude,
          //           this.data.lastLocation.latitude, this.data.lastLocation.longitude);
          //       dist2 = parseInt(dist2);
          //       tips = '与上次距离：' + (dist2) + '米';
          //   }
          //   this.setData({lastLocation:res});

          this.stugpscheckfail(tips);
        }
      },
      fail: res => {
        wx.hideLoading();
        let tips = '未能获取位置信息';
        this.stugpscheckfail(tips);
      }
    })
  },
  stugpscheckfail(reason) {
    let tips = '' + reason;
    wx.showModal({
      title: '签到失败',
      content: tips,
      showCancel: false,
      confirmText: '关闭'
    });
  },
  getLocationinfo() {
    // let that = this;
    // wx.getLocation({
    //   type: 'wgs84',
    //   isHighAccuracy: true,
    //   highAccuracyExpireTime: 5000,
    //   success: res => {
    //     console.log('dinwei cg', res);
    //     that.setData({
    //       gpsSign: true,
    //       distance: that.getDisance(res.latitude, res.longitude, that.data.Location.latitude, that.data.Location.longitude),
    //     })
    //     if (that.data.distance < 600) {
    //       that.studentSign();
    //     } else if (that.data.signType == '2') {
    //       wx.showModal({
    //         title: '签到失败',
    //         content: '请确认你已连接到指定wifi或已到达目的地',
    //         showCancel: false,
    //         confirmText: '关闭'
    //       });
    //       that.setData({
    //         signTipsText: '您距离教室太远，或未连接到指定wifi。'
    //       })
    //       wx.hideLoading();
    //       that.initRefresh();
    //     } else {
    //       wx.showModal({
    //         title: '签到失败',
    //         content: '请确定已到达目的地',
    //         showCancel: false,
    //         confirmText: '关闭'
    //       });
    //       that.setData({
    //         signTipsText: '您距离教室太远，无法完成签到。'
    //       })
    //       wx.setStorageSync('authSetting', '');
    //       wx.hideLoading();
    //       that.initRefresh();
    //     }
    //     console.log('距离', that.data.distance);
    //   },
    //   fail: err => {
    //     wx.hideLoading();
    //     that.initRefresh();
    //     wx.showModal({
    //       title: '定位失败',
    //       content: '需要获取您的地理位置，请确认授权，否则无法签到',
    //       success(res) {
    //         if (res.confirm) {
    //           wx.openSetting({
    //             success: function (dataAu) {
    //               if (dataAu.authSetting["scope.userLocation"] == true) {
    //                 if (that.data.signType == '2') {
    //                   wx.setStorageSync('authSetting', 'gps');
    //                 }
    //                 that.getLocationinfo()
    //               }
    //             }
    //           })
    //         } else if (res.cancel) {
    //           console.log('用户点击取消')
    //         }
    //       }
    //     });
    //   }
    // })
  },
  toRad(d) {
    return d * Math.PI / 180;
  },


  //计算距离  米
  getDistance(lat1, lng1, lat2, lng2) {
    const PI = Math.PI
    const EARTH_RADIUS = 6378137.0
    // 求弧度
    function getRadian(d) {
      return d * PI / 180.0; //角度1? = π / 180
    }

    let radLat1 = getRadian(lat1);
    let radLat2 = getRadian(lat2);
    let a = radLat1 - radLat2;
    let b = getRadian(lng1) - getRadian(lng2);

    let dst = 2 * Math.asin((Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2))));
    dst = dst * EARTH_RADIUS;

    return dst;
  },
  //     getDistance(   n1,    e1,    n2,    e2)
  // {
  //     const  jl_jd  =   102834.74258026089786013677476285 ;
  //     const  jl_wd  =   111712.69150641055729984301412873 ;
  //     let  b  =  Math.abs((e1  -  e2)  *  jl_jd);
  //     let  a  =  Math.abs((n1  -  n2)  *  jl_wd);
  //     let o =   Math.sqrt((a  *  a  +  b  *  b));
  //     if (o == null){
  //         o = 0;
  //     }
  //     return o;
  //
  // },
  //   getDistanceOld(lat1, lng1, lat2, lng2) {
  //     const PI = Math.PI
  //     const EARTH_RADIUS = 6378137.0
  //
  //     function getRad(d) {
  //       return d * PI / 180.0
  //     }
  //     let f = getRad((lat1 + lat2) / 2)
  //     let g = getRad((lat1 - lat2) / 2)
  //     let l = getRad((lng1 - lng2) / 2)
  //     let sg = Math.sin(g)
  //     let sl = Math.sin(l)
  //     let sf = Math.sin(f)
  //
  //     let s, c, w, r, d, h1, h2
  //     let a = EARTH_RADIUS
  //     let fl = 1 / 298.257
  //
  //     sg = sg * sg
  //     sl = sl * sl
  //     sf = sf * sf
  //
  //     s = sg * (1 - sl) + (1 - sf) * sl
  //     c = (1 - sg) * (1 - sl) + sf * sl
  //
  //     w = Math.atan(Math.sqrt(s / c))
  //     r = Math.sqrt(s * c) / w
  //     d = 2 * w * a
  //     h1 = (3 * r - 1) / 2 / c
  //     h2 = (3 * r + 1) / 2 / s
  //
  //     return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))
  //
  //
  //     // var dis = 0;
  //     // var radLat1 = this.toRad(lat1);
  //     // var radLat2 = this.toRad(lat2);
  //     // var deltaLat = radLat1 - radLat2;
  //     // var deltaLng = this.toRad(lng1) - this.toRad(lng2);
  //     // var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  //     // return dis * 6378137;
  //   },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //this.signquery();  //! cjy: signquery 谨慎调用； 再signquery后可能会跳转到其他页面
    //   this.signquerymember();
  },
  initRefresh() {
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  teacherGetWifi() {
    let that = this;
    let wifi = {};
    console.log('begin get wifi');
    wx.startWifi({
      success: res => {
        wx.getConnectedWifi({
          success: res => {
            console.log(res);
            if (res.wifi) {
              let wifi = {
                SSID: res.wifi.SSID,
                BSSID: res.wifi.BSSID
              };
              that.setData({
                wifi: wifi
              })
            } else {}
          },
          fail: err => {
            console.log('get wifi failed:');
            console.log(err);
          },
          complete: () => {
            console.log('teachergetwifi finish');
            that.teasignfinishcheck();
          }
        })
      },
      fail: res => {
        that.teasignfinishcheck();
      }
    })

  },
  teacherGetLocation() {
    let that = this;
    let Location = {};
    wx.getLocation({
      type: 'wgs84',
        //! cjy： 貌似非高精度偏差也不太大  --不使用高精度，会相差500米？
     isHighAccuracy: true,
     highAccuracyExpireTime: this.data.gpstimeout,
      success: res => {
        console.log(res);
        let Location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        let dist = wx.getStorageSync('signTypeDist') || 100;
        Location.gpsdist = dist;
        that.setData({
          Location: Location
        })
        that.teasignfinishcheck();
      },
      fail: err => {
        console.log('teachergetlocation failed');
        that.teasignfinishcheck();
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
    // this.signquery();
    //   this.signquerymember();
    //    if (!this.data.isTeacher) {
    //      this.setData({
    //        global: false
    //      })
    //    }
    let signchange = app.getCacheObject('signstatechange');
    console.log('sign onshow, signchange:');
    console.log(signchange);
    if (signchange) {
      if (this.data.teacherSignInfo.id == signchange.id) {
        //   this.data.teacherSignInfo.state = signchange.state;
        console.log('sign onshow, set changed state');
        this.data.teacherSignInfo.state = signchange.state;
        this.onteacursign(this.data.teacherSignInfo);
        // this.setData({
        //     teacherSignInfo: this.data.teacherSignInfo
        // })
        this.signquerymember();
      }
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
   * 页面上拉触底事件的处理函数
   */
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.HistoryisLoad) {
      wx.showToast({
        title: '已加载全部'
      });
      return;
    }
    wx.showLoading({
      title: '玩命加载中',
    })
    this.signquerymember();

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //
  // },
})