
/**
 * Module dependencies
 */

var level = require('level')
  , sublevel = require('level-sublevel')
  , EventEmitter = require('events').EventEmitter
  , ware = require('ware')

/**
 * Creates an instance of `Store'
 *
 * @api public
 * @param {Object} opts
 */

module.exports = Store;
function Store (opts) {
  if ('object' != typeof opts) {
    throw new TypeError("expecting object");
  } else if ('string' != typeof opts.path) {
    throw new TypeError("expecting `.path' to be a string");
  }

  if (!(this instanceof Store)) {
    return new Store(opts);
  }

  // inherit from `EventEmitter'
  EventEmitter.call(this);

  this.db = sublevel(level(opts.path)).sublevel(opts.prefix || 'pushlytics');
  this.ware = ware(opts.transform || function (err, data, next) {
    if (err) { return next(err); }
    else { next(); }
  });
}

// inherit from `EventEmitter'
Store.prototype.__proto__ = EventEmitter.prototype;

/**
 * Push data to store
 *
 * @api public
 * @param {Object} data
 * @param {Function} cb
 */

Store.prototype.push = function (data, cb) {
  var self = this;
  var db = this.db;

  if (null == data) {
    return this;
  }

  cb = 'function' == typeof cb ? cb : function () {};

  this.ware.run(data, function (err, data) {
    if (err) {
      cb(err);
      self.emit('error', err);
      return;
    }

    if ('object' == typeof data) {
      data = JSON.stringify(data);
    }

    db.put(Date.now(), data, function (err) {
      if (err) { self.emit('error', err); }
      cb(err, data);
    });
  });

  return this;
};

