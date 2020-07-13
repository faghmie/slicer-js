var Slicer = function(){
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