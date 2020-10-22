define([
  'module',
  'jquery',
  'underscore',
  'backbone'
], function ($self, $, _, Backbone) {

  var Collection = Backbone.Collection.extend({
    url: function () {
        var attrs = this.object_name.split('/');
        if (this.where_condition)
            return config.REST_PREFIX + '?action=TableData;datasource=' + attrs[0] + ';name=' + attrs[2] + ';where=' + this.where_condition;
        else
            return config.REST_PREFIX + '?action=TableData;datasource=' + attrs[0] + ';name=' + attrs[2];

    },

    initialize: function (models, opts) {
      this.opts = opts;
      this.object_name = this.opts.object_name;
      this.where_condition = JSON.stringify(this.opts.where_condition);
      Collection.__super__.initialize.call(this, models, opts);
    },
  });

  return Collection;
});
