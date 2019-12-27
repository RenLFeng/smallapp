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
const filetypeArr = ["txt", "rar", "xlsx", "docx", "ppt", "pdf"];
const getFileType = type => {
  let r = '';
  for (let item of filetypeArr) {
    if (type.includes(item)) {
      r = item;
      return r + '.svg';
    }
    if (
      type.includes("doc") ||
      type.includes("rtf")
    ) {
      r = 'docx';
      return r + '.svg';
    }
    if (type.includes("zip")) {
      r = 'rar';
      return r + '.svg';
    }
    if (type.includes("xls")) {
      r = 'xlsx';
      return r + '.svg';
    }
  }
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
module.exports = {
  formatTime: formatTime,
  parseNativeArgs: parseNativeArgs,
  getFileType: getFileType,
  Whatweek:Whatweek
}