/**
 *@author: mating
 *@date: 2018-08-25
 *@page: GMTC
 */
/**
 * rem自适应布局
 * 以设计稿宽度750为基础，1rem=100px，如标注图上文字大小为140px，css设置文字大小为1.4rem即可
 */
(function (doc, win) {
  // 获取浏览器滚动条宽度
  function getScrollbarWidth () {
    var odiv = doc.createElement('div');
    var styles = {
      width: '100px',
      height: '100px',
      overflowY: 'scroll'
    };
    for (var i in styles) odiv.style[i] = styles[i];
    doc.body.appendChild(odiv);
    var scrollbarWidth = odiv.offsetWidth - odiv.clientWidth;
    odiv.remove();
    return scrollbarWidth;
  }
  // 设置html的font-size
  var docEl = doc.documentElement;
  var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
  var pageWidth = 1080;
  var pageHeight = 1226*(1080/750);
  var recalc = function () {
    var scrollbarWidth = getScrollbarWidth();
    var docClientWidth = docEl.clientWidth || docEl.getBoundingClientRect().width;
    var docClientHeight = docEl.clientHeight || docEl.getBoundingClientRect().height;
    var winClientWidth = win.screen.width;
    var winClientHeight = win.screen.height;
    // 在微信开发者工具获取到的页面宽度竟然比屏幕分辨率还大，此时两者相较取小值
    var clientWidth = Math.min(docClientWidth, winClientWidth);
    var clientHeight = Math.min(docClientHeight, winClientHeight);
    if (!clientWidth) return;
    // 在小部分浏览器中滚动条宽度不为0，会占用页面宽度，会导致REM计算出错，所以需要在页面宽度中减掉滚动条宽度
    var fontSize = (clientWidth - scrollbarWidth) / pageWidth;
    if (fontSize * pageHeight > clientHeight) {
      fontSize = clientHeight / pageHeight;
    }
    docEl.style.fontSize = (100 * fontSize) + 'px';
  };
  if (!doc.addEventListener) return recalc();
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
$(function () {
  // var consoleTest = new VConsole();
  var zoomage;
  var cw = document.body.offsetWidth;
  var ch = document.body.offsetHeight;
  var audio = document.querySelector('#audio'), Orientation;
  var main = {
    imgTotal: 11,
    curImgCount: 0,
    curQuestion: 0,
    curBg: 0,
    bgPos: [{
      x: 95, y: 35, width: 570, height: 1010
    }, {
      x: 84, y: 42, width: 584, height: 1025
    }, {
      x: 95, y: 75, width: 570, height: 965
    }, {
      x: 115, y: 87, width: 510, height: 1000
    }],
    bgTxtPos: {
      name: {
        x: 200,
        y: 164 + 45,
        width: 366,
        height: 54
      },
      day: {
        x: 406,
        y: 926 + 27,
        width: 102,
        height: 34
      }
    },
    url: '',
    mySwiper: null,
    isPlaying: false,
    data: {
      name: 'mt',
      day: '1,222',
      department: '电商事业部',
      headimgurl: 'http://cloud.huaruntong.cn/web/activity/yld0420/images/logo.jpg?v=04'
    },
    imgIntervalId: null,
    generating: false,
    init: function () {
      var _this = this;
      this.initEvent();
      audio.volume =0.2;
      $('#pic-cnt-generate').css('height', ch + 'px');
      var resultCanvas = document.getElementById('result-canvas');
      resultCanvas.width = cw;
      resultCanvas.height = ch;
      this.getAuth();
      //FastClick.attach(document.body);
      $(document).on('WeixinJSBridgeReady', function () {
        if( _this.paused && !_this.isPlaying){
          audio.play();
          audio.volume = 0.2;
          _this.isPlaying = true;
        }
      });
      return;
    },
    imgLoading: function () {
      var _this = this;
      var total = 0, progress;
      $('img').each(function () {
        if (this.complete) {
          total++;
        }
      });
      _this.curImgCount = total;
      progress = 100 * _this.curImgCount / _this.imgTotal;
      if (_this.curImgCount >= _this.imgTotal) {
        clearTimeout(_this.imgIntervalId);
        $('.loading-text').html('100%');
        setTimeout(function () {
          $('#loading').addClass('hide');
          $('#swiper-container').removeClass('none');

        }, 100);
      } else {
        $('.loading-text').html((progress).toFixed(0) + '%');
        _this.imgIntervalId = setTimeout(function () {
          _this.imgLoading();
        }, 500);
      }
    },

    initEvent: function () {
      var _this = this;
      var face = document.getElementById('face');
      // 移动端兼容性判断 
      window.URL = window.URL || window.webkitURL;
      _this.imgLoading();
      $(document).on('touchend', function () {
        $('#people').removeClass('mask');
      });
      $(document).on('touchmove', function (event) {
        event.preventDefault();
      });
      $('.upload').on('change', function () {
        var file = this.files[0];
        if (window.URL) {

          _this.faceLoaded(window.URL.createObjectURL(file));
        } else {
          var read = new FileReader();
          read.readAsDataURL(file);
          read.onload = function () {
            var url = read.result;
            //face.src = url;
            _this.faceLoaded(url);
          };
        }
      });
      $('.startBtn').on('click', function () {
        _this.initSwiper();
        _this.initSvg();
        _this.mySwiper.slideNext();
        _this.initQuestion();
      });

      $('.question-next').on('click', function () {
        _this.initQuestion();
      });
      $('.user-next').on('click', function () {
        var p = $('.p3');
        p.find('.uploadBtn:first').removeClass('none');
        p.find('.uploaded').addClass('none');
        $('.tip').addClass('none');
        _this.mySwiper.slideNext();
        _this.initFace();
      });

      $('#generateBtn').on('click', function () {
        if (_this.generating) {
          return;
        }
        _this.generating = true;
        document.querySelector('#generateBtn').innerHTML = '生成中……';
        _this.generateImg();
      });

      document.getElementById('music').addEventListener('click', function () {
        var $p = $(this);
        $p.toggleClass('play');
        if ($p.hasClass('play')) {
          audio.play();
          _this.isPlaying=true;
        } else {
          audio.pause();
          _this.isPlaying=false;
        }
      });
    },
    faceLoaded: function (src) {
      var p = $('.p3');
      p.find('.uploadBtn:first').addClass('none');
      p.find('.uploaded').removeClass('none');
      $('.tip').removeClass('none');
      this.initZoom(src);
    },
    generateImg: function () {
      var _this = this;
      var resultSrc;
      // "matrix(1.49099, 0, 0, 1.49099, 45, 209)"
      var canvas = $('.backFace').find('canvas')[0], scaleX, scaleY, rotate, offsetX, offsetY;
      var backupCanvas = $('#backupCanvas')[0];
      backupCanvas.width = cw;
      backupCanvas.height = ch;
      var backupCx = backupCanvas.getContext('2d');
      if (zoomage) {
        scaleX = zoomage.scale.x != 1 ? zoomage.scale.x : zoomage.zoomD;
        scaleY = zoomage.scale.y != 1 ? zoomage.scale.y : zoomage.zoomD;
        rotate = zoomage.rotate.angle;
        offsetX = zoomage.moveXD;
        offsetY = zoomage.moveYD;
      }
      console.log(rotate);
      // html2canvas($('.backFace')[0]).then(function (canvas) {
      _this.generating = false;
      document.querySelector('#generateBtn').innerHTML = '生成海报';
      var result = document.getElementById('result-canvas');
      var cxRe = result.getContext('2d');
      var pos = _this.bgPos[_this.curBg];
      var imgRe = $('.resultImg').get(_this.curBg);
      var mNameLen, namePosX, mDayLen, dayPosX;
      var zoom = cw / imgRe.naturalWidth;
      var faceZoomX = (cw / imgRe.naturalWidth), faceZoomY = (ch / imgRe.naturalHeight);
      result.width = imgRe.naturalWidth;
      result.height = imgRe.naturalHeight;

      result.style.transform = 'scale(' + (cw / imgRe.naturalWidth) + ',' + (ch / imgRe.naturalHeight) + ')';
      result.style.transformOrigin = 'top left';
      // draw bg and face
      if (zoomage) {
        backupCx.save();
        backupCx.translate(offsetX, offsetY);
        backupCx.scale(scaleX, scaleY);
        backupCx.rotate(rotate * Math.PI / 180);
        backupCx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        cxRe.drawImage(backupCanvas, 0, 0, backupCanvas.width, backupCanvas.height, pos.x, pos.y, pos.width, pos.height);
        backupCx.restore();
      } else {
        cxRe.drawImage(canvas, 0, 0, canvas.width, canvas.height, pos.x, pos.y, pos.width, pos.height);
      }
      cxRe.drawImage(imgRe, 0, 0, imgRe.naturalWidth, imgRe.naturalHeight);
      // draw text(name and day)
      cxRe.font = '40px Georgia';
      cxRe.fillStyle = '#fff';
      mNameLen = cxRe.measureText(_this.data.name).width;
      namePosX = _this.bgTxtPos.name.x + (_this.bgTxtPos.name.width - mNameLen) / 2;
      cxRe.fillText(_this.data.name, namePosX, _this.bgTxtPos.name.x, _this.bgTxtPos.name.width);
      cxRe.fillStyle = '#daa956';
      cxRe.font = '40px Georgia';
      mDayLen = cxRe.measureText(_this.data.day).width;
      dayPosX = _this.bgTxtPos.day.x + (_this.bgTxtPos.day.width - mDayLen) / 2;
      cxRe.fillText(_this.data.day, dayPosX, _this.bgTxtPos.day.y, _this.bgTxtPos.day.width);
      _this.mySwiper.slideNext();
      resultSrc = result.toDataURL('image/png', 1);
      document.querySelector('#generateImg').src = resultSrc;
      _this.postImg(resultSrc);
      /* }, function () {
         _this.generating = false;
         $('#generateBtn').get(0).innerHTML = '生成海报';
       })*/
    },
    initZoom: function (src) {
      var people = $('#people');
      var cnt = document.getElementsByClassName('backFace')[0];
      var _this = this;
      $(cnt).empty();
      zoomage = new Zoomage({
        container: cnt,
        enableGestureRotate: true,
        dbclickZoomThreshold: 0.05,
        maxZoom: 10,
        minZoom: 0.08,
        Orientation:Orientation,
        onDrag: function (data) {
          people.addClass('mask');
        },
        onZoom: function (data) {
          people.addClass('mask');
        },
        onRotate: function (data) {
          people.addClass('mask');
        }
      });
      zoomage.load(src);
     /* var id = setInterval(function () {
        if (zoomage.imgTexture.complete) {
          clearInterval(id);
          if (navigator.userAgent.match(/iphone/i) && Orientation && Orientation!=1) {

            var expectWidth = this.naturalWidth;
            var expectHeight = this.naturalHeight;

            if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
              expectWidth = 800;
              expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
            } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
              expectHeight = 1200;
              expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
            }
            var canvas = zoomage.canvas;
            var ctx = zoomage.context;
            canvas.width = expectWidth;
            canvas.height = expectHeight;
            ctx.drawImage(zoomage.imgTexture, 0, 0, expectWidth, expectHeight);
            var base64 = null;
            //console.log('iphone');
            //alert(expectWidth + ',' + expectHeight);
            //如果方向角不为1，都需要进行旋转 added by lzk
            if(Orientation && Orientation != 1){
              //alert('旋转处理');
              switch(Orientation){
                case 6://需要顺时针（向左）90度旋转
                  //alert('需要顺时针（向左）90度旋转');
                  _this.rotateImg(zoomage.imgTexture,'left',canvas);
                  break;
                case 8://需要逆时针（向右）90度旋转
                  //alert('需要顺时针（向右）90度旋转');
                  _this.rotateImg(zoomage.imgTexture,'right',canvas);
                  break;
                case 3://需要180度旋转
                  //alert('需要180度旋转');
                  _this.rotateImg(zoomage.imgTexture,'right',canvas);//转两次
                  _this.rotateImg(zoomage.imgTexture,'right',canvas);
                  break;
              }
            }
          }
            zoomage.moveXD = 0;
           zoomage.rotate.angle = 0;

           zoomage.moveYD = Math.abs(ch - zoomage.canvas.height * zoomage.zoomD) * 0.4;
           zoomage._animate_Transform();
        }
      }, 500);*/
    },
    getAuth: function () {
      var _this = this;
      if (navigator.userAgent.indexOf('MicroMessenger') >= 0) {
        $.ajax({
          type: 'POST',
          url: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/2018birthday/do/?q=api/wechat/auth_check',
          data: {
            userinfo: 1,
            redirect_uri: location.href
          },
          dataType: 'json',
          success: function (result) {
            if (result.data.is_auth == 0) {
              location.href = result.data.auth_url;
            } else {
              _this.getUserInfo();
            }
          }
        });
      }
      this.record();
    },
    record: function () {
      $.ajax({
        type: 'POST',
        url: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/2018birthday/do/?q=api/visite/store',
        data: {},
        dataType: 'json',
        success: function (result) {
          console.log(result);
        }
      });
    },
    getUserInfo: function () {
      var _this = this;
      $.ajax({
        type: 'POST',
        url: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/2018birthday/do/?q=api/user',
        data: {},
        dataType: 'json',
        success: function (result) {
          console.log(result);
          // var result =result.data;
          if (result.code === 1) {
            _this.data = {
              name: result.data.gtmc_name,
              nickname: result.data.nickname,
              department: result.data.gtmc_department,
              headimgurl: result.data.headimgurl,
              day: result.data.entry_days.toLocaleString()
            };
            ['name', 'department'].forEach(function (x) {
              $('#' + x).text(_this.data[x]);
            });
            $('#avatar').attr('src', result.data['headimgurl']);

          } else {
            alert(result.msg);
          }
        }
      });
    },
    initSvg: function () {
      var polygon = document.getElementsByClassName('svg-p');
      var circle = document.getElementsByClassName('svg-c');
      var svg = document.getElementsByClassName('svg-main')[0];
      var zoom = parseFloat((ch / 667).toFixed(2));
      var svgWidth = 375 * (95 / 108);
      svg.style.width = svgWidth + 'px';
      svg.style.height = svgWidth + 'px';
      // svg.style.paddingTop = (0.88*ch - cw * (95 / 108)) + 'px';
      svg.style.transform = 'scale(' + zoom + ') translateX(-50%)';
      svg.style.webkitTransformOrigin = 'scale(' + zoom + ') translateX(-50%)';
      var width = (svgWidth - 90) || 300;
      var points = [], i, j, initX = 45, initY = 45;
      var length = 1;
      var x = width / 2, y = width / 2, r = width / 2;
      var growth = r / length; // 伸展比例
      var random, lineAxis = []; // 随机数
      var xAngle, yAngle;
      // 六边形
      for (i = 0; i < length; i++) {
        for (j = 0; j < 6; j++) {
          xAngle = Math.cos((j * 60) / 180 * Math.PI);
          yAngle = -Math.sin((j * 60) / 180 * Math.PI);
          /* */
          points.push((xAngle * r + x + initX) + ',' + (yAngle * r + y + initY));
          if (i == 0) {
            random = Math.min(0.38, Math.abs(0.38 - Math.random())) * r + 0.6 * r;
            lineAxis.push((xAngle * random + x + initX) + ',' + (yAngle * random + y + initY));
            circle[j].setAttribute('cx', xAngle * random + x + initX);
            circle[j].setAttribute('cy', yAngle * random + y + initY);
          }
        }
        r -= growth;
        points = [];
      }
      // 随机数生成六边形
      polygon[0].setAttribute('points', lineAxis.join(' '));
    },
    initFace: function () {
      var people = document.getElementById('people');
      var cx = people.getContext('2d');
      var bg = parseInt(Math.random() * 4) + 1;
      var img = $('.bgImg').get(bg - 1);
      this.curBg = bg - 1;
      document.getElementById('people').src = img.src;
      $('#generateImg').attr('class', 'g' + bg);
      people.width = img.naturalWidth;
      people.height = img.naturalHeight;
      people.style.transform = 'scale(' + (cw / img.naturalWidth) + ',' + (ch / img.naturalHeight) + ')';
      cx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.naturalWidth, img.naturalHeight);

    },
    initSwiper: function () {
      this.mySwiper = new Swiper('#swiper-container', {
        freeMode: false,
        allowTouchMove: false,
        loop: false,
        on: {
          init: function () {
            this.translate = 0;
          },
          slideChange: function () {
            if (this.activeIndex != 3) {
              $('.p3').addClass('none');
            } else {
              $('.p3').removeClass('none');
            }
            if (this.activeIndex == 4) {
              $('.p4').removeClass('none');
            } else {
              $('.p4').addClass('none');
            }
          },
          slideNextTransitionStart: function () {
          },
          slidePrevTransitionStart: function () {
          }
        }
      });
    },
    toast: function (str) {
      if (!window.__hint__) {
        window.__hint__ = (function () {
          var h = document.getElementById('hint');
          var content = h.querySelector('.h-content');
          var timer;

          function show (str) {
            if (timer) {
              content.innerText = str;
              close();
              return;
            }
            h.classList.add('in');
            content.innerText = str;
            setTimeout(function () {
              h.classList.add('fade');
            }, 0);
            close();
          }

          function close () {
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(function () {
              h.classList.remove('fade', 'in');
              timer = undefined;
            }, 1500);
          }

          return {
            show: show
          };
        })();
      }
      window.__hint__.show(str);
    },
    question: [{
      title: '部门会议开始，你会选择 坐在哪个位置?',
      data: ['A.靠近领导的位置', 'B.靠近门口的位置', 'C.角落或者后排座位']
    },
      {
        title: '<div class="question2">你偏好怎样的职场穿搭?</div>',
        data: ['A.霸道总裁风OR时尚女王风', 'B.佛系穿搭，怎么舒服怎么来', 'C.公司服装很好看，我喜欢']
      },
      {
        title: '职场上升，<br> 你的追求是什么？',
        data: ['A.打怪升级，快速进阶', 'B.耐心打磨，稳步提升', 'C.特立独行，与世无争']
      },
      {
        title: '赢得比赛，<br> 你觉得最重要的是什么？',
        data: ['A.队友的配合，团战可靠', 'B.优秀的主力', 'C.优秀的辅助']
      }],
    postImg: function (src) {
      $.ajax({
        type: 'POST',
        url: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/2018birthday/do/?q=api/work/store',
        data: {
          base64: src
        },
        dataType: 'json',
        success: function (result) {
          console.log(result);
        }
      });
    },
    requestQuestion: function (id, answer) {
      $.ajax({
        type: 'POST',
        url: 'http://gfwp.gac-toyota.com.cn/GTMCfamily/camp/2018birthday/do/?q=api/answer/store',
        data: {
          question_id: id,
          answer: ['A', 'B', 'C'][answer]
        },
        dataType: 'json',
        success: function (result) {
          console.log(result);
        }
      });
    },
    initQuestion: function () {
      var ul = $('.question');
      var cnt = $('.question-cnt');
      var currentAnser = false;
      var i = this.curQuestion;
      var data = this.question[i];
      var _this = this;
      ul.find('li').each(function (j, v) {
        currentAnser = $(v).find('input').get(0).checked;
        if (currentAnser) {
          _this.requestQuestion(i, j);
          return false;
        }
      });
      if (!currentAnser && i != 0) {
        this.toast('请选择');
        return;
      }
      if (!data) {
        if (this.curQuestion >= 4) {
          this.mySwiper.slideNext();
        }
        return;
      }
      cnt.find('.question-index').html('Q' + (i + 1) + '.');
      cnt.find('.question-title').html(data.title);
      ul.find('li').each(function (j, v) {
        $(v).find('label').html(data.data[j]);
        $(v).find('input').get(0).checked = false;
      });
      this.curQuestion++;
      if (this.curQuestion == 4) {
        $('.question-next').html('查看结果');
      }
    }
  };
  main.init();
});