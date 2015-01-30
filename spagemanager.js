/** sPageManager页面栈管理库,适用于spa(simple page application)webapp页面切换管理，也可用于幻灯。
 * build by awen @71752352@qq.com
 * 1 所有页面包含在同一个页面容器里，页面容器的样式为:pt-main，沿用pt-前缀是为了尊重pageanimations库
 * 2 所有的页面样式名为：pt-page；内核不编辑页面的展现样式，请自根据app自定义，具体参考demo。
 */
;(function($){
	var lastPage=null,		//上一页对象
		curPage=null,				//当前页对象
		//页面栈，记录当前的所有页面记录，后入先出（返回）	
		pageStack = [],
		//对pageanimations动画库列表
		_anims = ['none','move','moveFade','flip','rotateCube','rotatePush','rotateFold','rotateCarousel'],
		_defanim = 'none', //默认全局动画方式
		//自定义动画处理栈,优先级比默认的高,
		_animsProcess = {
			'rotateCube':{
				//垂直：[inAnimType,inDistance,inDelay,outAnimType,outDistance,outDelay]
				'v':['rotateCube','Top',0,'rotateCube','Top',0],
				'h':['rotateCube','Left',0,'rotateCube','Left',0],
			},
			'rotateCarousel':{
				'v':['rotateCarousel','Top',0,'rotateCarousel','Top',0],
				'h':['rotateCarousel','Left',0,'rotateCarousel','Left',0],
			},
			'flip':{
				'v':['flip','Bottom',500,'flip','Top',0],
				'h':['flip','Right',500,'flip','Left',0],
			}
		},
		_distances = ['v','h'], //支持方向列表
		_defdistance = 'h',	//默认全局方向
		/**
		 * 页面基本对象类
		 * @param  string sel		页面唯一选择器
		 * @param  string anim	封装的支持的动画类型
		 * @param  string distance	动画方向 v|h
		 */
		pageObj = function(sel,anim,distance){
			this.sel= sel;
			this.hash = location.hash;	//如crow5,github都是通过hash来定位和管理页面实例栈的,所以该项也很重要，在回退的同时要
			this.singleInstance = false; //是否单例,暂未实现
			this.anim = anim;
			this.distance = distance;
		};

	// 根据动画类型获取in动画参数数组
	function _getAnimIn(anim,distance,isback){
		//后期考虑统一delay处理方式
		var _delay = 0,
			_anim = anim,
			_distance = distance,
			_animlist;
		//自定义动画处理栈的优先级比较高
		if(anim in _animsProcess){
			_animlist = _animsProcess[anim];
			if(!(distance in _animlist)){
				return false;
			}
			_anim = _animlist[distance][0];
			_distance = _animlist[distance][1];
			_delay = _animlist[distance][2];
		}else{
			_distance = distance=='v'?'Bottom':'Right';
		}

		if(isback){
			_distance = _getReverseDistance(_distance);
		}
		return [_anim,_distance,_delay];
	}
	// 根据动画类型获取out动画参数数组
	function _getAnimOut(anim,distance,isback){
		var _delay = 0,
			_anim=anim,
			_distance = distance,
			_animlist;
		//自定义动画处理栈的优先级比较高
		if(anim in _animsProcess){
			_animlist = _animsProcess[anim];
			if(!(distance in _animlist)){
				return false;
			}
			_anim = _animlist[distance][3];
			_distance = _animlist[distance][4];
			_delay = _animlist[distance][5];
		}else{
			_distance = distance=='v'?'Top':'Left';
		}
		//除了判断回退
		if(isback){
			_distance = _getReverseDistance(_distance);
		}
		return [_anim,_distance,_delay];
	}
	//获取反方向
	function _getReverseDistance(distance){
		var reverse = '';
		switch(distance){
			case 'Top':
				reverse = 'Bottom';
			break;
			case 'Bottom':
				reverse = 'Top';
			break;
			case 'Left':
				reverse = 'Right';
			break;
			case 'Right':
				reverse = 'Left';
			break;
		}
		return reverse;
	}
	/**
	 * 页面切换基本类,依托于pageanimations动画css3库的修改库仅用于webkit内核浏览器
	 * @param string sel 当前页的css selector
	 * @param string animtype css3中支持的初始动画类型(none不需要distance和delay个参数)：
	 												none|move|moveFade|rotateCube|rotatePush|rotateFold|rotateRoom|rotateCarousel|flip
	 * @param string inout 进出（显示和隐藏页面）:In|Out
	 * @param string distance 方向
	 *                      Left|Right|Top|Bottom
	 * @param number delay animate延时执行，多用于前后两组动画衔接，例如animtype为flip时
	 *                     100|180|200|300|400|500|700|1000
	 */
	function _pageanim(pselector,animtype,inout,distance,delay){
		var page = $(pselector),
			anim = animtype=='none'||!animtype?'':'pt-page-'+animtype+distance+inout,
			onTop = inout=="Out"?false:true;
		//动画
		if (page.length==0) {return;}
		_resetPage(page);

		if (animtype!="none") {
			page.on('webkitAnimationEnd',function(e) {
				_resetPage(this);
			});
			page.on('webkitTransitionEnd',function(e) {
				_resetPage(this);
			});
		}

		if (delay) {
			anim+=' pt-page-delay'+delay;
		}
		var rmcls = anim;

		if (onTop) {
			anim+=' pt-page-current pt-page-top';
			rmcls+=' pt-page-top';
		}else{
			rmcls+=' pt-page-current';
		}
		// console.log(anim,onTop,rmcls);
		page.data('pt-animcname',rmcls).addClass(anim);
		//非动画效果要实时清除页面效果以及临时数据
		if (animtype=="none") {
				_resetPage(page);
		}
	}
	/**
	 * 重置页面，取消动画等参数属性
	 */
	function _resetPage(pselector){
		var page = $(pselector),
			animcname = page.data('pt-animcname')||false;
		// console.log(animcname);
		if (animcname) {
			page.off('webkitAnimationEnd').off('webkitTransitionEnd').removeData('pt-animcname').removeClass(animcname);
		}
	}
	/**
	 * 扩展支持的动画列表库
	 * @param  string animname 		要扩展的动画类型名称，如果与已有动画重名将覆盖已有动画
	 * @param  string distance 		要扩展的动画类型的方向（v|h）
	 * @param  string inAnimType  进入页面的动画效果，参见anim接口注释
	 * @param  string inDistance  进入页面的方向，参见anim接口注释
	 * @param  int inDelay  			进入页面动画执行的延时时间参见anim接口注释
	 * @param  string outAnimType 退出页面的动画效果，参见anim接口注释
	 * @param  string outDistance 退出页面的方向，参见anim接口注释
	 * @param  int outDelay 			退出页面动画执行的延时时间参见anim接口注释
	 * @return boolean 
	 */
	function _extend(animname,distance,inAnimType,inDistance,inDelay,outAnimType,outDistance,outDelay){
		//简单的参数判断
		if(!animname || !inDistance || !outDistance || !distance ||
			!inAnimType || _anims.indexOf(inAnimType)==-1 ||
			!outAnimType || _anims.indexOf(outAnimType)==-1){
			return false;
		}else{
			if(!(animname in _animsProcess)){
				_animsProcess[animname] = {};
				_anims.push(animname);
			}
			_animsProcess[animname][distance]=[inAnimType,inDistance,inDelay||0,outAnimType,outDistance,outDelay||0];
			return true;
		}
	}
	/**
	 * 对外提供接口
	 */
	window.sPageManager = {
		/**
		 * 设置页面管理器的全局变量，非必须
		 * @param globalanim 初始全局默认动画类型：none(默认)|move|moveFade|rotateCube|rotatePush|rotateFold|rotateRoom|rotateCarousel|flip
		 * @param globaldistance 初始全局默认动画方向：h(默认)|v
		 */
		init : function(globalanim,globaldistance){
			if (globalanim && _anims.indexOf(globalanim)>-1) {
				_defanim = globalanim;
			}
			if (globaldistance && _distances.indexOf(globaldistance)>-1) {
				_defdistance = globaldistance;
			}
		},
		/**
		 * 显示页面
		 * @param  string sel  页面标签的id选择器,例如（#pt-page1）
		 * @param  string anim 支持的动画类型,默认为全局设定的
		 * @param  string distance 动画的方向，v|h，默认是横向(h)
		 * @return object 当前页面对象
		 */
		show : function(sel,anim,distance){
			//inout都是以当前页为准
			var _anim = (typeof anim != 'undefined' && _anims.indexOf(anim)>-1)?anim:_defanim,
				_distance = (typeof distance != 'undefined' && _distances.indexOf(distance)>-1)?distance:_defdistance,
				animIn = _getAnimIn(_anim,_distance),
				animOut = _getAnimOut(_anim,_distance),
				page;
			if ($(sel).length==0) {return false;}
			if(!animIn || !animOut){
				return false;
			}
			page = new pageObj(sel,_anim,_distance);
			pageStack.push(page);
			if (curPage) {
				_pageanim(curPage.sel,animOut[0],'Out',animOut[1],animOut[2]);
			}
			lastPage = curPage;
			curPage = page;
			_pageanim(sel,animIn[0],'In',animIn[1],animIn[2]);
			return curPage;
		},
		//基础页面动画高级接口，该接口使用后显示的不是本库的page对象，
		//所以不再页面栈中体现，只是给用户提供了高级自定义动画接口，后期增加扩展page切换动画组合接口
		anim:_pageanim,

		//扩展动画接口
		extend : _extend,
		/**
		 * 页面后退 默认使用页面展示时动画的反向动画
		 * @param boolean stoponlast 是否保留最后一页 默认false
		 * @return 成功返回当前页对象，无责返回null
		 */
		back:function(stoponlast){
			var animOut,animIn;
			//有上一页才能返回
			if (!curPage) {
				return null;
			}
			//inout都是以当前页为准
			animOut = _getAnimOut(curPage.anim,curPage.distance,true);
			animIn = _getAnimIn(curPage.anim,curPage.distance,true);
			if(!animIn || !animOut){
				return null;
			}
			if(!stoponlast || lastPage){
				_pageanim(curPage.sel,animOut[0],'Out',animOut[1],animOut[2]);
				pageStack.pop();
			}
			if (lastPage){
				_pageanim(lastPage.sel,animIn[0],'In',animIn[1],animIn[2]);
				curPage = lastPage;
			}else if(!stoponlast){
				curPage = null;
			}

			var len = pageStack.length;
			if (len>1) {
				lastPage = pageStack[len-2];
			}else{
				lastPage = null;
			}
			// console.log(len,lastPage);
			return curPage;
		},
		//获取支持的动画列表
		getSupportAnims:function(){
			return _anims;
		},
		//获取页面栈
		getStack:function(){
			return pageStack;
		},
		// 获取当前页
		getCurrentPage:function(){
			return curPage;
		},
		//获取上一页
		getLastPage:function(){
			return lastPage;
		}
	};
})(jQuery);