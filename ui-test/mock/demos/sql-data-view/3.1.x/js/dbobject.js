define([
  'module',
  'jquery',
  'underscore',
  'backbone'
], function ($self, $, _, Backbone) {
  var Model = Backbone.Model.extend({
    idAttribute: 'name',

    urlRoot: function () {
        if (this.opts.object_name) {
            // data structure of object_name:
            // 0: datasource, 1: type, 2: name
            var attrs = this.opts.object_name.split('/');
            return config.REST_PREFIX + '?action=' + attrs[1] + 'Structure;datasource=' + attrs[0] + ';name=' + attrs[2];
        }
        return '';
    },

    initialize: function (atrs, opts) {
        console.log('DBObject::init', atrs, opts);
        this.opts = opts;
        Backbone.Model.prototype.initialize.call(this, atrs, opts);
    },
  });

  return Model;
});
