// pages/files/view.js

const util = require('../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileurl: '',
    loading: false,
    isImg: false,
    isVideo:false,
    isAudio:false,
    isDoc:false,
    fileObj: {
      name: '',
      fileIcon: ''
    },
    showtype:'',
    docstate:'下载中...',
    downok:false,
    localfile:''
  },

  getshowtype:function(ftype){
    if (ftype == 'ppt' || ftype=='docx' || ftype == 'xlsx'
    || ftype == 'pdf'){
      return 'doc';
    }
    else if (ftype == 'mp4'){
      return 'video';
    }
    else if (ftype == 'mp3'){
      return 'audio';
    }
    return '';
  },

  viewdoc:function(){
    console.log('viewdoc');
    wx.openDocument({
      filePath: this.localfile
    })
  },

  isios:function(){
    try {
      const res = wx.getSystemInfoSync()
      // console.log(res);
      // console.log(res.model)
      // console.log(res.pixelRatio)
      // console.log(res.windowWidth)
      // console.log(res.windowHeight)
      // console.log(res.language)
      // console.log(res.version)
      // console.log(res.platform)
      if (res.platform == 'ios') {
        return true;
      }
    } catch (e) {
      // Do something when catch error
    }
    return false;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // app.dowxlogin();
    let args = util.parseNativeArgs(options.args);
    console.log(args);
    let argobj = args.argobj;
    let url = '';
    let ftype = '';
    let showname = '';
    let filesize = 0;

    if (args.funname == 'jsFileLink') {
      url = argobj.downurl;
      ftype = 'file';
      ftype = util.getFileType(url);
     // console.log(ftype);
      if (argobj.name){
        showname = argobj.name;
      }
      if (argobj.filename){
        showname = argobj.filename;
      }
      if (argobj.filesize){
        filesize = argobj.filesize;
      }
    }
    else if (args.funname == 'jsUrlLink'){
      //！ 网页链接
      url = argobj.url;
      ftype = 'link';
    }
    let imgico = util.getFileTypeIcon(ftype);
    let showtype = this.getshowtype(ftype);
    if (showtype == 'doc'){
      //! 只针对小文档自动下载
      if (filesize > 0 && filesize < 3*1024*1024){ 
      }
      else{
        showtype = '';
      }
    }
    //console.log(imgico);
    //console.log(filesize);
    this.setData({
      fileObj:{
        fileIcon:imgico,
        name:showname
      },
      fileurl:url,
      showtype:showtype,
      isVideo:showtype=='video',
      isAudio:showtype=='audio',
      isDoc:showtype=='doc'
    })
    if (showtype == 'doc'){
      console.log('begin downloadfile:'+url);
      let downobj = {
        // 下载为临时文件
        url: url,
        success: (res) => {
          let filePath = res.tempFilePath
          if (res.filePath){
            filePath = res.filePath;
          }
          console.log('download ok, filepath:' + filePath);
          wx.openDocument({
            filePath: filePath,
            success:  (res)=> {
              console.log('打开文档成功');
              this.setData({
                downok:true,
                localfile:filePath
              })
              if (!this.isios()){
                wx.navigateBack();
              }
             // 
            },
            fail: (res) => {
              console.log('open doc failed:');
              console.log(res);
              let sztip = '打开文档失败：' + res.errMsg;
              this.setData({
                docstate:sztip
              })
            }
          })
        },
        fail: (res) => {
          console.log('down file failed');
          this.setData({
            docstate:'下载失败！'
          })
        }
      };
      if (showname.length > 0 && !this.isios()){
        //！ 加上url后缀，防止不能正常打开
        let ipos = url.lastIndexOf('.');
        let localname = showname;
        if (ipos > 0){
          localname += url.substr(ipos);
        }
        downobj.filePath = wx.env.USER_DATA_PATH + '/' + localname;
      }
      wx.downloadFile(downobj);
    }
  },
  Error: function (e) {
    this.setData({
      fileObj: {
        fileIcon: 'file_default.png'
      }
    })

  },
  copyUrl: function (e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.fileurl,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
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
      if (this.data.downok){
        wx.navigateBack()
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
  // onShareAppMessage: function () {
  //
  // }
})