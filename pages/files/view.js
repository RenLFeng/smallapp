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
    fileObj: {
      name: '',
      fileIcon: ''
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // app.dowxlogin();
    let args = util.parseNativeArgs(options.args);
    console.log(args);
    if (args.funname == 'jsFileLink') {
      wx.showLoading({
        title: '加载中',
      })
      // this.data.fileurl = args.argobj.downurl;
      // console.log(this.data.fileurl);
      let fullurl = app.getfileurl(args.argobj.url);
      this.setData({
        fileurl: fullurl,
      })
      if (args.argobj.ftype == 'file') {
        if (args.argobj.finttype == 1) {
          this.setData({
            isImg: true,
            fileObj: {
              fileIcon: fullurl,
              name: args.argobj.name,
            }
          });
        } else if (args.argobj.finttype == 0) {
          this.setData({
            fileObj: {
              fileIcon: util.getFileType(args.argobj.name),
              name: args.argobj.name,
            }
          });
        }
      } else if (args.argobj.ftype == 'link') {
        this.setData({
          fileObj: {
            fileIcon: 'it.svg',
            name: args.argobj.name,
          }
        });
      }
      wx.setNavigationBarTitle({
        title: '文件查看'
      })
      wx.hideLoading();
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
  onShareAppMessage: function () {

  }
})