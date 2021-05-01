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
function SendAddrV2Message(arg, options) {
  Message.call(this, options);
  this.command = 'sendaddrv2';
}
inherits(SendAddrV2Message, Message);

SendAddrV2Message.prototype.setPayload = function() {};

SendAddrV2Message.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = SendAddrV2Message;
