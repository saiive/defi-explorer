import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';

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
    let { chain, network, start, including_start, limit } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).listPoolShares({
            chain,
            network,
            start,
            including_start,
            limit
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

module.exports = {
    router: router,
    path: '/lp'
};
