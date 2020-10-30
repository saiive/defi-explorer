export type DefichainAddress = {
  toString: (stripCash: boolean) => string;
};
export type DefichainScript = {
  toBuffer: () => Buffer;
  toHex: () => string;
  classify: () => string;
  chunks: Array<{ buf: Buffer }>;
  toAddress: (network: string) => DefichainAddress;
};
export type DefichainInputObj = {
  prevTxId: string;
  outputIndex: number;
};
export type DefichainInput = {
  toObject: () => DefichainInputObj;
};
export type DefichainOutput = {
  script: DefichainScript;
  satoshis: number;
};
export type DefichainTransactionAnchor = {
  btcTxHash: string,
  anchorBlockHeight: number,
  prevAnchorBlockHeight: number,
}

export type DefichainTransactionCreateMasternode = {
  operatorType: number,
  operatorAuthAddress: string,
}

export type DefichainTransactionResignMasternode = {
  nodeId: string;
}

export type DefichainTransactionCreateToken = {
  symbol: string;
  name: string;
  decimal: number;
  limit: number;
  flags: number;
}

export type DefichainTransactionMintToken = {
  minted: Map<any, any>;
}

export type DefichainTransactionUpdateToken = {
  tokenTx: string;
  isDAT: number;
}

export type DefichainTransactionUpdateTokenAny = {
  tokenTx: string;
  newToken: {
    symbol: string;
    name: string;
    decimal: number;
    limit: number;
    mintable: number;
    tradeable: number;
    isDAT: number;
  };
}

export type DefichainTransactionCustomType =  'C' | 'R' | 'T' | 'M' | 'N' | 'n' | 'p' | 'u' | 's' | 'l' | 'r' | 'U' | 'b' | 'B' | 'G';
export type DefichainTransactionCustomData = DefichainTransactionCreateMasternode |
  DefichainTransactionResignMasternode |
  DefichainTransactionCreateToken |
  DefichainTransactionMintToken |
  DefichainTransactionUpdateToken |
  DefichainTransactionUpdateTokenAny;

export type DefichainTransactionCustom = {
  txType: DefichainTransactionCustomType,
  data: DefichainTransactionCustomData,
}

export type DefichainTransactionType = {
  outputAmount: number;
  hash: string;
  _hash: undefined | string;
  isCoinbase: () => boolean;
  isAnchor: () => boolean;
  outputs: DefichainOutput[];
  inputs: DefichainInput[];
  toBuffer: () => Buffer;
  getAnchor: () => DefichainTransactionAnchor | null,
  isCustom: () => boolean;
  getCustom: () => DefichainTransactionCustom | null,
  nLockTime: number;
};
