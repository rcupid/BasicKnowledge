var Bargain = (function (window, $, Validator) {
    /*验证插件*/
    var _v = new Validator();
    //函数字节流
    var _debounce = function (func, wait, immediate) {
        // immediate默认为false
        var timeout, args, context, timestamp, result;

        var later = function () {
            // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
            var last = (+(new Date())) - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = +(new Date());
            // 第一次调用该方法时，且immediate为true，则调用func函数
            var callNow = immediate && !timeout;
            // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
    };

    //构造函数
    var Bargain = function (opts) {
        this.settings = {
            wrapper: null,
            maskSelector: "#shadow_detail",
            maskZindex: 999,
            activeClass: 'btn-sub',
            carPrice: 0,
            islogin: false,
            mobile: undefined,
            submitCallback: null,
            zIndex: 1000,
            smsOpts: {
                smswrapperid: undefined,
                title: undefined,
                autoPlay: false,
                num: 60
            }
        };
        this.settings = $.extend({}, this.settings, opts);
        this.options = {};
    };
    //原型
    Bargain.prototype = {
        init: function () {
            this.initOptions();
            //this.initCss();
            this.bindEvent();
            this.bindData();
            this.showBargain();
        },
        showBargain: function () {
            var that = this,
                options = that.options;
            //显示遮罩
            options.mask.show().css("z-index", options.maskZindex);

            //显示浮层
            options.wrapper.show().css("z-index", options.zIndex);

            //var transition = "all 0.3s ease";
            //options.wrapper[0].style.webkitTransition = transition;
            //options.wrapper[0].style.Transition = transition;
            //setTimeout(function () {
            //    cssTransform(options.wrapper[0], "translateY", 0);
            //}, 10);

        },
        initOptions: function () {
            var settings = this.settings,
                wrapper = settings.wrapper;

            this.options = {
                islogin: settings.islogin,
                carPrice: settings.carPrice,
                mobile: settings.mobile,
                isValid: true,
                activeClass: settings.activeClass,
                mask: $(settings.maskSelector),
                maskZindex: settings.maskZindex,
                zIndex: settings.zIndex,
                wrapper: wrapper,
                price: wrapper.find('.bargain-price'),
                phone: wrapper.find('.bargain-phone'),
                submit: wrapper.find('.bargain-submit'),
                close: wrapper.find('.bargin-close'),
                alertWrapper: wrapper.find('.bargain-alert-wrapper'),
                alertTxt: wrapper.find(".bargin-alert-txt"),
                clearSelector: wrapper.find('.bargin-del')
            };

        },
        initCss: function () {
            var that = this,
                options = that.options;
            var height = options.wrapper.height();
            cssTransform(options.wrapper[0], "translateY", height);
        },
        bindData: function () {
            var options = this.options,
                carPrice = options.carPrice || 0;
            options.wrapper.find('.bargin-show-price').text(carPrice + "万");
            if (!!options.mobile) {
                options.phone.val(options.mobile);
                this.checkValidFunc(true);
            }
        },
        bindEvent: function () {
            var that = this;
            var options = that.options,
                price = options.price, //心理价格
                phone = options.phone, //手机号
                submit = options.submit; //砍价
            //价格
            var tempMoney = '';
            var timer = null;
            price.off("keydown").keydown(function () {
                if (options.isValid) {
                    tempMoney = price.val();
                }
            }).off("keyup").keyup(function (e) {
                if (!e.currentTarget.validity.valid) {
                    options.isValid = false;
                    // that.checkValidFunc(false);
                    that.alertShow("最多输入3位整数，2位小数");
                    price.val(tempMoney);
                    return false;
                }
                var money = $.trim(price.val());
                that.checkPrice(money);
            }).off("blur").blur(function () {
                var money = $.trim(price.val());
                that.checkPrice(money);
            });

            //手机号输入
            phone.keydown(_debounce(function () {
                var $this = $(this);
                var mobile = $this.val();
                that.checkPhone(mobile);
                if (!!mobile) {
                    that.showDelIcon(".bargain-phone");
                } else {
                    that.hideDelIcon(".bargain-phone");
                }
            }, 100));

            //清空输入内容
            options.clearSelector.click(function () {
                var $this = $(this),
                    clearTarget = $this.attr('data-target');
                if (!!clearTarget) {
                    setTimeout(function () {
                        that.checkValidFunc(false);
                    }, 0)

                    that.settings.wrapper.find(clearTarget).val('');

                }
            });

            //提交
            submit.off().click(function () {
                var money = $.trim(price.val());
                that.checkPrice(money);
                if (!options.isValid) { return false; }

                var mobile = $.trim(phone.val());
                that.checkPhone(mobile);

                if (!options.isValid) { return false; }

                if (options.islogin && mobile == that.settings.mobile) {
                    //登录的逻辑
                    var parameters = {
                        money: money,
                        mobile: mobile,
                        hide: function () {
                            that.hideBargain();
                        }
                    };

                    var submitCallback = that.settings.submitCallback;
                    typeof submitCallback === 'function' && submitCallback.call(that, parameters);
                } else {
                    //sms逻辑
                    that.triggerSmsInit(options);
                }
            });
            /*SMS*/

            //关闭
            options.close.off("click").click(function () {
                that.hideBargain();
            });
            //禁止滚动
            if (!!options.mask.length) {
                var timer = null;
                options.mask.on({
                    "touchstart": function () {
                        timer = setTimeout(function () {
                            that.hideBargain();
                        }, 300);
                    },
                    "touchmove": function (ev) {
                        ev.preventDefault();
                        window.clearTimeout(timer);
                    }
                })
            }
            options.wrapper.on("touchmove", function (ev) {
                ev.preventDefault();
            });
        },
        triggerSmsInit: function (options) {
            var mobile = $.trim(options.phone.val());
            if (options.islogin && mobile === this.settings.mobile) { return false; }
            var that = this,
                settings = that.settings,
                smsOpts = that.settings.smsOpts;
            if (!smsOpts.smswrapperid) { throw new Error('smsOpts.smswrapperid is undefined'); }

            smsOpts["maskSelector"] = settings.maskSelector;
            smsOpts["mobile"] = mobile;
            smsOpts["submitCallback"] = that.settings.submitCallback;
            smsOpts["money"] = $.trim(options.price.val());

            that.hideBargain();
            $(smsOpts.smswrapperid).Sms(smsOpts);

        },
        showDelIcon: function (section) {
            $(".bargin-del[data-target='" + section + "']").show();
        },
        hideDelIcon: function (section) {
            $(".bargin-del[data-target='" + section + "']").hide();
        },
        hideBargain: function () {
            var that = this;
            var options = that.options;
            that.hideBargainTransitionend();
            //var height = options.wrapper.height();
            //cssTransform(options.wrapper[0], "translateY", height);
            //addEnd(options.wrapper[0], end);

            //function addEnd(obj, fn) {
            //    obj.addEventListener('WebkitTransitionEnd', fn, false);
            //    obj.addEventListener('transitionend', fn, false);
            //}

            //function removeEnd(obj, fn) {
            //    obj.removeEventListener('WebkitTransitionEnd', fn, false);
            //    obj.removeEventListener('transitionend', fn, false);
            //}

            //function end() {
            //    options.wrapper[0].style.webkitTransition = '';
            //    options.wrapper[0].style.Transition = ''
            //    that.hideBargainTransitionend();
            //    removeEnd(options.wrapper[0], end);
            //    typeof callback === 'function' && callback.call(that);
            //}
        },
        hideBargainTransitionend: function () {
            var that = this;
            var options = that.options;
            if (!!options.mask) {
                options.mask.hide();
            }
            var height = options.wrapper.height();
            options.wrapper.hide();
            options.price.val('');
            options.phone.val('');
            that.alertHide();
            that.lowPriceHide();
            that.options.clearSelector.hide();
            that.options.submit.removeClass(that.options.activeClass);
        },
        alertShow: function (title) {
            var options = this.options;
            // options.alertWrapper.show();
            options.alertTxt.text(title);
            this.lowPriceHide();
        },
        alertHide: function () {
            this.options.alertTxt.text('');
            // this.options.alertWrapper.hide();
        },
        lowPriceShow: function () {
            this.alertHide();
            this.options.wrapper.find('#bargin-pricelow').show();
        },
        lowPriceHide: function () {
            this.alertHide();
            this.options.wrapper.find('#bargin-pricelow').hide();
        },
        checkValidFunc: function (state) {
            var that = this;
            that.options.isValid = state;
            if (state) {
                that.options.submit.addClass(that.options.activeClass);
            } else {
                that.options.submit.removeClass(that.options.activeClass);
            }
        },
        checkPrice: function (money) {
            var that = this,
                options = that.options;

            if (!!money) {
                money = parseFloat(money) || null;
                if (Object.prototype.toString.call(money) === "[object Number]") { //不是数字
                    money = parseFloat(money.toFixed(2));
                    if (money > 999.99) {
                        that.lowPriceHide();
                        that.alertShow("最多输入3位整数，2位小数");
                        that.options.isValid = false;
                        return false;
                    }
                    if (money / options.carPrice < 0.7) {
                        that.alertHide();
                        this.lowPriceShow();
                        that.options.isValid = true;
                        return false;
                    }
                } else {
                    that.lowPriceHide();
                    that.alertShow("最多输入3位整数，2位小数");
                    that.options.isValid = false;
                    return fasle;
                }
            }

            that.options.isValid = true;
            that.alertHide();
            that.lowPriceHide();
        },
        checkPhone: function (mobile) {
            var that = this;
            //判断手机号
            if (!mobile) {
                that.alertShow('没有手机号，没法联系您哦');
                // that.options.isValid = false;
                that.checkValidFunc(false);
                return false;
            }
            if (!_v.isPhone(mobile)) {
                that.alertShow('客官 , 给个靠谱的手机号呗');
                // that.options.isValid = false;
                that.checkValidFunc(false);
                return false;
            }
            // that.options.isValid = true;
            that.checkValidFunc(true);
            that.alertHide();
        }
    };
    return Bargain;
})(window, $, Validator);

$.fn.Bargain = function (options) {
    var opts = options || {};
    opts["wrapper"] = $(this);
    var bargarin = new Bargain(opts);
    bargarin.init();
}




// /*已登录*/
// $(".header-section").click(function () {
//     $("#barginWrapper").Bargain({
//         carPrice: 88,
//         islogin: true,
//         mobile: 18600408090,
//         submitCallback: function (options) {
//             console.log(options);
//             // options.hide();
//             //  $("#successWrapper").SuccessModal({
//             //     maskWrapper: "#shadow_detail"
//             // });
//         },
//         smsOpts: {
//             smswrapperid: '#smsWrapper',
//             title: '已发送短信验证码',
//             autoPlay: true,
//             num: 60,
//         }
//     });
// });

///*未登录*/
//$(".header-section").click(function() {
//    $("#barginWrapper").Bargain({
//        carPrice: 99,
//        islogin: false,
//        mobile: '',
//        submitCallback: function(options) {
//            console.log(options);
//            options.hide();
//            $("#successWrapper").SuccessModal({
//                maskWrapper: "#shadow_detail"
//            });
//        },
//        smsOpts: {
//            smswrapperid: '#smsWrapper',
//            title: '是谁开着比亚迪掉进了水沟',
//            autoPlay: true,
//            num: 10,
//        }
//    });
//});

//function SubBargain(ops){
//    Bargain.call(this,ops);

//}
//SubBargain.prototype=new Bargain();
//SubBargain.prototype.constructor=SubBargain;
//console.log(new Bargain());
//var bar=new SubBargain();
//console.log(bar.alertHide);