
/**
 * Module dependencies
 */

var store = require('./lib/store')
  , url = require('url')
  , qs = require('querystring')
  , debug = require('debug')('pushlytics')

/**
 * Default route
 */

var DEFAULT_ROUTE = '/pixel.gif';

/**
 * Creates a pushlytics instance
 * that is easily pluggable into
 * an http request stack
 *
 * @api public
 * @param {String} route - optional
 * @param {Object} opts - opts
 */

module.exports = pushlytics;
function pushlytics (route, opts) {
  if ('object' == typeof route) {
    opts = route;
    route = DEFAULT_ROUTE;
  }

  opts = opts || {};
  opts.store = opts.store || {};
  route = route || DEFAULT_ROUTE;

  debug("route to match: '%s'", route);

  // request callback
  function proto (req, res, next) {
    next = 'function' == typeof next ? next : function () {};
    var u = url.parse(req.url);
    var q = qs.parse(u.query);

    debug("request: '%s'", u.pathname, q);

    if (u.pathname == route) {
      debug("push: %j", q);
      proto.store.push(q);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/gif');
    res.end();
    next();
  }

  // init store
  opts.store.path = opts.store.path || './pushlytics-db';
  proto.store = store(opts.store);

  return proto;
}
