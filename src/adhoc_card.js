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
};