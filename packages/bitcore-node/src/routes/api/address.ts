import express = require('express');
const router = express.Router({ mergeParams: true });
import { ParamsDictionary } from 'express-serve-static-core';
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';
import queue from '../../worker/queue';

router.get('/:address/txs', function (req: express.Request<ParamsDictionary, any, any, any>, res) {
  let { address, chain, network } = req.params;
  let { unspent, limit = 10 } = req.query;
  let payload = {
    chain,
    network,
    address,
    req,
    res,
    args: { unspent, limit }
  };
  ChainStateProvider.streamAddressTransactions(payload);
});

router.get('/:address', function (req: express.Request<ParamsDictionary, any, any, any>, res) {
  let { address, chain, network } = req.params;
  let { unspent, limit = 10 } = req.query;
  let payload = {
    chain,
    network,
    address,
    req,
    res,
    args: { unspent, limit }
  };
  ChainStateProvider.streamAddressUtxos(payload);
});

router.get('/:address/balance', async function (req, res) {
  let { address, chain, network } = req.params;
  try {
    let result = await ChainStateProvider.getBalanceForAddress({
      chain,
      network,
      address
    });
    return res.send(result || { confirmed: 0, unconfirmed: 0, balance: 0 });
  } catch (err) {
    return res.status(500).send(err);
  }
});


router.get('/:ownerAddress/account', async function (req, res) {
  let { ownerAddress, chain, network } = req.params;
  try {
    let result = await ChainStateProvider.getAccount({
      chain,
      network,
      ownerAddress
    });
    return res.send(result || { confirmed: 0, unconfirmed: 0, balance: 0 });
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:ownerAddress/vault', async function (req, res) {
  let { ownerAddress, chain, network } = req.params;
  try {
    const chainProvider = ChainStateProvider.get({ chain });
    let result = await (<DFIStateProvider>chainProvider).genericRcp("listvaults", {
      chain,
      network,
      rpcParams: [{ ownerAddress: ownerAddress }]
    });
    return res.send(result);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// @ts-ignore
router.get('/stats/rich-list', async function (req, res) {
  const { chain, network } = req.params;
  const { pageno, pagesize } = req.query;
  let pageNo = 0;
  let pageSize = 0;
  try {
    if (pageno) {
      pageNo = parseInt(pageno as string);
      pageSize = parseInt(pagesize as string);
    }

    queue.push(
      {
        methodName: ChainStateProvider.getRichList.bind(ChainStateProvider),
        params: [{ chain, network, pageNo, pageSize }]
      },
      (err, result) => {
        if (err) {
          throw new Error(err.message);
        }
        res.send(result || []);
      }
    );
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = {
  router: router,
  path: '/address'
};
