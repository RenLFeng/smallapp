//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    mainurl:'',
    showurl:false,
    showloginfail:false,
    showdirectin:false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '/pages/web/page'
    })
  },
  onLoginOk:function(){
    this.setData({
      
      motto:'登陆中...'
    })
    if (app.LoginData.loginok)
   // if (app.LoginData.sessioncookie.length > 0)
    {
      //! 使用session登陆
      let onequery = '?cookie=' + app.LoginData.sessioncookie;
      let cururl = app.getmainpage(onequery);
      console.log('index url:'+cururl);
      let showurl = true;
      let showloginfail = app.WebLoginData.loginfail;
      console.log('webloginfail:'+showloginfail);
      if (app.WebLoginData.loginfail){
        showurl = false;
      }
      if (!app.LoginData.loginok){
        showurl = false;
      }
      else{
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true,
        });
      }
      
      if (cururl != this.data.mainurl){
        console.log(cururl);
        this.setData({
          showurl:showurl,
          mainurl:cururl,
          showloginfail: showloginfail
        })
      }
      else{
        this.setData({
          showurl:showurl,
          showloginfail: showloginfail
        })
      }
    }else {
  
    }

  },
  onShow:function(){
    console.log('wx index, on show');
    this.checkLoginFail();
  },
  checkLoginFail:function(){
    if (app.WebLoginData.loginfail){
      console.log('ck:weblogin loginfail');
      this.setData({
        showurl:false,
        showloginfail:true
      })
    }
    else{
      this.setData({
        showloginfail:false
      })
    }
  },
  onBtnReconnect:function(){
    console.log('onBtnReconnect');
    app.dowxlogin();
  },
  onBtnSkip:function(){
    console.log('onBtnSkip');
    this.setData({
      showurl:true
    })
  },
  onLoad: function () {

     console.log('index onload');

//! 总是回调； 微信登陆二次校正，用于cookie变化的场景
    app.userInfoReadyCallback = res => {
      this.onLoginOk();
    }
    
    if (
   //   app.globalData.userInfo
        app.LoginData.loginok
      ) {
      
      this.onLoginOk();
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          app.onLoginOk(true);
          
        }
      })
    }
    console.log('index onload end');
  },
  getUserInfo: function(e) {
    //console.log(e)
    // console.log('getuserinfo');
    
    
    app.globalData.userInfo = e.detail.userInfo
    
    app.onLoginOk(true);

    //! 处理离线下的登陆情况
    app.dowxlogin();
  }
})
