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

// const filetypeArr=["txt", "rar", "xlsx", "docx", "ppt", "pdf"];
// const getFileType = type =>{
//   let r='';
//   for (let item of filetypeArr) {
//     if (type.includes(item)) {
//       r = item;
//       return r+'.svg';
//     }
//     if (
//       type.includes("doc") ||
//       type.includes("rtf")
//     ) {
//       r = 'docx';
//       return r+'.svg';
//     }
//     if (type.includes("zip")) {
//       r = 'rar';
//       return r+'.svg';
//     }
//     if (type.includes("xls")) {
//       r ='xlsx';
//       return r+'.svg';
//     }
//   }
// }

module.exports = {
  formatTime: formatTime,
  parseNativeArgs:parseNativeArgs,
  getFileType:getFileType,
  getFileTypeIcon:getFileTypeIcon
}
