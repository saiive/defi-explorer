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
var CBalances = require('./deserialiizeTypes').CBalances;
var CScript = require('./deserialiizeTypes').CScript;

var customTxType = {
  createMasternode: 'C',
  resignMasternode: 'R',
  createToken: 'T',
  mintToken: 'M',
  updateToken: 'N',
  updateTokenAny: 'n',
  createPoolPair: 'p',
  updatePoolPair: 'u',
  poolSwap: 's',
  addPoolLiquidity: 'l',
  removePoolLiquidity: 'r',
  setGovVariable: 'G',
};

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
  var lenSymbol = br.readVarintNum();
  data.symbol = br.read(lenSymbol);
  var lenName = br.readVarintNum();
  data.name = br.read(lenName);
  data.decimal = br.readUInt8();
  data.limit = br.readUInt64LEBN();
  data.mintable = br.readUInt8();
  data.tradeable = br.readUInt8();
  data.isDAT = br.readUInt8();
  return data;
}

CreateToken.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.createToken);
  bw.writeVarintNum(data.symbol.length);
  bw.write(data.symbol);
  bw.writeVarintNum(data.name.length);
  bw.write(data.name);
  bw.writeUInt8(BN.fromNumber(data.decimal));
  bw.writeUInt64LEBN(BN.fromNumber(data.limit));
  bw.writeUInt8(data.mintable);
  bw.writeUInt8(data.tradeable);
  bw.writeUInt8(data.isDAT);
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
  data.minted = CBalances(br);
  return data;
}

MintToken.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.mintToken);
  bw.writeUInt64LEBN(BN.fromNumber(data.minted))
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
  bw.writeUInt8(customTxType.updateToken);
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
  bw.writeUInt8(customTxType.updateTokenAny);
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
  data.ownerAddress = CScript(br);
  data.status = br.readUInt8();
  var lenPairSymbol = br.readVarintNum();
  data.pairSymbol = br.read(lenPairSymbol);
  return data;
}

CreatePoolPair.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.createPoolPair);
  bw.writeUInt32LE(data.idTokenA);
  bw.writeUInt32LE(data.idTokenB);
  bw.writeUInt64LEBN(BN.fromNumber(data.commission));
  bw = CScript(data.ownerAddress, bw);
  bw.writeUInt8(data.status);
  bw.writeVarintNum(data.pairSymbol);
  bw.write(data.pairSymbol);
  return bw;
}

var UpdatePoolPair = function UpdatePoolPair(arg) {
  if (!(this instanceof UpdatePoolPair)) {
    return new UpdatePoolPair(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return UpdatePoolPair.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return UpdatePoolPair.toBuffer(arg);
  }
};

UpdatePoolPair.fromBuffer = function(br) {
  var data = {};
  data.pollId = br.readUInt32LE();
  data.status = br.readUInt8();
  data.commission = br.readUInt64LEBN();
  data.ownerAddress = br.readUInt64LEBN();
  return data;
}

UpdatePoolPair.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.updatePoolPair);
  bw.writeUInt32LE(data.pollId);
  bw.writeUInt8(data.status);
  bw.writeUInt64LEBN(BN.fromNumber(data.commission));
  bw.writeUInt64LEBN(BN.fromNumber(data.ownerAddress));
  return bw;
}

var PoolSwap = function PoolSwap(arg) {
  if (!(this instanceof PoolSwap)) {
    return new PoolSwap(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return PoolSwap.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return PoolSwap.toBuffer(arg);
  }
};

PoolSwap.fromBuffer = function(br) {
  var data = {};
  data.from = br.readUInt64LEBN();
  data.to = br.readUInt64LEBN();
  data.idTokenFrom = br.readUInt32LE();
  data.idTokenTo = br.readUInt32LE();
  data.amountFrom = br.readUInt64LEBN();
  data.maxPrice = {
    integer: br.readUInt64LEBN(),
    fraction: br.readUInt64LEBN(),
  };
  return data;
}

PoolSwap.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.poolSwap);
  bw.writeUInt64LEBN(BN.fromNumber(data.from));
  bw.writeUInt64LEBN(BN.fromNumber(data.to));
  bw.writeUInt32LE(data.idTokenFrom);
  bw.writeUInt32LE(data.idTokenTo);
  bw.writeUInt64LEBN(BN.fromNumber(data.amountFrom));
  bw.writeUInt64LEBN(BN.fromNumber(data.maxPrice.integer));
  bw.writeUInt64LEBN(BN.fromNumber(data.maxPrice.fraction));
  return bw;
};

