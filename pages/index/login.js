// pages/index/login.js

const util = require('../../utils/util.js');
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
      canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


    dologin:function(){
       if (!app.globalData.wxcache){
         app.dowxlogin();
         return;
       }
        wx.getUserInfo({
            withCredentials:true,
            success: res => {
                // 可以将 res 发送给后台解码出 unionId
                console.log(res);
               // this.globalData.userInfo = res.userInfo;
              //  this.globalData.userInfoRet = res;

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                //this.onLoginOk(true);
                app.httpPost({
                    url:app.getapiurl('/api/weixin/wxappupdateuser'),
                    data:{
                        user:res,
                        wxcache:app.globalData.wxcache,
                    },
                    success:res=>{
                        console.log(res);
                        if (res.data.code == 0){
                            app.onUserLogin(res.data.data);
                            wx.navigateBack();
                        }
                        else{
                            wx.showToast({
                                title: '登陆异常：' + res.data.msg
                            })
                        }
                        //this.onLoginOk(true);
                    },
                    fail:res=>{
                        console.log('wx update user failed!');
                        wx.showToast({
                            title: '登陆失败'
                        })
                    }
                });
            }
            ,fail:res=>{
                console.log('getuserinfo fail')  //！ 用户拒绝也会走这里
                // wx.showToast({
                //     title: '获取微信信息失败'
                // })
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
  // onShareAppMessage: function () {
  //
  // }
})