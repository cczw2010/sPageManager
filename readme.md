 sPageManager页面栈管理库，一个基于pageanimations样式库的js小库，适用于spa应用的页面转换管理,也可用与幻灯切换等。源码：[github](https://github.com/cczw2010/sPageManager)

###build by awen  


###description:
 * 1 所有页面包含在同一个页面容器里，页面容器的样式为:pt-main，沿用pt-前缀是为了尊重pageanimations库
 * 2 所有的页面样式名为：pt-page；核心代码不为pt-page增加多余样式，请自定定义页面展示样式
 
===
###api

* 设置页面管理器的全局变量，非必须
		
		/**
		* @param globalanim 初始全局默认动画类型：none(默认)|move|moveFade|rotateCube|rotatePush|rotateFold|rotateRoom|rotateCarousel|flip
		* @param globaldistance 初始全局默认动画方向：h(默认)|v
		*/
		sPageManager.init(globalanim,globaldistance)




* 显示页面

		/**
		 * @param  string sel  页面标签的id选择器,例如（#pt-page1）
		 * @param  string anim 支持的动画类型,默认为全局设定的
		 * @param  string distance 动画的方向，v|h，默认是横向(h)
		 * @return object 当前页面对象
		 */
		sPageManager.show(sel,anim,distance)
		
* 页面后退 默认使用页面展示时动画的反向动画

		/**
		 * @param boolean stoponlast 是否保留最后一页 默认false
		 * @return 成功返回当前页对象，无责返回null
		 */
		sPageManager.back(stoponlast)
		
* 获取支持的动画列表

		sPageManager.getSupportAnims()
		
* 获取页面对象历史栈

		sPageManager.getStack()
		
* 获取当前页页面对象

		sPageManager.getCurrentPage()
		
* 获取上一页页面对象

		sPageManager.getLastPage()


* 页面对象结构：
		
		{
			sel:'',					//当前页元素的选择器
			hash:'',				//当前页展示时的hash值，可用于基于hash的spa应用
			singleInstance:false,	//待扩展
			anim:'',				//动画类型
			distance:''				//动画方向
		}
