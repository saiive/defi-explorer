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
function WtxIdRelayMessage(arg, options) {
  Message.call(this, options);
  this.command = 'wtxidrelay';
}
inherits(GetaddrMessage, Message);

WtxIdRelayMessage.prototype.setPayload = function() {};

WtxIdRelayMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = WtxIdRelayMessage;
