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
function FeeFilterMessage(arg, options) {
  Message.call(this, options);
  this.command = 'feefilter';
}
inherits(FeeFilterMessage, Message);

FeeFilterMessage.prototype.setPayload = function() {};

FeeFilterMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = FeeFilterMessage;
