let sharedCanvas;
let sharedContext;//共享离屏上下文

// let tempX, tempY, lastX, lastY;//临时记录位置
let currentLoadHeadCnt = 0;//当前加载完成头像个数
let dataList;//托管数据列表
let infoList = [];//好友信息列表
let rankType;//排行类型

let img; //背景
let centenrX = 0;//中心点X坐标
let centenrY = 0;//中心点X坐标

let rankPageIndex = 0;//排行榜页数

const STAST_HEIGHT = 10;//起始高度
const RANK_WIDTH = 0.1;//好友排行x值所在比例
const HEAD_ICON_WIDTH = 0.25;//头像框x值所在比例
const NICK_NAME_WIDTH = 0.42;//昵称x值所在比例
const COUNT_WIDTH = 0.85;//特戒数量x值所在比例
const SPACE_HEIGHT = 30;//间隔高度
const ICON_SIZE = 30;//头像大小 0、46、64、96、132
const ICON_GAP = ICON_SIZE +15; //头像间距
const RANKITEMNUM = 3;//每页排行榜显示数量

const FRIEND = 1;//好友排行
const GROUP = 2;//群组排行
const SCORE = 3;//发送分数


wx.onMessage(data => {

  console.log("收到主域消息:" + data);

  sharedCanvas = wx.getSharedCanvas();
  sharedContext = sharedCanvas.getContext('2d');
  centenrX = sharedCanvas.width / 2;
  centenrY = sharedCanvas.height / 2 + 30;

  sharedContext.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
  // sharedContext.fillStyle = '#ffffff'
  sharedContext.fillStyle = 'red'
  // sharedContext.fillRect(0, 0, 500, 500)
  
  if (data.msgType == FRIEND) {//好友排行
    console.log("好友排行")
    getRankPage(data.page);
    // getFriendRank();
  }
  else if (data.msgType == GROUP) {//群组排行

  }
  else if (data.msgType == SCORE) {//发送分数
    sendScore(data.score + "");
  }

  console.log("执行onMessage结束:");
})

/** 发送分数*/
function sendScore(scoreNum) {

  wx.setUserCloudStorage({
    KVDataList: [{ key: "rankScore", value: scoreNum }],

    success: function (res) {
      console.log("发送成功");
    },
    fail: function (res) {
      console.log("发送失败");
    },
    complete: function (res) {
      //console.log("发送完成");
    }
  })
}

/**获取好友排行榜页面 */
function getRankPage(page){
  if(page == 0){
    rankPageIndex = 0;
    getFriendRank();
  }else if(page == 1){
    console.log("下一页")
    if((rankPageIndex + 1) * RANKITEMNUM < dataList.length){
      rankPageIndex++
    }
    getPageDataList();
  }else if(page == -1){
    console.log("上一页")
    if(rankPageIndex == 0){
      rankPageIndex = 0
    }else{
      rankPageIndex--;
    }
    getPageDataList();
  }
  
}
/**获取好友排行榜 */
function getFriendRank(){
  wx.getFriendCloudStorage({
    keyList: ["rankScore"],
    success: function (res) {
      console.log("获取好友排行成功");
      dataList = res.data;
      console.log("好友排行数量=" + dataList.length)
      // let tempData1 = dataList[0];
      // dataList.push(tempData1)
      // let tempData2 = dataList[0];
      // dataList.push(tempData2)
      // let tempData3 = dataList[0];
      // dataList.push(tempData3)
      // let tempData4 = dataList[0];
      // dataList.push(tempData4)
      
      
      dataList.sort(compareScore)
      getPageDataList();
      // drawRankList(dataList)
    },
    fail: function (res) {
      console.log("获取好友排行失败");
    },
    complete: function (res) {
      // console.log("获取好友排行完成");
    }
  })
}
/**排行榜排序 */
function compareScore(a,b){
  let tempA = a.KVDataList[0].value;
  let tempB = b.KVDataList[0].value;
  console.log("------------排行对比--tempA="+tempA+",tempB="+tempB);
  return tempB - tempA;
}

