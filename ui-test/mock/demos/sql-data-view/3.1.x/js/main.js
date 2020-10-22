define(function (require, exports, module) {
    var $self                       = module,
        $                           = require('jquery'),
        _                           = require('underscore'),
        Backbone                    = require('backbone'),
        utils                       = require('../utils.js'),
        Datasources                 = require('../collections/datasources.js'),
        MenuObjects                 = require('../collections/menuobjects.js'),
        Rows                        = require('../collections/rows.js'),
        Features                    = require('../collections/features.js'),
        DBObject                    = require('../models/dbobject.js'),
        SqlStatement                = require('../collections/sqlstatement.js'),
        TplMain                     = require('text!../templates/main.html'),
        TplToolbar                  = require('text!../templates/toolbar.html'),
        TplMenu                     = require('text!../templates/menu.html'),
        TplContentFunction          = require('text!../templates/content_function.html'),
        TplContentPackage           = require('text!../templates/content_package.html'),
        TplContentTable             = require('text!../templates/content_table.html'),
        TplContentType              = require('text!../templates/content_type.html'),
        TplContentSequence          = require('text!../templates/content_sequence.html'),
        TplContentMaterializedView  = require('text!../templates/content_mview.html'),
        TplContentView              = require('text!../templates/content_view.html'),
        TplData                     = require('text!../templates/table/table.html'),
        TplMainMenu                 = require('text!../templates/main_menu.html'),
        TplKeyValueTab              = require('text!../templates/key_value_tab.html'),
        TplRawSQL                   = require('text!../templates/content_raw_sql.html'),

        CodeMirror                  = require('../libs/codemirror/lib/codemirror.js'),
        Prism                       = require('prismjs');

    require('../libs/codemirror/mode/sql/sql.js');
    require('../libs/bootstrap.js');

    $.fn.fastLiveFilter = function(list, options) {
    	// Options: input, list, timeout, callback
    	options = options || {};
    	list = $(list);
    	var input = this;
    	var timeout = options.timeout || 0;
    	var callback = options.callback || function() {};

    	var keyTimeout;

    	// NOTE: because we cache lis & len here, users would need to re-init the plugin
    	// if they modify the list in the DOM later.  This doesn't give us that much speed
    	// boost, so perhaps it's not worth putting it here.
    	var lis = list.children();
    	var len = lis.length;
    	var oldDisplay = len > 0 ? lis[0].style.display : "block";
    	callback(len); // do a one-time callback on initialization to make sure everything's in sync

    	input.change(function() {
    		// var startTime = new Date().getTime();
    		var filter = input.val().toLowerCase();
    		var li;
    		var numShown = 0;
    		for (var i = 0; i < len; i++) {
    			li = lis[i];
    			if ((li.textContent || li.innerText || "").toLowerCase().indexOf(filter) >= 0) {
    				if (li.style.display == "none") {
    					li.style.display = oldDisplay;
    				}
    				numShown++;
    			} else {
    				if (li.style.display != "none") {
    					li.style.display = "none";
    				}
    			}
    		}
    		callback(numShown);
    		// var endTime = new Date().getTime();
    		// console.log('Search for ' + filter + ' took: ' + (endTime - startTime) + ' (' + numShown + ' results)');
    		return false;
    	}).keydown(function() {
    		// TODO: one point of improvement could be in here: currently the change event is
    		// invoked even if a change does not occur (e.g. by pressing a modifier key or
    		// something)
    		clearTimeout(keyTimeout);
    		keyTimeout = setTimeout(function() { input.change(); }, timeout);
    	});
    	return this; // maintain jQuery chainability
    }

    var loadCSS = function (url, rel_name, cb) {
        if (!$('head link[data-rel="'+rel_name+'"]').length) {
            _.each(url, function (u) {
                $('head').append('<link href="' + u +'" rel="stylesheet" type="text/css" data-rel="' + rel_name + '">');
            });
            var $img = $('<img src="' + url[0] + '" />').on('error', function () {
                //console.log('call me back');
                cb();
                $(this).remove();
            });

            $('body').append($img);
            return true;
        }

        return false;
    };

    var unloadCSS = function (name) {
        $('head link[data-rel="' + name +'"]').remove();
    };

    var BaseView = Backbone.View.extend({
        context: {},
        subviews: {},

        // manages subviews
        assign: function (selector, view) {
            var selectors;
            if (_.isObject(selector)) {
                selectors = selector;
            } else {
                selectors = {};
                selectors[selector] = view;
            }
            if (!selectors) return;
            _.each(selectors, function (view, selector) {
                view.setElement(this.$(selector)).render();
            }, this);
        },

        render: function (ctx) {
            this.preRender();
            var context = _.extend(this.context, ctx);
            var tpl = _.template(this.template);

            this.$el.html(tpl(context));

            this.onRender();
            this.trigger('render');
            return this;
        },

        onRender: _.noop,

        preRender: _.noop,

        // undelegate events and remove view from dom
        off: function () {
            this.undelegateEvents();
            this.$el.empty();
        }
    });

    // dropdown toolbar view
    var ToolbarView = BaseView.extend({
        template: TplToolbar,

        initialize: function () {
            this.collection = new Datasources();

            this.listenTo(this.collection, 'all', function (e, d) {
                //console.log(e, d);
            });
            this.listenTo(this.collection, 'sync', this.render);

            this.collection.fetch();
        },

        render: function () {
            _.extend(this.context, {
                items: this.collection.toJSON()
            });
            BaseView.prototype.render.call(this, this.context);
        }
    });


    // main menu view
    var MainMenuView = BaseView.extend({
        template: TplMainMenu,

        initialize: function (opts) {
            _.bindAll(this, 'render');
            this.opts = opts;
            //console.log(opts);
            this.collection = new Features([], opts);
            this.collection.on('sync', this.render);
            this.collection.fetch();
        },

        render: function () {
            //console.log('render', this);
            _.extend(this.context, {
                features: this.collection.toJSON(),
                ds: this.opts.datasource
            });
            BaseView.prototype.render.call(this, this.context);
        },

        load: function ($el) {
            var source = $('#sql-dataview-mainmenu').data('source');
            var type = $el.data('type');
            var el = '#' + source + '-' + type;
            var view = [type, source].join('_');
            var created = false, sv;

            if (this.subviews[view]) {
                sv = this.subviews[view];
            } else {
                sv = new MenuView( {datasource: source, type: type } );
                created = true;
            }

            if (!created) {
                $(el).toggle();
            } else {
                this.assign(el, sv);
            }

            this.subviews[view] = sv;
        }
    });


    // left menu view
    var MenuView = BaseView.extend({
        template: TplMenu,

        initialize: function (opts) {
            this.opts = opts;
            this.collection = new MenuObjects([], { datasource: opts.datasource, type: opts.type } );
            this.listenTo(this.collection, 'all', function (e) {
                //console.log(e);
            });
            this.listenTo(this.collection, 'sync', this.render);

            this.collection.fetch();
        },

        render: function () {
            //console.log("MenuView::render", this.opts, this.collection);
            _.extend(this.context, {
                items: this.collection.toJSON(),
                itemtype: this.opts.type,
                ds: this.opts.datasource,
            });
            BaseView.prototype.render.call(this, this.context);

            $('#search_input').fastLiveFilter('#dbobject-menu-' + this.opts.type);
        }
    });

    // table data view
    var ContentTableDataView = BaseView.extend({
        template: TplData,

        events: {
            "click a[data-action=export-csv]" : 'exportCSV',
        },

        initialize: function (opts) {
            this.opts = opts;
            this.collection = new Rows([], { object_name: opts.object_name,
                                             where_condition: opts.where_condition
                                           }
                                      );
            this.listenTo(this.collection, 'sync', this.render);

            this.collection.fetch();
        },

        exportCSV: function(e) {
            var el = $(e.currentTarget);
            var table = this.$("table");
            var csv = utils.tableToCSV({el:table, export:true});

            $('body').append('<div class="modal" id="modal" role="dialog"><div class="modal-header"><button id="modal-close" type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="myModalLabel">Copy CSV data</h3></div><div class="modal-body"><p><textarea style="box-sizing: border-box; width: 100%; height: 300px" id="csv-data" readonly="readonly">' + csv + '</textarea></p></div></div>');
            document.querySelector('#csv-data').select();
            $('#modal-close').on('click', function() {
              $('#modal').remove();
            });
        },

        render: function () {
            _.extend(this.context, { items: this.collection.toJSON(),
                                     meta: this.opts.object_meta.toJSON(),
                                     where_condition: utils.flattenSerializedArray(this.opts.where_condition)
                                   }
                    );
            BaseView.prototype.render.call(this, this.context);
        }

    });

    // main table view
    var ContentTableView = BaseView.extend({
        template: TplContentTable,
        events: {
            "click a": "changeTab",
            "submit form#where-filter-form": "onSubmitWhere",
            "submit form#clear-where-filter-form": "onSubmitWhereClear",
        },

        initialize: function (opts) {
            //console.log('ContentTableView', opts);
            this.opts = opts;
            this.object_name = this.opts.object_name;
            this.model = new DBObject({}, { object_name: this.object_name });
            this.listenTo(this.model, 'sync', this.render);

            this.model.fetch();

        },

        render: function () {
            _.extend(this.context, {
                table: this.model.toJSON()
            });
            BaseView.prototype.render.call(this, this.context);
        },

        onRender: function () {
            console.log(Prism);
            Prism.highlightAll();
        },

        onSubmitWhere: function(e) {
            //console.log(e);
            this.subviews.data = new ContentTableDataView( { object_name: this.object_name,
                                                             object_meta: this.model,
                                                             where_condition: $('#where-filter-form').serializeArray()
                                                           }
                                                         );
            this.assign('#table-data', this.subviews.data);

            e.preventDefault();
        },

        onSubmitWhereClear: function(e) {
            //console.log(e);
            this.showData();
            e.preventDefault();
        },

        showData: function () {
            this.subviews.data = new ContentTableDataView( { object_name: this.object_name,
                                                             object_meta: this.model,
                                                           }
                                                         );
            this.assign('#table-data', this.subviews.data);
        },

        changeTab: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var $el = $(e.currentTarget);

            if ($el.attr('href') == '#table-data') {
                this.showData();
            }

            $el.tab('show');
        }
    });

    // base content view
    var ContentKeyValueBase = BaseView.extend({

        events: {
            "click a[data-action=export-csv]" : 'exportCSV',
        },

        initialize: function (opts) {
            _.bindAll(this, 'render');

            this.opts = opts;
            this.object_name = this.opts.object_name;
            this.model = new DBObject({}, { object_name: this.object_name });
            console.log(this.model);
            this.listenTo(this.model, 'sync', this.render);
            this.omitDisplay = [ 'src', 'src_body' ];

            this.model.fetch();

        },

        // a helper method tp render "key_value_tab.html" template.
        // <%= renderKeyValueTab() %> is used in parent template then
        renderKeyValueTab: function (model) {
          return function() {
            var args = this.omitDisplay;
            console.log('In renderKeyValueTab', model);
            var jsonObj = this.model.toJSON();
            args.unshift(_.keys(jsonObj));
            var keys = _.without.apply(_, args);
            return _.template(TplKeyValueTab, { obj: jsonObj, keys : keys });
          }
        },

        exportCSV: function(e) {
            var el = $(e.currentTarget);
            var table = this.$("table");
            var csv = utils.tableToCSV({el:table, export:true});
            el.attr("download", "qorus_ui_export.csv");
            el.attr("href", csv);
            el.attr("target", "_blank");
        },

        render: function () {
            console.log('In render', this.model);
            _.extend(this.context, {
              obj: this.model.toJSON(),
              renderKeyValueTab: this.renderKeyValueTab(this.model),
            });

            BaseView.prototype.render.call(this, this.context);
        },

        onRender: function () {
            console.log(Prism);
            Prism.highlightAll();
        },
    });

    // sequence view
    var ContentSequenceView = ContentKeyValueBase.extend({
        template: TplContentSequence,
    });

    var ContentFunctionView = ContentKeyValueBase.extend({
         template: TplContentFunction,
    });

    var ContentMaterializedViewView = ContentKeyValueBase.extend({
         template: TplContentMaterializedView,
    });

    var ContentPackageView = ContentKeyValueBase.extend({
        template: TplContentPackage,
    });

    var ContentProcedureView = ContentKeyValueBase.extend({
        template: TplContentFunction, // TODO/FIXME: maybe to separate one day
    });

    var ContentTypeView = ContentKeyValueBase.extend({
        template: TplContentType,
    });

    var ContentViewView = ContentKeyValueBase.extend({
        template: TplContentView,
    });

    var ContentSQLView = BaseView.extend({
        template: TplRawSQL,

        events: {
            'submit': 'onSubmit',
            "click a[data-action=export-csv]" : 'exportCSV',
        },

        initialize: function (opts) {
            _.bindAll(this, 'render');
            this.opts = opts || {};
            //console.log(opts);
            this.initCollection(opts);
        },

        render: function () {
            var css = loadCSS(
                    [config.BASE_URL + '/css/codemirror.css', config.BASE_URL + '/css/codemirror.css'],
                    'sql-data-view',
                    this.applyHighlighting
                );

            //console.log('render', this.collection.toJSON());
            _.extend(this.context, this.opts, {
                items: this.collection.toJSON(),
                ds: this.opts.datasource
            });

            BaseView.prototype.render.call(this, this.context);

            if (!css) {
                this.applyHighlighting();
            }
        },

        exportCSV: function(e) {
            var el = $(e.currentTarget);
            var table = this.$("table");
            var csv = utils.tableToCSV({el:table, export:true});
            //console.log(el);
            el.attr("download", "qorus_ui_export.csv");
            el.attr("href", csv);
            el.attr("target", "_blank");
        },

        applyHighlighting: function () {
            if (!$('.CodeMirror').length) {
                CodeMirror.fromTextArea(document.getElementById('sql-statement'), { mode: 'text/x-sql', theme: 'blackboard', lineNumbers: true });
            }
        },

        onSubmit: function (e) {
            e.preventDefault();

            this.opts = _.extend({}, _.pick(this.opts, 'datasource') , utils.flattenSerializedArray($(e.target).serializeArray()));
console.log(this.opts);

            var opts = _.extend({}, this.opts, { 'sql-statement': window.btoa(this.opts['sql-statement']) });

            this.initCollection(opts);
            this.collection.fetch();
        },

        initCollection: function (opts) {
            if (this.collection) {
                this.collection.off();
            }

            this.collection = new SqlStatement([], opts);
            this.collection.on('sync', this.render);
            //this.collection.fetch();
        },

        off: function () {
            unloadCSS('sql-data-view');
            this.undelegateEvents();
            this.$el.empty();
        }
    });

    // extension main view
    var MainView = BaseView.extend({
        template: TplMain,
        events: {
            "click a[data-action=datasource-change]"        : 'changeDatasource',
            "click a[data-action=db-object-menu-clicked]"   : 'showDBObject',
            "click a[data-action=load-nested-menu]"         : 'loadNestedMenu',
            "click a[data-action=sql-editor-clicked]"       : 'showSQLEditor'
        },

        initialize: function () {
            this.createSubviews();
            this.dispatch();
        },

        dispatch: function () {
            var path, len;
            var query = window.location.search.slice(1);
            //console.log('MainView::dispatch', query, query.split('/'), query.split('/').length);

            if (query.length > 1) {
                path = query.split('/');
                len = path.length;
                this.changeDatasource(path[0]);
                // TODO/FIXME: how to load nested menu?
                if (path[1] == 'sql') {
                    this.showSQLEditor();
                }
                if (len == 3)
                    this.showDBObject(query);
            } else {
                path = null;
                len = 0;
            }
        },

        createSubviews: function () {
            this.subviews.toolbar = new ToolbarView();
        },

        preRender: function () {
            this.context = _.extend({}, this.context, { base_url: config.BASE_URL });
        },

        onRender: function () {
            //console.log(this.context);
            this.assign('#sql-datasources', this.subviews.toolbar);
        },

        navigate: function (path) {
            if (path.substring(0, 1) === '?') {
                path = utils.getCurrentLocationPath() + path;
            }
            Backbone.history.navigate(path, { trigger: false });
        },

        changeDatasource: function (e) {
            //console.log('changeDatasource start', e);
            var datasource, is_event = false;

            if (_.isObject(e)) {
                var $el = $(e.currentTarget);
                is_event = true;

                datasource = $el.data('datasource');

                // prevent default click
                e.preventDefault();

                // but change url
                this.navigate($el.attr('href'));

            } else {
                datasource = e;
            }

            if (this.subviews.menu) {
                this.subviews.menu.off();

                if (this.subviews.content) {
                    this.subviews.content.off();
                }
            }

            this.datasource = datasource;

            //console.log('changeDatasource datasource', datasource);
            this.subviews.menu = new MainMenuView( {datasource: datasource} );

            this.subviews.menu.on('render', function (e) {
                $('#datasource-name').text(datasource);
            });

            this.assign('#sql-dataview-tree', this.subviews.menu);

            if (is_event) {
                //console.log('is event');
                $('.dropdown-toggle').dropdown('toggle');
            }
        },

        showDBObject: function (e) {
            //console.log('showDBObject', e);
            var dbobject, navigation;

            if (_.isObject(e)) {
                var $el = $(e.currentTarget);
                dbobject = $el.data('dbobject');

                // prevent default click
                e.preventDefault();

                // but change url
                this.navigate($el.attr('href'));
            } else {
                dbobject = e;
            }

            if (this.subviews.content) {
                this.subviews.content.off();
            }

            // 0 - datasource
            // 1 - db object type (lowercase)
            // 2 - sb object name (db native case)
            navigation = dbobject.split('/');
            //console.log('showDBObject BEFORE VIEW', navigation, dbobject, e);

            //this.subviews.content = new ContentView( {object_name: dbobject} );
            //console.log('constructing', navigation[1]);
            switch (navigation[1]) {
                case 'function' :
                    this.subviews.content = new ContentFunctionView( { object_name : dbobject } );
                    break;
                case 'materializedView' :
                    this.subviews.content = new ContentMaterializedViewView( { object_name : dbobject } );
                    break;
                case 'package' :
                    this.subviews.content = new ContentPackageView( { object_name : dbobject } );
                    break;
                case 'procedure' :
                    this.subviews.content = new ContentProcedureView( { object_name : dbobject } );
                    break;
                case 'table' :
                    this.subviews.content = new ContentTableView( { object_name : dbobject } );
                    break;
                case 'sequence' :
                    this.subviews.content = new ContentSequenceView( { object_name : dbobject } );
                    break;
                case 'type' :
                    this.subviews.content = new ContentTypeView( { object_name : dbobject } );
                    break;
                case 'view' :
                    this.subviews.content = new ContentViewView( { object_name : dbobject } );
                    break;
                default:
                    console.log('UNIMPLEMENTED DB object type', navigation[1]);
            }

            // TODO/FIXME: move it to table view. But what it should do?
            //this.subviews.content.on('render', function (e) {
            //    $('#dbobject li').removeClass('active');
            //    $('#dbobject a[data-dbobject=' + dbobject.replace('/', '\\/') + ']').parent().addClass('active');
            //});

            this.assign('#sql-dataview-object-detail', this.subviews.content);
        },

        showSQLEditor: function (e) {
            if (this.subviews.content) {
                this.subviews.content.off();
            }
            this.subviews.content = new ContentSQLView({ datasource: this.datasource });
            this.assign('#sql-dataview-object-detail', this.subviews.content);

            if (e) {
                this.navigate($(e.currentTarget).attr('href'));
            }
        },

        loadNestedMenu: function (e) {
            //console.log('loadNestedMenu', e);
            e.preventDefault();
            var $el = $(e.currentTarget);
            $el.toggleClass('uiexpand');
            this.subviews.menu.load($el);
        }
    });

    var view = new MainView();

    view.setElement('#sql-dataview');
    view.render();
    view.dispatch();

    return view;
});
