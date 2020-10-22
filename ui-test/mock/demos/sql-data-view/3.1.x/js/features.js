define([
  'module',
  'jquery',
  'underscore',
  'backbone',
], function ($self, $, _, Backbone) {
  var Collection = Backbone.Collection.extend({

    initialize: function (models, opts) {
      this.url = '/db?action=Features;datasource=' + opts.datasource;
      Collection.__super__.initialize.call(this, models, opts);
    },
  });

  return Collection;
});
