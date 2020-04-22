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
      curdisablegzh:false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '/pages/web/page'
    })
  },
    onShareObjBankeSign(shareobj){
      if (this.data.shareing){
          console.log('onshareobjbankesign, in shareing');
          return;
      }
      console.log('onshareobjbankesign');
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
                  let toast ='异常:'+res.data.msg;
                  console.log(toast);
                  wx.showToast({ title:toast, icon:'none'});
                this.finishShareing(true);
              }
           },
           catch:res=>{
             wx.hideLoading();
             wx.showToast({title:'异常', icon:'none'});
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

      //! test.
      

        let cururl = app.getfullurl('/');
        if (shareobj)
        {
          try{//! 防止shareobj出异常
            //! 检测是否登陆；如果未登陆时， 先跳转登陆
            if (!app.LoginData.userid) {
                //! cjy: 不清空； 用户会困惑
              // this.setData({  //! 清空当次分享，避免重入
              //   shareobj: null
              // })
              wx.navigateTo({
                url: '/pages/index/login'
              })
              return;
            }

            if (shareobj.action == 'joinbanke') {
              cururl += '#/bankejoin/' + shareobj.data.id;
            }
            else if (shareobj.action == 'commonshare') {
              //cururl += '#/zuoyeresult/' + shareobj.data.id;
              cururl = app.getfullurl('') + shareobj.data;
            }
            else if (shareobj.action == 'bankesign'
              || shareobj.action == 'sign'   //! sign为scene传入
            ) {
              this.onShareObjBankeSign(shareobj);
              return;
            }
          }catch(e){

          }
          
        }

      this.setData({  //! 清空当前的分享数据; 这里才清除，以便与startshareing无缝对接
        shareobj: null
      })

      //! 测试是否跳转关注公众号
      //！sdk: https://developers.weixin.qq.com/miniprogram/dev/component/official-account.html
      let appscene = 0; // app.LoginData.appscene
        let oss = wx.getLaunchOptionsSync()
        if (oss){
            appscene = oss.scene
            console.log('onloginok, appscene:'+appscene);
        }
      if ((appscene == 1047
        || appscene == 1124
        // || appscene == 1089   //! 大部分appscene都不显示，这里加限制
        // || appscene == 1038
        // || appscene == 1011
        // || appscene == 1017  //! 扫码体验版
        )
        && app.LoginData.userid //! 必须是已登录的用户
          && app.LoginData.sessioncookie.length > 0
      ) {
        if (!this.data.curdisablegzh){
          let skipgzh = wx.getStorageSync("skipgzh");
          if (!skipgzh) {
            this.setData({
              curdisablegzh:true
            })
            console.log('to==gzh')
            wx.navigateTo({
              url: '/pages/share/gzh'
            })
            return;
          }
        }
        
      }

      let cookie = app.LoginData.sessioncookie;
      let onequery = 'cookie=' + cookie;
     // onequery = ''
       if (cururl.indexOf('?')>=0){
          cururl += '&';
       }
        else{
          cururl += '?';
        }
      cururl += onequery;
      console.log('index url:'+cururl);
      let showurl = true;
      let showloginfail = app.WebLoginData.loginfail;
      // console.log('webloginfail:'+showloginfail);
      // if (app.WebLoginData.loginfail){
      //   showurl = false;
      // }
      // showurl = false;   //！ test
      // if (!app.LoginData.loginok){
      //   showurl = false;
      // }
      // else{
      //   this.setData({
      //     userInfo: app.globalData.userInfo,
      //     hasUserInfo: true,
      //   });
      // }

      
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
    parseSceneToShareobj:function(scenestr){
      //! 将scene字符串转换未 shareobj；      actionname;key1=value1;key2=value2;
        let tarray = scenestr.split(';')
        if (tarray && tarray.length){
            let shareobj = {};
            shareobj.action = tarray[0]
            let dataobj = {}
            //！ cjy:因为scene严格的长度限定，第一个也可能存储action
            let iscommonshare = false;
            if (tarray[0] == 'surl'){
              iscommonshare = true;
              shareobj.action = 'commonshare';
              if (tarray[1]){
                dataobj = tarray[1]
              }
              else{
                dataobj = ''
              }
            }
            else{
              let tmparray = tarray[0].split('=');
              if (tmparray.length == 2) {
                shareobj.action = tmparray[0]
                dataobj[tmparray[0]] = tmparray[1]
              }
              for (let i = 1; i < tarray.length; i++) {
                let onearray = tarray[i].split('=');
                if (onearray.length == 2) {
                  dataobj[onearray[0]] = onearray[1]
                }
              }
            }
            
            shareobj.data = dataobj;
            return shareobj;
        }
        return null;
    },
  onLoad: function (options) {

     console.log('index onload');

     //! 测试
     //  let testscenestr = 'sign;id=1030';
     //  let sob = this.parseSceneToShareobj(testscenestr);
     //  console.log(sob);
     //  this.setData({
     //      shareobj:sob
     //  })

     if (options){
       if (options.shareobj){
           console.log('hasshareobj:' + options.shareobj);
         let shareobj = util.parseNativeArgs(options.shareobj);

         console.log(shareobj);
         this.setData({
             shareobj:shareobj
         })
       }
       if (options.scene){
           console.log('hasscene' + options.scene);
           let scstr = decodeURIComponent(options.scene);
           let shareobj = this.parseSceneToShareobj(scstr);

           console.log(shareobj);
           if (shareobj){
               this.setData({
                   shareobj:shareobj
               })
           }
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
      app.getUserInfo();
    }
    console.log('index onload end');
  },
  getUserInfo: function(e) {
    //console.log(e)
    // console.log('getuserinfo');

      app.getUserInfo();

   // app.globalData.userInfo = e.detail.userInfo

    //app.onLoginOk(true);

    //! 处理离线下的登陆情况
    //app.dowxlogin();
  }
})
