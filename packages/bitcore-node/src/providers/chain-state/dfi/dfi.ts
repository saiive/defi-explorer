import { InternalStateProvider } from "../internal/internal";
import { CSP } from '../../../types/namespaces/ChainStateProvider';
import { TransactionStorage } from '../../../models/transaction';
import { TransactionJSON } from '../../../types/Transaction';

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
      if (found.blockHeight) {
        isCustomTxApplied = (await this.getRPC(chain, network).getCustomTxApplied(txId, found.blockHeight)) as boolean;
      }
      const convertedTx = TransactionStorage._apiTransform(found, { object: true }) as TransactionJSON;
      return { ...convertedTx, confirmations: confirmations, isCustomTxApplied };

    } else {
      return undefined;
    }
  }

}
