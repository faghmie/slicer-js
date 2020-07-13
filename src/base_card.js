var BaseCard = {
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
                            '<a class="slicer-setting btn btn-light btn-link"><i class="fa fa-cog"></i></a>'+
                            '<a class="slicer-remove btn btn-light btn-link"><i class="fa fa-trash"></i></a>'+
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
