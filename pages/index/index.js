//index.js
//获取应用实例
const util = require('../../utils/util.js');
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
      shareobj:null,  //! 页面的分享
      shareing:false,
      urlcookie:'',
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '/pages/web/page'
    })
  },
    onShareObjBankeSign(shareobj){
      if (this.data.shareing){
          return;
      }
      //！ cjy： 这里不显示ui； 貌似这里显示ui，hideloading后立即navigate，loading不消除？（android）
        // wx.showLoading({
        //   title:'处理中...',
        //       mask:true
        // })
        this.startShareing();
       let url = app.getapiurl('/api/sign/signqueryself');
       app.httpPostCatch({
           url:url,
           data:{
               id:shareobj.data.id
           },
           success:res=>{
               console.log(res);
              wx.hideLoading();
              if (res.data.code == 0){
                  let rdata = res.data.data;
                  //! 是否为签到发起者
                  if (rdata.master){
                      this.finishShareing(false);
                     // this.onLoginOk();
                      //! 跳转到控制界面或结果显示界面
                      wx.setStorageSync('signinfo',JSON.stringify(rdata.signdata));
                      wx.navigateTo({
                          url:'/pages/location/studentSignState/index?isTeacher=1',
                      })
                  }
                  else if (rdata.signinfo.length == 1){
                      this.finishShareing(false);
                      app.setCacheObject('signqueryself', rdata);
                      wx.navigateTo({
                          url:'/pages/location/sign'
                      })
                  }
                  else{
                      let tips = '您不在签到名单中';
                      wx.showModal({
                          title:'提示',
                          content:tips,
                          complete:res=>{
                              this.finishShareing(true);
                          }
                      })
                  }
              }
              else{
                  wx.showToast('异常:'+res.data.msg);
                this.finishShareing(true);
              }
           },
           catch:res=>{
             wx.hideLoading();
             wx.showToast('异常');
             this.finishShareing(true);
           }
       })
    },
    startShareing(){
      this.setData({
          shareing:true,
          shareobj:null,  //! 清空当前的shareobj
      })
    },
    finishShareing(showurl){
      this.setData({
          shareing:false
      })
        if (showurl){
            this.onLoginOk();
        }
    },
  onLoginOk:function(){
    this.setData({
      
      motto:'登陆中...'
    })
      if (this.data.shareing){
          console.log('onloginok, inshareing, return');
          return;
      }
    if (app.LoginData.loginok)
   // if (app.LoginData.sessioncookie.length > 0)
    {
      //! 使用session登陆

      

        let shareobj = this.data.shareobj;
        
        // shareobj = {
        //     action:'bankesign',
        //     data:{id:1025}
        // }

        let cururl = app.getfullurl('/');
        if (shareobj)
        {
         if (shareobj.action == 'joinbanke')
          {
            cururl += '#/bankejoin/' + shareobj.data.id;
          }
          else if (shareobj.action == 'commonshare'){
           //cururl += '#/zuoyeresult/' + shareobj.data.id;
           cururl = app.getfullurl('') + shareobj.data; 
          }
          else if (shareobj.action == 'bankesign'){
            this.onShareObjBankeSign(shareobj);
            return;
         }
        }

      this.setData({  //! 清空当前的分享数据; 这里才清除，以便与startshareing无缝对接
        shareobj: null
      })

      let cookie = app.LoginData.sessioncookie;
      let onequery = '?cookie=' + cookie;
     // onequery = ''
      cururl += onequery;
      console.log('index url:'+cururl);
      let showurl = true;
      let showloginfail = app.WebLoginData.loginfail;
      console.log('webloginfail:'+showloginfail);
      if (app.WebLoginData.loginfail){
        showurl = false;
      }
      //showurl = false;
      if (!app.LoginData.loginok){
        showurl = false;
      }
      else{
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true,
        });
      }



      
     // if (cururl != this.data.mainurl)
      if (cookie != this.data.urlcookie) //! 因为shareobj的url的缘故，这里只判断cookie，防止shareobj的url被覆盖
      {
          console.log('showurl:'+showurl);
        console.log(cururl);
        this.setData({
          showurl:showurl,
          urlcookie:cookie,
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
        console.log('index not login ok');
    }

  },
  onShow:function(){
    console.log('wx index, on show');
    //this.checkLoginFail();
    //! cjy: onshow 时，总是尝试web重连
   // app.startWebConnect();
   //! cjy: 尝试wx登陆，防止可能的session失效
    app.dowxlogin();
    if (!this.data.shareobj && 
      !this.data.shareing && !this.data.showurl && app.LoginData.loginok){
        this.onLoginOk();
    }
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
      let cookie = app.LoginData.sessioncookie;
      if (cookie.length > 0){
          console.log('force set loginok');
          //! 强制设为true
          app.LoginData.loginok = true;

          this.onLoginOk();
      }
    // this.setData({
    //   showurl:true
    // })
  },
  onLoad: function (options) {

     console.log('index onload');

     if (options){
       if (options.shareobj){
         let shareobj = util.parseNativeArgs(options.shareobj);
         this.setData({
             shareobj:shareobj
         })
       }
     }

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
