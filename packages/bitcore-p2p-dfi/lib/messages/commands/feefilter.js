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
function FeefilterMessage(arg, options) {
  Message.call(this, options);
  this.command = 'feefilter';
}
inherits(FeefilterMessage, Message);

FeefilterMessage.prototype.setPayload = function() {};

FeefilterMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = FeefilterMessage;
