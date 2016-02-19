/**
 * Created by hjb2722404 on 2015/12/5.
 */
;(function($){
    var LightBox =function(settings){
        var self = this;

        this.settings = {
            speed:500
        };

        this.config=$.extend({},this.settings,settings);

        //创建遮罩和弹出框

        this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');

        //保存Body
        this.bodyNode = $(document.body);

        //渲染剩余的DOM并且插入到body
        this.renderDOM();

        this.picViewArea = this.popupWin.find(".lightbox-pic-view"); //图片预览区域
        this.popupPic = this.popupWin.find(".lightbox-image"); //图片
        this.captionArea = this.popupWin.find(".lightbox-pic-caption");//图片描述区域
        this.nextBtn = this.popupWin.find(".lightbox-next-btn");
        this.preBtn = this.popupWin.find(".lightbox-prev-btn");

        this.captionText = this.popupWin.find("p.lightbox-pic-desc"); //描述文字
        this.currentIdex = this.popupWin.find("span.lightbox-of-index");//索引
        this.closeBtn = this.popupWin.find("span.lightbox-close-btn");//关闭按钮

        //准备开发事件委托，获取组数据
        this.groupName = null;
        this.groupData = []; //放置同一组数据
        this.bodyNode.delegate(".js-lightbox","click",function(e){
            //阻止事件冒泡
            e.stopPropagation();
            var currentGroupName = $(this).attr("data-group");
            if(currentGroupName != self.groupName){
                self.groupName = currentGroupName;
                //根据当前组名获取同一组数据
                self.getGroup();
            }

            //初始化弹出
            self.initPopup($(this));
        });
        //关闭弹出
        this.popupMask.click(function(){
           $(this).fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
        this.closeBtn.click(function(){
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });

        //绑定上下切换按钮事件
        this.flag = true;
        this.nextBtn.hover(function(){
            console.log("hovernext");
            if(!$(this).hasClass("disabled")&&self.groupData.length>1){
                $(this).addClass("lightbox-next-btn-show");
            }
        },function(){
            if(!$(this).hasClass("disabled")&&self.groupData.length>1){
                $(this).removeClass("lightbox-next-btn-show");
            }
        }).click(function(e){
            if(!$(this).hasClass("disabled")&&self.flag){
                self.flag = false;
                e.stopPropagation();
                self.goto("next");
            }
        });
        this.preBtn.hover(function(){
            if(!$(this).hasClass("disabled")&&self.groupData.length>1){
                $(this).addClass("lightbox-prev-btn-show");
            }
        },function(){
            if(!$(this).hasClass("disabled")&&self.groupData.length>1){
                $(this).removeClass("lightbox-prev-btn-show");
            }
        }).click(function(e){
            if(!$(this).hasClass("disabled")&&self.flag){
                self.flag = false;
                e.stopPropagation();
                self.goto("prev");

            }
        });

        //绑定窗口调整事件
        var timer = null;
        this.clear = false;
        $(window).resize(function(){
            if(self.clear){
                window.clearTimeout(timer);
                timer = window.setTimeout(function(){
                    self.loadPicSize(self.groupData[self.index].src);
                },500);
            }
        }).keyup(function(e){
            var keyValue = e.which;
            if(self.clear) {
                if (keyValue == 37 || keyValue == 38) {
                    self.preBtn.click();
                } else if (keyValue == 39 || keyValue == 40) {
                    self.nextBtn.click();
                }
            }
        });
    };

    LightBox.prototype = {
        goto:function(dir){
            if(dir === "next"){

                this.index++;
                if(this.index >= this.groupData.length-1){
                    this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
                }
                if(this.index!=0){
                    this.preBtn.removeClass("disabled");
                }

                var src = this.groupData[this.index].src;
                this.loadPicSize(src);

            }else if(dir ==="prev"){

                this.index--;
                if(this.index <= 0){
                    this.preBtn.addClass("disabled").removeClass("lightbox-prev-btn-show");
                }
                if(this.index!=this.groupData.length-1){
                    this.nextBtn.removeClass("disabled");
                }

                var src = this.groupData[this.index].src;
                this.loadPicSize(src);
            }
        },
        loadPicSize:function(sourceSrc){
            var self = this;
            self.popupPic.css({width:"auto",height:"auto"}).hide();
            self.captionArea.hide();

            this.preLoadImg(sourceSrc,function(){
                //alert('ok');
                self.popupPic.attr("src",sourceSrc);
                var picWidth = self.popupPic.width();
                var picHeight = self.popupPic.height();

                self.changePic(picWidth,picHeight);
            });

        },
        changePic:function(width,height){

            var self = this,
                winWidth = $(window).width(),
                winHeight = $(window).height();

            //如果图片的宽高大于浏览器视口的宽高比例，我就看下是否溢出
            var scale = Math.min(winWidth/(width+10),winHeight/(height+10),1);
            width = width*scale;
            height = height*scale;

            this.picViewArea.animate({
                width:width-10,
                height:height-10
            },self.config.speed);

            this.popupWin.animate({
                width:width,
                height:height,
                marginLeft: -(width/2),
                top:(winHeight-height)/2
            },self.config.speed,function(){
                self.popupPic.css({
                    width:width-10,
                    height:height-10
                }).fadeIn();
                self.captionArea.fadeIn();
                self.flag = true;
                self.clear = true;
            });

            //设置描述文字和当前索引
            this.captionText.text(this.groupData[this.index].caption);
            this.currentIdex.text("当前索引 ： "+(this.index+1)+" of "+this.groupData.length);
        },
        preLoadImg:function(src,callback){

            var img = new Image();

            if(!!window.ActiveXObject){
                img.onreadystatechange = function(){
                    if(this.readyState == "complete"){
                        callback();
                    }
                }
            }else{
                img.onload = function(){
                    callback();
                }
            }
            img.src = src;
        },
        showMaskAndPopup:function(sourceSrc,currentId){
            var self = this;
            this.popupPic.hide();
            this.captionArea.hide();

            this.popupMask.fadeIn();

            var winWidth = $(window).width(),
                winHeight= $(window).height();

            this.picViewArea.css({
                width:winWidth/2,
                height:winHeight/2
            });

            this.popupWin.fadeIn();

            var viewHeight = winHeight/2+10;

            this.popupWin.css({
                width:winWidth/2+10,
                height:winHeight+10,
                marginLeft: -(winWidth/2+10)/2,
                top:-viewHeight
            }).animate({
                top:(winHeight-viewHeight)/2
            },self.config.speed,function(){
                    //加载图片
                self.loadPicSize(sourceSrc);
            });
            //根据当前点击的元素ID获取在当前组别里面的索引

            this.index = this.getIndexOf(currentId);

            var groupDataLength = this.groupData.length;

            if(groupDataLength >1 ){
                if(this.index === 0){
                    this.preBtn.addClass("disabled");
                    this.nextBtn.removeClass("disabled");
                }else if(this.index === groupDataLength-1){
                    this.nextBtn.addClass("disabled");
                    this.preBtn.removeClass("disabled");
                }else{
                    this.preBtn.removeClass("disabled");
                    this.nextBtn.removeClass("disabled");
                }
            }
        },
        getIndexOf:function(currentId){

            var index = 0;

            $(this.groupData).each(function(i){
                index = i;
                if(this.id === currentId){
                    return false;
                }
            });

            return index;
        },
        initPopup:function(currentObj){
            var self = this,
                sourceSrc = currentObj.attr("data-source"),
                currentId = currentObj.attr("data-id");

            this.showMaskAndPopup(sourceSrc,currentId);
        },
        getGroup:function(){
            var self = this;

            //根据当前组别名称获取所有页面中有相同组别的对象
            var groupList = this.bodyNode.find("*[data-group="+this.groupName+"]");

            //清空数组数据
            self.groupData.length = 0;

            groupList.each(function(){
                self.groupData.push({
                    src:$(this).attr("data-source"),
                    id:$(this).attr("data-id"),
                    caption:$(this).attr("data-title")
                });
            });
            //console.log(self.groupData);

        },
        renderDOM:function(){
            var strDOM ='<div class="lightbox-pic-view">';
              strDOM += '<span class="lightbox-btn lightbox-prev-btn"></span>';
              strDOM += '<img class="lightbox-image" src="" alt=""/>';
              strDOM += '<span class="lightbox-btn lightbox-next-btn"></span>';
              strDOM += '</div>';
              strDOM += '<div class="lightbox-pic-caption">';
              strDOM += '<div class="lightbox-caption-area">';
              strDOM += '<p class="lightbox-pic-desc"></p>';
              strDOM += '<span class="lightbox-of-index">当前索引：0 of 0</span>';
              strDOM += '</div>';
              strDOM += '<span class="lightbox-close-btn"></span>';
              strDOM += ' </div>';

            //插入到this.popupWin
            this.popupWin.html(strDOM);

            //把遮罩和弹出框插入到body对象

            this.bodyNode.append(this.popupMask,this.popupWin);

        }
    };

    window['LightBox'] = LightBox;
})(jQuery);