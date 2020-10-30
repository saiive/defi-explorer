'use strict'

var _ = require('lodash');
var BufferUtil = require('../util/buffer');

var CScript = function CScript(arg, bw) {
  if (!(this instanceof CScript)) {
    return new CScript(arg);
  }
  if (BufferUtil.isBuffer(arg.buf)) {
    return CScript.fromBuffer(arg);
  }
  if (_.isArray(arg)) {
    return CScript.toBuffer(arg, bw);
  }
};

CScript.fromBuffer = function(br) {
  var count = br.readVarintNum();
  return br.read(count);
}
CScript.toBuffer = function(data, bw) {
  var count = data.length;
  bw.writeVarintNum(count);
  bw.write(data);
  return bw;
}

var CBalances = function(arg, bw) {
  if (!(this instanceof CBalances)) {
    return new CBalances(arg);
  }
  if (BufferUtil.isBuffer(arg.buf)) {
    return CBalances.fromBuffer(arg);
  }
  if (_.isMap(arg)) {
    return CBalances.toBuffer(arg, bw);
  }
};

CBalances.fromBuffer = function(br) {
  var res = new Map();
  var count = br.readVarintNum();
  for (var i = 0; i < count; i++) {
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
