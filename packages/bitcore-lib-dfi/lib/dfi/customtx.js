'use strict'

var _ = require('lodash');
var BN = require('../crypto/bn');
var BufferWriter = require('../encoding/bufferwriter');
let BufferReader = require('../encoding/bufferreader');
var Hash = require('../crypto/hash');
var $ = require('../util/preconditions');
var Address = require('../address');
var PublicKey =  require('../publickey');
let BufferUtil = require('../util/buffer');
let Signature = require('../crypto/signature');

var customTxType = {
  createMasternode: 'C',
  resignMasternode: 'R',
}

var CreateMasternode = function CreateMasternode(buffer) {
  if (!(this instanceof CreateMasternode)) {
    return new CreateMasternode(buffer);
  }
  if (BufferUtil.isBuffer(buffer)) {
    return CreateMasternode.fromBuffer(buffer);
  }
};

CreateMasternode.fromBuffer = function(buffer) {
  var data = {};
  data.operatorType = buffer.readUInt8();
  data.operatorAuthAddress = buffer.read(20);
  return data;
};

var ResignMasternode = function() {
  if (!(this instanceof ResignMasternode)) {
    return new ResignMasternode(buffer);
  }
  if (BufferUtil.isBuffer(buffer)) {
    return ResignMasternode.fromBuffer(buffer);
  }
};

ResignMasternode.fromBuffer = function(buffer) {
  var data = {};
  data.nodeId = buffer.read(32);
  return data;
}

var CreateToken = function CreateToken(buffer) {
  if (!(this instanceof CreateToken)) {
    return new CreateToken(buffer);
  }
  if (BufferUtil.isBuffer(buffer)) {
    return CreateToken.fromBuffer(buffer);
  }
}

CreateToken.fromBuffer = function(buffer) {
  var data = {};

}
