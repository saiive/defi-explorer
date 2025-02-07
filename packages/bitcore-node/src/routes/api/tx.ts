import { SetCache } from '../middleware';
import { Router } from 'express';
import { CSP } from '../../types/namespaces/ChainStateProvider';
import { ChainStateProvider } from '../../providers/chain-state';
import logger from '../../logger';
import { TransactionJSON } from '../../types/Transaction';
import { CacheTimes } from '../middleware';
const router = Router({ mergeParams: true });

router.get('/', function(req, res) {
  let { chain, network } = req.params;
  let { blockHeight, blockHash, limit, since, direction, paging } = req.query;
  if (!chain || !network) {
    return res.status(400).send('Missing required param');
  }
  if (!blockHash && !blockHeight) {
    return res.status(400).send('Must provide blockHash or blockHeight');
  }
  chain = chain.toUpperCase();
  network = network.toLowerCase();
  let payload: CSP.StreamTransactionsParams = {
    chain,
    network,
    req,
    res,
    args: { limit, since, direction, paging }
  };

  if (blockHeight !== undefined) {
    payload.args.blockHeight = parseInt(blockHeight as string);
  }
  if (blockHash !== undefined) {
    payload.args.blockHash = blockHash;
  }
  return ChainStateProvider.streamTransactions(payload);
});

router.get('/latest', async (req, res) => {
  try {
    let { chain, network } = req.params;
    chain = chain.toUpperCase();
    network = network.toLowerCase();

    const latestTxs = await ChainStateProvider.getLatestTransactions({ chain, network });
    return res.send(latestTxs || []);
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err.message);
  }
});

router.get('/:txId', async (req, res) => {
  let { chain, network, txId } = req.params;
  if (typeof txId !== 'string' || !chain || !network) {
    return res.status(400).send('Missing required param');
  }
  chain = chain.toUpperCase();
  network = network.toLowerCase();
  try {
    const tx = await ChainStateProvider.getTransaction({ chain, network, txId });
    if (!tx) {
      return res
        .status(404)
        .send(
          `The requested txid ${txId} could not be found, it is most likely still being confirmed, please try again in a few minutes.`
        );
    } else {
      const tip = await ChainStateProvider.getLocalTip({ chain, network });
      if (tx && tip.height - (<TransactionJSON>tx).blockHeight > 100) {
        SetCache(res, CacheTimes.Month);
      }
      return res.send(tx);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:txId/authhead', async (req, res) => {
  let { chain, network, txId } = req.params;
  if (typeof txId !== 'string' || !chain || !network) {
    return res.status(400).send('Missing required param');
  }
  chain = chain.toUpperCase();
  network = network.toLowerCase();
  try {
    const authhead = await ChainStateProvider.getAuthhead({ chain, network, txId });
    if (!authhead) {
      return res.status(404).send(`Authhead for txid ${txId} could not be found.`);
    } else {
      return res.send(authhead);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:txid/coins', (req, res, next) => {
  let { chain, network, txid } = req.params;
  if (typeof txid !== 'string' || typeof chain !== 'string' || typeof network !== 'string') {
    res.status(400).send('Missing required param');
  } else {
    chain = chain.toUpperCase();
    network = network.toLowerCase();
    ChainStateProvider.getCoinsForTx({ chain, network, txid })
      .then(coins => {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify(coins));
      })
      .catch(next);
  }
});

router.get('/:txid/decoderaw', async (req, res) => {
  let { chain, network, txid } = req.params;
  if (typeof txid !== 'string' || typeof chain !== 'string' || typeof network !== 'string') {
    return res.status(400).send('Missing required param');
  } else {
    try {
      chain = chain.toUpperCase();
      network = network.toLowerCase();
      const tx = await ChainStateProvider.getDecodeRawTx({ chain, network, txId: txid });
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(tx));
    } catch (error) {
      return res.status(500).send(error);
    }
  }
});


router.post('/decode', async (req, res) => {
  try {
    let { chain, network } = req.params;
    const { rawTx } = req.body;
    chain = chain.toUpperCase();
    network = network.toLowerCase();
    const txid = await ChainStateProvider.getDecode({
      chain,
      network,
      rawTx
    });
    return res.send({ txid });
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err.message);
  }
});

router.post('/send', async (req, res) => {
  try {
    let { chain, network } = req.params;
    const { rawTx } = req.body;
    chain = chain.toUpperCase();
    network = network.toLowerCase();
    const txid = await ChainStateProvider.broadcastTransaction({
      chain,
      network,
      rawTx
    });
    return res.send({ txid });
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err.message);
  }
});

module.exports = {
  router: router,
  path: '/tx'
};
