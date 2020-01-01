// pages/location/studentSignState/index.js
const app = getApp();
const util = require('../../../utils/util.js')
const setALL = [{
    name: "设为已签到",
    id: 1
  },
  {
    name: "设为迟到",
    id: 2
  },
  {
    name: "设为超时",
    id: 3
  },
  {
    name: "设为未签到",
    id: 0
  }
];
const More = [{
    name: "查看全部",
    id: 100
  },
  {
    name: "查看未签到",
    id: 0
  },
  {
    name: "查看超时",
    id: 3
  },
  {
    name: "查看迟到",
    id: 2
  },
  {
    name: "查看已签到",
    id: 1
  }
];
// const setALL = [
//   "设为未签到",
//   "设为已签到",
//   "设为迟到",
//   "设为超时",
// ];

// const More = [
//   "查看未签到",
//   "查看已签到",
//   "查看迟到",
//   "查看超时",
//   "查看全部",
// ];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showActionSheet: false,
    actions: [],
    isSignBtn: true,
    isStudent: true,
    seeText: "查看全部",
    studentSingItem: {},

    isSign: false,
    isTeacher: false,
    singnInfo: {},
    signmembers: [],
    signmembersTemp: [],
    allmemberNuber: 0,
    signmemberNuber: 0,

    signType: '',
      signTypeDesc:'',

      timerid:0,  //! 定时器， 用于定时拉取签到数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options', options);

    this.setData({
      isTeacher: JSON.parse(options.isTeacher)
    })

    let signinfo = wx.getStorageSync('signinfo') || '{}';
    signinfo = JSON.parse(signinfo);
    let signtypedesc = '';

    let info  = {};
    if (signinfo.info && typeof signinfo.info == 'string'){
        info = JSON.parse(signinfo.info || '{}');
    }
    else if (signinfo.info){
      info = signinfo.info;
    }

      this.setTitle(signinfo.state);

    if (info.wifi){
      signtypedesc += '\nWIFI检验'
        signtypedesc += '('+ info.wifi.SSID + ')'
    }
    if (info.gps){
      signtypedesc += '\n位置校验 '
        if (typeof info.gps.gpsdist != 'undefined'){
          signtypedesc += '(' + info.gps.gpsdist + '米)';
        }
    }
    if (signtypedesc == ''){
      if (this.data.isSign){
          signtypedesc = '\n无校验方式，成员不能签到，请手动更改签到状态';
      }
      else{
        signtypedesc = '\n无校验方式';
      }
    }

    this.setData({
      singnInfo: signinfo,
        signTypeDesc:signtypedesc
    }, () => {});

    this.signquerymember();
    console.log('istacher', this.data.isTeacher);
    console.log('isSign', this.data.isSign);
    if (this.data.isSign){
      let that = this;
      let timerid = setInterval(function(){
        that.signquerymember();
      }, 3000);
      this.setData({
          timerid:timerid
      })
    }
  },
  //签到设置
  confin: function (e) {
    wx.navigateTo({
      url: '/pages/config/sign/index',
    })
  },
  //一键设置
  confign() {
    this.setData({
      isStudent: false,
      actions: setALL
    })
    this.showActionSheetFn();
  },
  //查看类型
  More() {
    this.setData({
      isSignBtn: false,
      actions: More
    })
    this.showActionSheetFn();
  },
  // van-action 取消btn
  onCancel() {
    this.setData({
      isSignBtn: true,
      isStudent: true,
      showActionSheet: false
    })
  },
  //签到状态下拉选项
  onSelect(event) {
    console.log(event.detail);
    let item = event.detail;
    //设置签到状态
    if (this.data.isSignBtn) {
      if (this.data.isStudent) {
        this.studentChangestate(item.id);
      } else {
        this.setAllSignState(item.id);
      }
    } else {
      //查看签到类型
      this.seeSginType(item.id);
      this.setData({
        seeText: item.name
      })
      let list = [];
      this.setData({
        isSignBtn: true
      })
    }
    this.setData({
      showActionSheet: false
    })
  },
  //更改单个学生签到状态
  studentChageFn(e) {
    if (!this.data.isTeacher) return;
    this.setData({
      studentSingItem: e.detail,
      showActionSheet: true,
      actions: setALL
    })
    // console.log(e)
  },
  studentChangestate(state) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '你确定要作此操作吗?',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中...',
            mask: true
          })
          app.httpPost({
            url: app.getapiurl('/api/sign/changestate'),
            data: {
              userid: that.data.studentSingItem.userid,
              signid: that.data.studentSingItem.signid,
              state: state
            },
            success: res => {
              console.log("ds", res);
              if (res.data.code == "0") {
                that.setData({
                  'studentSingItem.state': state
                })
                that.signquerymember();
              }
              wx.hideLoading();
            },
            error: err => {
              wx.hideLoading();
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //批量修改签到状态
  setAllSignState(state) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要作此操作吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中...'
          })
          app.httpPost({
            url: app.getapiurl('/api/sign/batchstate'),
            data: {
              signid: that.data.singnInfo.id,
              state: state
            },
            success: res => {
              if (res.data.code == "0") {
                that.setData({
                  isStudent: true
                });
                let signmembers = that.data.signmembers;
                for (let v of signmembers) {
                  v.state = state;
                }
                console.log('dsa', signmembers);
                that.setData({
                  signmembers: signmembers,
                  signmembersTemp: signmembers
                })
                that.signquerymember();
              }
              wx.hideLoading();
            },
            error: err => {
              wx.hideLoading();
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //查看签到类型
  seeSginType(state) {
    let list = [];
    list = this.data.signmembersTemp.filter(item => item.state == state);
    if (state == "100") {
      this.setData({
        signmembers: this.data.signmembersTemp
      })
    } else {
      this.setData({
        signmembers: list
      })
    }
  },
  showActionSheetFn() {
    this.setData({
      showActionSheet: true
    })
  },
  countSign(data) {
    let signmemberNuber = 0;
    for (let v of data) {
      if (v.state > '0') {
        signmemberNuber++;
      }
    }
    this.setData({
      signmemberNuber: signmemberNuber,
      allmemberNuber: data.length ,  //! cjy: 后者永远显示总人数， 否则怪异
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  signquerymember() {
    let that = this;
    console.log('signquerymember');
    app.httpPost({
      url: app.getapiurl('/api/sign/signquerymember'),
      data: {
        id: that.data.singnInfo.id
      },
      success: res => {
        if (res.data.code == 0) {
          if (res.data.data && res.data.data.signmembers.length) {
            let signmemberNuber = 0;
            let Data = res.data.data;
            for (let item of Data.signmembers) {
              if (item.state > '0') {
                signmemberNuber++;
              }
              for (let v of Data.users) {
                if (item.state == '0') {
               //  item.stateText = '未签到';
                  item.abnormal = true;
                } else if (item.state == '1') {
               //  item.stateText = '已签到';
                } else if (item.state == '2') {
                 // item.stateText = '迟到';
                  item.abnormal = true;
                } else if (item.state == '3') {
                  //item.stateText = '超时';
                  item.abnormal = true;
                }
                item.stateText = util.signGetStateDesc(item.state);
                item.typedesc = util.signGetTypeDesc(item.signnum);
                if (item.signnum == 2){
                  //! 距离
                    item.typedesc = '距离 ' + item.signinfo + '米';
                }
                if (item.signtime && item.state > 0){
                    item.signtimetext = item.signtime.split(" ")[1];
                }
                else{
                  item.signtimetext = '';
                }

                if (item.userid == v.id) {
                  item.name = v.name;
                  item.avatar = app.getapiurl(v.avatar);
                }
              }
            }
            that.setData({
              signmembers: Data.signmembers,
              signmembersTemp: Data.signmembers,
              // allmemberNuber: Data.signmembers.length - signmemberNuber,
              // signmemberNuber: signmemberNuber
            })
            that.countSign(that.data.signmembers);
          //  console.log("学生打卡记录", that.data.signmembers);
          }
        } else {}
      },
      error: err => {}
    })
  },
  //教师下课
  SignEnd() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '结束签到？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
            let postdata = {
                    id: that.data.singnInfo.id,
                    state: 1
                }
          app.httpPost({
            url: app.getapiurl("/api/sign/signupdate"),
            data: postdata,
            success: res => {
              wx.hideLoading();
              if (res.data.code == 0){
                  that.setData({
                      isSign: false,
                  })
                  wx.setNavigationBarTitle({
                      title: '签到结果'
                  })
                  app.setCacheObject('signstatechange',
                      postdata)
                  //! 自动后退
                  wx.navigateBack();
              }
              else{
                wx.showToast({
                    title:'错误:'+res.data.msg
                })
              }

            },
            error: err => {
              wx.hideLoading();
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  setTitle(state) {
    if (state == '0') {
      wx.setNavigationBarTitle({
        title: '签到中...'
      })
      this.setData({
        isSign: true
      })
    } else
    // if (state == '1')
      {
      wx.setNavigationBarTitle({
        title: '签到结果'
      })
      this.setData({
        isSign: false
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //! cjy： 每次签到， 校验方式均有所不同
    // let signType = wx.getStorageSync('signType') || '[]';
    // if (signType.includes('wifi') || signType.includes('gps')) {
    //   signType = JSON.parse(signType);
    //   let type = [];
    //   for (let v of signType) {
    //     if (v) {
    //       type.push(v.toUpperCase())
    //     }
    //   }
    //   this.setData({
    //     signType: type
    //   })
    // } else {
    //   this.setData({
    //     signType: []
    //   })
    // }
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
    clearInterval(this.data.timerid);
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