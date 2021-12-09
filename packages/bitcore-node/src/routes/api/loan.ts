import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';
import logger from "../../logger";

router.get('/schemes', async function (req, res) {
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

router.get('/collaterals', async function (req, res) {
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

router.get('/tokens', async function (req, res) {
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

router.get('/vaults', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).genericRcp("listvaults", {
            chain,
            network,
            rpcParams: [{ verbose: true }]
        });

        return res.send(result || {});
    } catch (err) {
        return res.status(500).send(err);
    }
});


router.get('/schemes/:id', async function (req, res) {
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

router.get('/collaterals/:id', async function (req, res) {
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

router.get('/tokens/:id', async function (req, res) {
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


router.get('/vaults/:id', async function (req, res) {
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


router.get('/auctions', async function (req, res) {
    let { chain, network } = req.params;
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