/**获取当前页面数据 */
function getPageDataList(){
  let starIndex = rankPageIndex * RANKITEMNUM;
  let endIndex = starIndex + RANKITEMNUM;
  if (dataList.length < endIndex){
    endIndex = dataList.length;
  }
  infoList = [];
  for (var i = starIndex; i < endIndex; i++){
    console.log("----showindex="+i);
    infoList.push(dataList[i]);
  }
  drawRankList(infoList)

}
/**绘制排行榜数据 */
function drawRankList(data) {
  data.forEach((item, index) => {
    var userData = item;
    console.log("index="+index +",名称=" + userData.nickname)
    console.log("url=" + userData.avatarUrl)
    let scoreDataList = userData.KVDataList;
    console.log("score=" + scoreDataList[0].value);

    drawUserInof(index,item);
  })
}
/**绘制用户信息 */
function drawUserInof(index,userData){
  drawRenderIcon(index, userData.avatarUrl);
  drawRenderNickName(index, userData.nickname);
  drawRenderScore(index, userData.KVDataList[0].value);

  // drawRenderNickName(0, userData.nickname);
  // drawRenderNickName(1, userData.nickname);
  // drawRenderNickName(2, userData.nickname);

  // drawRenderScore(0, userData.KVDataList[0].value);
  // drawRenderScore(1, userData.KVDataList[0].value);
  // drawRenderScore(2, userData.KVDataList[0].value);
  
}

/**绘制渲染器头像*/
function drawRenderIcon(index, url) {

  let headImg = wx.createImage();
  // var urlIndex = url.lastIndexOf("/");
  // var sizeSrc = url.substring(0, urlIndex+1) + ICON_SIZE;
  // console.log("sizeSrc =" + sizeSrc);
  // headImg.src = sizeSrc;
  headImg.src = url;
  
  headImg.onerror = function () { console.log("头像加载失败:" + url) };
  let tempX = centenrX - 70;
  let tempY = centenrY + (index * ICON_GAP);
  headImg.onload = function () {
    sharedContext.drawImage(headImg, tempX, tempY,ICON_SIZE,ICON_SIZE);
  }

  if(rankPageIndex == 0){
    let numImg = wx.createImage();
    numImg.src = "game/img_di"+(index + 1)+".png";
    let tempImgX = tempX - 37;
    let tempIMgY = tempY;
    numImg.onload = function () {
      sharedContext.drawImage(numImg, tempImgX, tempIMgY, 31, 34.5);
    }

  }else{
    //名次
    sharedContext.fillStyle = '#000000';
    sharedContext.font = "16px Arial";

    let tempNumX = tempX - 25;
    let tempNumY = tempY + 20;
    let idNum = (rankPageIndex * RANKITEMNUM + index + 1) +"";
    sharedContext.fillText(idNum, tempNumX, tempNumY);
  }


}

/**绘制渲染器昵称*/
function drawRenderNickName(index, nickName) {

  sharedContext.fillStyle = '#000000';
  sharedContext.font = "12px Arial";
  let tempX = centenrX - 30;
  let tempY = centenrY + (index * ICON_GAP) +20;
  
  if (nickName.length > 5) {//目前名字最多显示7个

    sharedContext.fillText(nickName.slice(0, 5) + "...", tempX, tempY);
  }
  else {

    sharedContext.fillText(nickName, tempX, tempY);
  }
}
/**绘制渲染器分数*/
function drawRenderScore(index, scoreNum) {

  sharedContext.fillStyle = '#000000';
  sharedContext.font = "14px Arial";
  
  let tempX = centenrX + 50;
  let tempY = centenrY + (index * ICON_GAP) + 20;

  sharedContext.fillText(scoreNum, tempX, tempY);
  
}



