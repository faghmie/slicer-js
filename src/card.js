function open_card(content, on_show, on_close){
	return new Card(content, on_show, on_close);
}

function Card(content, on_show, on_close){
	var $this = this,
		overlay = $('<div>').addClass('ui-overlay').appendTo('body');
    
	var options = {
			width: '40vw',
			'min-width': '40vw',
			'max-width': '100vw',
			height: '40vh',
			'max-height': '50vh',
			'min-height': '40vh',
			overflow	: 'auto',
		};
	
    if (typeof on_show === 'function' || 
		typeof on_close === 'function'){
		options.on_show = on_show;
		options.on_close = on_close;
	} else {
		options = $.extend(options, on_show);
	}
	
	if (typeof options.width === 'undefined') options.width = '40vw';
	
	if (typeof options.no_header === 'undefined') options.no_header = false;
	
	var div = $('<div class="popup-card biznous-glow d-flex flex-column">'+
					'<div class="header-row d-flex justify-content-between ">'+
						'<div class="drag-me title">'+
							'<h6 class="header"/>'+
						'</div>'+
						'<div class="">'+
							'<i class="close-btn pull-right fa fa-fw fa-lg fa-times" style="color: #9F9F9F" />'+
						'</div>'+
					'</div>'+
					'<div class="body-wrapper">'+
						'<div class="body-content">'+
						'</div>'+
					'</div>'+
					'<div class="drag-me" style="cursor: move;min-height:15px;max-height:15px;">'+
					'</div>'+
				'</div>')
			.css({
					position: 'absolute',
					'border-radius': '5px',
					zIndex: 9001,
					top: 0,
					overflow: 'hidden',
					width : options.width,
					padding: '10px',
					'max-width' : options['max-width'],
					'min-width' : options['min-width'],
					'max-height' : '90vh',
				})
			.appendTo(overlay)
			.show();
	
	
	if (true === options.transparent){
		div.removeClass('card shadow-lg');
		div.css('box-shadow', '');
	}

    div.find('.body-content')
		.append(content)
		.css({
			'min-height' : options['min-height'],
			height: options.height,
			overflow: options.overflow,
		});
	
	div.draggable({handle: '.drag-me'});
	if (options.title){
		div.find('.header').append(options.title);
	}
	
	function close(_callback){
		$('body').css({'overflow': 'auto'});
		if (this.is_closed === true || !div) return;
		
		this.is_closed  = true;
		
		div.animate({right:'-800'}, 
			{
				queue: false, 
				duration: 50, 
				complete: function(){
					overlay.remove();
					
					if (typeof(options.on_close) === 'function') 
						options.on_close(div);
					
					if (div) div.remove();
					div = null;
					if (typeof _callback === 'function') _callback();
				},
			}
		);
	}
	
	div.find('i.close-btn').on('click', this, function(evt){
		close.call(evt.data);
	});

	$('body').css({'overflow': 'hidden'});
	overlay.show(function(){
		div.animate({right:'0px'}, 
			{
				queue: false, 
				duration: 200, 
				complete: function(){
					if (typeof(options.on_show) === 'function') options.on_show(div);
				},
			}
		);

		div.show(function(){
			// if (typeof(options.on_show) === 'function') options.on_show();
			if (!div) return;
			div.position({
					of	: overlay,
					my	: 'center center',
					at	: 'center center'
				});
		});
    });
	
	recenter = function(){
		div.position({
			of	: overlay,
			my	: 'center center',
			at	: 'center center'
		});
	};

	this.is_closed = false;
	return {
	   close: close,
	   recenter: recenter,
	   container: div 
	};
}
