(function($){
	
	/**
	* @file jquery.slider.js
	* @author Sascha Weidner
	* @class slider
	* @copyright Sascha Weidner, Sioweb
	* http://www.sioweb.de - support|at|sioweb.de
	*
	* Dieser Slider setzt in erster Linie auf moderne Browser und vergibt nur Klassen. Es wird geprüft ob CSS Animation oder Transition möglich sind und 
	* führt eine jQuery Animation aus falls diese Eigenschaften nicht unterstützt werden. 
	*/
	
	"use strict";
	var Sws = function()
	{
		var selfObj = this;
		this.item = false;
		this.active = 1;
		this.activeItem = 0;
		this.timeout = null;
		this.css3 = false;

		this.init = function(elem)
		{
			var support = false;
			/* Object ist jetzt überall gültig, auch in Events */
			selfObj = this;
			/**/
			
			this.elem = elem;
			this.item = $(this.elem);

			/* Slider-Type auswählen um Performance zu sichern */
			if((support = this.checkSupport('animation')))
				this.cssAnimation(support);
			if((support = this.checkSupport('transition')))
				this.cssTransition(support);
			/**/
			if(!this.css3)
				this.item.addClass('noCSS3');

			this.countItems = $(this.elem).find(this.items).length;

			$(this.elem).find(this.items).first().addClass('slider_first');

			/* Nicht sliden wenn nicht mindestens 2 Objekte vorhanden sind. */
			if(this.countItems < 2)
				return false;

			if(this.navigation)
				this.addNavigation();

			this.after();
			this.timeout = setTimeout(this.next, this.intervall);
		};

		this.cssAnimation = function(prop)
		{
			this.css3 = true;
			this.item.addClass('kd_slider_animation');
		};

		this.cssTransition = function()
		{
			this.css3 = true;
			this.item.addClass('kd_slider_transition');
		};

		this.addNavigation = function()
		{
			selfObj.navigation = $('<div class="slider_navigation" />').appendTo(this.item);
			$('<span class="slider_prev" />').appendTo(selfObj.navigation).click(selfObj.prev);
			for(var i = 0; i < selfObj.countItems; i++)
				$('<span />').appendTo(selfObj.navigation).click(selfObj.slideTo);
			$('<span class="slider_next" />').appendTo(selfObj.navigation).click(selfObj.next);
		};

		this.slideTo = function()
		{
			/* könnte bei drücken auf den Zurückbutton auf die Rückwärtsrichtung eingestellt werden */
			var action = selfObj.next,
				activeItem = false;

			if(selfObj.stopped)
				return false;

			selfObj.before();

			/* WICHTIG: this ist der geklickte Button in der Navigation!!! <- Rudelzeichen */
			/* Nichts machen, wenn der Button für das aktuell angezeigte Bild gedrückt wird */
			if(selfObj.activeItem == ($(this).index()-1))
				return false;

			/* Steht das ausgewählte Bild nach dem aktuell angezeigten Bild bewege den Slider vorwärts */
			if(selfObj.activeItem < ($(this).index()-1))
			{
				activeItem = selfObj.item.find(selfObj.items).removeClass('next').removeClass('prev').eq(selfObj.activeItem).addClass('next');
				if(!selfObj.css3)
					activeItem.css('left',0).animate({'left': '-100%'},selfObj.speed);
				selfObj.activeItem = $(this).index()-1;
				activeItem = selfObj.item.find(selfObj.items).removeClass('activeNext').removeClass('activePrev').eq(selfObj.activeItem).addClass('activeNext');
				if(!selfObj.css3)
					activeItem.css('left','100%').animate({'left': '0'},selfObj.speed);
			}
			/* Steht das ausgewählte Bild hinter dem aktuell angezeigten Bild bewege den Slider rückwärts */
			else
			{
				activeItem = selfObj.item.find(selfObj.items).removeClass('next').removeClass('prev').eq(selfObj.activeItem).addClass('prev');
				if(!selfObj.css3)
					activeItem.css('left',0).animate({'left': '100%'},selfObj.speed);
				selfObj.activeItem = $(this).index()-1;
				activeItem = selfObj.item.find(selfObj.items).removeClass('activeNext').removeClass('activePrev').eq(selfObj.activeItem).addClass('activePrev');
				if(!selfObj.css3)
					activeItem.css('left','-100%').animate({'left': 0},selfObj.speed);
			}

			selfObj.after();

			/* Ist der Slider aktiv, also so zu sagen Autoplay => true, wird das nächste bild angezeigt*/
			if(selfObj.active)
				selfObj.timeout = setTimeout(action, selfObj.intervall);
		};

		this.next = function()
		{
			var activeItem = false;
			if(selfObj.stopped)
				return false;
			selfObj.before();
			activeItem = selfObj.item.find(selfObj.items).removeClass('next').removeClass('prev').eq(selfObj.activeItem).addClass('next');
			if(!selfObj.css3)
				activeItem.css('left',0).animate({'left': '-100%'},selfObj.speed);
			selfObj.activeItem++;
			if(selfObj.activeItem >= selfObj.countItems)
				selfObj.activeItem = 0;

			activeItem = selfObj.item.find(selfObj.items).removeClass('activePrev').removeClass('activeNext').eq(selfObj.activeItem).addClass('activeNext');
			if(!selfObj.css3)
				activeItem.css('left','100%').animate({'left': '0'},selfObj.speed);

			selfObj.after();

			if(selfObj.active)
				selfObj.timeout = setTimeout(selfObj.next, selfObj.intervall);
		};

		this.prev = function()
		{
			var activeItem = false;
			if(selfObj.stopped)
				return false;
			selfObj.before();
			activeItem = selfObj.item.find(selfObj.items).removeClass('next').removeClass('prev').eq(selfObj.activeItem).addClass('prev');
			if(!selfObj.css3)
				activeItem.css('left',0).animate({'left': '100%'},selfObj.speed);
			selfObj.activeItem--;
			if(selfObj.activeItem < 0)
				selfObj.activeItem = selfObj.countItems-1;

			activeItem = selfObj.item.find(selfObj.items).removeClass('activePrev').removeClass('activeNext').eq(selfObj.activeItem).addClass('activePrev');
			if(!selfObj.css3)
				activeItem.css('left','-100%').animate({'left': '0'},selfObj.speed);

			selfObj.after();

			if(selfObj.active)
				selfObj.timeout = setTimeout(selfObj.prev, selfObj.intervall);
		};

		this.before = function()
		{
			clearTimeout(selfObj.clickTimeout);
			if(selfObj.clickStop)
			selfObj.stopped = true;
				selfObj.clickTimeout = setTimeout(function(){selfObj.stopped = false;},selfObj.clickStop);
			clearTimeout(selfObj.timeout);
			selfObj.item.find(selfObj.items).removeClass('slider_first');
		};

		this.after = function()
		{
			if(selfObj.navigation)
				selfObj.navigation.find('span').removeClass('active').eq((selfObj.activeItem+1)).addClass('active');
		};

		/**
		* Prüft ob eine CSS-Eigenschaft vorhanden ist, bspw. transition, animation etc. …
		*/
		this.checkSupport = function(prop)
		{
			var div = document.createElement('div'),
			vendors = 'Khtml Ms O Moz Webkit'.split(' '),
			len = vendors.length;

			return (function(prop)
			{
				if(prop in div.style) return prop;
				prop = prop.replace(/^[a-z]/, function(val){
					return val.toUpperCase();
				});

				while(len--){
					if(vendors[len] + prop in div.style ){
						return vendors[len] + prop;
					}
				}
				return false;
			})(prop);
		};
	};
	
	$.fn.slider = function(settings)
	{
		var slider = {};
		return this.each(function()
		{
			var SWS = new Sws();
			
			if(!settings)
				settings = {};
			
			SWS = $.extend(settings,SWS);
			
			/** Standard-Einstellungen als Fallback-Einstellungen. */
			SWS = $.extend({
				clickStop: settings.clickStop||false,
				navigation: settings.navigation||false,
				items: settings.items||'img',
				intervall: settings.intervall||4000,
				speed: settings.speed||4000,
				delay: settings.delay||1000
			},SWS);
			
			/** Initialisieren. */
			SWS.init(this);
			slider[$(this).attr('id')] = SWS;
        });
	};
	
})(jQuery);