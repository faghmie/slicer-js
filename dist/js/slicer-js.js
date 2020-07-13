var AdhocCard = {

    _get_frame: function(){
        var frame = $(
            '<div class="adhoc-container d-flex -flex-column">'+
                '<div class="left-pane form-group mr-2">'+
                    '<ul class="dataset list-group -list-group-flush"/>'+
                '</div>'+
                '<div class="frame-body w-100">'+
                    '<ul class="field-list list-group list-group-flush"/>'+
                '</div>'+
            '</div>'
        );
        
        frame.find('.left-pane, .frame-body').css({
            'height': '65vh',
            'max-height': '65vh',
            overflow: 'auto',
        });
        frame.find('.left-pane').css({
            'width': '200px',
            'min-width': '200px',
        });
        return frame;
    },

    show: function(options){
        var slicer = AdhocCard._get_frame(),
            dataset = slicer.find('.dataset'),
            list = [];

        options = $.extend({type: 'slicer', container: 'body'}, options);
        options.container = $(options.container);
        options.frame = slicer;

        for(var ds in cache){
            if (typeof cache[ds] === 'function') continue;
            list.push(ds);
        }
        list = list.sort(function(a,b){return a.localeCompare(b);});
        list.forEach(function(v){
            dataset.append('<a class="list-group-item list-group-item-action text-capitalize">'+ v.replace('_', ' ').trim() +'</a>');
            dataset.find('a:last-child').data('dataset', v);
        });

        dataset.find('a').css('cursor', 'pointer');
        
        dataset.off('click').on('click', '.list-group-item', dataset, function(evt){
            evt.stopPropagation();
            dataset.find('.list-group-item').removeClass('active');
            $(this).addClass('active');
            options.dataset = cache[$(this).data('dataset')];
            AdhocCard._dataset_changed(options);
        });

        if (options.pane){
            options.pane.children().remove();
            options.pane.append(slicer);
        } else {
            open_card(slicer,{
                title: options.title,
                'min-width': '60vw',
                'min-height': '70vh'
            });
        }
    },

    _dataset_changed: function(options){
        var list = options.frame.find('.field-list'),
            view = null, existing = [], show_list = [];

        list.children().remove();
        if (options.type === 'slicer')
            view = options.container.data('slicers');
        else
            view = options.container.data('infocards');

        view.forEach(function(slicer){
            existing.push(slicer.toObject().field);
        });
        options.dataset.header.forEach(function(col, index){
            if (index === 0) return;
            if (existing.indexOf(col) !== -1) return;
            
            show_list.push(col);
        });
        show_list = show_list.sort(function(a,b){return a.localeCompare(b);});
        show_list.forEach(function(v){
            list.append('<a class="list-group-item list-group-item-action">'+ v +'</a>');
            list.find('a:last-child').attr('dataset', options.dataset.name);
        });
        
        list.find('a').css('cursor', 'pointer');
        
        list.off('click').on('click', '.list-group-item', list, function(evt){
            var list = evt.data,
                item = $(this).text();
            
            evt.stopPropagation();

            if (options.type == 'slicer')
                (new Slicer())
                    .attach({
                                container: options.container,
                                dataset: $(this).attr('dataset'), 
                                style: 'secondary', 
                                left: 50, 
                                top: 50, 
                                width: 300, 
                                height: 300, 
                                title: item, 
                                field: item})
                    .make_editable();
            else if (options.type == 'org') {
                (new OrgCard())
                    .attach({
                                container: options.container,
                                dataset: $(this).attr('dataset'), 
                                style: 'secondary', 
                                left: 50, 
                                top: 50, 
                                width: 200, 
                                height: 200, 
                                title: item, 
                                field: item})
                    .make_editable();
            } else {
                (new InfoCard())
                    .attach({
                                container: options.container,
                                dataset: $(this).attr('dataset'), 
                                style: 'secondary', 
                                left: 50, 
                                top: 50, 
                                width: 200, 
                                height: 120, 
                                title: item, 
                                field: item})
                    .make_editable();
            }
            iterate_slicers();
        });
    }
};;var BaseCard = {
        table: null,
        dataset: null,
        field: null,
        col_id: null,
        frame: null,
        PARENT_SET: 'slicers',
        
    _get_frame: function(options){
        var dim = $.extend({
                        width: '400px',
                        height: '200px',
                        top: '200px',
                        left: '200px',
                        style: 'primary',
                    }, options),
            $this = this;

        var frame = $(
            '<div class="small dash-frame">'+
                '<div class="title-bar">'+
                    '<div class="frame-title" />'+
                    '<div class="dash-edit">'+
                        // '<div class="-btn-group -btn-group-xs">'+
                            '<a class="slicer-setting btn btn-light btn-link"><i class="fa fa-cog"></i></a>'+
                            '<a class="slicer-remove btn btn-light btn-link"><i class="fa fa-trash"></i></a>'+
                        // '</div>'+
                    '</div>'+
                '</div>'+                
                '<div class="frame-body h-100 m-2" />'+
            '</div>'
        );

        frame
            .css({
                width: dim.width,
                height: dim.height,
                top: dim.top,
                left: dim.left,
                display: 'inline-block',
                overflow: 'hidden',
                position: 'absolute',

            })
            .addClass('border-'+ dim.style);
        
        frame.find('.frame-body').css({
            overflow: 'auto'
        });

        frame.on('click', function(evt){
                evt.stopPropagation();
                $($this.table).children().css('z-index', 0);
                $(this).css('z-index', 1);
            });

        frame.find('.slicer-remove')
            .on('click', function(evt){
                evt.stopPropagation();
                var del_key = null;

                $this.table.data($this.PARENT_SET).forEach(function(item, index){
                    if (item === $this){
                        frame.remove();
                        del_key = index;
                    }
                });
                $this.table.data($this.PARENT_SET).splice(del_key, 1);
                $this.options.on_change($this);
            });

        frame.find('.slicer-setting')
            .on('click', this, function(evt){
                evt.stopPropagation();
                new CardFormat(evt.data);
            });

        frame.find('.dash-edit').hide();
        return frame;
    },
    
    make_editable: function(){
        var $this = this;
        
        this.frame
        .draggable({
            handle: '.title-bar', 
            grid: [5,5], 
            containment: [0, 40],
            start: function(){$this.options.on_before_change($this);},
            stop: function(){$this.update_frame($this);},
        })
        .resizable({
            grid: [5,5],
            start: function(){$this.options.on_before_change($this);},
            stop: function(){$this.update_frame($this);},
            resize: function(){
                $this.theme();
                $this.set_content();
                $this.resize();
            }
        });
        this.frame.find('.dash-edit').show();//removeClass('d-none');
    },

    move: function(left, top){
        var pos = this.frame.position();
        if (!left) left = parseInt(pos.left);
        if (!top) top = parseInt(pos.top);

        left = parseInt(left) + 'px';
        top = parseInt(top) + 'px';

        this.frame.css({
            top: top,
            left: left
        });
    },

    resize: function(width, height){
        if (!width) width = Math.ceil(this.frame.css('width'));
        if (!height) height = Math.ceil(this.frame.css('height'));

        this.frame.css({
            width: Math.ceil(width) + 'px',
            height: Math.ceil(height) + 'px'
        });

        if (typeof this._resize === 'function') this._resize();
        if (typeof _resize === 'function') _resize();
    },

    toObject: function(){
        var pos = this.frame.position();
        var obj = {
            field: this.field,
            dataset: !this.dataset ? null : this.dataset.name,
            style: this.list_style,
            title: this.title,
            left: pos.left,
            top: pos.top,
            width: this.frame.width(),
            height: this.frame.height()
        };

        if (typeof this._toObject === 'function') this._toObject(obj);

        return obj;
    },
    
    style: function(){
        return {
            text_active: this.text_active,
            list_style: this.list_style
        };
    },

    header: function(text){
        if (typeof text !== 'undefined'){
            this.frame.find('.frame-title').text(text);
            this.title = text;
        } else
            return this.frame.find('.frame-title').text();
    },

    find: function(selector){
        return this.frame.find(selector);
    },

    
    field_index: function(){
        return this.col_id;
    },

    get_dataset: function(){
        return this.dataset;
    },

    theme: function(style){
        var light_color = ['light', 'warning', 'om-sun'];

        this.frame.removeClass('border-'+ this.list_style);
        this.frame.find('.title-bar').removeClass('bg-'+ this.list_style);
        this.frame.find('.frame-body').removeClass('text-'+ this.list_style);

        if (typeof style === 'string' && style.trim().length > 0) this.list_style = style;
        
        this.text_active = light_color.indexOf(style) !== -1 ? 'text-dark' : 'text-white';

        this.frame.addClass('border-'+ this.list_style);
        this.frame.find('.title-bar').addClass('bg-'+ this.list_style);

        this.frame.find('.frame-title')
            .removeClass('text-secondary text-dark text-white')
            .addClass(this.text_active);
        
        if (typeof this._theme === 'function') this._theme();

        this.set_content();
    },

    attach: function(options){
        var frame = this.frame = this._get_frame(options);

        this.table = $(options.container);
        this.field = options.field;

        options = $.extend({
            style: 'primary',
            on_change: function(){console.log('no start save');},
            on_before_change: function(){console.log('no stop save');},
        }, options);

        if (typeof window.dashboard_toObject === 'function') options.on_change = window.dashboard_toObject;
        if (typeof window.stop_auto_save === 'function') options.on_before_change = window.stop_auto_save;

        this.options = options;

        this.title = options.title;
        this.header(options.title);
        if (options.dataset){
            if (typeof options.dataset === 'string'){
                if (options.dataset in cache){
                    this.dataset = cache[options.dataset];
                } else {
                    this.dataset = {
                        name: options.dataset,
                        header: [],
                        rows:[]   
                    };
                }
                
            } else
                this.dataset = options.dataset;
        }

        if (!this.dataset){
            this.dataset = this.html_table_to_dataset(this.table);
        }

        this.col_id = this.dataset.header.indexOf(options.field);

        this.text_active = 'text-'+ (options.style === 'light' ? 'dark' : 'white');
        
        var the_set = this.table.data(this.PARENT_SET);
        if (!(the_set instanceof Array)) the_set = [];

        the_set.push(this);
        this.table.data(this.PARENT_SET, the_set);

        frame.appendTo(this.table);

        if (typeof this._attach === 'function') this._attach(options);

        this.set_content();
        this.theme(options.style);

        return this;
    },

    html_table_to_dataset: function(table){
        var ds = {header:['@visible'], rows:[], name: this.generate_uuid()};
        table.find('th').each(function(){
            ds.header.push($(this).text());
        });

        table.find('tr').each(function(){
            ds.rows.push([1]);

            $(this).find('td').each(function(){
                ds.rows[ds.rows.length - 1].push($(this).text());
            });
        });

        if (typeof table.attr('biznous-ds-key') === 'undefined')
            table.attr('biznous-ds-key', ds.name);
        else{
            table.data('slicers').forEach(function(item){
                var dx = item.get_dataset();
                if (dx.name === table.attr('biznous-ds-key')) ds = dx;
            });
        }

        return ds;
    },

    //EVERY CARD WILL NEED TO WRITE THEIR OWN FUNCTION FOR "SET_CONTENT"
    set_content: function(){

    },

    generate_uuid: function() {
        /*
         * source: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
         */
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
};
;var CardFormat = function (card) {
    var frame = null;
    var themes = ['light', 'secondary', 'danger', 'info', 'warning', 'success', 'dark',
        'heritage-green', 'fresh-green', 'future-green', 'sky', 'sun', 
        'naartjie', 'cerise'];
    
    function get_frame() {
        return $('<div class="d-flex flex-column small">' +
                    '<input class="form-control form-control-sm card-title" />' +
                    '<div class="custom" />'+
                    '<p class="setting mt-2">theme</p>'+
                    '<div class="theme d-flex" />' +
                    '<p class="setting mt-2">size & position</p>'+
                    '<div class="arrange" />'+
            '</div>');
    }

    function set_title(container) {
        container.find('.card-title').val(card.header());
        container.find('.card-title').on('keyup', function (evt) {
            card.header($(this).val());
        });
    }
    
    function set_arrange(container){
        var frame = $('<div class="form-inline">'+
                        '<div class="form-group">' +
                            '<label class="setting">top</label>'+
                            '<input type="number" class="setting form-control form-control-sm top">'+
                        '</div>'+
                        '<div class="form-group">' +
                            '<label class="ml-2 setting">left</label>'+
                            '<input type="number" class="setting form-control form-control-sm left">'+
                        '</div>'+
                    '</div>').appendTo(container.find('.arrange'));

        frame.find('input').on('input', function(evt){
            evt.stopPropagation();
            card.move(frame.find('.left').val(), frame.find('.top').val());
        });

        var pos = card.frame.position();
        frame.find('.top').val(parseInt(pos.top));
        frame.find('.left').val(parseInt(pos.left));
    }

    function set_dimensions(container){
        var frame = $('<div class="form-inline">'+
                        '<div class="form-group">' +
                            '<label class="setting">width</label>'+
                            '<input type="number" class="setting form-control form-control-sm width">'+
                        '</div>'+
                        '<div class="form-group">' +
                            '<label class="ml-2 setting">height</label>'+
                            '<input type="number" class="setting form-control form-control-sm height">'+
                        '</div>'+
                    '</div>').appendTo(container.find('.arrange'));
        
        frame.find('input').css({
            width: '40px',
        });

        frame.find('input').on('input', function(evt){
            evt.stopPropagation();
            card.resize(frame.find('.width').val(), frame.find('.height').val());
        });

        frame.find('.width').val(parseInt(card.frame.css('width')));
        frame.find('.height').val(parseInt(card.frame.css('height')));
    }

    function set_theme(container) {
        var ul = container.find('.theme');
        li = null;
        ul.css({
            height: '80px',
            'max-height': '80px',
            overflow: 'auto'
        });
        themes.forEach(function (item) {
            li = $('<div>')
                .appendTo(ul)
                .addClass('m-2')
                .addClass('border border-dark')
                .addClass('bg-' + item)
                .data('theme', item)
                .css({
                    width: '50px',
                    'min-width': '50px',
                    height: '50px',
                    'min-height': '50px',
                    cursor: 'pointer'
                });
        });
        ul.find('div').on('click', function (evt) {
            evt.stopPropagation();
            card.theme($(this).data('theme'));
        });
    }
    frame = get_frame();
    set_title(frame);
    set_theme(frame);
    set_arrange(frame);
    set_dimensions(frame);

    if (typeof card.settings === 'function') {
        frame.find('.custom').children().remove();
        frame.find('.custom').append(card.settings());
    }

    
    var props_card = open_card(frame, {
        title: 'Settings',
        width: '300px',
        'min-width': '300px',
        'max-width': '300px',
        'min-height': '250px',
        on_show: function(){
            var height = frame.height()+20;
            card.options.on_before_change();
            if (window.innerWidth < frame.height()) height = window.innerWidth;
            frame.parents('.popup-card').css('min-height', height+'px');
            frame.parents('.body-content').css('min-height', height+'px');
            props_card.recenter();
        },
        on_close: card.options.on_change,
    });
};
;function open_card(content, on_show, on_close){
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
;var BizNous = window.BizNous || {};

var save_timer = null;
var widget_types = ['slicers', 'infocards', 'chartcards', 'tablecards', 'orgcards', 'portfolioview'];
var dash_registry = {};
var dash_container = '.dash-detail';
var profileSelector = null;
var AppName = 'BizNous';
var notify = null;
var biznousHistory = null;
BizNous = {
    _currentView: null,
    _currentProfile: null,
    _notify: null,
    inMobileMode: false,
    
    set currentProfile(caption){
        BizNous._currentProfile = caption;
        $('.current-profile').html(caption);
    },
    get currentProfile(){
        return BizNous._currentProfile;
    },

    set currentView(caption){
        BizNous._currentView = caption;
        document.title = caption + ' - '+ AppName;
    },
    get currentView(){
        return BizNous._currentView;
    },
    
    notify: function(msg, config){
        if (BizNous._notify === null) BizNous._notify = new Notify();
        BizNous._notify.show(msg,config);
    },

    wait: function(msg){
        if (BizNous._notify === null) BizNous._notify = new Notify();
        BizNous._notify.show(msg, {autoHide: false});
    },

    closeNotify: function(msg){
        if (BizNous._notify === null) BizNous._notify = new Notify();
        BizNous._notify.close();
    },

    success: function(msg){
        if (BizNous._notify === null) BizNous._notify = new Notify();
        BizNous._notify.show(msg, {className:'success'});
    },

    error: function(msg){
        if (BizNous._notify === null) BizNous._notify = new Notify();
        console.trace(msg);
        if (!msg) msg = '';
        
        if (msg.message) msg = msg.message;
        
        if (msg.toLowerCase().trim() === 'failed to fetch') msg = 'Unable to connect to the server. Try refreshing the page.';

        BizNous._notify.show(msg, {className:'error'});
    },

};

BizNous.saveTimer = null;
BizNous.userCredentials = {};
BizNous.plugins = {
    'insights':[
        'biznous_base_hook',
        'biznous_ops_hook',
        'biz_change_template_hook',
        'privacy_info_hook',
        'user_story_view_hook'
    ]
};

BizNous.api = {
    endpoints:{
        search: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/search/',
        data: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/data',
        user: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/users/',
        profile: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/profile/',
        share: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/share',
        model_groups: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/model-groups',
        datamodel: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/datamodel',
        track_changes: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/track-changes',
        diagram: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/diagram',
        custom_views: 'https://ki6ba1z4r2.execute-api.ca-central-1.amazonaws.com/prod/custom-view',

    }
};

var DASH_PLUGINS = {
    'Business Insight': [
        '{"name":"Business Capabilities","notes":"Visually depicts how the capabilities are linked to the various functional areas within the business","slicers":[{"field":"Business Model","dataset":"business","style":"success","title":"Business Model","left":335,"top":355,"width":846,"height":102,"num_of_items":4,"item_height":"25px"},{"field":"Capability","dataset":"business_capabilities","style":"om-heritage-green","title":"Capability","left":20,"top":140,"width":1166,"height":104,"num_of_items":8,"item_height":"40px"},{"field":"Sub-Capability","dataset":"business_capabilities","style":"om-heritage-green","title":"Sub-Capability","left":20,"top":250,"width":306,"height":554,"num_of_items":1,"item_height":"25px"},{"field":"Value Chain","dataset":"value_chain","style":"om-naartjie","title":"Value Chain","left":335,"top":470,"width":235,"height":335,"num_of_items":1,"item_height":"30px"},{"field":"Process","dataset":"process","style":"om-naartjie","title":"Process","left":580,"top":470,"width":602,"height":337,"num_of_items":2,"item_height":"30px"},{"field":"Distribution Channel","dataset":"distribution channels","style":"success","title":"Distribution Channel","left":335,"top":250,"width":852,"height":96,"num_of_items":5,"item_height":"30px"}],"infocards":[{"field":"Business Area","dataset":"business","style":"success","title":"Business Area","left":470,"top":10,"width":220,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Process","dataset":"process","style":"om-naartjie","title":"Processes","left":220,"top":10,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Application","dataset":"application","style":"om-sky","title":"Application","left":1000,"top":10,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Data","dataset":"data","style":"info","title":"Data","left":740,"top":10,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Capability","dataset":"business_capabilities","style":"om-heritage-green","title":"Capabilities","left":0,"top":10,"width":190,"height":130,"font_size":"70px","aggregation":"distinct"}],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Strategy Impacts","notes":"Provides an overview of the business and the key aspects to consider","slicers":[{"field":"Strategy","dataset":"business","style":"om-future-green","title":"Strategy","left":10,"top":10,"width":268,"height":214,"num_of_items":1,"item_height":"60px"},{"field":"Capability","dataset":"business_capabilities","style":"success","title":"Capability","left":10,"top":240,"width":270,"height":278,"num_of_items":1,"item_height":"25px"}],"infocards":[{"field":"Application","dataset":"application","style":"info","title":"Applications","left":850,"top":10,"width":180,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Data","dataset":"data","style":"secondary","title":"Data","left":1050,"top":10,"width":180,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Business Area","dataset":"business","style":"success","title":"Functional Areas","left":550,"top":10,"width":240,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Process","dataset":"process","style":"om-cerise","title":"Process","left":290,"top":10,"width":210,"height":130,"font_size":"70px","aggregation":"distinct"}],"chartcards":[{"field":"Application","dataset":"application","style":"info","title":"Technical Fitness of Applications","left":300,"top":150,"width":440,"height":370,"chart_field":"Technical Fitness","aggregation":"distinct","chart_type":"horizontal bar","show_x_label":true,"show_y_label":true},{"field":"Data","dataset":"data","style":"secondary","title":"Type of Data","left":760,"top":150,"width":480,"height":370,"chart_field":"DataType","aggregation":"distinct","chart_type":"horizontal bar","show_x_label":true,"show_y_label":true}],"tablecards":[],"orgcards":[]}',
        '{"name":"Value Chain","notes":"Navigate the value chain and explore it\'s impact and relationship with the organization","slicers":[{"field":"Value Chain","dataset":"value_chain","style":"om-heritage-green","title":"Value Chain","left":10,"top":0,"width":1232,"height":112,"num_of_items":6,"item_height":"25px"},{"field":"Process","dataset":"process","style":"info","title":"Process","left":10,"top":260,"width":214,"height":268,"num_of_items":1,"item_height":"25px"},{"field":"Journey Type","dataset":"process","style":"info","title":"Journey Type","left":10,"top":130,"width":214,"height":118,"num_of_items":1,"item_height":"25px"}],"infocards":[{"field":"Process","dataset":"process","style":"info","title":"Processes","left":1070,"top":140,"width":180,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Application","dataset":"application","style":"om-heritage-green","title":"Applications","left":1070,"top":270,"width":180,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Data","dataset":"data","style":"om-fresh-green","title":"Data","left":1060,"top":430,"width":180,"height":130,"font_size":"70px","aggregation":"distinct"}],"chartcards":[{"field":"Business Area","dataset":"business","style":"primary","title":"Business Unit vs Functional Areas (# impacted)","left":230,"top":140,"width":810,"height":420,"chart_field":"Business Unit","aggregation":"distinct","chart_type":"horizontal bar","show_x_label":true,"show_y_label":true}],"tablecards":[],"orgcards":[]}',
        '{"name":"Product","notes":"Overview of where the organization and the products available","slicers":[{"field":"SaleOption","dataset":"product_view","style":"secondary","title":"SaleOption","left":10,"top":160,"width":196,"height":254,"num_of_items":1,"item_height":"25px"},{"field":"Proposition","dataset":"product_view","style":"secondary","title":"Proposition","left":220,"top":160,"width":582,"height":262,"num_of_items":3,"item_height":"40px"},{"field":"Product Type","dataset":"product_view","style":"info","title":"Product Type","left":10,"top":10,"width":790,"height":138,"num_of_items":5,"item_height":"25px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Business Overview","notes":"Overview of key features of the organization","slicers":[{"field":"Business Model","dataset":"business","style":"info","title":"Customer Segments","left":20,"top":140,"width":536,"height":148,"num_of_items":3,"item_height":"25px"},{"field":"Value Chain","dataset":"value_chain","style":"om-heritage-green","title":"Value Chain","left":20,"top":310,"width":346,"height":192,"num_of_items":1,"item_height":"25px"},{"field":"Capability","dataset":"business_capabilities","style":"info","title":"Capability","left":860,"top":140,"width":376,"height":148,"num_of_items":2,"item_height":"25px"},{"field":"Proposition","dataset":"product_view","style":"om-heritage-green","title":"Products","left":390,"top":310,"width":318,"height":192,"num_of_items":2,"item_height":"25px"},{"field":"SaleOption","dataset":"product_view","style":"om-heritage-green","title":"Sale Option","left":1080,"top":310,"width":150,"height":192,"num_of_items":1,"item_height":"25px"},{"field":"Product Type","dataset":"product_view","style":"om-heritage-green","title":"Product Type","left":730,"top":310,"width":320,"height":192,"num_of_items":2,"item_height":"25px"},{"field":"Distribution Channel","dataset":"distribution channels","style":"info","title":"Distribution Channel","left":570,"top":140,"width":276,"height":148,"num_of_items":2,"item_height":"30px"}],"infocards":[{"field":"Business Area","dataset":"business","style":"om-naartjie","title":"Business Area","left":1050,"top":0,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Process","dataset":"process","style":"dark","title":"Process","left":270,"top":0,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Application","dataset":"application","style":"info","title":"Application","left":780,"top":0,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Data","dataset":"data","style":"success","title":"Data","left":520,"top":0,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"},{"field":"Proposition","dataset":"product_view","style":"warning","title":"Products","left":20,"top":0,"width":200,"height":130,"font_size":"70px","aggregation":"distinct"}],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Business Capability Transition","notes":"View the dependencies between the existing organization and the proposed capabilities","slicers":[{"field":"Strategy","dataset":"business","style":"info","title":"Strategy","left":10,"top":10,"width":200,"height":502,"num_of_items":1,"item_height":"60px"},{"field":"Capability","dataset":"business_capabilities","style":"secondary","title":"Current Capability","left":220,"top":10,"width":404,"height":234,"num_of_items":2,"item_height":"35px"},{"field":"Sub-Capability","dataset":"business_capabilities","style":"secondary","title":"Current Sub-Capability","left":220,"top":260,"width":400,"height":274,"num_of_items":2,"item_height":"35px"},{"field":"Future Capability","dataset":"business_capabilities","style":"info","title":"Future Capability","left":640,"top":10,"width":432,"height":232,"num_of_items":2,"item_height":"35px"},{"field":"Future Sub Capability","dataset":"business_capabilities","style":"info","title":"Future Sub Capability","left":640,"top":260,"width":430,"height":274,"num_of_items":2,"item_height":"35px"}],"infocards":[{"field":"Application","dataset":"application","style":"success","title":"# Applications","left":1100,"top":20,"width":240,"height":130,"font_size":"90px","aggregation":"distinct"},{"field":"Data","dataset":"data","style":"secondary","title":"# Data","left":1100,"top":170,"width":240,"height":130,"font_size":"90px","aggregation":"distinct"},{"field":"Business Area","dataset":"business","style":"info","title":"# Functional Areas","left":1100,"top":330,"width":240,"height":140,"font_size":"90px","aggregation":"distinct"}],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Organogram","notes":"Visually explore the organization through the organogram diagram","slicers":[{"field":"Business Model","dataset":"business","style":"om-heritage-green","title":"Business Model","left":10,"top":10,"width":388,"height":178,"num_of_items":3,"item_height":"25px"},{"field":"Department","dataset":"business","style":"info","title":"Department","left":780,"top":10,"width":358,"height":178,"num_of_items":3,"item_height":"25px"},{"field":"Business Unit","dataset":"business","style":"success","title":"Business Unit","left":410,"top":10,"width":358,"height":178,"num_of_items":2,"item_height":"25px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[{"dataset":"business","style":"info","title":"Functional View","left":10,"top":200,"width":1148,"height":658,"level_0":"Business Model","level_1":"Business Unit","level_2":"Department","level_3":"Business Area","level_0_title":"Business Model Manager","level_1_title":"Business Unit Manager","level_2_title":"Department Manager","level_3_title":null}]}',
        '{"name":"Journey Map","notes":"Browse the various journeys involving the organization","slicers":[{"field":"Journey Type","dataset":"journey_map","style":"success","title":"Journey Type","left":10,"top":10,"width":226,"height":178,"num_of_items":2,"item_height":"25px"},{"field":"Process","dataset":"journey_map","style":"success","title":"Process","left":10,"top":200,"width":227,"height":366,"num_of_items":1,"item_height":"25px"},{"field":"Department","dataset":"business","style":"info","title":"Department","left":250,"top":130,"width":533,"height":194,"num_of_items":2,"item_height":"25px"},{"field":"Business Area","dataset":"business","style":"info","title":"Business Area","left":250,"top":330,"width":533,"height":237,"num_of_items":4,"item_height":"25px"},{"field":"Data","dataset":"journey_map","style":"secondary","title":"Data","left":790,"top":220,"width":497,"height":160,"num_of_items":3,"item_height":"25px"},{"field":"Capability","dataset":"business_capabilities","style":"secondary","title":"Capability","left":250,"top":10,"width":534,"height":116,"num_of_items":3,"item_height":"25px"},{"field":"Project","dataset":"project","style":"secondary","title":"Project","left":790,"top":390,"width":496,"height":174,"num_of_items":2,"item_height":"25px"},{"field":"Application","dataset":"application","style":"secondary","title":"Application","left":790,"top":10,"width":496,"height":196,"num_of_items":2,"item_height":"25px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
    ],
    'Operational Perspective': [
        '{"name":"Operational Impacts","notes":"Implementation and operational teams can use this to assess the level of impact, before making business","slicers":[{"field":"Business Model","dataset":"business","style":"success","title":"Business Model","left":14,"top":10,"width":462,"height":158,"num_of_items":3,"item_height":"25px"},{"field":"Process","dataset":"process","style":"success","title":"Process","left":891,"top":10,"width":391,"height":152,"num_of_items":2,"item_height":"25px"},{"field":"Business Area","dataset":"business","style":"secondary","title":"Business Area","left":16,"top":180,"width":456,"height":363,"num_of_items":2,"item_height":"25px"},{"field":"Data","dataset":"data","style":"secondary","title":"Data","left":480,"top":180,"width":604,"height":173,"num_of_items":3,"item_height":"25px"},{"field":"DataType","dataset":"data","style":"secondary","title":"DataType","left":1090,"top":180,"width":188,"height":172,"num_of_items":1,"item_height":"25px"},{"field":"Application","dataset":"application","style":"secondary","title":"Application","left":480,"top":360,"width":604,"height":175,"num_of_items":3,"item_height":"25px"},{"field":"Technical Fitness","dataset":"application","style":"secondary","title":"Technical Fitness","left":1090,"top":360,"width":190,"height":178,"num_of_items":1,"item_height":"25px"},{"field":"Project","dataset":"project","style":"success","title":"Project","left":490,"top":10,"width":394,"height":154,"num_of_items":2,"item_height":"25px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Technical Insight","notes":"Provides an overview of the technical insghts","slicers":[],"infocards":[{"field":"Application","dataset":"application","style":"info","title":"Applications","left":10,"top":10,"width":260,"height":140,"font_size":"70px","aggregation":"distinct"},{"field":"Data","dataset":"data","style":"secondary","title":"Data Items","left":430,"top":10,"width":250,"height":140,"font_size":"70px","aggregation":"distinct"},{"field":"Business Area","dataset":"business","style":"success","title":"Functional Areas","left":840,"top":10,"width":240,"height":140,"font_size":"70px","aggregation":"distinct"}],"chartcards":[{"field":"Business Area","dataset":"business","style":"success","title":"Functional Areas Impacted","left":840,"top":170,"width":400,"height":310,"chart_field":"Business Unit","aggregation":"distinct","chart_type":"horizontal bar","show_x_label":true,"show_y_label":true},{"field":"Application","dataset":"application","style":"primary","title":"Technical Fitness of Applications","left":10,"top":170,"width":400,"height":310,"chart_field":"Technical Fitness","aggregation":"distinct","chart_type":"horizontal bar","show_x_label":true,"show_y_label":true},{"field":"Data","dataset":"data","style":"secondary","title":"Type of Data","left":430,"top":170,"width":400,"height":310,"chart_field":"DataType","aggregation":"distinct","chart_type":"horizontal bar","show_x_label":true,"show_y_label":true}],"tablecards":[],"orgcards":[]}',
        '{"name":"Data","notes":"Visually displays the relationship between the various business capabilities and data","slicers":[{"field":"Data","dataset":"data","style":"om-heritage-green","title":"Data","left":10,"top":150,"width":1190,"height":390,"num_of_items":5,"item_height":"25px"},{"field":"DataType","dataset":"data","style":"om-fresh-green","title":"DataType","left":400,"top":10,"width":800,"height":130,"num_of_items":6,"item_height":"25px"},{"field":"Data Audience","dataset":"data","style":"om-fresh-green","title":"Data Audience","left":10,"top":10,"width":380,"height":130,"num_of_items":2,"item_height":"25px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Application Management","notes":"Understand your application portfolio and its impacts","slicers":[{"field":"Technical Fitness","dataset":"application","style":"om-heritage-green","title":"Technical Fitness","left":940,"top":0,"width":260,"height":206,"num_of_items":1,"item_height":"30px"},{"field":"ApplicationRelationship","dataset":"application","style":"om-heritage-green","title":"Application Stage","left":5,"top":0,"width":247,"height":390,"num_of_items":1,"item_height":"30px"},{"field":"Business Area","dataset":"enabling functions","style":"secondary","title":"Business Areas","left":270,"top":215,"width":657,"height":170,"num_of_items":3,"item_height":"30px"},{"field":"Application","dataset":"application","style":"om-heritage-green","title":"Application","left":270,"top":0,"width":658,"height":206,"num_of_items":4,"item_height":"25px"},{"field":"Secondary Application","dataset":"application","style":"info","title":"Related Application","left":5,"top":405,"width":592,"height":172,"num_of_items":4,"item_height":"25px"},{"field":"Distribution Channel","dataset":"distribution channels","style":"secondary","title":"Distribution Channel","left":940,"top":215,"width":259,"height":170,"num_of_items":2,"item_height":"30px"},{"field":"Project","dataset":"project","style":"info","title":"Business Change Initiatives","left":610,"top":405,"width":588,"height":171,"num_of_items":2,"item_height":"35px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Application","notes":"Visually displays the relationship between the various applications","slicers":[{"field":"Application","dataset":"application","style":"secondary","title":"Application","left":6,"top":10,"width":672,"height":294,"num_of_items":3,"item_height":"25px"},{"field":"Technical Fitness","dataset":"application","style":"om-fresh-green","title":"Technical Fitness","left":680,"top":320,"width":234,"height":232,"num_of_items":1,"item_height":"25px"},{"field":"Underlying Technology","dataset":"application","style":"om-fresh-green","title":"Underlying Technology","left":10,"top":320,"width":234,"height":224,"num_of_items":1,"item_height":"25px"},{"field":"Secondary Application","dataset":"application","style":"secondary","title":"Related Application","left":690,"top":10,"width":434,"height":297,"num_of_items":2,"item_height":"25px"},{"field":"App Support","dataset":"application","style":"success","title":"Who Supports It","left":260,"top":320,"width":402,"height":230,"num_of_items":2,"item_height":"25px"},{"field":"TechType","dataset":"application","style":"secondary","title":"TechType","left":930,"top":320,"width":194,"height":234,"num_of_items":1,"item_height":"25px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
        
    ],
    'Business Change Initiatives': [
        '{"name":"Portfolio View","notes":"Represents the portfolio of change initiatives within the organization","slicers":[{"field":"Project","dataset":"project","style":"om-heritage-green","title":"Project","left":265,"top":0,"width":730,"height":114,"num_of_items":2,"item_height":"25px"},{"field":"Project Business Model","dataset":"project","style":"secondary","title":"Business Model","left":10,"top":0,"width":242,"height":114,"num_of_items":1,"item_height":"30px"},{"field":"Capability","dataset":"business_capabilities","style":"secondary","title":"Capability","left":1005,"top":225,"width":232,"height":296,"num_of_items":1,"item_height":"30px"},{"field":"Distribution Channel","dataset":"distribution channels","style":"secondary","title":"Distribution Channel","left":1005,"top":0,"width":229,"height":219,"num_of_items":1,"item_height":"30px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[],"portfolioview":[{"dataset":null,"style":"primary","left":10,"top":140,"width":977,"height":385,"y_axis":"Project","x_axis":"Business Area","cell_value":"Business Area"}]}',
        '{"name":"Business Initiative","notes":"Explore a specific business chang initiative","slicers":[{"field":"Programme","dataset":"project","style":"om-heritage-green","title":"Programme","left":9.988426208496094,"top":19.988426208496094,"width":246.00726,"height":144.00426000000002,"num_of_items":1,"item_height":"25px"},{"field":"Project","dataset":"project","style":"om-heritage-green","title":"Project","left":279.9884338378906,"top":19.988426208496094,"width":686.0072600000001,"height":146.00726,"num_of_items":4,"item_height":"25px"},{"field":"Enabling Business Model","dataset":"project","style":"secondary","title":"Enabling Business Model","left":689.9884643554688,"top":189.98844146728516,"width":545.00026,"height":137.99726,"num_of_items":4,"item_height":"30px"},{"field":"Enabling Capability","dataset":"project","style":"info","title":"Enabling Capability","left":8.993056297302246,"top":339.9884262084961,"width":297.99726,"height":247.99726,"num_of_items":1,"item_height":"25px"},{"field":"Project Business Model","dataset":"project","style":"secondary","title":"Project Business Model","left":9.988426208496094,"top":189.98844146728516,"width":646.0072600000001,"height":137.99726,"num_of_items":5,"item_height":"30px"},{"field":"Enabling Application","dataset":"project","style":"info","title":"Enabling Application","left":628.9931030273438,"top":339.9884262084961,"width":297.99726,"height":247.99726,"num_of_items":1,"item_height":"25px"},{"field":"Enabling Data","dataset":"project","style":"info","title":"Enabling Data","left":938.9931030273438,"top":339.9884262084961,"width":297.99726,"height":247.99726,"num_of_items":1,"item_height":"25px"},{"field":"Distribution Channel","dataset":"distribution channels","style":"om-heritage-green","title":"Distribution Channel","left":1004.9884643554688,"top":19.976852416992188,"width":226.00726,"height":146.00726,"num_of_items":2,"item_height":"30px"},{"field":"Business Area","dataset":"project","style":"info","title":"Business Area","left":318.9930725097656,"top":339.9884262084961,"width":297.99726,"height":247.99726,"num_of_items":1,"item_height":"30px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
        '{"name":"Team Impact","notes":"Understand your application portfolio and its impacts","slicers":[{"field":"ApplicationRelationship","dataset":"application","style":"om-heritage-green","title":"Application Stage","left":40,"top":155,"width":1151,"height":75,"num_of_items":7,"item_height":"35px"},{"field":"Project","dataset":"project","style":"info","title":"Business Change Initiatives","left":40,"top":0,"width":640,"height":141,"num_of_items":2,"item_height":"30px"},{"field":"Business Model","dataset":"business","style":"secondary","title":"Business Model","left":710,"top":0,"width":474,"height":144,"num_of_items":2,"item_height":"30px"}],"infocards":[],"chartcards":[],"tablecards":[{"dataset":"project","style":"secondary","title":"Technology Teams","left":40,"top":245,"width":1151,"height":256,"header":["Enabling Business Model","Business Area","Contact Person","Technology Stage","Enabling Application"]},{"dataset":"project","style":"secondary","title":"Data Team","left":40,"top":515,"width":1154,"height":256,"header":["Enabling Business Model","Business Area","Contact Person","Data LifeCycle","Enabling Data"]}],"orgcards":[],"portfolioview":[]}',
        '{"name":"Business Initiative Tasks","notes":"Explore a specific business chang initiative","slicers":[{"field":"Project Business Model","dataset":"project","style":"om-heritage-green","title":"Project Business Model","left":4.984375,"top":14.984375,"width":512,"height":133.969,"num_of_items":4,"item_height":"30px"},{"field":"Project","dataset":"story_base","style":"om-heritage-green","title":"Project","left":540,"top":15,"width":469,"height":131,"num_of_items":3,"item_height":"30px"},{"field":"Capability","dataset":"business_capabilities","style":"info","title":"Capability","left":10,"top":175,"width":201,"height":288,"num_of_items":1,"item_height":"30px"},{"field":"Story Status","dataset":"story_base","style":"om-heritage-green","title":"Story Status","left":230,"top":175,"width":776,"height":82,"num_of_items":6,"item_height":"30px"},{"field":"Sub-Capability","dataset":"business_capabilities","style":"info","title":"Sub-Capability","left":10,"top":470,"width":201,"height":298,"num_of_items":1,"item_height":"30px"},{"field":"Business Area","dataset":"business","style":"info","title":"Business Area","left":1025,"top":465,"width":226,"height":306,"num_of_items":1,"item_height":"30px"}],"infocards":[{"field":"Story Application","dataset":"story_impact","style":"om-naartjie","title":"Technology","left":1030,"top":315,"width":200,"height":120,"font_size":"70px","aggregation":"distinct"},{"field":"Story Data","dataset":"story_impact","style":"om-sky","title":"Data","left":1025,"top":175,"width":200,"height":120,"font_size":"70px","aggregation":"distinct"},{"field":"Story","dataset":"story_base","style":"om-cerise","title":"Tasks","left":1020,"top":25,"width":200,"height":120,"font_size":"70px","aggregation":"distinct"}],"chartcards":[],"tablecards":[{"dataset":"story_base","style":"primary","title":"Task","left":230,"top":270,"width":778,"height":500,"header":["Project","Story","Description"]}],"orgcards":[]}',
        '{"name":"Change Initiative Template","notes":"High-level view of what should be considered when busy with a specific type of business change initiative","slicers":[{"field":"Process","dataset":"business_change","style":"info","title":"Process","left":10,"top":10,"width":213,"height":571,"num_of_items":1,"item_height":"25px"},{"field":"Business Area","dataset":"business","style":"secondary","title":"Business Area","left":230,"top":200,"width":429,"height":378,"num_of_items":4,"item_height":"25px"},{"field":"Data","dataset":"business_change","style":"secondary","title":"Data","left":670,"top":410,"width":416,"height":172,"num_of_items":3,"item_height":"25px"},{"field":"Application","dataset":"business_change","style":"secondary","title":"Application","left":670,"top":200,"width":417,"height":201,"num_of_items":3,"item_height":"25px"},{"field":"SME Person","dataset":"business","style":"secondary","title":"SME Person","left":1100,"top":200,"width":240,"height":381,"num_of_items":1,"item_height":"25px"},{"field":"Capability","dataset":"business_capabilities","style":"info","title":"Capability","left":230,"top":10,"width":434,"height":186,"num_of_items":3,"item_height":"40px"},{"field":"Sub-Capability","dataset":"business_capabilities","style":"info","title":"Sub-Capability","left":670,"top":10,"width":672,"height":186,"num_of_items":4,"item_height":"40px"}],"infocards":[],"chartcards":[],"tablecards":[],"orgcards":[]}',
        
    ],
};

window._config = {
    cognito: {
        userPoolId: 'ca-central-1_Jw8crpsDm', // e.g. us-east-2_uXboG5pAb
        userPoolClientId: '269gogjksvhc1qnnfgdmf45em', // e.g. 25ddkmj4v6hfsfvruhpfi7n4hv
        region: 'ca-central-1' // e.g. us-east-2
    }
};

Object.equals = function (a, b) {
    var found_at_least_one = false;
    for (var f in a) {
        if (!(f in b)) continue;
        found_at_least_one = true;
        if (a[f] != b[f]) return false;
    }

    if (false === found_at_least_one) return false;

    return true;
};

GroupsToEdit = {
    Stories:{
        primary_entity: 'story',
        primary_key: {
            'Business Model': null,
            'Project': null,
            'Story': null,
        },
        lanes: {
            'Organization':{
                entity: 'story_business_areas',
                display: 'Business Area',
                values:[]
            },
            'Technology':{
                entity: 'story_app',
                display: 'Application',
                values:[]
            },
            'Data':{
                entity: 'story_data',
                display: 'Data',
                values:[]
            },
        }
    },
    BusinessInitiatives:{
        primary_entity: 'dim_project',
        primary_key: {
            'Business Model': null,
            'Project': null
        },
        lanes: {
            'Strategy':{
                entity: 'map_strategy',
                display: 'Strategy',
                values:[]
            },
            'Capability':{
                entity: 'map_project_capability',
                display: 'Enabling Capability',
                alias: 'Capability',
                children:{
                    entity: 'dim_sub_capability',
                    display: 'Sub-Capability',
                    reference: 'Enabling Sub-Capability',
                    key: 'Capability'
                },
                values:[]
            },
            'Sub-Capability':{
                entity: 'map_project_capability',
                display: 'Enabling Sub-Capability',
                alias: 'Sub-Capability',
                values:[]
            },
            'Organization':{
                entity: 'project_areas_impacted',
                display: 'Business Area',
                alias: 'Enabling Business Area',
                values:[]
            },
            'Applications':{
                entity: 'project_apps_impacted',
                display: 'Application',
                values:[]
            },
            'Data':{
                entity: 'project_data_impacted',
                display: 'Data',
                values:[]
            }
        }
    },
    Data:{
        primary_entity: 'dim_data',
        primary_key: {
            'Data': null,
        },
        lanes: {
            'Capture':{
                entity: 'map_data',
                display: 'Business Area',
                default:{
                    'LifeCycle': 'Capture'
                },
                filters:{
                    'LifeCycle': 'Capture'
                },
                values:[]
            },
            'Maintain':{
                entity: 'map_data',
                display: 'Business Area',
                default:{
                    'LifeCycle': 'Maintain'
                },
                filters:{
                    'LifeCycle': 'Maintain'
                },
                values:[]
            },
            'Use':{
                entity: 'map_data',
                display: 'Business Area',
                default:{
                    'LifeCycle': 'Use'
                },
                filters:{
                    'LifeCycle': 'Use'
                },
                values:[]
            },
            'Share':{
                entity: 'map_data',
                display: 'Business Area',
                default:{
                    'LifeCycle': 'Share'
                },
                filters:{
                    'LifeCycle': 'Share'
                },
                values:[]
            },
            'Store':{
                entity: 'map_data',
                display: 'Business Area',
                default:{
                    'LifeCycle': 'Store'
                },
                filters:{
                    'LifeCycle': 'Store'
                },
                values:[]
            },
            'Destroy':{
                entity: 'map_data',
                display: 'Business Area',
                default:{
                    'LifeCycle': 'Destroy'
                },
                filters:{
                    'LifeCycle': 'Destroy'
                },
                values:[]
            },
        }
    },
    Technology:{
        primary_entity: 'dim_application',
        primary_key: {
            'Application': null,
        },
        lanes: {
            'Integration Point':{
                entity: 'map_app_dependency',
                display: 'Secondary',
                alias: 'Application',
                values:[]
            },
            'Consumer / End-User':{
                entity: 'map_application',
                display: 'Business Area',
                default:{
                    'Role': 'Consumer / End-User'
                },
                filters:{
                    'Role': 'Consumer / End-User'
                },
                values:[]
            },
            'Manage Technology Change':{
                entity: 'map_application',
                display: 'Business Area',
                default:{
                    'Role': 'Manage Technology Change'
                },
                filters:{
                    'Role': 'Manage Technology Change'
                },
                values:[]
            },
            'Requirements Specification':{
                entity: 'map_application',
                display: 'Business Area',
                default:{
                    'Role': 'Requirements Specification'
                },
                filters:{
                    'Role': 'Requirements Specification'
                },
                values:[]
            },
            'Development / Build':{
                entity: 'map_application',
                display: 'Business Area',
                default:{
                    'Role': 'Development / Build'
                },
                filters:{
                    'Role': 'Development / Build'
                },
                values:[]
            },
            'Testing':{
                entity: 'map_application',
                display: 'Business Area',
                default:{
                    'Role': 'Testing'
                },
                filters:{
                    'Role': 'Testing'
                },
                values:[]
            },
            'Deployment':{
                entity: 'map_application',
                display: 'Business Area',
                default:{
                    'Role': 'Deployment'
                },
                filters:{
                    'Role': 'Deployment'
                },
                values:[]
            },
            'Maintenance':{
                entity: 'map_application',
                display: 'Business Area',
                default:{
                    'Role': 'Maintenance'
                },
                filters:{
                    'Role': 'Maintenance'
                },
                values:[]
            },
        }
    }
};;function iterate_slicers(container, $this, reorder_all,do_history){
    var slicers = null,
        areas = [],
        datalist = [],
        filter_ds = [],
        maintain_original = true;
    
    if (!window.cache) window.cache = {};

    // if (typeof do_history === 'undefined' || do_history !== false){
    //     biznousHistory.push(get_filter());
    // }

    if (!container){
        container = $('.dash-detail');
    }
    
    maintain_original = !container.hasClass('dash-detail');
    
    slicers = container.data('slicers');

    areas = init_reference(maintain_original);
    
    widget_types.forEach(function(widget){
        var card = container.data(widget);
        if (!(card instanceof Array)) return;
        card.forEach(function(item){
            var ds = item.get_dataset();
            if (!ds) return;
            if (datalist.indexOf(ds) === -1 && ds.header[0] === '@visible'){
                datalist.push(ds);
                ds.rows.forEach(function(row, index){
                    ds.rows[index][0] = 1;
                });
            }
        });
    });

    slicers.forEach(function(item){
        var ds = item.get_dataset();
        item.set_content();
        if (item.find('.slicer-item.active').length > 0){
            if (filter_ds.indexOf(ds) === -1) filter_ds.push(ds);
        }
    });
    
    //NOW SYNC REFERENCE-MASTER
    if (filter_ds.length === 0){
        if (maintain_original === false){
            areas.forEach(function(row,index){
                if (true !== reorder_all) areas[index][0] = 1;
            });
        }
    } else {
        var sweeper = [];

        filter_ds.forEach(function(ds){
            var key = ds.header.indexOf('Business Area');
            var ignore = ds.rows
                    .filter(function(row){return row[0] == 1;})
                    .map(function(row){return row[key];});
            ignore = ignore.filter(function(v,i){return ignore.indexOf(v) === i;}).sort();
            if (sweeper.length === 0){
                sweeper = sweeper.concat(ignore);
            } else {
                sweeper = ignore.filter(function(item){
                    return sweeper.indexOf(item) !== -1;
                });
            }
        });
        sweeper = sweeper.filter(function(v,i){return sweeper.indexOf(v) === i;});

        areas.forEach(function(item, index){
            if (true === maintain_original){
                if (cache.reference_master[index][0] === 1)
                    areas[index][0] = sweeper.indexOf(item[1]) === -1 ? 0 : 1;    
            } else{
                areas[index][0] = sweeper.indexOf(item[1]) === -1 ? 0 : 1;
            }
            
        });
    }

    //UPDATE EVERYONES DATASET BASED ON AREAS ACTIVE
    datalist.forEach(function(ds){
        var key = ds.header.indexOf('Business Area');
        ds.rows.forEach(function(row, index){
            if (row[0] == 0) return;

            areas.forEach(function(area){
                if ((area[1] == row[key] && area[0] == 0) ||
                    row[key] === null){
                    ds.rows[index][0] = 0;
                }
            });
        });
    });

    slicers.forEach(function(item){
        if (true === reorder_all)
            item.update_frame();
        else
            item.update_frame($this == item);
    });

    widget_types.forEach(function(widget){
        var card = container.data(widget);
        if (!(card instanceof Array)) return;
        card.forEach(function(item){
            item.set_content();
        });
    });

    function init_reference(maintain_original) {
        if (!(cache.reference_master instanceof Array)) {
            cache.reference_master = [];
        }

        cache.reference_master.forEach(function (item, index) {
            if (true !== reorder_all && maintain_original !== true)
                cache.reference_master[index][0] = 1;
        });

        return cache.reference_master.slice();
    }
};var Slicer = function(){
    this.prototype = $.extend(this, BaseCard);

    var text_disabled = 'text-muted',
        $this = this,
        num_of_items = 2,
        item_height = '30px',
        html_table = null;

    this._toObject = function(obj){
        obj.num_of_items = num_of_items;
        obj.item_height = item_height;
        obj.title = this.title;
    };

    this._resize = function(){       
        var w = Math.floor((this.frame.width() - 30 - (num_of_items*10))/num_of_items) + 'px';
        this.find('.slicer-item').css({
            'width': w,
            'min-width': w,
            'max-width': w,
            'height': item_height,
            'min-height': item_height,
            'max-height': item_height,
            'line-height': item_height,
        });
        
    };

    this.sort = function(){
        var active_elems = this.find('.slicer-item').not('.disabled').detach().sort(function (a, b) {
            return ($(a).text() < $(b).text() ? -1 
                    : $(a).text() > $(b).text() ? 1 : 0);
        });
        var disabled_elems = this.find('.slicer-item').detach().sort(function (a, b) {
            return ($(a).text() < $(b).text() ? -1 
                    : $(a).text() > $(b).text() ? 1 : 0);
        });
        this.find('ul').append(active_elems).append(disabled_elems);
    };

    this.style = function(){
        return {
            num_of_items: num_of_items,
            text_active: this.text_active,
            text_disabled: text_disabled,
            list_style: this.list_style
        };
    };

    this.columns = function(num){
        if (typeof num !== 'undefined'){
            num_of_items = Math.max(parseFloat(num), 1);
            this.resize();
        } else {
            return num_of_items;
        }
    };

    this._theme = function(style){
        var frame = this.frame;

        this.find('ul').css({
            padding: '0',
            margin: 0
        });

        frame.find('.title-bar').addClass('bg-' + this.list_style);

        if (typeof style !== 'undefined') this.list_style = style;

        text_active = 'text-'+ (style === 'light' ? 'dark' : 'white');
        

        frame.find('.title-bar').addClass('border-bottom border-' + style);
        frame.addClass('border-' + style);

        var el_height = parseFloat(item_height)-5 +'px';
        
        this.find('.slicer-item')
            .addClass('list-inline-item')
            .css({
                'height': el_height,
                'max-height': el_height,
                'min-height': el_height,
                'max-width': frame.width()
            });
    };

    this._attach = function(options){
        var filter_list = [],
            list = $('<ul>'),
            $this = this;

        this.find('.dash-edit').before(search_button());
        this.find('.frame-body').append(list);
        this.options = options = $.extend({
            num_of_items: 1,
            style: 'info',
            item_height: item_height,
        }, options);

        if (!isNaN(options.num_of_items)) num_of_items = options.num_of_items;
        if (BizNous.inMobileMode === true) num_of_items = 1;
        
        html_table = options.container;

        item_height = options.item_height;
        this.header(this.title || this.field);
        
        this.dataset.rows.forEach(function(row){
            var val = row[$this.col_id];

            if (!val || filter_list.indexOf(val) !== -1) return;

            filter_list.push(val);
            list.append('<a class="slicer-item" title="'+val+'">'+ (val !== "" ? val : "(blank)") +'</a>');
        });
        
        list.on('click', '.slicer-item', function(evt){
            var item = $(this);
            
            evt.stopPropagation();

            if (!evt.ctrlKey){
                list.find('.slicer-item').not(item).removeClass('active');
            }

            item.toggleClass('active');
            iterate_slicers(options.container, $this);
            $this.options.on_change();
        });

        this.resize();
        this.sort();

        return this;
    };

    this.update_frame = function(no_reorder){
        var list = [], change_cnt = 0;
        
        this.dataset.rows.forEach(function(row){
            if (row[0] === 0) return;
            if (list.indexOf(row[$this.col_id]) === -1) list.push(row[$this.col_id]);
        });
        change_cnt = this.find('slicer-item.active').length;

        this.find('.slicer-item').each(function(){
            var item = $(this);
            item.removeClass('disabled');

            if (list.indexOf(item.text()) === -1) {
                item.addClass('disabled');
            }
        });

        this.find('.title-bar').removeClass('font-italic');
        this.find('.frame-clear-filter').remove();

        if (this.find('.slicer-item.active').length > 0){
            this.find('.title-bar').addClass('font-italic');
            this.find('.frame-title').prepend('<a class="frame-clear-filter fa fa-lg fa-filter text-danger" title="click to clear filter"/>');
            this.find('.frame-clear-filter').on('click', function(evt){
                evt.stopPropagation();
                $this.find('.slicer-item').removeClass('active');
                iterate_slicers($this.options.container, $this);
                $this.sort();
                $this.options.on_change();
            });
        }

        //IF frame YOU JUST CLICKED, THEN DON'T RE-ARRANGE
        if (no_reorder === true) return;
        var sel_list = this.find('.slicer-item').not('.disabled').remove();
        
        var ul = this.find('ul');
        ul.prepend(sel_list);
        ul.scrollTop(0);
        this.resize();
        this.sort();
    };

    this.set_content = function(){
        var values = [];
        this.dataset.rows.forEach(function(v,i){
            var tr = html_table.find('tbody tr').eq(i);

            if ($this.dataset.rows[i+1] && $this.dataset.rows[i+1][0] === 0)
                tr.hide();
            else
                tr.show();
        });

        this.frame.find('.slicer-item').each(function(){
            var item = $(this);
            if (!item.hasClass('active')) return;

            values.push(item.text());
        });

        if (values.length > 0) {
            this.dataset.rows.forEach(function(row, index){
                if (row[0] === 0) return;

                var val = row[$this.col_id];
                
                if(values.indexOf(val) === -1) $this.dataset.rows[index][0] = 0;
            });
        }
    };

    //FUNCTION THAT WANTS TO DISPLAY CUSTOM SETTINGS NEED TO POPULATE THIS FUNCTION
    //AND THEN RETURN THE ELEMENTTS
    this.settings = function(){
        var $this = this;
        var frame = $('<div class="d-flex flex-row flex-wrap mt-3">'+
                    '<div class="form-group mr-4">' +
                        '<label>number of columns</label>' +
                        '<select class="form-control form-control-sm num-of-items" />' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label>item height</label>' +
                        '<input class="form-control form-control-sm item-height" type="number"/>' +
                    '</div>' +
                '</div>'
            );

        var sel = frame.find('.num-of-items');
        for (var i = 1; i < 11; i++) {
            sel.append('<option>' + ((i < 10 ? '0' : '') + i) + '</option>');
            if (i === $this.columns())
                sel.find('option:last-child').attr('selected', 'selected');
        }
        sel.on('change', function (evt) {
            evt.stopPropagation();
            $this.columns(sel.val());
        });


        var item = frame.find('.item-height');
        item.val(parseInt(item_height));
        item.css({
            width: '80px'
        }).on('keyup', function (evt) {
            evt.stopPropagation();
            
            var num = isNaN(parseInt(item.val())) ? 20 : parseInt(item.val());
            if (num < 20) num = 20;
            item_height = num + 'px';
            
            $this.resize();
        });

        return frame;
    };

    function search_button(){
        var frame = $('<div class="d-flex border-bottom">'+
                        '<input placeholder="Search term" class="pl-2 border border-0">'+
                        '<span class="btn-search border-0"><i class="fa fa-fw fa-search"/> </span>'+
                    '</div>').css({
                        position: 'relative'
                    });
        
        frame.find('input').hide();
        frame.removeClass('border-primary');
        frame.find('input')
        .css({
            outline: 'none'
        })
        .on('keyup', function(evt){
            var str_find = $(this).val().toLowerCase();

            evt.stopPropagation();
            $this.find('.slicer-item').show();
            if (str_find.trim() === '') return;

            $this.find('.slicer-item').each(function(){
                var item = $(this).text().toLowerCase();
                if (item.indexOf(str_find) === -1)
                    $(this).hide();
            });
        });

        frame.find('.btn-search')
        .on('click', function(evt){
            var $this = $(this);
            evt.stopPropagation();
            if ($this.find('i').hasClass('fa-search')){
                frame.find('input').show();
                $this.find('i').removeClass('fa-search').addClass('fa-times');
                frame.addClass('border-primary');
            } else {
                frame.find('input').val('').trigger('keyup').hide();
                $this.find('i').removeClass('fa-times').addClass('fa-search');
                frame.removeClass('border-primary');
            }
        });

        return frame;
    }

    return this;
};