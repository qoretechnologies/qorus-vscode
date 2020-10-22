define(function (require) {
    var _         = require('underscore'),
        Backbone  = require('backbone'),
        utils     = require('../utils.js');

  var Collection = Backbone.Collection.extend({
    url: function () {
     var url = '/db?action=Sql&' + utils.encodeQuery(this.opts);

     return url;
    },

    initialize: function (models, opts) {
      this.opts = opts || {};
      Collection.__super__.initialize.call(this, models, opts);
    },
  });

  return Collection;
});
