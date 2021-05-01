'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib');
var BufferUtil = bitcore.util.buffer;

/**
 * Request information about active peers
 * @extends Message
 * @param {Object} options
 * @constructor
 */
function SendCmpctMessage(arg, options) {
  Message.call(this, options);
  this.command = 'sendcmpct';
}
inherits(SendCmpctMessage, Message);

SendCmpctMessage.prototype.setPayload = function() {};

SendCmpctMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = SendCmpctMessage;
