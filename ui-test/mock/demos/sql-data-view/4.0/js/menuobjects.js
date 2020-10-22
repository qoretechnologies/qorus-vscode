define([
  'module',
  'jquery',
  'underscore',
  'backbone',
], function ($self, $, _, Backbone) {
  var Collection = Backbone.Collection.extend({

    initialize: function (models, opts) {
        console.log('menuobjects::initialize', opts);
      this.url = config.REST_PREFIX + '?action=' + opts.type + ';datasource=' + opts.datasource;
      Collection.__super__.initialize.call(this, models, opts);
    },
  });

  return Collection;
});
