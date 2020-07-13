function iterate_slicers(container, $this, reorder_all,do_history){
    var slicers = null,
        areas = [],
        datalist = [],
        filter_ds = [],
        maintain_original = true,
        reference_key = 'reference-key';
    
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
            var key = ds.header.indexOf(reference_key);
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
        var key = ds.header.indexOf(reference_key);
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
}