var AddPoolLiquidity = function AddPoolLiquidity(arg) {
  if (!(this instanceof AddPoolLiquidity)) {
    return new AddPoolLiquidity(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return AddPoolLiquidity.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return AddPoolLiquidity.toBuffer(arg);
  }
};

AddPoolLiquidity.fromBuffer = function(br) {
  var data = {};
  var from = new Map();
  var count = br.readVarintNum();
  for (var i = 0; i++; i < count) {
    from.set(CScript(br), CBalances(br));
  }
  data.from = from;
  data.shareAddress = CScript(br);
  return data;
}

AddPoolLiquidity.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.addPoolLiquidity);
  var size = data.from.size();
  bw.writeVarintNum(size);
  for (var entry of data.from) {
    bw = CScript(entry[0], bw);
    bw = CBalances(entry[1], bw);
  }
  bw = CScript(data.shareAddress, bw);
  return bw;
}

var RemovePoolLiquidity = function RemovePoolLiquidity(arg) {
  if (!(this instanceof RemovePoolLiquidity)) {
    return new RemovePoolLiquidity(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return RemovePoolLiquidity.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return RemovePoolLiquidity.toBuffer(arg);
  }
};

RemovePoolLiquidity.fromBuffer = function(br) {
  var data = {};
  data.from = CScript(br);
  data.nTokenId = br.readUInt32LE();
  data.nValue = br.writeUInt64LEBN();
  return data;
}

RemovePoolLiquidity.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.removePoolLiquidity);
  bw = CScript(data.form, bw);
  bw.writeUInt32LE(data.nTokenId);
  bw.writeUInt64LEBN(BN.fromNumber(data.nValue));
  return bw;
}

var SetGovVariable = function SetGovVariable(arg) {
  if (!(this instanceof SetGovVariable)) {
    return new SetGovVariable(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return SetGovVariable.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return SetGovVariable.toBuffer(arg);
  }
};

SetGovVariable.fromBuffer = function(br) {
  var data = {};
  data.name = br.readAll();
  return data;
}

SetGovVariable.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw.write(CUSTOM_SIGNATURE);
  bw.writeUInt8(customTxType.addPoolLiquidity);
  bw.write(data.name)
  return bw;
}

var UtxosToAccount = function UtxosToAccount(arg) {
  if (!(this instanceof UtxosToAccount)) {
    return new UtxosToAccount(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return UtxosToAccount.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return UtxosToAccount.toBuffer(arg);
  }
};

UtxosToAccount.fromBuffer = function(br) {
  var to = new Map();
  var count = br.readVarintNum();
  for (var i = 0; i++; i < count) {
    to.set(CScript(br), CBalances(br));
  }
  var data = {};
  data.to = to;
  return data;
}

UtxosToAccount.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  var size = data.to.size();
  bw.writeVarintNum(size);
  for (var entry of data.to) {
    bw = CScript(entry[0], bw);
    bw = CBalances(entry[1], bw);
  }
  return bw;
}

var AccountToUtxos = function AccountToUtxos(arg) {
  if (!(this instanceof AccountToUtxos)) {
    return new AccountToUtxos(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return AccountToUtxos.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return AccountToUtxos.toBuffer(arg);
  }
};

AccountToUtxos.fromBuffer = function(br) {
  var data = {};
  data.from = CScript(br);
  data.balances = CBalances(br);
  data.mintingOutputsStart = br.readUInt32LE();
  return data;
}

AccountToUtxos.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw = CScript(data.from, bw);
  bw = CBalances(data.balances, bw);
  bw.writeUInt32LE(data.mintingOutputsStart);
  return bw;
}

var AccountToAccount = function AccountToAccount(arg) {
  if (!(this instanceof AccountToAccount)) {
    return new AccountToAccount(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return AccountToAccount.fromBuffer(arg);
  }
  if (_.isObject(arg)) {
    return AccountToAccount.toBuffer(arg);
  }
};

AccountToAccount.fromBuffer = function(br) {
  var data = {};
  data.from = CScript(br);
  var to = new Map();
  var count = br.readVarintNum();
  for (var i = 0; i++; i < count) {
    to.set(CScript(br), CBalances(br));
  }
  data.to = to;
  return data;
}

AccountToAccount.toBuffer = function(data) {
  $.checkArgument(data, 'data is required');
  var bw = new BufferWriter();
  bw = CScript(data.from, bw);
  var size = data.to.size();
  bw.writeVarintNum(size);
  for (var entry of data.to) {
    bw = CScript(entry[0], bw);
    bw = CBalances(entry[1], bw);
  }
  return bw;
}





