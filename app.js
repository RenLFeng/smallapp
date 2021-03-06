//app.js
App({
  LoginData:{
    publishserver:'www2.exsoft.com.cn', //! 正式服务器地址; 测试环境注释掉此行
    testserver:'192.168.0.168', //! 测试服务器ip
    testapiserver:'192.168.0.168', //! 测试服务器的api地址
   // testserver:'192.168.1.101',
  //  testapiserver:'192.168.1.101',
    // testserver:'192.168.0.239', //! 测试服务器ip
    // testapiserver:'192.168.0.2', //! 测试服务器的api地址
    // testapiport:9982,
    // testport:8080, //8080,

    sessioncookie:'',
    username:'',

      //! 新的登陆标志； 2020-3-24
      userid:0,
      pendingnewuserlogin:false,

   // useravatar:'',
    loginok:false,
    wxloginok:false,
    errmsg:'',
    errcode:0,
    wxloginstate:0,  //! 登陆状态： 0:空闲； 1：登陆中  2：
      wxlogintime:0,
    updatinguser:false,
    appscene:0,  //! 本次启动的小程序场景值
  },

    //! cjy: 缓存， 数据中转
    setCacheObject(key, obj){
      wx.setStorageSync(key, (obj));
    },
    getCacheObject(key, dodelete=true){
        try {
            let value = wx.getStorageSync(key)
            if (value) {
                // Do something with return value
                if (dodelete){
                  wx.removeStorageSync(key);
                }
            }
            return value;
        } catch (e) {
            // Do something when catch error
        }
        return null;
    },

  getpublishurl:function(){
    let szret = 'https://' + this.LoginData.publishserver;
    return szret;
  },
  //! httppost封装； 封装cookie
  httpPost:function(postobj){
      if (!postobj.header && this.LoginData.sessioncookie.length > 0){
         let localcookie = 'EXSOFTSSID=' + this.LoginData.sessioncookie;
         var header = {
           'content-type':'application/json;charset=utf-8',
           'cookie':localcookie
         }
         postobj.header = header;
      }
      if (!postobj.method){
        postobj.method = 'POST';
      }
      return wx.request(postobj);
  },
    //！ httppost的分装， 类似axio， 封装fail以及success中发生异常的清空:   success:  catch:
    httpPostCatch:function(postobj){
        let oldok = postobj.success;
        let catchfun = postobj.catch;
      //  console.log('httppostcatch');
        let thisok = (res)=>{
       //   console.log('thisok');
          try{
            if (oldok){
              oldok(res);
            }
          }catch(e){
            if (catchfun){
              catchfun(e);
            }
          }
        }
        let thisfail = (res)=>{
          if (catchfun){
            catchfun(res);
          }
        }
        postobj.success = thisok;
        postobj.fail = thisfail;
        return this.httpPost(postobj);
    },
    onUserLogin:function(user){
      this.LoginData.sessioncookie = user.cookie;
      this.LoginData.userid = user.id;
      this.onLoginOk(true);
    },
  onLoginOk:function(bsave){
    console.log('onLoginOk:'+bsave);
    if (!this.LoginData.sessioncookie.length) {
      //! wxlogin 尚未完成
      console.log('onLoginOk, null sessioncookie');
      return;
    }
   // if (!(this.LoginData.username.length >0)
  //  && this.globalData.userInfo)

    //   if (this.globalData.userInfoRet
    //   && this.globalData.wxcache
    //       && !this.LoginData.updatinguser
    //   )
    // {
    // //  if (this.LoginData.username.length == 0)
    //   {
    //     //! 首次登陆， 初始化数据， 完成后才登入页面
    //     if (this.LoginData.updatinguser){
    //      //! 正在更新中
    //       console.log('onLoginOk, in updateing user');
    //       //return;
    //     }
    //
    //     this.LoginData.updatinguser = true;
    //     console.log("wx update user");
    //     this.httpPost({
    //         url:this.getapiurl('/api/weixin/wxappupdateuser'),
    //         data:{
    //           user:this.globalData.userInfoRet,
    //             wxcache:this.globalData.wxcache,
    //         },
    //         success:res=>{
    //           console.log(res);
    //           this.globalData.wxcache = null;
    //           this.LoginData.updatinguser = false;
    //          // this.LoginData.username = this.globalData.userInfo.nickName;
    //           if (this.LoginData.username.length == 0) {
    //             this.LoginData.username = 'unkown name';
    //           }
    //           //this.onLoginOk(true);
    //         },
    //         fail:res=>{
    //           console.log('wx update user failed!');
    //           this.LoginData.updatinguser = false;
    //          // this.onLoginOk(true);
    //         }
    //     });
    //     //return ;
    //   }
    //
    //
    //   //this.LoginData.username = this.globalData.userInfo.nickName;
    //   //this.loginData.useravatar = this.globalData.userInfo.avatarUrl;
    //   if (this.LoginData.username.length == 0){
    //     this.LoginData.username = 'unkown name';
    //   }
    // }
    // if (!(this.LoginData.sessioncookie.length > 10
    // && this.LoginData.username.length > 0)){
    //   console.log('onLoginOk, not got username');
    //     return;
    // }
    this.LoginData.loginok = true;
    console.log('set LoginData loginok');
    if (this.userInfoReadyCallback) {
      this.userInfoReadyCallback(null)
    }
    if (bsave){
      this.saveLoginData();
    }
    
  },
  saveLoginData:function(){
    wx.setStorageSync('username', this.LoginData.username);
    wx.setStorageSync('sessioncookie', this.LoginData.sessioncookie);
    wx.setStorageSync('useravatar', this.LoginData.useravatar);
    wx.setStorageSync('userid', this.LoginData.userid);
  },
  readLoginData:function(){
    //！本地读取，防止和网页版使用同一cookie
    //! 未知原因，这里本地存储很容易导致未登录。
    //! cjy: 因为index的onshow会 dologin，这里可以安全登陆

    this.LoginData.userid = wx.getStorageInfoSync('userid') || 0;
 //   if (this.LoginData.userid)
    {
        this.LoginData.sessioncookie = wx.getStorageSync('sessioncookie') || '';
        this.LoginData.username = wx.getStorageSync('username') || '';
        this.LoginData.useravatar = wx.getStorageInfoSync('useravatar') || '';
    }
  },
  dowxlogin:function(){
    // 登录

    if (this.LoginData.wxloginstate){
      console.log('in wxlogin, return');
      return;
    }

    if (this.WebLoginData.loginfail){
      this.LoginData.wxloginok = false;
    }

    if (this.LoginData.wxloginok){
      let curtime = new Date().getTime();
      //! 最短重登间隔：10分钟
      if (curtime - this.LoginData.wxlogintime <= 10 * 60 * 1000){
          console.log('wxloginok, return');
          return;
      }
    }
      console.log("dowxlogin");
    this.LoginData.wxloginstate = 1;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res.code);
        console.log("dowxlogin, wx success");
        this.LoginData.errcode = 0;
        wx.request({
          // cjy: 务必使用新接口登录：  wxapplogin
          url: this.getapiurl('/api/weixin/wxapplogin'),
          method: 'POST',
          data: {
            code: res.code,
            cookie:this.LoginData.sessioncookie,
          },
          success: res => {
            // console.log(res);
            //  console.log(this);
            console.log('wx login ret:' + res.data.code);
            console.log(res.data);
            this.LoginData.wxloginstate = 0;
            if (res.data.code == 0) {
              this.LoginData.wxlogintime = new Date().getTime();
              this.LoginData.wxloginok = true;
              this.globalData.wxcache = res.data.data.wxcache;
              this.LoginData.userid = res.data.data.userid;
              if (res.data.data.cookie && this.LoginData.sessioncookie != res.data.data.cookie){
                //! 
                this.LoginData.sessioncookie =res.data.data.cookie;
                this.LoginData.username = "";

              }

                this.onLoginOk(true);

            }
            else {
              console.log(res);
              this.LoginData.errcode = -1;
            }
          },
          fail: res => {
            console.log('my wx login failed');
            console.log(res)
            this.LoginData.wxloginstate = 0;
          }
        }
        );
      },
      fail:res=>{
        console.log('wxlogin fail');
        this.LoginData.wxloginstate = 0;
      }
    })
  },
    doNewUserLogin:function(){
       // this.loginData.pendingnewuserlogin = true;
        //this.dowxlogin();
    },
    getUserInfo:function(){

        if (!this.globalData.wxcache){
          this.dowxlogin();  //! 先微信登陆
          return;
        }

        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        wx.getUserInfo({
            withCredentials:true,
            success: res => {
                // 可以将 res 发送给后台解码出 unionId
                console.log(res);
                this.globalData.userInfo = res.userInfo;
                this.globalData.userInfoRet = res;

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                this.onLoginOk(true);
            }
        })
    },
  onLaunch: function (options) {
    // 展示本地存储能力
   // var logs = wx.getStorageSync('logs') || []
  // logs.unshift(Date.now())
   // wx.setStorageSync('logs', logs)
   console.log('onlaunch');

  if (options){
    console.log("[onLaunch] 本次场景值:", options.scene)
    this.LoginData.appscene = options.scene;
  }
  

    this.initWebEvent();

    this.readLoginData();

    this.onLoginOk(false); //! 第一次测试

    this.dowxlogin();
    
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //        this.getUserInfo();
    //     }
    //   }
    // })

    console.log('onlaunch end');
  },
  globalData: {
    userInfo: null,
        userInfoRet:null,
      wxcache:null,  //! 服务器返回的用于获取uninoid的数据
  },
  isfullurl:function(url){
    if (url.indexOf('http://')> -1
    || url.indexOf('https://') > -1
    ){
      return true;
    }
    return false;
  },
  getfullurl:function(subpath){
    if (this.isfullurl(subpath)){
      return subpath;
    }
    let rootpath = 'http://' + this.LoginData.testserver +':' + this.LoginData.testport;
    if (this.LoginData.publishserver){
      rootpath = this.getpublishurl();
    }
    rootpath += subpath;
  //  console.log(rootpath);
    return rootpath;
  },
  getapiurl:function(subpath){
    if (this.isfullurl(subpath)){
      return subpath;
    }
    let rootpath = 'http://'+ this.LoginData.testapiserver +':' + this.LoginData.testapiport;
    if (this.LoginData.publishserver){
      rootpath = this.getpublishurl();
    }
    rootpath += subpath;
    return rootpath;
  },
  getfileurl:function(subpath){
    return this.getapiurl(subpath);
  }
  ,getmainpage:function(szquery){
    let mainurl = this.getfullurl('/');
    mainurl += szquery;
    return mainurl;
  }




  
  ,WebLoginData:{
    isdoing:false,
    connected:false,
    logined:false,
    logining:false,
    loginfail:false,
    reconnectTimer:null,
    lockReconnect:false,
    reconnectNum:0,
    loginCookie:'',
  },
  getapptitle:function(){
    return '云平台';
  },
  getwebserver: function () {
    let rootpath = 'ws://' + this.LoginData.testapiserver + ':9983';
    if (this.LoginData.publishserver) {
      rootpath = 'wss://' + this.LoginData.publishserver + ':444';
    }
    return rootpath;
  },
  //建立websocket连接
  startWebLogin(){
    
    if (this.LoginData.sessioncookie.length < 10){
      console.log('startweblogin invalid sessioncookie');
      return;
    }
    if (!this.WebLoginData.connected){
      console.log('startweblogin not connected');
      return;
    }
    if (this.WebLoginData.logining){
      console.log('startweblogin logining');
      return;
    }
    if (this.WebLoginData.logined){
      console.log('startweblogin logined');
      return;
    }
    console.log('startweblogin');
    this.WebLoginData.logining = true;
    this.WebLoginData.loginfail = false;
    this.WebLoginData.loginCookie = this.LoginData.sessioncookie;
    let loginmsg = {
      cmd:'login',
      data:{
        cookie:this.WebLoginData.loginCookie,
        role:'weixin'
      }
    };
    wx.sendSocketMessage({
      data:JSON.stringify(loginmsg),
      fail:res=>{
        console.log('startweblogin send login msg failed:');
        console.log(res);
        this.closeWeb();
      }
    });
  },
  onWebLoginOk(){
    if (this.userInfoReadyCallback) {
      this.userInfoReadyCallback(null);
    }
  },
  startWebConnect() {
    return false; //! cjy wx不再ws连接
    if (this.WebLoginData.isdoing){
      return false;
    }
    if (this.WebLoginData.connected){
      //! try login
      this.startWebLogin();
      return false;
    }
   // console.log('startwebconnect:loginfail:'+this.WebLoginData.loginfail +  " " + 
  //  this.WebLoginData.loginCookie)
    if (this.WebLoginData.loginfail && this.WebLoginData.loginCookie == this.LoginData.sessioncookie){
      console.log("fail sessioncookie, not connect");
      return false;
    }
    this.WebLoginData.isdoing = true;
    var that = this
    let serverurl = this.getwebserver();
    console.log('startwebconnect:'+serverurl);
    wx.connectSocket({
      url: serverurl,
      success:res=> {
        console.log("web connect ok, doing:"+this.WebLoginData.isdoing);
       // if (this.WebLoginData.isdong)
        
      },
      fail:res=>{
        this.WebLoginData.isdoing = false;
      }
    })
    return true;
  },
  closeWeb(){
    console.log("closeWeb");
    wx.closeSocket();
    this.onWebDisconnect();
    this.reconnectWeb()
  },
  webNavToWeb(url, title, argobj){
   
    let szarg = JSON.stringify(argobj);
    console.log('webnavtoweb:' + url + ' args:' +szarg);
    let szquery = '?args=' + encodeURIComponent(szarg);
    let showurl = url;
    showurl += szquery;
    console.log('navtoweb:'+ showurl);
    let argurl = '/pages/web/page?url=' + encodeURIComponent(showurl);
    argurl += '&title=' + encodeURIComponent(title);
    wx.navigateTo({
      url:argurl
    });
  },
  onloginfailed(){
     {
      this.WebLoginData.loginfail = true;
      this.WebLoginData.logining = false;
      this.closeWeb();
    }
  },
  parseWebMessage(data){
    try{
      let objdata = JSON.parse(data)
      
      if (objdata.cmd == 'loginresult'){
        
        this.WebLoginData.logining = false;
        if (objdata.code == 0){
          console.log('weblogin ok');
          this.WebLoginData.logined = true;
          this.onWebLoginOk();
        }
        else{
          //this.WebLoginData.loginfail = true;
          this.onloginfailed();
          console.log('loginresult:' + data);
        //  conole.log('loginfailed:' + data);
        }
      }
      else if (objdata.cmd == 'pingcestart'){
        this.webNavToWeb('/#/PingCeing', '评测', objdata);
      }
      else if (objdata.cmd == 'kickout'){
        //! 被踢出，视为登陆失败， 防止再自动重连
        //! 一般出现在开发环境真机调试
        this.WebLoginData.loginfail = true;
      }
      else{
        console.log('recv undeal web msg:'+data);
      }
    }catch(e){
      
      console.log('websocket parsewebmsg,msg:'+ data + ' !err:'+e);
      if (this.WebLoginData.logining){
        this.onloginfailed();
      }
    }
  },
  //绑定事件
  initWebEvent() {
    var that = this
    wx.onSocketMessage((res) => {
      this.parseWebMessage(res.data);
      // if (res.data == "pong") {
      //   that.reset()
      //   that.start()
      // } else {
      //   that.globalData.callback(res)
      // }
    })
    wx.onSocketOpen(() => {
      console.log('WebSocket连接打开')
      //that.reset()
      //that.start()
      that.onWebConnect();
    })
    wx.onSocketError((res) => {
      console.log('WebSocket连接打开失败')
      that.onWebDisconnect();
      that.reconnectWeb()
    })
    wx.onSocketClose((res) => {
      console.log('WebSocket 已关闭！')
      that.onWebDisconnect();
      that.reconnectWeb()
    })
  },
  onWebConnect(){
    {
      this.WebLoginData.connected = true;
      this.WebLoginData.isdoing = false;
      this.WebLoginData.lockReconnect = false;
      if (this.WebLoginData.reconnectTimer) {
        clearTimeout(this.WebLoginData.reconnectTimer);
        this.WebLoginData.reconnectTimer = null;
      }
      
      this.startWebLogin();
    }
    
  },
  onWebDisconnect(){
      this.WebLoginData.logining = false;
      this.WebLoginData.logined = false;
      this.WebLoginData.isdoing = false;
      this.WebLoginData.connected  = false;
      this.WebLoginData.lockReconnect = false;
  },
  firstWebConnect(){

    //！ cjy: websock 连接移到网页
    return;

      //! 清空当前的logincookie
      this.WebLoginData.loginCookie = '';
      this.startWebConnect();
      this.reconnectWeb(); //! 启动定时器连接
  },
  //重新连接
  reconnectWeb() {
    var that = this;
    this.WebLoginData.reconnectNum = 0;
    if (that.WebLoginData.lockReconnect) return;
    that.WebLoginData.lockReconnect = true;
    if (that.WebLoginData.reconnectTimer){
      clearTimeout(that.WebLoginData.reconnectTimer)
    }
    {//连接10次后不再重新连接?
      that.WebLoginData.reconnectTimer = setTimeout(() => {
        that.WebLoginData.lockReconnect = false;
        if (that.startWebConnect()){
          this.WebLoginData.reconnectNum = this.WebLoginData.reconnectNum + 1
          console.log("重连次数:" + this.WebLoginData.reconnectNum)
        }
        
      }, 5000);//每隔5秒连接一次
      
    }
  },
  //! tudo. 加心跳包？
})