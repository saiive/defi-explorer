import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ChainStateProvider } from '../../providers/chain-state';
import { IBlock } from '../../types/Block';
import { SetCache, CacheTimes } from '../middleware';
const router = require('express').Router({ mergeParams: true });

router.get('/', async function (req: Request<ParamsDictionary, any, any, any>, res: Response) {
  let { chain, network } = req.params;
  const { sinceBlock, date, limit = 50, since, direction, paging, anchorsOnly } = req.query;
  let limitNum = 0;
  if (limit) {
    limitNum = parseInt(limit as string);
  }
  try {
    let payload = {
      chain,
      network,
      sinceBlock,
      anchorsOnly: anchorsOnly === 'true',
      args: { date, limit: limitNum, since, direction, paging },
      req,
      res,
    };
    return ChainStateProvider.streamBlocks(payload);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/total-anchored-blocks', async function (req: Request, res: Response) {
  let { chain, network } = req.params;
  try {
    let result = await ChainStateProvider.getTotalAnchoredBlocks({ chain, network });
    return res.json(result);
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

module.exports = {
  router: router,
  path: '/block',
};
