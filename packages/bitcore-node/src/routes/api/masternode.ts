import { Request, Router } from 'express';
import { ChainNetwork } from '../../types/ChainNetwork';
import { IWallet } from '../../models/wallet';
import { ChainStateProvider } from '../../providers/chain-state';
import { MongoBound } from '../../models/base';
const router = Router({ mergeParams: true });

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


router.get('/list/:start/:includingStart/:limit', async (req: AuthenticatedRequest, res) => {
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

router.get('/list', async (req: AuthenticatedRequest, res) => {
  try {
    let { chain, network, } = req.params;
    let payload = {
      chain,
      network
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
