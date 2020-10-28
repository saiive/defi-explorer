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
  createToken: 'T',
}

var CUSTOM_SIGNATURE = 'DfTx';

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

var CreateToken = function CreateToken(arg) {
  if (!(this instanceof CreateToken)) {
    return new CreateToken(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return CreateToken.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return CreateToken.toBuffer(arg);
  }
}

CreateToken.fromBuffer = function(br) {
  var data = {};
  data.decimal = br.readUInt8();
  data.limit = br.readUInt64LEBN();
  data.mintable = br.readUInt8();
  data.tradeable = br.readUInt8();
  data.isDAT = br.readUInt8();
  data.minted = br.readUInt8();
  data.creationTx = br.readReverse(32);
  data.destructionTx = br.readReverse(32);
  data.creationHeight = br.readUInt32LE();
  data.destructionHeight = br.readUInt32LE();
  return data;
}

CreateToken.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.createToken);
  bw.write(data.symbol);
  bw.write(data.name);
  bw.writeUInt8(BN.fromNumber(data.decimal));
  bw.writeUInt64LEBN(BN.fromNumber(data.limit));
  bw.writeUInt8(data.mintable);
  bw.writeUInt8(data.tradeable);
  bw.writeUInt8(data.isDAT);
  bw.writeUInt8(data.minted);
  bw.write(data.creationTx);
  bw.write(data.destructionTx);
  bw.writeUInt32LE(data.creationHeight);
  bw.writeUInt32LE(data.destructionHeight);
  return bw;
};

var MintToken = function MintToken(arg) {
  if (!(this instanceof MintToken)) {
    return new MintToken(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return MintToken.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return MintToken.toBuffer(arg);
  }
};

MintToken.fromBuffer = function(br) {
  var data = {};
  data.balances = br.readUInt64LEBN();
  return data;
}

MintToken.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.writeUInt64LEBN(BN.fromNumber(data.balances))
  return bw;
}


