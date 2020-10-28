import { Request, Response } from 'express';
import { ChainStateProvider } from '../../providers/chain-state';
import { IBlock } from '../../types/Block';
import { SetCache, CacheTimes } from '../middleware';
const router = require('express').Router({ mergeParams: true });

router.get('/', async function (req: Request, res: Response) {
  let { chain, network } = req.params;
  let { sinceBlock, date, limit, since, direction, paging, anchorsOnly } = req.query;
  if (limit) {
    limit = parseInt(limit);
  }
  try {
    let payload = {
      chain,
      network,
      sinceBlock,
      anchorsOnly: anchorsOnly === 'true',
      args: { date, limit, since, direction, paging },
      req,
      res,
    };
    return ChainStateProvider.streamBlocks(payload);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/tip', async function (req: Request, res: Response) {
  let { chain, network } = req.params;
  try {
    let tip = await ChainStateProvider.getBlock({ chain, network });
    return res.json(tip);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:blockId', async function (req: Request, res: Response) {
  let { blockId, chain, network } = req.params;
  try {
    let block = await ChainStateProvider.getBlock({ chain, network, blockId });
    if (!block) {
      return res.status(404).send('Block not found');
    }
    const tip = await ChainStateProvider.getLocalTip({ chain, network });
    if (block && tip.height - (<IBlock>block).height > 100) {
      SetCache(res, CacheTimes.Month);
    }
    return res.json(block);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/:blockHash/transactions', async function (req: Request, res: Response) {
  let { blockHash, chain, network } = req.params;
  let { skip = 0, limit = 0 } = req.query;
  try {
    const data = await ChainStateProvider.streamBlockTransactionsList({
      chain,
      network,
      args: {
        skip,
        limit,
        blockHash,
      },
    });
    res.json(data);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = {
  router: router,
  path: '/block',
};
