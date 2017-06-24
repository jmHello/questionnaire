/**
 * Created by jm on 2017/5/5.
 */
/*
* CustormEvent
* */
(function ($) {
    $.CustormEvent=function () {
        this.clientList={};
    };
    var fn=$.CustormEvent.prototype;
    fn.trigger=function () {
        var key=Array.prototype.shift.call(arguments),
            fns=this.clientList[key];
        if(!fns||fns.length==0) return false;
        for(var i=0,fn;fn=fns[i++];) fn.apply(this,arguments);
    };
    fn.listen=function (key,fn) {
        if(!this.clientList[key])this.clientList[key]=[];
        this.clientList[key].push(fn);
    };
    fn.remove=function (key,fn) {
        var fns=this.clientList[key];
        if(!fns) return false;
        if(!fn) fn&&(fns.length=0);
        else{
            for(var l=fns.length,_fn;l--;){
                _fn=fns[l];
                if(_fn===fn) fns.splice(l,1);
            }
        }
    }
})(window.JM.component);
/*
 drag:
     元素的x坐标 = 鼠标移动的横向距离+元素本来的x坐标 = 鼠标现在的x坐标 - 鼠标之前的x坐标 + 元素本来的x坐标
     元素的y坐标 = 鼠标移动的横向距离+元素本来的y坐标 = 鼠标现在的y坐标 - 鼠标之前的y坐标 + 元素本来的y坐标
 */
(function ($) {
    var dom={
        'on':function (ele,type,handler) {
            JM.addHandler(ele,type,handler,false);
        },
        'getStyle':function (ele,name) {
            return JM.getStyle(ele,name);
        },
        'setCss':function (ele,css) {
            for(var key in css) ele.style[key]=css[key];
        }
    };
    //object:DragElement
    function DragElement(ele) {
        this.ele=ele;
        this.iX=0;
        this.iY=0;
    };
    DragElement.prototype={
        'constructor':DragElement,
        'setEleCss':function (css) {
            dom.setCss(this.ele,css);
            return this;/* return this的作用是：为了链式调用*/
        },
        'setXY':function (x,y) {
            this.iX=parseInt(x)||0;
            this.iY=parseInt(y)||0;
            return this;
        },
        'init':function () {
            this.setEleCss({
                'left':dom.getStyle(this.ele,'left'),
                'top':dom.getStyle(this.ele,'top')
            }).setXY(this.ele.style.left,this.ele.style.top);
        }
    };
    //object:Mouse
    function Mouse() {
        this.x=0;
        this.y=0;
    }
    Mouse.prototype.setXY=function (x,y) {
        this.x=parseInt(x);
        this.y=parseInt(y);
        console.log(this.x,this.y);
    };
    //basic config
    var draggableConfig={
        'zIndex':1,
        'draggingObj':null,
        'mouse':new Mouse()
    };
    function Drag(ele) {
        var ele=ele.querySelector('.jm-dragging')||ele;
            draggingObj=null;
        dom.on(ele,'selectstart',function () {
            return false;
        });
        function handleEvent(e) {
            var ev=JM.getEvent(e);
            switch (ev.type){
                case 'mousedown':
                    if(ele){
                        draggableConfig.mouse.setXY(ev.clientX,ev.clientY);
                        draggingObj=new DragElement(ele);
                        draggingObj
                            .setXY(ele.offsetLeft,ele.offsetTop)
                            .setEleCss({
                                'zIndex':draggableConfig.zIndex++,
                                'position':'absolute'
                            });
                    }
                    break;
                case 'mousemove':
                    if(draggingObj!==null){
                        var mouse=draggableConfig.mouse;
                        draggingObj.setEleCss({
                            'left':parseInt(ev.clientX-mouse.x+draggingObj.iX)+'px',
                            'top':parseInt(event.clientY - mouse.y + draggingObj.iY)+'px'
                        });
                    }
                    break;
                case 'mouseup':
                    draggingObj = null;
                    break;
            }
        }
        return{
            'add':function () {
                JM.addHandler(ele,'mousedown',handleEvent);
                JM.throttle(JM.addHandler(document,'mousemove',handleEvent),25);
                JM.addHandler(ele,'mouseup',handleEvent);
            },
            'remove':function () {
                JM.removeHandler(ele,'mousedown',handleEvent);
                JM.removeHandler(document,'mousemove',handleEvent);
                JM.removeHandler(ele,'mouseup',handleEvent);
            }
        };
    };
    $.Drag=Drag;
})(window.JM.component);

/*
 modal

 jm-target-------open
 jm-dismiss------hide
 jm-toggle-----modal
 ---------------------------------
     <button jm-target="aa"></buttnon>
 <div class="modal" jm-toggle id="addItems">
     <div class="modal_dialog">
         <div class="modal_content">
             <div class="modal_header">
                 <button type="button"jm-dismiss>x</button>
                 <h4>添加商品</h4>
             </div>
             <div class="modal_body"></div>
             <div class="modal_footer">
                 <button type="button" class="btn btn_primary" jm-dismiss>关闭</button>
                 <button type="button" class="btn btn_primary" jm-dismiss>保存</button>
             </div>
         </div>
     </div>
 </div>
 */
(function ($) {
   $.Modal=function (modal) {
        this.modal=modal;
        this.cancelBtn=modal.querySelectorAll('[jm-dismiss]');
        this.openBtn=document.querySelectorAll('[jm-target]');
    };
    $.Modal.prototype={
        'constructor':$.Modal,
        'show':function (modal) {
            JM.addClass(modal,'show');
            this.getPosition(modal);
        },
        'hide':function (modal){
            JM.removeClass(modal,'show')
        },
        'openModal':function () {
            var _self=this;
            JM.reverseIterator(this.openBtn,function (i,item) {
                JM.addHandler(item,'click',function (e) {
                    JM.stopPropagation(JM.getEvent(e));
                    var jm_target=item.getAttribute('jm-target');
                    if(_self.modal.id==jm_target)
                        _self.show(_self.modal);
                })
            });
        },
        'closeModal':function (fn) {
            var _self=this;
            JM.reverseIterator(this.cancelBtn,function (i,item) {
                var self=this;
                JM.addHandler(item,'click',function (e) {
                    JM.stopPropagation(JM.getEvent(e));
                    _self.hide(_self.modal);
                    _self.moveModal(_self.modal).remove();
                    fn&&fn.apply(self);
                },false);
            });
        },
        'moveModal':function (obj) {
            console.log(obj);
            return JM.component.Drag(obj);
        },
        'getPosition':function (modal) {
            var top,
                left,
                c_height,
                c_width,
                s_height,
                s_width,
                doc=document,
                height,
                width;
            top=doc.documentElement.scrollTop||doc.body.scrollTop;
            left=doc.documentElement.scrollLeft||doc.body.scrollLeft;
            c_height=doc.documentElement.clientHeight||doc.body.clientHeight;
            c_width=doc.documentElement.clientWidth||doc.body.clientWidth;
            s_height=doc.documentElement.scrollHeight||doc.body.scrollHeight;
            s_width=doc.documentElement.scrollWidth||doc.body.scrollWidth;

            if(s_height>c_height){
                modal.style.top=parseInt((c_height-modal.offsetHeight+top)>>1)+'px';
                modal.style.left=parseInt((c_width-modal.offsetWidth+left)>>1)+'px';
                console.log(c_height,modal.offsetHeight,(c_height-modal.offsetHeight)>>1,top,modal.style.top);

            }else{
                modal.style.top=parseInt((c_height-modal.offsetHeight)>>1)+'px';
                modal.style.left=parseInt((c_width-modal.offsetWidth)>>1)+'px';
            }
        }
    };
    var fn=$.Modal.prototype;
    fn.init=function (modal) {
        var oModal=new $.Modal(modal);
        if(oModal){
            oModal.openModal();
            oModal.moveModal(modal).add();
        }
    };
    var t_toggle=JM.getEles('[jm-toggle]'),len=t_toggle.length;
    for(;len--;){
        fn.init(t_toggle[len]);
        oModal.closeModal();
    }
})(window.JM.component);


