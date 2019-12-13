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



const parseNativeArgs= sz=>{
  let tsz = sz||'';
  tsz = decodeURIComponent(tsz);
  //console.log(tsz);
  try{
    let args = JSON.parse(tsz);
    return args;
  }catch(e){
    console.log('parsenativeargs, exception:'+e);
  }
  return {
    funname:'',
    argobj:{}
  }
}
const filetypeArr=["txt", "rar", "xlsx", "docx", "ppt", "pdf"];
const getFileType = type =>{
  let r='';
  for (let item of filetypeArr) {
    if (type.includes(item)) {
      r = item;
      return r+'.svg';
    }
    if (
      type.includes("doc") ||
      type.includes("rtf")
    ) {
      r = 'docx';
      return r+'.svg';
    }
    if (type.includes("zip")) {
      r = 'rar';
      return r+'.svg';
    }
    if (type.includes("xls")) {
      r ='xlsx';
      return r+'.svg';
    }
  }
}

module.exports = {
  formatTime: formatTime,
  parseNativeArgs:parseNativeArgs,
  getFileType:getFileType
}
