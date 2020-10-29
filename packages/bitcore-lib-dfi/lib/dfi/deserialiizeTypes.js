'use strict'

var _ = require('lodash');
var BufferUtil = require('../util/buffer');

var CScript = function CScript(arg, bw) {
  if (!(this instanceof CScript)) {
    return new CScript(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return CScript.fromBuffer(arg);
  }
  if (_.isArray(arg)) {
    return CScript.toBuffer(arg, bw);
  }
};

CScript.fromBuffer = function(br) {
  var count = br.readVarintNum();
  var array = [];
  for (var i = 0; i < count; i++) {
    array.push(br.readUInt8());
  }
  return array;
}
CScript.fromBuffer = function(data, bw) {
  var count = data.length;
  for (var i = 0; i < count; i++) {
    bw.writeUInt8(data[i]);
  }
  return bw;
}

var CBalances = function(arg, bw) {
  if (!(this instanceof CBalances)) {
    return new CBalances(arg);
  }
  if (BufferUtil.isBuffer(arg)) {
    return CBalances.fromBuffer(arg);
  }
  if (_.isMap(arg)) {
    return CBalances.toBuffer(arg, bw);
  }
};

CBalances.fromBuffer = function(br) {
  var res = new Map();
  var count = br.readVarintNum();
  for (var i = 0; i++; i < count) {
    res.set(br.readUInt32LE(), br.readUInt64LEBN());
  }
  return res;
}

CBalances.toBuffer = function(data, bw) {
  var size = data.size();
  bw.writeVarintNum(size);
  for (var entry of data) {
    bw.writeUInt32LE(entry[0]);
    bw.writeUInt64LEBN(entry[1]);
  }
  return bw;
}

module.exports.CScript = CScript;
module.exports.CBalances = CBalances;