/*
    forms validation
 var validator=new JM.component.validator();
     if(form.id)
     validator.add(form.id,[{
     'strategy':'isEmpty',
     'errorMsg':'学号不能为空'
     },{
     'strategy':'isNumber',
     'errorMsg':'学号只能为数字'
     },{
     'strategy':'minLength:10',
     'errorMsg':'学号不能小于10位'
     },{
     'strategy':'maxLength:10',
     'errorMsg':'学号不能大于10位'
     }]);
 var data=validator.start();
 if(callback) callback(data);
 }
 */
(function ($) {
    var strategies={
        'isEmpty':function (value,errorMsg) {
            if(value.length===0||(!/[^\s]/.test(value))) return errorMsg;
        },
        'minLength':function (value,length,errorMsg) {
            if(value.length<length) return errorMsg;
        },
        'maxLength':function (value,length,errorMsg) {
            if(value.length>length) return errorMsg;
        },
        'isMobile':function (value,errorMsg) {
            if(!/^1[3|5|7|8][0-9]{9}$/.test(value)) return errorMsg;
        },
        'isNumber':function (value,errorMsg) {
            if(!/\d/.test(value)) return errorMsg;
        },
        'isPrice':function (value,errorMsg) {
            if(!/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(value)) return errorMsg;
        }
    };
    $.validator=function () {
        this.cache=[];
    };
    var  fn=$.validator.prototype;
    fn.add=function (dom,rules) {
        var _self=this;
        for(var i=0,rule;rule=rules[i++];){
            (function (rule) {
                var strategyAry=rule.strategy.split(':'),
                    errorMsg=rule.errorMsg;
                _self.cache.push(function () {
                    var strategy=strategyAry.shift();
                    strategyAry.unshift(dom.value);
                    strategyAry.push(errorMsg);
                   return {
                       'dom':dom,
                       'getErrMsg':strategies[strategy].apply(dom,strategyAry)
                   };
                })
            })(rule);
        }
    };
    fn.start=function () {
        for(var i=0,validateFunc;validateFunc=this.cache[i++];){
            var data=validateFunc(),
                errMsg=data.getErrMsg;
            if(errMsg) return{
                'dom':data.dom,
                'errMsg':errMsg
            };
        }
    };

})(window.JM.component);

/*
    animate
 */
(function ($) {
    var tween = {
        'uVelocity':function (t, b, c, d ) {
            return;
        },
        linear: function( t, b, c, d ){
            return c*t/d + b;
        },
        easeIn: function( t, b, c, d ){
            return c * ( t /= d ) * t + b;
        },
        strongEaseIn: function(t, b, c, d) {
            return c * ( t /= d ) * t * t * t * t + b;
        },
        strongEaseOut: function(t, b, c, d){
            return c * ( ( t = t / d - 1) * t * t * t * t + 1 ) + b;
        },
        sineaseIn: function( t, b, c, d ){
            return c * ( t /= d) * t * t + b;
        },
        sineaseOut: function(t,b,c,d){
            return c * ( ( t = t / d - 1) * t * t + 1 ) + b;
        }
    };
   $.Animate=function (dom) {
        this.dom=dom;
        this.startTime=0;
        this.startPos=0;
        this.endPos=0;
        this.propertyName=null;
        this.easing=null;
        this.duration=null;
    };
    $.Animate.prototype={
        'constructor': $.Animate,
        'start':function (propertyName,endPos,duration,easing) {
            this.startTime=+new Date();
            this.propertyName=propertyName;
            this.startPos=parseInt(JM.getStyle(this.dom,this.propertyName));
            this.endPos=endPos;
            this.duration=duration;
            this.easing=tween[easing];
            var _self=this,
                timeId=setInterval(function () {
                   if(_self.step()===false) clearInterval(timeId);
                },1);
        },
        'step':function () {
            var t= +new Date();
            if(t>=(this.startTime+this.duration)){
                this.update(this.endPos);
                return false;
            }
            var pos=this.easing(t-this.startTime,this.startPos,this.endPos-this.startPos,this.duration);
            this.update(pos);
        },
        'update':function (pos) {
            this.dom.style[this.propertyName]=pos+'px';
        }
    };
    // var ball=document.getElementsByClassName('ball');
    // JM.reverseIterator(ball,function (i,item) {
    //   var  an=new $.anmimate(item);
    // an.start('left',900,1000,'linear');
    // });

})(window.JM.component);
/*
    animation
 */
(function ($) {
   var speedTypes={
       'uniformSpeed':function (iTarget,iCurrent,iSpeed) {
           var speed=(iTarget-iCurrent)/iSpeed;
           speed=speed>0?Math.ceil(speed):Math.floor(speed);
           return speed;
       }
   };
   $.Animation=function (dom) {
       this.dom=dom;
       this.propertyName=null;
       this.iCur=null;
       this.iTarget=null;
       this.speedType=null;
       this.iSpeed=null;
       this.timer=null;
   };
    $.Animation.prototype={
        'constructor':$.Animation,
        'start':function (propertyName,speedType,iTarget,iSpeed,time) {
            this.iTarget=iTarget;
            this.iSpeed=iSpeed;
            this.speedType=speedTypes[speedType];
            this.move(propertyName,time);
        },
        'getICurrent':function (propertyName) {
           this.propertyName=propertyName;
            if(this.propertyName=='opacity') this.iCur=Math.round(parseFloat(JM.getStyle(this.dom,this.propertyName))*100);
            else this.iCur=parseInt(JM.getStyle(this.dom,this.propertyName));
        },
        'step':function () {
            var speed=this.speedType(this.iTarget,this.iCur,this.iSpeed);
            if(this.iCur==this.iTarget) return false;
            if(this.propertyName=='opacity') {
                this.dom.style.filter='alpha(opacity:'+(this.iCur+speed)+')';
                this.dom.style.opacity=(this.iCur+speed)/100;
            }else{
                // console.log(this.iCur,this.iTarget,speed);
                this.dom.style[this.propertyName]=this.iCur+speed+'px';
            }
        },
        'move':function (propertyName,time) {
            var _self=this;
            clearInterval(this.timer);
            this.timer=setInterval(function () {
                _self.getICurrent(propertyName);
                if(_self.iCur==_self.iTarget) clearInterval(_self.timer);
                _self.step();
            },time);
        }
    };
    // var slideshow_li=JM.getEle('.slideshow li');
    // var a=new $.Animation(slideshow_li);
    // slideshow_li.style.height=0;
    // a.start('height','uniformSpeed',300,6,1000);
})(window.JM.component);
/*
    slideshow
 */
