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
  mintToken: 'M',
  updateToken: 'N',
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
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.mintToken);
  bw.writeUInt64LEBN(BN.fromNumber(data.balances))
  return bw;
}

var UpdateToken = function UpdateToken(arg) {
  if (!(this instanceof UpdateToken)) {
    return new UpdateToken(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return UpdateToken.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return UpdateToken.toBuffer(arg);
  }
};

UpdateToken.fromBuffer = function(br) {
  var data = {};
  data.tokenTx = br.readReverse(32);
  data.isDAT = br.readUInt8();
  return data;
}

UpdateToken.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.createToken);
  bw.write(data.tokenTx);
  bw.writeUInt8(data.isDAT);
  return bw;
}

var UpdateTokenAny = function UpdateTokenAny(arg) {
  if (!(this instanceof UpdateTokenAny)) {
    return new UpdateTokenAny(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return UpdateTokenAny.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return UpdateTokenAny.toBuffer(arg);
  }
};

UpdateTokenAny.fromBuffer = function(br) {
  var data = {};
  data.tokenTx = br.readReverse(32);
  var len = br.readUInt8();
  var symbol = br.read(len);
  len = br.readUInt8();
  var name = br.read(len);
  data.newToken = {
    symbol: symbol,
    name: name,
    decimal: br.readUInt8(),
    limit: br.readUInt64LEBN(),
    mintable: br.readUInt8(),
    tradeable: br.readUInt8(),
    isDAT: br.readUInt8(),
  };
  return data;
}

UpdateTokenAny.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.createToken);
  bw.write(data.tokenTx);
  bw.write(data.symbol);
  bw.write(data.name);
  bw.writeUInt8(data.decimal);
  bw.writeUInt64LEBN(BN.fromNumber(data.limit));
  bw.writeUInt8(data.mintable);
  bw.writeUInt8(data.tradeable);
  bw.writeUInt8(data.isDAT);
  return bw;
}

var CreatePoolPair = function CreatePoolPair(arg) {
  if (!(this instanceof CreatePoolPair)) {
    return new CreatePoolPair(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return CreatePoolPair.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return CreatePoolPair.toBuffer(arg);
  }
};

CreatePoolPair.fromBuffer = function(br) {
  var data = {};
  data.idTokenA = br.readUInt32LE();
  data.idTokenB = br.readUInt32LE();
  data.commission = br.readUInt64LEBN();
  data.ownerAddress = br.readUInt64LEBN();
  data.status = br.readUInt8();
  data.pairSymbol = br.readAll();
  return data;
}

CreatePoolPair.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.createToken);
  bw.writeUInt32LE(data.idTokenA);
  bw.writeUInt32LE(data.idTokenB);
  bw.writeUInt64LEBN(BN.fromNumber(data.commission));
  bw.writeUInt64LEBN(BN.fromNumber(data.ownerAddress));
  bw.writeUInt8(data.status);
  bw.write(data.pairSymbol);
  return bw;
}

