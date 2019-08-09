define(["jquery","wjs","public","wui"],function($,wjs,public){
    //生成时间戳
    let timestamp = new Date().getTime()
    //生成随机字符串
    function randomString(len) {
        len = len || 32;
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
        var maxPos = chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    let nonceStr = randomString(16)
    //登录函数
    function authorize(code, timestamp) {
        $.showLoading("加载中")
        $.ajax({
            url: public.baseUrl + "/api/third/aliAuth",
            method: "POST",
            async: false,
            data: {
                code: code,
                timestamp: timestamp,
                deviceType: "3"
            },
            dataType: "json",
            success: function (res) {
                $.hideLoading();
                if (res.code == 200) {
                    let openid = res.data
                    localStorage.setItem("openid", openid)
                }
            }
        })
    }

    return {
        randomString:randomString,
        authorize:authorize,
        nonceStr:nonceStr,
        timestamp: timestamp
    }
})