(function ($) {
    var nowZIndex=2,
        now=0;

    /*
    * moveImgs:control imgs to move
    * */
    var moveImgs=function (li,img) {
        this.li=li;
        this.img=img;
    };
    moveImgs.prototype={
        'constructor':moveImgs,
        'move':function (propertyName,speedType,target,iSpeed,time) {
            //animation
            var animation=new JM.animation.Animation(this.img);
            animation.start(propertyName,speedType,target,iSpeed,time);
        },
        'init':function (propertyName,speedType,target,iSpeed,time) {
            //set li zIndex
            this.li.style.zIndex=nowZIndex++;
            //set img height 0
            this.img.style.height=0;
            //move
            this.move(propertyName,speedType,target,iSpeed,time);
        }
    };

    /*
    * $.Slideshow:control the carousel to autoplay and click the circle to show corresponding img.
    * */
    $.Slideshow=function (lis,imgs,circles,oNextBtn,oPrevBtn) {
        this.items=lis;
        this.imgs=imgs;
        this.circles=circles;
        this.oNextBtn=oNextBtn;
        this.oPrevBtn=oPrevBtn;
        this.timer=null;
    };
    $.Slideshow.prototype={
        'constructor':$.Slideshow,
        'moveImgs':function (li,img) {
            var imgs=new moveImgs(li,img);
            imgs.init('height','uniformSpeed',230,6,18);
        },
        'changeCircleColor':function (circle) {
            for(var i=0,len=this.circles.length;i<len;i++){
                JM.removeClass(this.circles[i],'change_circle_color');
            }
            JM.addClass(circle,'change_circle_color');
        },
        'next':function () {
            var _self=this;
            JM.addHandler(this.oNextBtn,'click',function (e) {
                JM.stopPropagation(JM.getEvent(e));
                var len=_self.items.length;
                now++;
                if(now==len) now=0;
                console.log(now);
                _self.moveImgs(_self.items[now],_self.imgs[now]);
            },false);
        },
        'prev':function () {
            var _self=this;
            JM.addHandler(this.oPrevBtn,'click',function (e) {
                JM.stopPropagation(JM.getEvent(e));
                var len=_self.items.length;
                now--;
                if(now==0) now=len-1;
                _self.moveImgs(_self.items[now],_self.imgs[now]);
            },false);
        },
        'clickShow':function () {
            var _self=this;
            for(var i=0,len=this.circles.length;i<len;i++){
                this.circles[i].index=i;
                JM.addHandler(circle_btn[i],'click',function (e) {
                    JM.stopPropagation(JM.getEvent(e));
                    _self.moveImgs(_self.items[this.index],_self.imgs[this.index]);
                    _self.changeCircleColor(this);
                    //clear timers
                    clearInterval(_self.timer);
                    //autoPlay again
                    _self.autoPlay();
                },false);
            }
        },
        'autoPlay':function () {
            var _self=this;
            this.timer=setInterval(function () {
                var len=_self.items.length;
                now++;
                if(now==len) now=0;
                _self.moveImgs(_self.items[now],_self.imgs[now]);
                _self.changeCircleColor(_self.circles[now]);
            },5000);
        },
        'init':function (lis,imgs,circles,oNextBtn,oPrevBtn) {
            circles[0].parentNode.style.left=Math.floor((parseInt(JM.getStyle(imgs[0],'width'))-parseInt(JM.getStyle(circles[0].parentNode,'width')))/2)+'px';
            var sli_show=new $.Slideshow(lis,imgs,circles,oNextBtn,oPrevBtn);
            sli_show.autoPlay();
            sli_show.clickShow();
        }
    };
    var fn=$.Slideshow.prototype;

   var slideshow_li=JM.getEles('.slideshow li'),
       slideshow_img=JM.getEles('.slideshow>ul img'),
       circle_btn=JM.getEles('.slideshow>p>i'),
       oNextBtn=JM.getEle('.next'),
       oPrevBtn=JM.getEle('.prev');
    // fn.init(slideshow_li,slideshow_img,circle_btn,oNextBtn,oPrevBtn);

})(window.JM.component);

/*
    questionnaire
 */
