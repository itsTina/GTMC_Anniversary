/**
 * Created by kevin on 2017/1/3.
 */

function wxShare() {
    $(function() {
        $.ajax({
            type: "POST",
            url: "http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/2018birthday/do/?q=api/wechat/jsapi_sign",
            data: {url:location.href},
            dataType: 'json',
            success: function(json) {
                var data = json.data;
                if (json.code == 1) {
                    wx.config({
                        debug: false,
                        appId: data.appId, // 必填，公众号的唯一标识
                        timestamp: data.timeStamp, // 必填，生成签名的时间戳
                        nonceStr: data.nonceStr, // 必填，生成签名的随机串
                        signature: data.signature, // 必填，签名，见附录1
                        jsApiList: [
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage'
                        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });

                    wx.ready(function() {
                        setupShareInfo();
                    });
                    setupShareInfo();
                } else {
                    alert('服务器繁忙，请稍后再试');
                }
            }
        });
    });
    function postShare  (){
    $.ajax({
      type: 'POST',
      url: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/2018birthday/do/?q=api/share/store',
      data: {
        url: shareInfo.link
      },
      dataType: 'json',
      success: function (result) {
        console.log(result);
      }
    });
  };

    var defaultShareInfo = {
            title: '分享的标题- default',
            link: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/demo/index.html',
            imgUrl: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/demo/img/share.jpg',
            desc: '分享描述信息在这里【摘要】- default'
    };

    if (typeof shareInfo == 'undefined'){
        shareInfo = defaultShareInfo;
    }

    function setupShareInfo() {
        console.log('config wx share info');
        wx.onMenuShareTimeline({
            //sharefun()
            title: shareInfo.timeLineTitle|| shareInfo.title,
            link: shareInfo.link,
            imgUrl: shareInfo.imgUrl,
            trigger: function(res) {
                //alert('用户点击分享到朋友圈');
              postShare();
            },
            success: function(res) {
                //alert('已分享');
            },
            cancel: function(res) {
                //alert('已取消');
            },
            fail: function(res) {
                //alert(JSON.stringify(res));
            }
        });

        //alert('已注册获取“分享到朋友圈”状态事件');
        wx.onMenuShareAppMessage({
            title: shareInfo.title,
            link: shareInfo.link,
            imgUrl: shareInfo.imgUrl,
            desc: shareInfo.desc,

            trigger: function(res) {
                //alert('用户点击发送给朋友');
              postShare();
            },
            success: function(res) {
                //alert('已分享');
            },
            cancel: function(res) {
                //alert('已取消');
            },
            fail: function(res) {
                //alert(JSON.stringify(res));
            }
        });
    }

    window.setupShareInfo = setupShareInfo;

}

wxShare();

