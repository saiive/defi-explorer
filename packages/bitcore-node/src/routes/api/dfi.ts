import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';
import logger from "../../logger";

router.get('/gov', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).getGov({
            chain,
            network
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/listpoolpairs', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).listPoolPairs({
            chain,
            network
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/listpoolshares', async function (req, res) {
    let {chain, network} = req.params;
    let {start, including_start, limit} = req.query;
    let startNum, limitNum, including_startBool;

    try {
        if (limit) {
            limitNum = parseInt(limit as string);
        }

        if (start) {
            startNum = parseInt(start as string);
        }

        if (including_start !== undefined) {
            including_startBool = including_start.toString().toLowerCase() === 'true';
        }

        const chainProvider = ChainStateProvider.get({chain});
        let result = await (<DFIStateProvider>chainProvider).listPoolShares({
            chain,
            network,
            start: startNum,
            including_start: including_startBool,
            limit: limitNum
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/getpoolpair/:poolID', async function (req, res) {
    let { chain, network, poolID } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).getPoolPair({
            chain,
            network,
            poolID
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/listaccounthistory/:owner/:token', async function (req, res) {
    let { chain, network, owner, token } = req.params;
    let {maxBlockHeight, limit, no_rewards} = req.query;
    let maxBlockHeightNum, limitNum, noRewardsBool;

    try {
        if (limit) {
            limitNum = parseInt(limit as string);
        }

        if (maxBlockHeight) {
            maxBlockHeightNum = parseInt(maxBlockHeight as string);
        }

        if (no_rewards !== undefined) {
            noRewardsBool = no_rewards.toString().toLowerCase() === 'true';
        }

        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).listAccountHistory({
            chain,
            network,
            owner,
            token,
            limit: limitNum,
            maxBlockHeight: maxBlockHeightNum,
            noRewards: noRewardsBool
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post('/testpoolswap', async function (req, res) {
  try {
    let { chain, network } = req.params;
    let { from, tokenFrom, amountFrom, to, tokenTo, maxPrice } = req.body;

    chain = chain.toUpperCase();
    network = network.toLowerCase();
    const chainProvider = ChainStateProvider.get({ chain });
    let result = await (<DFIStateProvider>chainProvider).testPoolSwap({
        chain,
        network,
        from,
        tokenFrom,
        amountFrom,
        to,
        tokenTo,
        maxPrice
    });
    return res.send(result || {} );
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err.message);
  }
});

module.exports = {
    router: router,
    path: '/lp'
};
