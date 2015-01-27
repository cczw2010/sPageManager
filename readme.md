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

* 基础动画高级接口（非本库page对象组合动画，不在本库页面栈中统一管理）

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
		sPageManager.anim(sel,animtype,inout,distance,delay)

* 获取支持的动画列表

		sPageManager.getSupportAnims()

* 扩展页面动画列表库，扩展后可在show接口中使用

		/**
	    * @param  string animname 		要扩展的动画类型名称，如果与已有动画重名将覆盖已有动画
	    * @param  string distance 		要扩展的动画类型的方向（v|h）
	    * @param  string inAnimType		进入页面的动画效果，参见anim接口注释
	    * @param  string inDistance		进入页面的方向，参见anim接口注释
	    * @param  int inDelay  			进入页面动画执行的延时时间参见anim接口注释
	    * @param  string outAnimType	退出页面的动画效果，参见anim接口注释
	    * @param  string outDistance	退出页面的方向，参见anim接口注释
	    * @param  int outDelay 			退出页面动画执行的延时时间参见anim接口注释
	    * @return boolean 
	    */
	    sPageManager.extend(animname,distance,inAnimType,inDistance,inDelay,outAnimType,outDistance,outDelay)
	

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
