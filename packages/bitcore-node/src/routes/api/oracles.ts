import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';

router.get('/prices', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).listPrices({
            chain,
            network
        });
        return res.send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});
router.get('/prices/:id', async function (req, res) {
    let { chain, network, id } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("getprice", {
            chain,
            network,
            rpcParams: [{ currency: "USD", token: id }]
        });
        return res.send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/oracles', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).listOracles({
            chain,
            network
        });
        return res.send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/data/:oracleId', async function (req, res) {
    let { oracleId, chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).getOracleData({
            chain,
            network,
            oracleId
        });
        return res.send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});

module.exports = {
    router: router,
    path: '/oracles'
};
