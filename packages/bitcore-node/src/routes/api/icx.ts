import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';
import logger from "../../logger";

router.get('/orders/:token/:chainId/:orderTx/:limit/:closed', async function (req, res) {
    let { chain, network, token, chainId, orderTx, limit, closed } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).icxListOrders({
            chain,
            network,
            token,
            chainId,
            orderTx,
            limit,
            closed
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
}); 

router.get('/orders', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).icxListOrders({
            chain,
            network
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/order/:orderTx', async function (req, res) {
    let { chain, network, orderTx } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).icxGetOrder({
            chain,
            network,
            orderTx: orderTx
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/htlc/:offerTx', async function (req, res) {
    let { chain, network, offerTx } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).icxListHtlcs({
            chain,
            network,
            offerTx
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

module.exports = {
    router: router,
    path: '/icx'
};
