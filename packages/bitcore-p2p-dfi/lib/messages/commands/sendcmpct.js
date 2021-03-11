'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib-dfi');
var BufferUtil = bitcore.util.buffer;

/**
 * Request information about active peers
 * @extends Message
 * @param {Object} options
 * @constructor
 */
function SendcmpctMessage(arg, options) {
  Message.call(this, options);
  this.command = 'sendcmpct';
}
inherits(SendcmpctMessage, Message);

SendcmpctMessage.prototype.setPayload = function() {};

SendcmpctMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = SendcmpctMessage;
