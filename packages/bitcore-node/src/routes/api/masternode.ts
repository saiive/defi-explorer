import { Request, Response, Router } from 'express';
import { ChainNetwork } from '../../types/ChainNetwork';
import { IWallet } from '../../models/wallet';
import { ChainStateProvider } from '../../providers/chain-state';
import { MongoBound } from '../../models/base';
const router = Router({ mergeParams: true });
const secp256k1 = require('secp256k1');
const bitcoreLib = require('bitcore-lib');

type VerificationPayload = {
  message: string;
  pubKey: string;
  signature: string | string[] | undefined;
};
type SignedApiRequest = ChainNetwork & VerificationPayload;

type PreAuthRequest<Q = any> = {
  params: SignedApiRequest;
  query: Q;
} & Request;

type AuthenticatedRequest<Q = any> = {
  wallet?: MongoBound<IWallet>;
} & PreAuthRequest<Q>;


router.get('/listmasternodes', async (req: AuthenticatedRequest, res) => {
  try {
    let { chain, network, start, includingStart, limit } = req.params;
    let payload = {
      chain,
      network,
      start, 
      includingStart, 
      limit
    };
    return ChainStateProvider.listmasternodes(payload);
  } catch (err) {
    return res.status(500).send(err);
  }
});


module.exports = {
  router: router,
  path: '/masternodes'
};
