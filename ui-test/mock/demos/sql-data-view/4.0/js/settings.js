define(function (require) {
  var $ = require('jquery');
  var hostname = window.location.hostname;
  //var hostname = "192.168.20.190";
  var host = hostname + ":8001";
  var wshost = hostname + ":8001";
  var protocol = "http:"; // window.location.protocol;
  var ws_protocol = (protocol == 'https:') ? "wss://" : "ws://";
  function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
  }
 $.ajaxSetup({
  //  crossDomain: true,
   username: 'admin',
   password: 'admin',
   beforeSend: function(xhr){
    //  console.log('shit baraboom');
    xhr.setRequestHeader("Authorization", make_base_auth('admin', 'admin'));
   }
 });
  var settings = {
      DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss.SSS ddd ZZ',
      DATE_DISPLAY_CONDENSED: 'YYYYMMDDHHmmss',
      DATE_DISPLAY: 'YYYY-MM-DD HH:mm:ss',
      DATE_TSEPARATOR: 'YYYY-MM-DDTHH:mm:ss',
      DATE_FROM: '1970-01-01',
      SEARCH_SEPARATOR: /[ ,]+/,
      PROTOCOL: protocol,
      REST_API_PREFIX:  protocol + '//'+ host + '/api',
      WS_PREFIX: '',
      WS_HOST: ws_protocol + wshost,
      EVENTS_WS_URL: ws_protocol + wshost + '/apievents',
      HOST: host,
      DEBUG: false
    };
  if (settings.DEBUG && window.console && console.log) {
    window.debug = window.console;
  } else {
    window.debug = {
      'log': function () {},
      'error': function () {
        console.log.call(console, arguments);
      }
    };
  }
  return settings;
});