(function ($) {
    var createEachQueItem= function (qTitle,cName,flag,type) {
        //createElement
        var doc=document,
            section=doc.createElement('section'),
            h3=doc.createElement('h3'),
            form=doc.createElement('form'),
            //title
            div_title=doc.createElement('div'),
            ti_label=doc.createElement('label'),
            ti_input=doc.createElement('input'),
            //filled
            div_filled=doc.createElement('div'),
            fi_label=doc.createElement('label'),
            fi_input=doc.createElement('input'),
            //description
            div_description=doc.createElement('div'),
            des_label=doc.createElement('label'),
            des_input=doc.createElement('input'),
            //delete
            p_del=doc.createElement('p'),
            i_del=doc.createElement('i');
        //set innerHtml
        h3.innerHTML=qTitle;
        ti_label.innerHTML='题目';
        fi_label.innerHTML='是否必填';
        des_label.innerHTML='备注';
        i_del.innerHTML='x';
        //set attr
        form.setAttribute('q_type',type);
        ti_input.setAttribute('q_sign','title');
        fi_input.setAttribute('q_sign','filled');
        des_input.setAttribute('q_sign','description');

        ti_input.type='text';
        fi_input.type='checkbox';
        des_input.type='text';
        ti_input.placeholder="必填";
        des_input.placeholder="选填（150个字以内）";
        //add class
        JM.addClass(section,'editor');
        JM.addClass(section,cName);
        JM.addClass(form,'q_form');
        JM.addClass({
            'editor_title':div_title,
            'clearfix':div_title
        });
        JM.addClass({
            'editor_filled':div_filled,
            'clearfix':div_filled
        });
        JM.addClass({
            'editor_description':div_description,
            'clearfix':div_description
        });
        JM.addClass(i_del,'delete_x');

        //add event
        JM.addHandler(i_del,'click',function (e) { //delete item
            JM.stopPropagation(JM.getEvent(e));
            JM.removeNodes(this.parentNode.parentNode.parentNode,this.parentNode.parentNode);
        });
        //add nodes
        //add title
        JM.addNodes(div_title,ti_label);
        JM.addNodes(div_title,ti_input);
        JM.addNodes(form,div_title);
        //add filled
        JM.addNodes(div_filled,fi_label);
        JM.addNodes(div_filled,fi_input);
        JM.addNodes(form,div_filled);
        if(flag){
            //options
            var div_options=doc.createElement('div'),
                op_ul=doc.createElement('ul'),
                //the first li
                op_ul_li1=doc.createElement('li'),
                op_ul_li1_ul=doc.createElement('ul'),
                //the first choice
                op_ul_li1_ul_li1=doc.createElement('li'),
                op_ul_li1_ul_li1_label=doc.createElement('label'),
                op_ul_li1_ul_li1_input=doc.createElement('input'),
                op_ul_li1_ul_li1_i=doc.createElement('i'),
                //the second li
                op_ul_li2=doc.createElement('li'),
                op_ul_li2_p=doc.createElement('p'),
                op_ul_li2_p_a=doc.createElement('a');

            //set innerHtml
            op_ul_li1_ul_li1_label.innerHTML='选项';
            op_ul_li1_ul_li1_i.innerHTML='x';
            op_ul_li2_p_a.innerHTML='新建选项+';

            //set Attr
            op_ul_li1_ul.setAttribute('q_sign','choice');
            op_ul_li1_ul_li1_input.type='text';
            op_ul_li1_ul_li1_input.placeholder="必填（至少填写一个）";
            //add class
            JM.addClass(div_options,'editor_options');
            JM.addClass(op_ul_li1_ul,'option_item_list');
            JM.addClass(op_ul_li1_ul_li1_i,'deleteAChoice');
            JM.addClass(op_ul_li2_p_a,'addAChoice');

            //add event
            if(op_ul_li1_ul_li1_i) JM.addHandler(op_ul_li1_ul_li1_i,'click',function (e) {
                JM.stopPropagation(JM.getEvent(e));
                JM.removeNodes(this.parentNode.parentNode,this.parentNode);
            },false);

            JM.addHandler(op_ul_li2_p_a,'click',function (e) {
                JM.stopPropagation(JM.getEvent(e));
                var li=doc.createElement('li'),
                    label=doc.createElement('label'),
                    input=doc.createElement('input'),
                    i=doc.createElement('i');
                input.type='text';
                input.placeholder="必填（至少填写一个）";
                label.innerHTML="选项";
                i.innerHTML="x";

                //add event
                JM.addHandler(i,'click',function (e) { //delete item
                    JM.stopPropagation(JM.getEvent(e));
                    JM.removeNodes(this.parentNode.parentNode,this.parentNode);
                });
                //add class
                JM.addClass(i,'deleteAChoice');
                //add nodes
                JM.addNodes(li,label);
                JM.addNodes(li,input);
                JM.addNodes(li,i);
                JM.addNodes(op_ul_li1_ul,li);
            },false);
            //add options
            //add first li
            //add first option
            JM.addNodes(op_ul_li1_ul_li1,op_ul_li1_ul_li1_label);
            JM.addNodes(op_ul_li1_ul_li1,op_ul_li1_ul_li1_input);
            JM.addNodes(op_ul_li1_ul_li1,op_ul_li1_ul_li1_i);
            JM.addNodes(op_ul_li1_ul,op_ul_li1_ul_li1);
            JM.addNodes(op_ul_li1,op_ul_li1_ul);
            JM.addNodes(op_ul,op_ul_li1);

            //add the second li
            JM.addNodes(op_ul_li2_p,op_ul_li2_p_a);
            JM.addNodes(op_ul_li2,op_ul_li2_p);
            JM.addNodes(op_ul,op_ul_li2);
            JM.addNodes(div_options,op_ul);
            JM.addNodes(form,div_options);
        }
        //add description
        JM.addNodes(div_description,des_label);
        JM.addNodes(div_description,des_input);
        JM.addNodes(form,div_description);
        //add others
        JM.addNodes(section,h3);
        JM.addNodes(section,form);
        //add delete
        JM.addNodes(p_del,i_del);
        JM.addNodes(section,p_del);
        return section;
    },
        q_type={
        'singleChoice':function (type) {
            /*var str='<section class="editor singleChioce" q_type="'+type+'">' +
                '<h3>单选题</h3>' +
                '<form class="q_form">' +
                '<div class="editor_title clearfix"><label>题目</label><input type="text" q_sign="title"></div>' +
                '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox" name="isFilled" q_sign="filled"></div>'+
                '<div class="editor_options">' +
                '<ul>' +
                '<li><ul class="option_item_list"><li><label>选项</label><input type="text" q_sign="choice"><i class="deleteAChoice">x</i></li><li><label>选项</label><input type="text" q_sign="choice"><i class="deleteAChoice">x</i></li></ul></li>' +
                '<li><p><a href="javascript:;" class="addAChoice">新建选项+</a></p></li> ' +
                '</ul> ' +
                '</div> ' +
                '<div class="editor_description clearfix"> <label>备注</label><input type="text" q-sign="description"> </div> ' +
                '</form>'+
                '<p><i class="delete_x">x</i></p> ' +
                '</section>';*/
            return createEachQueItem('单选题','singleChioce',true,type);

        },
        'moreChoice':function (type) {
            /*var str='<section class="editor moreChioce"q_type="'+type+'">' +
                '<h3>多选题</h3>' +
                '<form class="q_form">' +
                '<div class="editor_title clearfix"><label>题目</label><input type="text" q_sign="title"></div>' +
                '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled" q_sign="filled"></div>'+
                '<div class="editor_options">' +
                '<ul>' +
                '<li><ul class="option_item_list"><li><label>选项</label><input type="text" q_sign="choice"><i class="deleteAChoice">x</i></li><li><label>选项</label><input type="text" q_sign="choice"><i class="deleteAChoice">x</i></li></ul></li>' +
                '<li><p><a href="javascript:;"  class="addAChoice">新建选项+</a></p></li> </ul> </div> ' +
                '<div class="editor_description clearfix"> <label>备注</label><input type="text" q-sign="description"> </div> ' +
                '</form>'+
                '<p><i class="delete_x">x</i></p> ' +
                '</section>';
            return str;*/
            return createEachQueItem('多选题','moreChioce',true,type);
        },
        'dropDownChoice':function (type) {
            /*var str='<section class="editor dropDownChioce"q_type="'+type+'">' +
                '<h3>下拉题</h3>' +
                '<form class="q_form">' +
                '<div class="editor_title clearfix"><label>题目</label><input type="text" q_sign="title"></div>' +
                '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled" q_sign="filled"></div>'+
                '<div class="editor_options">' +
                '<ul>' +
                '<li><ul class="option_item_list"><li><label>选项</label><input type="text"q_sign="choice"><i class="deleteAChoice">x</i></li><li><label>选项</label><input type="text"q_sign="choice"><i class="deleteAChoice">x</i></li></ul></li>' +
                '<li><p><a href="javascript:;" class="addAChoice">新建选项+</a></p></li> </ul> </div> ' +
                '<div class="editor_description clearfix"> <label>备注</label><input type="text" q-sign="description"> </div> ' +
                '</form>'+
                '<p><i class="delete_x">x</i></p> ' +
                '</section>';
            return str;*/
            return createEachQueItem('下拉题','dropDownChioce',true,type);
        },
        'singleTextChoice':function (type) {
            /*var str='<section class="editor singleTextChoice" q_type="'+type+'">' +
                '<h3>单行文本题</h3>'+
                '<form class="q_form">' +
                '<div class="editor_title clearfix"><label>题目</label><input type="text" q_sign="title" ></div>' +
                '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled" q_sign="filled"></div>'+
                '<div class="editor_description clearfix"> <label>备注</label><input type="text" q-sign="description"> </div> ' +
                '</form>'+
                '<p><i class="delete_x">x</i></p> ' +
                '</section>';
            return str;*/
            return createEachQueItem('单行文本题','singleTextChoice',false,type);
        },
        'moreTextChoice':function (type) {
            /*var str='<section class="editor moreTextChioce" q_type="'+type+'">' +
                '<h3>多行文本题</h3>' +
                '<form class="q_form">' +
                '<div class="editor_title clearfix"><label>题目</label><input type="text" q_sign="title"></div>' +
                '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox" q_sign="filled"></div>'+
                '<div class="editor_description clearfix"> <label>备注</label><input type="text" q-sign="description"> </div> ' +
                '</form>'+
                '<p><i class="delete_x">x</i></p> ' +
                '</section>';
            return str;*/
            return createEachQueItem('多行文本题','moreTextChioce',false,type);
        }
    },
        qr_type={
            'singleChoice':function () {
                var str='<div class="qr_result">' +
                    '<section class="qr_type">' +
                        '<header><h3><i class="qr_num">1.</i><span class="qr_title"></span><strong class="isFilled"></strong></h3><p class="qr_des"></p></header>'+
                        '<section class="qr_choice">' +
                        // '<label> <input type="radio" name="name">aa </label> ' +
                        '</section>'+
                    '</section>' +
                    '</div>';
                return str;
            },
            'moreChoice':function () {
                var str='<div class="qr_result">' +
                    '<section class="qr_type"> ' +
                    '<header> <h3><i class="qr_num">1.</i><span class="qr_title"></span><strong class="isFilled"></strong></h3> <p class="qr_des"></p> </header> ' +
                    '<section class="qr_choice">' +
                    // ' <label> <input type="checkbox" name="name" value="">aa </label> ' +
                    '</section> ' +
                    '</section> ' +
                    '</div>';
                return str;
            },
            'dropDownChoice':function () {
                var str=' <div class="qr_result"> ' +
                    '<section class="qr_type"> ' +
                    '<header> <h3><i class="qr_num">1.</i><span class="qr_title"></span><strong class="isFilled"></strong></h3> <p class="qr_des"></p> </header> ' +
                    '<section class="qr_choice"> ' +
                    '<select></select>'+
                    // '<select name="name"> <option value="1">1</option> <option value="1">1</option> <option value="1">1</option> <option value="1">1</option> <option value="1">1</option> </select> ' +
                    '</section> ' +
                    '</section> ' +
                    '</div>';
                return str;
            },
            'singleTextChoice':function () {
                var str='<div class="qr_result"> ' +
                    '<section class="qr_type"> ' +
                    '<header> <h3><i class="qr_num">1.</i><span class="qr_title"></span><strong class="isFilled"></strong></h3> <p class="qr_des"></p> </header> ' +
                    '<section class="qr_choice"> ' +
                    // '<label> <input type="text" name="name"> </label>
                    '</section> ' +
                    '</section> ' +
                    '</div>';
                return str;
            },
            'moreTextChoice':function () {
                var str='<div class="qr_result">' +
                    '<section class="qr_type"> ' +
                    '<header> <h3><i class="qr_num">1.</i><span class="qr_title"></span><strong class="isFilled"></strong></h3> <p class="qr_des"></p> </header> ' +
                    '<section class="qr_choice"> ' +
                    // '<label> <textarea></textarea> </label> ' +
                    '</section> ' +
                    '</section> ' +
                    '</div>';
                return str;
            }
        },
        qr_modal={
            'singleChoice':function (type) {
                var str='<div class="modal jm-dragging" jm-toggle>'+
                    '<div class="modal_content">'+
                    '<div class="modal_header clearfix"> <button type="button"jm-dismiss>x</button> <h4>修改单选题</h4> </div>'+
                    '<div class="modal_body">'+
                    '<section class="editor singleChioce"q_type="'+type+'"> ' +
                    '<h3>单选题</h3>'+
                    '<form>' +
                    '<div class="editor_title clearfix"><label>题目</label><input type="text"></div>' +
                    '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled"></div>'+
                    '<div class="editor_options">' +
                    '<ul>' +
                    '<li><ul class="option_item_list"><li><label>选项</label><input type="text"><i class="deleteAChoice">x</i></li><li><label>选项</label><input type="text"><i class="deleteAChoice">x</i></li></ul></li>' +
                    '<li><p><a href="javascript:;" class="addAChoice">新建选项+</a></p></li> </ul> </div> ' +
                    '<div class="editor_description clearfix"> <label>备注</label><input type="text"> </div> ' +
                    '</form>'+
                    '<p><i class="delete_x">x</i></p>'+
                    '</section>'+
                    '</div>'+
                    '<div class="modal_footer">'+
                    '<button type="button" class="btn btn_primary" jm-dismiss>关闭</button> <button type="button" class="btn btn_primary" jm-dismiss>保存</button>'+
                    '</div>'+
                    '</div>'+
                    '</div>';
                return str;
            },
            'moreChoice':function (type) {
                var str='<div class="modal jm-dragging" jm-toggle> ' +
                    '<div class="modal_content"> ' +
                    '<div class="modal_header clearfix"> <button type="button"jm-dismiss>x</button><h4>修改多选题</h4> </div> ' +
                    '<div class="modal_body">' +
                    '<section class="editor moreChioce"q_type="'+type+'">' +
                    '<h3>多选题</h3>' +
                    '<form>' +
                    '<div class="editor_title clearfix"><label>题目</label><input type="text"></div>' +
                    '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled"></div>'+
                    '<div class="editor_options">' +
                    '<ul>' +
                    '<li><ul class="option_item_list"><li><label>选项</label><input type="text"><i class="deleteAChoice">x</i></li><li><label>选项</label><input type="text"><i class="deleteAChoice">x</i></li></ul></li>' +
                    '<li><p><a href="javascript:;"  class="addAChoice">新建选项+</a></p></li> </ul> </div> ' +
                    '<div class="editor_description clearfix"> <label>备注</label><input type="text"> </div> ' +
                    '</form>'+
                    '<p><i class="delete_x">x</i></p></section> </div> ' +
                    '<div class="modal_footer"><button type="button" class="btn btn_primary" jm-dismiss>关闭</button> <button type="button" class="btn btn_primary" jm-dismiss>保存</button> </div> ' +
                    '</div> ' +
                    '</div>';
                return str;
            },
            'dropDownChoice':function (type) {
                var str='<div class="modal jm-dragging" jm-toggle> ' +
                    '<div class="modal_content"> ' +
                    '<div class="modal_header clearfix"> <button type="button"jm-dismiss>x</button> <h4>修改下拉题</h4> </div> ' +
                    '<div class="modal_body"> ' +
                    '<section class="editor dropDownChioce"q_type="'+type+'">' +
                    ' <h3>下拉题</h3> ' +
                    '<form>' +
                    '<div class="editor_title clearfix"><label>题目</label><input type="text"></div>' +
                    '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled"></div>'+
                    '<div class="editor_options">' +
                    '<ul>' +
                    '<li><ul class="option_item_list"><li><label>选项</label><input type="text"><i class="deleteAChoice">x</i></li><li><label>选项</label><input type="text"><i class="deleteAChoice">x</i></li></ul></li>' +
                    '<li><p><a href="javascript:;" class="addAChoice">新建选项+</a></p></li> </ul> </div> ' +
                    '<div class="editor_description clearfix"> <label>备注</label><input type="text"> </div> ' +
                    '</form>'+
                    '<p><i class="delete_x">x</i></p> </section> </div> ' +
                    '<div class="modal_footer"> <button type="button" class="btn btn_primary" jm-dismiss>关闭</button> <button type="button" class="btn btn_primary" jm-dismiss>保存</button> </div> ' +
                    '</div> ' +
                    '</div>';
                return str;
            },
            'singleTextChoice':function (type) {
                var str='<div class="modal jm-dragging" jm-toggle  id="addItems">'+
                    '<div class="modal_content">'+
                    '<div class="modal_header clearfix">'+
                    '<button type="button"jm-dismiss>x</button> <h4>修改单行文本题</h4>'+
                    '</div>'+
                    '<div class="modal_body">'+
                    '<section class="editor singleTextChoice" q_type="'+type+'">'+
                    '<h3>单行文本题</h3>'+
                    '<form>' +
                    '<div class="editor_title clearfix"><label>题目</label><input type="text"></div>' +
                    '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled"></div>'+
                    '<div class="editor_description clearfix"> <label>备注</label><input type="text"> </div> ' +
                    '</form>'+
                    '<p><i class="delete_x">x</i></p>'+
                    '</section>'+
                    '</div>'+
                    '<div class="modal_footer">'+
                    '<button type="button" class="btn btn_primary" jm-dismiss>关闭</button> <button type="button" class="btn btn_primary" jm-dismiss>保存</button>'+
                    '</div>'+
                    '</div>'+
                    '</div>';
                return str;
            },
            'moreTextChoice':function (type) {
                var str='<div class="modal jm-dragging" jm-toggle  id="addItems">'+
                    '<div class="modal_content">'+
                    '<div class="modal_header clearfix">'+
                    '<button type="button"jm-dismiss>x</button> <h4>修改多行文本题</h4>'+
                    '</div>'+
                    '<div class="modal_body">'+
                    '<section class="editor moreTextChioce" q_type="'+type+'">'+
                    '<h3>多行文本题</h3>'+
                    '<form>' +
                    '<div class="editor_title clearfix"><label>题目</label><input type="text"></div>' +
                    '<div class="editor_filled clearfix"><label>是否必填</label><input type="checkbox"  name="isFilled"></div>'+
                    '<div class="editor_description clearfix"> <label>备注</label><input type="text"> </div> ' +
                    '</form>'+
                    '<p><i class="delete_x">x</i></p>'+
                    '</section>'+
                    '</div>'+
                    '<div class="modal_footer">'+
                    '<button type="button" class="btn btn_primary" jm-dismiss>关闭</button> <button type="button" class="btn btn_primary" jm-dismiss>保存</button>'+
                    '</div>'+
                    '</div>'+
                    '</div>';
                return str;
            }
        },
        doc=document;
/**
 * QueType
 * @param {Object} QueObj
 * @constructor
 */
    var QueType=function (QueObj) {
        this.queObj=QueObj;
        this.choiceBtns=null;//左侧栏选项
        this.q_content=null;//显示问卷的区域
        this.q_title=null;
        this.q_description=null;
        this.editor=null;//每一个问题的父级
        this.delete=null;//删除每一个问题的删除键
        this.addAChoice=null;//添加选项
        this.deleteAChoice=null;//删除选项
        this.makeQueBtn=null;//确认生成问卷
        this.qTitle=null;//问题的标题
        this.qChoice=null;//问题的选项
        this.qFilled=null;//问题的必填选项
        this.qDes=null;//问题的备注
        this.qForm=null;//
        this.result=null;
    };
    var QueTypeConfig={
        'num':0,
        'type':{
            'singleChoice':'1',
            'moreChoice':'2',
            'dropDownChoice':'3',
            'singleTextChoice':'4',
            'moreTextChoice':'5'
        }
    };
    QueType.prototype={
        'constructor':QueType,
        'createStru':function () { //创建问卷基本结构
            this.queObj.innerHTML='<div class="clearfix">'+
                '<div class="editor_sidebar">'+
                '<h1>题目控件</h1>'+
                '<nav class="q_nav">' +
                '<ul>' +
                '<li><a href="javascript:;" id="singleChoice">单选题</a></li>' +
                '<li><a href="javascript:;" id="moreChoice">多选题</a></li>' +
                '<li><a href="javascript:;" id="dropDownChoice">下拉题</a></li>' +
                '<li><a href="javascript:;" id="singleTextChoice">单行文本题</a></li>' +
                '<li><a href="javascript:;" id="moreTextChoice">多行文本题</a></li>'+
                '</ul>' +
                '</nav>' +
                '</div>'+
                '<div class="editor_content">' +
                '<article>'+
                '<header class="q_title">' +
                '<h1><input type="text" placeholder="问卷标题" id="questionnaire_title"></h1> ' +
                '<textarea id="questionnaire_description" placeholder="（问卷导语选填，150个字以内）例子：为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！"></textarea> ' +
                '</header> ' +
                '<section class="q_content">请添加问卷问题！！</section>' +
                '<footer class="editor_control">' +
                '<button type="button" id="makeQue">确认</button> <button type="button">取消</button>'+
                '</footer>' +
                '</article>' +
                '</div>' +
                '</div>';
            this.q_title=doc.getElementById('questionnaire_title');
            this.q_description=doc.getElementById('questionnaire_description');
            this.choiceBtns=this.queObj.querySelectorAll('.q_nav>ul>li>a');
            this.q_content=this.queObj.querySelector('.q_content');
            this.makeQueBtn=this.queObj.querySelector('#makeQue');
        },
        'addQueChoice':function () {//增加选项
            var _self=this;
            JM.reverseIterator(this.choiceBtns,function (i,item) {
                JM.addHandler(item,'click',function (e) {
                    JM.stopPropagation(JM.getEvent(e));
                    if(item.id in q_type ){
                        var str=q_type[item.id](QueTypeConfig.type[item.id]);
                        // _self.q_content.innerHTML+=str;
                        JM.addNodes(_self.q_content,str);
                        _self.editor=JM.getEles('.editor');
                        _self.setAttr();
                    }
                },false);
            });
        },
        'setAttr':function () { //设置一些需要用到的自定义属性
            var _self=this;
            if(_self.editor){
                QueTypeConfig.num=0;
                _self.delete=JM.getEles('.delete_x');
                if(JM.getEles('.addAChoice'))_self.addAChoice=JM.getEles('.addAChoice');
                // _self.delete=JM.getEles('.delete_x');
                for(var i=0,len=_self.editor.length;i<len;i++){
                    //set attr
                    _self.editor[i].setAttribute('q_num',++QueTypeConfig.num);
                    if(_self.addAChoice[i]) _self.addAChoice[i].setAttribute('q_num', _self.editor[i].getAttribute('q_num'));

                    _self.qTitle=JM.getEles('[q_sign="title"]');
                    _self.qDes=JM.getEles('[q_sign="description"]');
                    _self.qFilled=JM.getEles('[q_sign="filled"]');
                    _self.delete[i].setAttribute('q_num', _self.editor[i].getAttribute('q_num'));
                    _self.setName(_self.qTitle[i],'title',_self.editor[i].getAttribute('q_num'));
                    _self.setName(_self.qDes[i],'description',_self.editor[i].getAttribute('q_num'));
                    _self.setName(_self.qFilled[i],'filled',_self.editor[i].getAttribute('q_num'));
                }
            }
        },
        'setName':function (inputs,sign,index) { //设置name属性值
            inputs.name=sign+index;
        },
        'sendData':function (fn) { //对外的一个接口，用来向后台发送数据
           this.result={
                'title':'',
                'type':'',
                'description':'',
                'questions':[]
            };
             var _self=this;
            JM.addHandler(this.makeQueBtn,'click',function (e) {
                JM.stopPropagation(JM.getEvent(e));
                _self.qForm=JM.getEles('.q_form');
                _self.formValidate(function (data) {
                    if(data){
                        alert(data.errMsg);
                    }else{
                        var len=_self.qForm.length;
                        if(len){
                            _self.getData(_self);
                            fn&&fn.call(_self,{
                                'result':_self.result,
                                'area':_self.q_content,
                                'title':_self.q_title,
                                'description':_self.q_description
                            });
                            console.log(_self.result);
                        }else alert('请添加问卷问题！');
                    }
                });


            },false);
        },
        'getData':function (_self) { //获取数据
            var qChoice_inputs;
            _self.result.title=_self.q_title.value;
            _self.result.type=_self.q_title.value;
            _self.result.description=_self.q_description.value||'';
            _self.result.questions=[];
            JM.inIterator(_self.qForm,function(i,item){
                var  choices='';
                _self.qChoice=item.querySelector('[q_sign="choice"]');
                if(_self.qChoice){
                    qChoice_inputs=_self.qChoice.querySelectorAll('input[type="text"]');
                    for(var k=0,len=qChoice_inputs.length;k<len;k++)
                        if(qChoice_inputs[k].value.length!=0 &&/[^\s]/.test(qChoice_inputs[k].value)) choices+=qChoice_inputs[k].value+'&';
                }
                _self.result.questions.push({
                    'type':item.getAttribute('q_type'),
                    'title':item['title'+(i+1)].value||'',
                    'filled':(item['filled'+(i+1)].checked?1:0),
                    'content':choices||'',
                    'description':item['description'+(i+1)].value||''
                });
            });
        },
        'formValidate':function (fn) { //表单验证
            var validator=new JM.component.validator();
            if(this.q_title) validator.add(this.q_title,[{
                    'strategy':'isEmpty',
                    'errorMsg':'问卷标题不能为空！'
                }]);
            if(this.q_description&&this.q_description.value.length!=0&&/[^\s]/.test(this.q_description.value))validator.add(this.q_description,[{
                'strategy':'maxLength:150',
                'errorMsg':'问卷导语的字数不能超过150！'
            }]);
            if(this.qForm){
                JM.inIterator(this.qForm,function(i,item){
                    this.qChoice=item.querySelector('[q_sign="choice"]');
                    if(item['title'+(i+1)]) validator.add(item['title'+(i+1)],[{
                        'strategy':'isEmpty',
                        'errorMsg':item['title'+(i+1)].value+'问题的标题不能为空！'
                    }]);
                    if(this.qChoice){
                        var qChoice_inputs=this.qChoice.querySelectorAll('input[type="text"]');
                        if(qChoice_inputs[0]) validator.add(qChoice_inputs[0],[{
                            'strategy':'isEmpty',
                            'errorMsg':item['title'+(i+1)].value+'问题选项至少填一项！'
                        }]);
                    }
                    if(item['description'+(i+1)]&&item['description'+(i+1)].value.length!=0&&/[^\s]/.test(item['description'+(i+1)].value))validator.add(item['description'+(i+1)],[{
                        'strategy':'maxLength:150',
                        'errorMsg':item['title'+(i+1)].value+'问题备注的字数不能超过150！'
                    }]);
                });
            }
            var data=validator.start();
            fn&&fn(data);
        },
        'init':function () {
            this.createStru();
            this.addQueChoice();
        }
    };
    $.QueType=QueType;
/**
 * QueResult
 * @param {Object}qR_area
 * @constructor
 */
    var QueResult=function (qR_area) {
        this.qR_area=qR_area;
        this.qR_title=null;
        this.qR_des=null;
        this.qR_content=null;
        this.qes_result=null;
        this.qes_num=null;
        this.qes_title=null;
        this.qes_isFilled=null;
        this.qes_des=null;
        this.qes_choice=null;
    };
    var QueResultConfig={
        'type':{
            '1':'singleChoice',
            '2':'moreChoice',
            '3':'dropDownChoice',
            '4':'singleTextChoice',
            '5':'moreTextChoice'
        }
    };
    QueResult.prototype={
        'constructor':QueResult,
        'createStru':function () {
            this.qR_area.innerHTML='<div class="questionnaire_result_show" id="questionnaire_result_show">'+
                '<article>'+
                '<header class="qr_header">'+
                    '<h1></h1>'+
                    '<p></p>'+
                '</header>'+
                '<section class="qr_content"></section>'+
                '</article>'+
                '</div>';
            this.qR_title=this.qR_area.querySelector('.qr_header>h1');
            this.qR_des=this.qR_area.querySelector('.qr_header>p');
            this.qR_content=this.qR_area.querySelector('.qr_content');
        },
        'createEachQue':function (questions) {
            var str='',
                _self=this,
                index=0;
            JM.reverseIterator(questions,function (i,item) {
                str+=qr_type[QueResultConfig.type[item.type]]();
            });
            this.qR_content.innerHTML=str;
            this.qes_result=this.qR_area.querySelectorAll('.qr_result');
            this.qes_num=this.qR_area.querySelectorAll('.qr_num');
            this.qes_title=this.qR_area.querySelectorAll('.qr_title');
            this.qes_isFilled=this.qR_area.querySelectorAll('.isFilled');
            this.qes_des=this.qR_area.querySelectorAll('.qr_des');
            this.qes_choice=this.qR_area.querySelectorAll('.qr_choice');
            JM.inIterator(questions,function (i,item) {
                _self.qes_num[i].innerHTML=(++index)+'.';
                _self.qes_title[i].innerHTML=item.title;
                _self.qes_des[i].innerHTML=item.description;
                item.filled===1?(_self.qes_isFilled[i].innerHTML='*'):(_self.qes_isFilled[i].innerHTML='');
                var choice=item.content.split('&');
                switch (item.type){
                    case 1:
                        var s1='';
                        for(var j=0,len=choice.length-1;j<len;j++)  s1+='<label><input type="radio">'+choice[j]+'</label>';
                        _self.qes_choice[i].innerHTML=s1;
                        break;
                    case 2:
                        var s1='';
                        for(var j=0,len=choice.length-1;j<len;j++)  s1+='<label><input type="checkbox">'+choice[j]+'</label>';
                        _self.qes_choice[i].innerHTML=s1;
                        break;
                    case 3:
                        var select= _self.qes_choice[i].querySelector('select');
                        console.log(select);
                       if(select){
                           for(var j=0,len=choice.length-1;j<len;j++)  s1+='<option>'+choice[j]+'</option>';
                           select.innerHTML=s1;
                       }
                        break;
                    case 4:
                        _self.qes_choice[i].innerHTML='<label><input type="text"></label>';
                        break;
                    case 5:
                        _self.qes_choice[i].innerHTML='<label><textarea></textarea></label>';
                        break;
                }
            });
        },
        'getChoices':function (choices) {
            var str='';
            for(var i=0,len=choices.length-1;i<len;i++){

            }
        },
        'show':function (data,questions) {
            var _self=this,
                str='';
            this.qR_title.innerHTML=data.title;
            this.qR_des.innerHTML=data.description;
           this.createEachQue(questions);
        },
        'init':function () {
            this.createStru();
        }
    };
    $.QueResult=QueResult;



    function getData(data) {
        var qr_result=JM.getEles('.qr_result'),
            qes_num=qr_result.querySelectorAll('.qes_num'),
            qes_title=qr_result.querySelectorAll('.qes_title'),
            qes_isFilled=qr_result.querySelectorAll('.qes_isFilled'),
            qes_des=qr_result.querySelectorAll('.qes_des'),
            qes_choice=qr_result.querySelectorAll('.qr_choice');

    }
    // if(document.getElementById('jm_questionnaire')){
    //     var jm_questionnaire=document.getElementById('jm_questionnaire');
    //     var a=new QueType(jm_questionnaire);
    //     a.init();
    // }

    // if(document.getElementById('show_qR')){
    //     var show_qR=document.getElementById('show_qR');
    //     var b=new QueResult(show_qR);
    //     b.init();
    // }
})(window.JM.component);

