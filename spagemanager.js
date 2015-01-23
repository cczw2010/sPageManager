/** sPageManager页面栈管理库,适用于spa(simple page application)webapp页面切换管理，也可用于幻灯。
 * build by awen @71752352@qq.com
 * 1 所有页面包含在同一个页面容器里，页面容器的样式为:pt-main，沿用pt-前缀是为了尊重pageanimations库
 * 2 所有的页面样式名为：pt-page；内核不编辑页面的展现样式，请自根据app自定义，具体参考demo。
 */
;(function($){
	var lastPage=null,			//上一页对象
		curPage=null,				//当前页对象
		//页面栈，记录当前的所有页面记录，后入先出（返回）	
		pageStack = [],
		//对pageanimations动画库列表
		_anims = ['none','move','moveFade','flip','rotateCube','rotatePush','rotateFold','rotateCarousel'],
		_defanim = 'none', //默认全局动画方式
		_animsSpacile = ['rotateCube','rotateCarousel'], //动画列表中的进出同向动画
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
			this.anim = (typeof anim != 'undefined' && _anims.indexOf(anim)>-1)?anim:_defanim;
			this.distance = (typeof distance != 'undefined' && _distances.indexOf(distance)>-1)?distance:_defdistance;
		};

	// 根据动画类型获取in动画参数数组
	function _getAnimIn(anim,distance,isback){
		var delay = anim=="flip"?500:0;
		//同向动画的进入动画与退出动画是一个方向
		if(_animsSpacile.indexOf(anim)>-1){
			return _getAnimOut(anim,distance,isback);
		}

		if(isback){
			distance = distance=='v'?'Top':'Left';
		}else{
			distance = distance=='v'?'Bottom':'Right';
		}
		return [anim,distance,delay];
	}
	// 根据动画类型获取out动画参数数组
	function _getAnimOut(anim,distance,isback){
		//除了判断回退
		if(isback){
			distance = distance=='v'?'Bottom':'Right';
		}else{
			distance = distance=='v'?'Top':'Left';
		}
		return [anim,distance,0];
	}
	/**
	 * 页面切换基本类,依托于pageanimations动画css3库的修改库仅用于webkit内核浏览器
	 * @param string sel 当前页的selector
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
			var animIn = _getAnimIn(anim,distance),
				animOut = _getAnimOut(anim,distance),
				page;
			// console.log(animIn,animOut);
			if ($(sel).length==0) {return false;}
			page = new pageObj(sel,anim,distance);
			pageStack.push(page);
			if (curPage) {
				_pageanim(curPage.sel,animOut[0],'Out',animOut[1],animOut[2]);
			}
			lastPage = curPage;
			curPage = page;
			_pageanim(sel,animIn[0],'In',animIn[1],animIn[2]);
			return curPage;
		},
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