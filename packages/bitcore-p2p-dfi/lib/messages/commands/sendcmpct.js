'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib-dfi');
var BufferUtil = bitcore.util.buffer;

/**
 * A message indicating that the node prefers to receive new block announcements
 * via a `headers` message rather than an `inv` (BIP130).
 * @extends Message
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