(function ($) {
    $.Pagination=function (outer,data) {
        this.outer=outer;
        this.pageList=data.pageList||[10,20,30];
        this.pageSize=data.pageSize||0;
        this.pageCount=data.pageCount||1;
        this.beginPageIndex=data.beginPageIndex||1;
        this.currentPage=data.currentPage||1;
        this.endPageIndex=data.endPageIndex||1;
        this.recordCount=data.recordCount||0;
        this.recordList=data.recordList||[];
        this.beginPageBtn=null;
        this.endPageBtn=null;
        this.lastIndexBtn=null;
        this.nextIndexPage=null;
        this.currentPageNum=null;
        this.totalRecords=null;
        this.pageListChoice=null;
        this.pageSizeChoice=null;
        this.pageListBtn=null;
        this.pageSizeBtn=null;
        this.hide_currentPage=null;
        this.cE=new JM.component.CustormEvent();
    };
    var getIndex=function (eles,input,callback) {
        for(var i=0,len=eles.length;i<len;i++){
            eles[i].onclick=function () {
                input.value=this.innerHTML;
                callback&&callback.call(this, input.value);
            }
        }
        // JM.reverseIterator(eles,function (i,item) {
        //     JM.addHandler(item,'click',function (e) {
        //         JM.stopPropagation(JM.getEvent(e));
        //         input.value=this.innerHTML;
        //         callback&&callback.call(item, input.value);
        //     },false);
        // })
    };
    var fn=$.Pagination.prototype;
    fn.createStructure=function () {
        this.outer.innerHTML='<div> ' +
            '<div class="clearfix"> ' +
            '<p>共<i class="page_total"></i>条记录，当前页为第<strong class="page_current">1</strong>页</p> ' +
            '<ul class="page_ranging clearfix"> ' +
            '<li><a href="javascript:;" class="begin_page">首页</a></li> ' +
            '<li><a href="javascript:;" class="last_page">上一页</a></li> ' +
            '<li class="p_choice_style"><div><input type="button" value="1"><ul class="page_currentChoice"></ul></div><small>/页</small></li> ' +
            '<li><a href="javascript:;" class="next_page">下一页</a></li> ' +
            '<li><a href="javascript:;" class="end_page">尾页</a></li> ' +
            '<li class="p_choice_style"><small>每页显示条数</small><div><input type="button" value="10"><ul class="page_size"></ul></div><small>条</small></li> ' +
            '</ul> ' +
            '</div> ' +
            '</div>';
        this.beginPageBtn=this.outer.querySelector('.begin_page');
        this.endPageBtn=this.outer.querySelector('.end_page');
        this.lastIndexBtn=this.outer.querySelector('.last_page');
        this.nextIndexPage=this.outer.querySelector('.next_page');
        this.currentPageNum=this.outer.querySelector('.page_current');
        this.totalRecords=this.outer.querySelector('.page_total');
        this.pageCurrentChoice=this.outer.querySelector('.page_currentChoice');
        this.pageSizeChoice=this.outer.querySelector('.page_size');
        this.pageCurrentChoiceBtn=this.outer.querySelectorAll('.p_choice_style input[type="button"]')[0];
        this.pageSizeBtn=this.outer.querySelectorAll('.p_choice_style input[type="button"]')[1];

    };
    fn.createCurrentPageList=function () {
        var html='';
        for(var i=1,len=this.endPageIndex;i<=len;i++){
            html+='<li><small>'+i+'</small></li>';
        }
        this.pageCurrentChoice.innerHTML=html;
    };
    fn.createPageList=function () {
        var html='';
        for(var i=0,len=this.pageList.length;i<len;i++){
            html+='<li><small>'+this.pageList[i]+'</small></li>';
        }
        this.pageSizeChoice.innerHTML=html;
    };
    fn.getCurrentPage=function () { //get current page num
        var _self=this;
        this.createCurrentPageList();
        JM.addHandler(this.pageCurrentChoiceBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            JM.addClass(_self.pageCurrentChoice,'show');
            var sm=_self.pageCurrentChoice.querySelectorAll('small'),
                self=this;
            getIndex(sm,this,function (pN) {
                _self.currentPage=pN;
                _self.currentPageNum.innerHTML=pN;
                JM.removeClass(this.parentNode.parentNode,'show');
                _self.cE.trigger('updateMsg');
            });
        },false);
    };
    fn.getPageList=function () { //get current page size
        var _self=this;
        this.createPageList();
        JM.addHandler(this.pageSizeBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            JM.addClass(_self.pageSizeChoice,'show');
            var sm=_self.pageSizeChoice.querySelectorAll('small');
            getIndex(sm,this,function (size) {
                _self.pageSize=size;
                JM.removeClass(this.parentNode.parentNode,'show');
                _self.change();
                _self.getCurrentPage();
                _self.currentPageNum.innerHTML=1;
                _self.pageCurrentChoiceBtn.value=1;
                _self.cE.trigger('updateMsg');
            });
        },false);
    };
    fn.getPrev=function () {
        var _self=this;
        JM.addHandler(this.lastIndexBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            if(--_self.currentPage<_self.beginPageIndex){
                _self.currentPage=_self.beginPageIndex;
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }else{
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }
            _self.cE.trigger('updateMsg');
        },false);
    };
    fn.getNext=function () {
        var _self=this;
        JM.addHandler(this.nextIndexPage,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            if(++_self.currentPage>_self.endPageIndex){
                _self.currentPage=_self.endPageIndex;
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }else{
                _self.currentPageNum.innerHTML=_self.currentPage;
                _self.pageCurrentChoiceBtn.value=_self.currentPage;
            }
            _self.cE.trigger('updateMsg');
        },false);
    };
    fn.getFirst=function () {
        var _self=this;
        JM.addHandler(this.beginPageBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            _self.currentPage=_self.beginPageIndex;
            _self.currentPageNum.innerHTML=_self.currentPage;
            _self.pageCurrentChoiceBtn.value=_self.currentPage;
            _self.cE.trigger('updateMsg');
        },false);
    };
    fn.getEnd=function () {
        var _self=this;
        JM.addHandler(this.endPageBtn,'click',function (e) {
            JM.stopPropagation(JM.getEvent(e));
            _self.currentPage=_self.endPageIndex;
            _self.currentPageNum.innerHTML=_self.currentPage;
            _self.pageCurrentChoiceBtn.value=_self.currentPage;
            _self.cE.trigger('updateMsg');
        },false);
    };
    fn.change=function () {
        var _len=this.recordCount;
        if(_len){
            this.endPageIndex=Math.ceil(_len/this.pageSize);
        }else this.endPageIndex=1;
        this.getCurrentPage();
    };
    fn.updateMsg=function (fn) {
       var self=this;
       var msg=(function () {
           var _self=self;
           return function () {
               fn.call(_self,function (result) {
                   console.log(result,result.pageCount,result.recordCount);
                   _self.pageList=result.pageList|| _self.pageList;
                   _self.pageSize=result.pageSize|| _self.pageSize;
                   _self.pageCount=result.pageCount|| _self.pageCount;
                   _self.beginPageIndex=result.beginPageIndex|| _self.beginPageIndex;
                   _self.currentPage=result.currentPage|| _self.currentPage;
                   _self.endPageIndex=result.endPageIndex|| _self.endPageIndex;
                   _self.recordCount=result.recordCount|| _self.recordCount;
                   _self.recordList=result.resultList|| _self.recordList;
                   _self.totalRecords.innerHTML=_self.recordCount;
                   _self.change();
               },{
                   'currentPage':parseInt(_self.pageCurrentChoiceBtn.value),
                   'pageSize':parseInt(_self.pageSizeBtn.value)
               });
           };
       })();
       this.cE.listen('updateMsg',msg);
   };
    fn.init=function () {
       this.createStructure();
       this.getCurrentPage();
       this.getPageList();
       this.getPrev();
       this.getNext();
       this.getFirst();
       this.getEnd();
       this.cE.trigger('updateMsg');
   };

   // if(JM.getEle('[jm-Pagination]')){
   //     var a=JM.getEle('[jm-Pagination]');
   //     var b=new $.Pagination(a,{});
   //     var d={
   //         'recordList':[1,2,3,4,5,6,7,8,10,11]
   //     };
   //     b.updateMsg(function (handle,data) {
   //          console.log(data);
   //     });
   //     b.init();
   // }
})(window.JM.component);