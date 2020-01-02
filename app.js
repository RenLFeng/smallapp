//app.js
App({
  LoginData:{
  //  publishserver:'www2.exsoft.com.cn', //! 正式服务器地址; 测试环境注释掉此行
    testserver:'192.168.40.104', //! 测试服务器ip
    testapiserver:'192.168.40.104', //! 测试服务器的api地址
    // testserver:'192.168.0.237', //! 测试服务器ip
    // testapiserver:'192.168.0.2', //! 测试服务器的api地址
    testapiport:9982,
    testport:8080, //8080,

    sessioncookie:'',
    username:'',
   // useravatar:'',
    loginok:false,
    wxloginok:false,
    errmsg:'',
    errcode:0,
    wxloginstate:0,  //! 登陆状态： 0:空闲； 1：登陆中  2：
      wxlogintime:0,
    updatinguser:false,
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
  onLoginOk:function(bsave){
    console.log('onLoginOk:'+bsave);
    if (!this.LoginData.sessioncookie.length) {
      //! wxlogin 尚未完成
      console.log('onLoginOk, null sessioncookie');
      return;
    }
    if (!(this.LoginData.username.length >0)
    && this.globalData.userInfo){
      if (this.LoginData.username.length == 0
      ){
        //! 首次登陆， 初始化数据， 完成后才登入页面
        if (this.LoginData.updatinguser){
         //! 正在更新中
          console.log('onLoginOk, in updateing user');
          return;
        }

        this.LoginData.updatinguser = true;
        console.log("wx update user");
        this.httpPost({
            url:this.getapiurl('/api/weixin/updateuser'),
            data:{
              user:this.globalData.userInfo
            },
            success:res=>{
              this.LoginData.updatinguser = false;
              this.LoginData.username = this.globalData.userInfo.nickName;
              if (this.LoginData.username.length == 0) {
                this.LoginData.username = 'unkown name';
              }
              this.onLoginOk(true);
            },
            fail:res=>{
              this.LoginData.updatinguser = false;
              this.onLoginOk(true);
            }
        });
        return ;
      }
      else{
        //! check是否需要同步用户信息
        //! 这里只考虑同步头像； 名字可能教学要求？ 或干脆后续不再做同步/ 仅在用户同步时才同步?
       
      }

      this.LoginData.username = this.globalData.userInfo.nickName;
      //this.loginData.useravatar = this.globalData.userInfo.avatarUrl;
      if (this.LoginData.username.length == 0){
        this.LoginData.username = 'unkown name';
      }
    }
    if (!(this.LoginData.sessioncookie.length > 10 
    && this.LoginData.username.length > 0)){
      console.log('onLoginOk, not got username');
        return;
    }
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
  },
  readLoginData:function(){
    //！本地读取，防止和网页版使用同一cookie
    //! 未知原因，这里本地存储很容易导致未登录。
    //! cjy: 因为index的onshow会 dologin，这里可以安全登陆
    this.LoginData.sessioncookie = wx.getStorageSync('sessioncookie') || '';
    this.LoginData.username = wx.getStorageSync('username') || '';
    this.LoginData.useravatar = wx.getStorageInfoSync('useravatar') || '';
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
        this.LoginData.errcode = 0;
        wx.request({
          url: this.getapiurl('/api/weixin/login'),
          method: 'POST',
          data: {
            code: res.code,
            cookie:this.LoginData.sessioncookie
          },
          success: res => {
            // console.log(res);
            //  console.log(this);
            console.log('wx login ret');
            this.LoginData.wxloginstate = 0;
            if (res.data.code == 0) {
              this.LoginData.wxlogintime = new Date().getTime();
              this.LoginData.wxloginok = true;
              if (this.LoginData.sessioncookie != res.data.data.cookie){
                //! 
                this.LoginData.sessioncookie =res.data.data.cookie;
                // this.LoginData.sessioncookie ='ebf9a94cac8ab1b135119dd3ed77032b';
                //！ 需要重新更新userinfo
                this.LoginData.username = "";
                this.onLoginOk(true);
              }
              //! 开始websock的连接
              //this.firstWebConnect();
            }
            else {
              console.log(res);
              this.LoginData.errcode = -1;
            }
          },
          fail: res => {

            console.log(res)
            this.LoginData.wxloginstate = 0;
          }
        }
        );
      },
      fail:res=>{
        this.LoginData.wxloginstate = 0;
      }
    })
  },
  onLaunch: function () {
    // 展示本地存储能力
   // var logs = wx.getStorageSync('logs') || []
  // logs.unshift(Date.now())
   // wx.setStorageSync('logs', logs)
   console.log('onlaunch');

    this.initWebEvent();

    this.readLoginData();

    this.onLoginOk(false); //! 第一次测试

    this.dowxlogin();
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              this.onLoginOk(true);
            }
          })
        }
      }
    })

    console.log('onlaunch end');
  },
  globalData: {
    userInfo: null
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