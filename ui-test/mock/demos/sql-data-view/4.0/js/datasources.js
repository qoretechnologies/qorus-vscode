define([
  'module',
  'jquery',
  'underscore',
  'backbone'
], function ($self, $, _, Backbone) {
  var Collection = Backbone.Collection.extend({
    url: config.REST_PREFIX + "?action=Datasources"
  });

  return Collection;
});
