var BizNous = window.BizNous || {};

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
};