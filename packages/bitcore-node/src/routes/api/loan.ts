import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';
import logger from "../../logger";

router.get('/scheme', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("listloanschemes", {
            chain,
            network,
            rpcParams: []
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/collateral', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("listcollateraltokens", {
            chain,
            network,
            rpcParams: []
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/token', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("listloantokens", {
            chain,
            network,
            rpcParams: []
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/vault', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("listvaults", {
            chain,
            network,
            rpcParams: []
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});


router.get('/scheme/:id', async function (req, res) {
    let { chain, network, id } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("getloanscheme", {
            chain,
            network,
            rpcParams: [id]
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/collateral/:id', async function (req, res) {
    let { chain, network, id } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("getcollateraltoken", {
            chain,
            network,
            rpcParams: [id]
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/token/:id', async function (req, res) {
    let { chain, network, id } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("getloantoken", {
            chain,
            network,
            rpcParams: [id]
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});


router.get('/vault/:id', async function (req, res) {
    let { chain, network, id } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("getvault", {
            chain,
            network,
            rpcParams: [id]
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});


router.get('/auction', async function (req, res) {
    let { chain, network} = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("listauctions", {
            chain,
            network,
            rpcParams: []
        });
        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});


module.exports = {
    router: router,
    path: '/loans'
};
