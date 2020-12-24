import { InternalStateProvider } from "../internal/internal";
import { CSP } from '../../../types/namespaces/ChainStateProvider';
import { TransactionStorage } from '../../../models/transaction';
import { TransactionJSON } from '../../../types/Transaction';
import {
  DefichainTransactionMintToken,
  DefichainTransactionAddPoolLiquidity,
  DefichainTransactionUtxosToAccount,
  DefichainTransactionAccountToUtxos,
  DefichainTransactionAccountToAccount,
} from '../../../types/namespaces/Defichain/Transaction';

export class DFIStateProvider extends InternalStateProvider{
  constructor(chain: string = 'DFI') {
    super(chain);
  }

  async getTransaction(params: CSP.StreamTransactionParams) {
    let { chain, network, txId } = params;
    if (typeof txId !== 'string' || !chain || !network) {
      throw 'Missing required param';
    }
    network = network.toLowerCase();
    const query = { chain, network, txid: txId };
    const tip = await this.getLocalTip(params);
    const tipHeight = tip ? tip.height : 0;
    const found = await TransactionStorage.collection.findOne(query);
    let isCustomTxApplied = false;
    if (found) {
      let confirmations = 0;
      if (found.blockHeight && found.blockHeight >= 0) {
        confirmations = tipHeight - found.blockHeight + 1;
      }
      if (found.blockHeight && found.isCustom && found.customData) {
        isCustomTxApplied = (await this.getRPC(chain, network).getCustomTxApplied(txId, found.blockHeight)) as boolean;
        switch (found.txType) {
          case 'M': {
            const tokensPromises = (found.customData as DefichainTransactionMintToken).minted.map((mint) => {
              return this.getRPC(chain, network).getToken(mint.token);
            });
            const tokens = await Promise.all(tokensPromises);
            (found.customData as DefichainTransactionMintToken).minted = (found.customData as DefichainTransactionMintToken).minted.map((mint, index) => {
              return `${mint.balance}@${tokens[index][mint.token].symbol}`;
            });
            break;
          }
          case 'l': {
            for (const key in (found.customData as DefichainTransactionAddPoolLiquidity).from) {
              const tokensPromises = (found.customData as DefichainTransactionAddPoolLiquidity).from[key].map((from) => {
                return this.getRPC(chain, network).getToken(from.token);
              });
              const tokens = await Promise.all(tokensPromises);
              (found.customData as DefichainTransactionAddPoolLiquidity).from[key] = (found.customData as DefichainTransactionAddPoolLiquidity).from[key].map((from, index) => {
                return `${from.balance}@${tokens[index][from.token].symbol}`;
              });
            }
            break;
          }
          case 'U': {
            for (const key in (found.customData as DefichainTransactionUtxosToAccount).to) {
              const tokensPromises = (found.customData as DefichainTransactionUtxosToAccount).to[key].map((to) => {
                return this.getRPC(chain, network).getToken(to.token);
              });
              const tokens = await Promise.all(tokensPromises);
              (found.customData as DefichainTransactionUtxosToAccount).to[key] = (found.customData as DefichainTransactionUtxosToAccount).to[key].map((to, index) => {
                return `${to.balance}@${tokens[index][to.token].symbol}`;
              });
            }
            break;
          }
          case 'b': {
            const tokensPromises =  (found.customData as DefichainTransactionAccountToUtxos).balances.map((balance) => {
              return this.getRPC(chain, network).getToken(balance.token);
            });
            const tokens = await Promise.all(tokensPromises);
            (found.customData as DefichainTransactionAccountToUtxos).balances = (found.customData as DefichainTransactionAccountToUtxos).balances.map((balance, index) => {
              return `${balance.balance}@${tokens[index][balance.token].symbol}`;
            });
            break;
          }
          case 'B': {
            for (const key in (found.customData as DefichainTransactionAccountToAccount).to) {
              const tokensPromises = (found.customData as DefichainTransactionAccountToAccount).to[key].map((to) => {
                return this.getRPC(chain, network).getToken(to.token);
              });
              const tokens = await Promise.all(tokensPromises);
              (found.customData as DefichainTransactionAccountToAccount).to[key] = (found.customData as DefichainTransactionAccountToAccount).to[key].map((to, index) => {
                return `${to.balance}@${tokens[index][to.token].symbol}`;
              });
            }
            break;
          }
        }
      }
      const convertedTx = TransactionStorage._apiTransform(found, { object: true }) as TransactionJSON;
      return { ...convertedTx, confirmations: confirmations, isCustomTxApplied };

    } else {
      return undefined;
    }
  }

}
