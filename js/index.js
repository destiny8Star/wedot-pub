requirejs.config({
    baseUrl: "js/",
    paths: {
        "flex": "apps/flexible",
        "public": "apps/public",
        "swx": "apps/setWx-config",
        "jquery": "https://code.jquery.com/jquery-3.2.1.min",
        "wui": "https://cdn.bootcss.com/jquery-weui/1.2.1/js/jquery-weui.min",
        "wjs": "http://res.wx.qq.com/open/js/jweixin-1.4.0"
    },
    shim: {
        "wui": {
            deps: ['jquery'],
        },
    }
})
requirejs(["jquery", "wui", "flex", "wjs", "public", "swx"], function ($, wui, flex, wjs, public, swx) {
    //时间戳
    let timestamp = public.getTimes()
    //获取地址栏参数
    var code = public.getUrlParms("code");
    var zeroUserId = public.getUrlParms("zeroUserId");
    var zeroUserIdzl; //助力的zeroUserId，从详情里获取
    var userId = public.getUrlParms("userId");
    var info; //当前分享的信息 
    console.log('code', code)
    //获取openid
    let openid = localStorage.getItem("openid");
    if (!openid) {
        swx.authorize(code, timestamp)
        openid = localStorage.getItem("openid");
    }
  //获取商品详情
    function getInfo(timestamp, userId, zeroUserId){
      $.showLoading("加载中")
      $.ajax({
          url: public.baseUrl + "/api/zero/shareGoodsDetail",
          method: "POST",
          async: false,
          data: {
              userId: userId,
              zeroUserId: zeroUserId,
              timestamp: timestamp,
              deviceType: "3"
          },
          dataType: "json",
          success: function (res) {
              console.log("商品详情",res)
              $.hideLoading();
            if(res.code==200){
               info=res.data;
                zeroUserIdzl = info.zeroUserId
                $(".good-img").attr({ src: info.url})
                $(".goods-name").text(info.goodsTitle)
                $(".per-num").text(info.num)
                $(".pri-num").text("￥"+info.price)
                let str=""
                switch (info.process){
                    case 0: str +='<img src="img/ZL.png" alt="">';
                    break;
                    case 1: str += '<img src="img/ZL-1.png" alt="">';
                    break;
                    case 2: str += '<img src="img/ZL-2.png" alt="">';
                    break;
                    case 3: str += '<img src="img/ZL-3.png" alt="">';
                    break;
                    case 4: str += '<img src="img/ZL-4.png" alt="">';
                    break;
                }
                $(".top-zlper").html(str)
                let imgs=""
                imgs += '<img src="' + info.urlDetailOne + '" alt=""><img src="' + info.urlDetailTwo +'" alt="">';
                $(".detailbg").html(imgs)
                if (info.process==4){
                    $(".top-btn").html('<button class="weui-btn btn-wc">已完成助力</button>')
                }else{
                    $(".top-btn").html('<button class="weui-btn btn-zl">我要给他助力</button>')
                }
            }else{
                $.toast(res.message,"forbidden")
            }
            
          }
      })
  }
    getInfo(timestamp, userId, zeroUserId)

  //我要给他助力
    $(".btn-zl").click(function(){
        $(".mask").show()
    })
  //获取验证码
    let flag=true
    let reg = /^1\d{10}$/ 
    $(".getcode").click(function(){
        let mobile = $(".in-name").val()
        if (mobile) {
           let isp=reg.test(mobile)
            if(!isp){
                $.toast("请输入正确手机号", "cancel")
                return 
            }
             if(flag){
                 flag=false
                 let num = 60;
                 console.log("aaa")
                 $(this).addClass("nocode").text("重新获取 (" + num + "S)")
                 let intTime = setInterval(function () {
                     num--;
                     if (num > 0) {
                         $(".nocode").text("重新获取 (" + num + "S)")

                     } else {
                         clearInterval(intTime)
                         num = 0;
                         $(".nocode").removeClass("nocode").text("获取验证码")
                         flag=true
                     }

                 }, 1000)
                public.getPCode(mobile)
            }
           
        } else {
            $.toast("请输入手机号","cancel")
        }
    })
    //不助力
    $(".nohelp").click(function(){
        $(".mask").hide()
    })
    //助力
    $(".btn-to").click(function(){
        $.showLoading("加载中")
        let mobile = $(".in-name").val()
        let code = $(".in-code").val()
        $.ajax({
            url: public.baseUrl + "/api/zero/friendCheck",
            method: "POST",
            data: {
                mobile: mobile,
                mobileAuthCode:code,
                timestamp: timestamp,
                deviceType: "3",
                zeroUserId: zeroUserIdzl,
                userId: userId
            },
            dataType: "json",
            success: function (res) {
                $.hideLoading();
                if(res.code==200){
                    $.toast(res.message, function () {
                        $(".top-zlper").html('<div class="zl-wc">感谢您已助力成功!</div>')
                        $(".top-btn").html('<button class="weui-btn btn-lq">我也要0元领取</button>')
                        $(".mask").hide()
                    })
                    // getInfo(timestamp, "4c6295a3d8af4623becb469d98054858", 1)
                } else if (res.code == 6014) {
                    $.toast(res.message, "forbidden",function(){
                        $(".top-zlper").html('<div class="zl-wc">您已帮其他朋友助力过!</div>')
                        $(".top-btn").html('<button class="weui-btn btn-lq">我也要0元领取</button>')
                        $(".mask").hide() 
                    })
                }else{
                    $.toast(res.message,"forbidden",function(){
                        $(".mask").hide()
                    })
                }
                console.log("code", res)
            }
        })
    })
    //我也要零元拿
  
    $(".top-btn").on('click','.btn-lq',function(){
        window.location.href ="http://test.dianjishenghuo.cn/#/landing?states=1&mobile="+info.mobile
    })
   
})