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
  minted: Array<any>;
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

export type DefichainTransactionCreatePoolPair = {
  idTokenA: string;
  idTokenB: string;
  commission: number;
  ownerAddress: string;
  status: string;
  pairSymbol: string;
}

export type DefichainTransactionUpdatePoolPair = {
  pollId: string;
  status: string;
  commission: number;
  ownerAddress: string;
}

export type DefichainTransactionPoolSwap = {
  from: string;
  to: string;
  idTokenFrom: string;
  idTokenTo: string;
  amountFrom: number;
  maxPrice: {
    integer: number;
    fraction: number;
  }
}

export type DefichainTransactionAddPoolLiquidity = {
  from: {
    [key: string]: Array<any>
  };
  shareAddress: string;
}

export type DefichainTransactionRemovePoolLiquidity = {
  from: string;
  shareAddress: string;
  nValue: number;
}

export type DefichainTransactionSetGovVariable = {
  name: string;
}

export type DefichainTransactionUtxosToAccount = {
  to: {
    [key: string]: Array<any>
  };
}

export type DefichainTransactionAccountToUtxos = {
  from: string;
  balances: Array<any>;
  mintingOutputsStart: string;
}

export type DefichainTransactionAccountToAccount = {
  from: string;
  to:{
    [key: string]: Array<any>
  };
}

export type DefichainTransactionAnyAccountsToAccounts = {
  from: Array<{
    [key: string]: Array<any>
  }>
  to: Array<{
    [key: string]: Array<any>
  }>
}


export type DefichainTransactionCustomType =  'C' | 'R' | 'T' | 'M' | 'N' | 'n' | 'p' | 'u' | 's' | 'l' | 'r' | 'U' | 'b' | 'B' | 'G' | 'a';
export type DefichainTransactionCustomData = DefichainTransactionCreateMasternode |
  DefichainTransactionResignMasternode |
  DefichainTransactionCreateToken |
  DefichainTransactionMintToken |
  DefichainTransactionUpdateToken |
  DefichainTransactionUpdateTokenAny |
  DefichainTransactionCreatePoolPair |
  DefichainTransactionUpdatePoolPair |
  DefichainTransactionPoolSwap |
  DefichainTransactionAddPoolLiquidity |
  DefichainTransactionRemovePoolLiquidity |
  DefichainTransactionSetGovVariable |
  DefichainTransactionUtxosToAccount |
  DefichainTransactionAccountToUtxos |
  DefichainTransactionAccountToAccount |
  DefichainTransactionAnyAccountsToAccounts;

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
  checkCustom: () => { isCustom: boolean, br?: Buffer },
  getCustom: () => DefichainTransactionCustom | null,
  nLockTime: number;
};
