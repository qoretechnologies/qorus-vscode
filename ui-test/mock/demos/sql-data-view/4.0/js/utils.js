define(function (require) {
  var _         = require('underscore'),
      moment    = require('moment'),
      settings  = require('./settings.js'),
      $         = require('jquery'),
      md5       = require('spark-md5');

  var utils = {
    settings: settings,
    status_map: {
      "waiting": "waiting",
      "async-waiting": "waiting",
      "event-waiting": "waiting",
      "error": "important",
      "in-progress": "warning",
      "complete": "success",
      "incomplete": "info",
      "canceled": "canceled",
      "retry": "error",
      "ready": "ready",
      "scheduled": "info",
      "success": "success"
    },
    action_icons: {
      "unload": "remove-circle",
      "load": "off",
      "reset": "refresh"
    },

    input_map: {
      'integer': ['input', 'number'],
      'bool': ['input', 'text'],
      'string': ['input', 'text']
    },
    data_types: {
      'integer': /\d+/,
      'string': /.*/,
      'date': /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
      'boolean': /(1|2|True|False)/i
    },

    parseDate: function (date, format) {
      var d;
      if (format===undefined){
          d = moment(date, settings.DATE_FORMAT);
      } else if (format===null){
          d = moment(date);
      } else {
          d = moment(date, format);
      }

      return d;
    },

    formatDate: function (date) {
        return date.format(settings.DATE_DISPLAY);
    },

    prepareDate: function (date) {
      var mdate;

      if (date === undefined || date === null || date === '24h') {
        mdate = moment().add('days', -1).format(settings.DATE_DISPLAY);
      } else if (date == 'all') {
        mdate = moment(settings.DATE_FROM).format(settings.DATE_DISPLAY);
      } else if (date == 'now') {
        mdate = moment().format(settings.DATE_DISPLAY);
      } else if (date == 'today') {
        mdate = moment().hour(0).minutes(0).seconds(0);
      } else if (date.match(/^[0-9]+$/)) {
        mdate = moment(date, 'YYYYMMDDHHmmss').format(settings.DATE_DISPLAY);
      } else {
        mdate = date;
      }

      return mdate;
    },

    // getNextDate: function (cron_time) {
    //     var next = later().getNext(cronParser().parse(cron_time));
    //
    //     return this.parseDate(next, null);
    // },

    getCurrentLocation: function () {
      return window.location.href;
    },

    getCurrentLocationPath: function () {
      return window.location.pathname;
    },

    parseURLparams: function () {
      var loc    = window.location.hash.slice(1),
          params = [];

      _(loc.split(';')).each(function (param) {
        params.push(param.split(':'));
      });

      return params;
    },

    flattenSerializedArray: function (object, except) {
      // buggy when the object should be an array but has only one item selected it becomes a string
      var exclude = _.isArray(except) ? except : [except];
      var data = {};
      _.each(object, function(obj) {
        if (_.indexOf(exclude, obj.name) === -1) {
          if (_.has(data, obj.name)) {
            if (!_.isArray(data[obj.name])) {
              var old = data[obj.name];
              data[obj.name] = [old];
            }
            data[obj.name].push(obj.value);
          } else {
            data[obj.name] = obj.value;
          }
        }
      });

      return data;
    },

    encodeDate: function (date) {
      var m  = moment(date, settings.DATE_DISPLAY);

      if (!m.isValid()) {
        m = moment();
      }
      return m.format('YYYYMMDDHHmmss');

    },

    prep: function (val, des) {
      if (_.isNumber(val)) {
        val = String('00000000000000' + val).slice(-14);
      } else  if (_.isString(val)) {
        val = val.toLowerCase();
      }
      if (des === true) {
        return '-' + val;
      }
      return val;
    },

    // Generate four random hex digits.
    S4: function () {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    },

    // Generate a pseudo-GUID by concatenating random hexadecimal.
    guid: function () {
       return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
    },

    parseQuery: function (fragment) {
      if (!fragment) return {};
      fragment = decodeURIComponent(fragment);
      var query = (fragment.indexOf('?') === -1) ? fragment : fragment.split('?')[1];
      var params = {};

      if (query.search(/^\s+/) !== -1) return {};

      _.each(query.split(/;|&/), function (pair) {
        pair = pair.split('=');
        params[pair[0]] = pair[1];
      });

      return params;
    },

    encodeQuery: function (query) {
      var equery = [];

      _.each(query, function (v, k) {
        if (k!=='')
          equery.push([k,v].join('='));
      });

      return equery.join('&');
    },

    spaceToLevel: function (str) {
      var len = str.search(/[^\s]/);

      if (len !== -1) {
        return len;
      } else {
        return str.length;
      }
    },

    flattenObj: function (obj) {
      if (!obj) return '';
      var lines = JSON.stringify(obj, null, 1)
                    .replace(/{},$|[],$|^\{$|^\}$|\],$|\},$|\{$|\}$|\[$|\]$|,$|"/mg, '')
                    .replace(/"/gm, '')
                    .split('\n'),
          result = [],
          total  = lines.length,
          counter= {};

      _.each(lines, function (line, i) {
        var level     = utils.spaceToLevel(line),
            nextLevel = lines[i+1] ? utils.spaceToLevel(lines[i+1]) : -1,
            cnt       = line.slice(level).split(/:(.+)/,2),
            node      = nextLevel > level,
            leaf      = nextLevel < level,
            key       = cnt[0],
            value     = (cnt.length > 1) ? cnt[1] : '';

        if (key || node) {
          if (counter[level] === undefined) {
            counter[level] = 0;
          } else {
            counter[level] = counter[level] + 1;
          }

          if (!value && !node) {
            value = key;
            key = '';
          }

          result.push({
            key: key || "[" + counter[level]  + "]",
            value: value,
            level: level - 1,
            node: node,
            leaf: leaf
          });

          if (leaf) {
            delete counter[level];
          }
        }
      });

      return result.slice(1);
    },

    validate: function (obj, type, regex) {
      var test;

      if (type in this.data_types)
        test = this.data_types[type];

      if (type === 'regex') test = regex;

      return obj.match(test);
    },

    /**
      Returns CSV string/base64 data of html table
      @param {Object} options - Export options
      @param {string} options.el - Name of table element
      @param {Boolean} [options.export] - True if you want outuput in data uri format
      @param {Array} [options.ignore] - Indexes of columns which ignore in export
      @param {string} [options.separator=";"] - CSV separator
      @param {string} [options.newline="\n"] - CSV newline separator
      @returns {string}

      @example
      function exportCSV(e) {
        var el    = $(e.currentTarget),
            table = el.data('table');

        el.href = utils.tableToCSV({ el: table, export: true });
        return true;
      }

      <a download="file.csv" onClick="export()" table="#export-table}>Export CSV</a>
    */
    tableToCSV: function (opts) {
      if (!opts && !opts.el) return 'Options or element not specified';
      var $el       = $(opts.el),
          ignore    = (opts.ignore) ? _(opts.ignore).clone().map(function (ig) { return ":eq("+ig+")"; }).join() : '',
          separator = opts.separator || ';',
          newline   = opts.newline || "\n",
          csv       = '';

      // create header
      if (opts.header) {
        csv += opts.header.join(separator);
      } else {
        csv += $el.find('thead').first().find('th').not(ignore).map(function (i, el) {
          return $(el).text().trim();
        }).get().join(separator);
      }
      csv += newline;

      // process rows
      $el.find('tbody tr:visible').each(function () {
        csv += $(this).find('td').not(ignore).map(function (i, el) {
          var val;

          if (_.has($(el).data(), 'value')) {
            val = $(el).data('value').toString();
          } else {
            val = $(el).text();
          }
          return val.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        }).get().join(separator);
        csv += "\n";
      });

      return csv.trim();

      if (!opts.export) {
        return csv.trim();
      } else {
        return 'data:text/csv;base64,' + utils.utf8ToB64(csv.trim());
      }
    },

    /**
      Returns CSV string/base64 data of collection
      @param {Object} options - Export options
      @param {Boolean} [options.export] - True if you want outuput in data uri format
      @param {Array} [options.data] - Data
      @param {Array} [options.include] - Keys of columns which include in export
      @param {Array} [options.exclude] - Keys of columns which exclude in export
      @param {string} [options.separator=";"] - CSV separator
      @param {string} [options.newline="\n"] - CSV newline separator
      @returns {string}

      @example
      function exportCSV(e) {
        var el = document.querySelector('a'),
            col = [{ name: 'Name1', dontList: 'me'}],
            opts = { data: col, export: true };

        el.href = utils.dataToCSV(opts);
        return true;
      }

      <a download="file.csv" onClick="export()" table="#export-table}>Export CSV</a>
    */
    dataToCSV: function (opts) {
      if (!opts && opts.data && opts.data.length > 0) return 'Options not specified';
      var keys      = _.keys(opts.data[0]),
          separator = opts.separator || ';',
          newline   = opts.newline || "\n",
          csv       = '';

      if (opts.include) {
        keys = _.intersection(opts.include, keys);
      }

      if (opts.exclude) {
        keys = _.difference(keys, opts.exclude);
      }

      // create header
      csv += keys.join(separator);
      csv += newline;

      // process rows
      _.each(opts.data, function (row) {
        var cols = _.map(keys, function (key) { return row[key]; });

        csv += cols.join(separator);
        csv += newline;
      });


      if (!opts.export) {
        return csv.trim();
      } else {
        return 'data:text/csv;base64,' + utils.utf8ToB64(csv.trim());
      }
    },

    /**
      Returns base64 encoded string
      @param {string}
      @returns {string}
    */
    utf8ToB64: function (str) {
      return window.btoa(unescape(encodeURIComponent(str)));
    },

    hash: function (obj) {
      var s = md5.hash(JSON.stringify(obj).replace(/\s/, ''));

      return s;
    },

    getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },

    getSelected: function () {
      if (window.getSelection) {
        return window.getSelection().toString();
      } else if (document.getSelection) {
        return document.getSelection().toString();
      } else {
        var selection = document.selection && document.selection.createRange();
        if (selection.text) {
          return selection.text.toString();
        }
        return "";
      }
      return "";
    },

    preventOnSelection: function (fn) {
      var getSelected = this.getSelected;

      return function () {
        if (getSelected() === "") {
          fn.apply(this, arguments);
        }
      };
    }
  };

  return utils;
});
