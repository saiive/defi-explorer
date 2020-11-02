import { DefichainTransactionCustomData, DefichainTransactionCustomType } from './namespaces/Defichain/Transaction';

export type TransactionJSON = {
  _id: string;
  txid: string;
  chain: string;
  network: string;
  blockHeight: number;
  blockHash: string;
  blockTime: string;
  blockTimeNormalized: string;
  coinbase: boolean;
  fee: number;
  size: number;
  locktime: number;
  inputCount: number;
  outputCount: number;
  value: number;
  isCustom: boolean;
  customData: DefichainTransactionCustomData | null;
  txType: DefichainTransactionCustomType | null;
};
