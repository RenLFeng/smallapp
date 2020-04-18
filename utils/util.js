const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


//! cjy: 得到签到方式的描述
const signGetTypeDesc = signnum=>{
  if (signnum == 2){
    return '位置签到';
  }
  else if (signnum == 1){
    return 'WIFI签到'
  }
  else if (signnum == 100){
    return '教师设置'
  }
  else if (signnum == 99){
    return '已结束，不能签到'
  }
  return ''
}

const signGetStateDesc = signstate=>{
  if (signstate == 1){
    return '已签到';
  }
  else if (signstate == 2){
    return '迟到';
  }
  else if (signstate == 3){
    return '超时'
  }
  else if (signstate == 0){
    return '未签到';
  }
  return '';
}


const parseNativeArgs = sz => {
  let tsz = sz || '';
  tsz = decodeURIComponent(tsz);
  //console.log(tsz);
  try {
    let args = JSON.parse(tsz);
    return args;
  } catch (e) {
    console.log('parsenativeargs, exception:' + e);
  }
  return {
    funname: '',
    argobj: {}
  }
}

const imgsvgArr = ["txt", "rar", "xlsx", "docx", "ppt", "pdf"];

const getFileTypeIcon = (ftype)=>{
  let v = ftype;
  for(let fi of imgsvgArr){
    if (fi == v){
      return v + '.svg';
    }
  }
  if (v == 'link'){
    v = 'it';
  }
  else{
    v = 'file';
  }
  return v + '.svg';
}
const  timeWeekHummanread =v=>{
  let wobj = {
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六',
    0: '星期日'
  };
  if (wobj[v]) {
    return wobj[v];
  }
  return '';
}
const Whatweek =time=> {
  let date = new Date();
  if (time) {
    date = new Date(time);
  }
  var day = date.getDay();
  return timeWeekHummanread(day);
}
const getFileType = (namein) => {
  let r = '';
  let name = namein || '';
  if (name.length > 5) {
    name = name.substr(name.length - 6);
  }
  name = name.toLocaleLowerCase();
  if (name.includes('.rar') || name.includes('.zip')) {
    r = 'rar';
  }
  else if (name.includes('.doc') || name.includes('.docx') || name.includes('.rtf')) {
    r = 'docx';
  }
  else if (name.includes('.xlsx') || name.includes('.xls')) {
    r = 'xlsx';
  }
  else if (name.includes('.ppt') || name.includes('.pptx')) {
    r = 'ppt';
  }
  else if (name.includes('.pdf')) {
    r = 'pdf';
  }
  else if (name.includes('.txt')){
    r = 'txt';
  }
  else if (name.includes('.mp4')){
    r = 'mp4';
  }
  else if (name.includes('.mp3')){
    r = 'mp3';
  }
  return r;
}

module.exports = {
  formatTime: formatTime,
  parseNativeArgs:parseNativeArgs,
  getFileType:getFileType,
  getFileTypeIcon:getFileTypeIcon,
  Whatweek:Whatweek,
    signGetTypeDesc:signGetTypeDesc,
    signGetStateDesc:signGetStateDesc
}