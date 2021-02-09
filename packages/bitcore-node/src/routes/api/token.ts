import express = require('express');
const router = express.Router({ mergeParams: true });
import { ChainStateProvider } from '../../providers/chain-state';
import { DFIStateProvider } from '../../providers/chain-state/dfi/dfi';

router.get('/list', async function (req, res) {
    let { chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).listTokens({
            chain,
            network
        });
        return res.send(result);
    } catch (err) {
        return res.status(500).send(err);
    }
});
router.get('/get/:token', async function (req, res) {
    let { token, chain, network } = req.params;
    try {
        const chainProvider = ChainStateProvider.get({ chain });
        let result = await (<DFIStateProvider>chainProvider).getToken({
            chain,
            network,
            token
        });
        var keyElement = Object.keys(result)[0];
        var tokenResult = result[keyElement];
        tokenResult["id"] = keyElement;
        return res.send(tokenResult);
    } catch (err) {
        return res.status(500).send(err);
    }
});

module.exports = {
    router: router,
    path: '/token'
};
