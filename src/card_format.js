var CardFormat = function (card) {
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
