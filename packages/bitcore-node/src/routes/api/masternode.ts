import { Request, Router } from 'express';
import { ChainNetwork } from '../../types/ChainNetwork';
import { IWallet } from '../../models/wallet';
import { ChainStateProvider } from '../../providers/chain-state';
import { MongoBound } from '../../models/base';
import { CacheMiddleware, CacheTimes } from '../middleware';
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


router.get('/list/:start/:includingStart/:limit', CacheMiddleware(CacheTimes.Hour), async (req: AuthenticatedRequest, res) => {
  try {
    let { chain, network, start, includingStart, limit } = req.params;
    let limitNum, including_startBool;

    if (limit) {
      limitNum = parseInt(limit as string);
    }

    if (includingStart !== undefined) {
      including_startBool = includingStart.toString().toLowerCase() === 'true';
    }

    let payload = {
      chain,
      network,
      start: start,
      includingStart: including_startBool,
      limit: limitNum
    };
    var result = await ChainStateProvider.listmasternodes(payload);
    return res.send(result || {});
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/list', CacheMiddleware(CacheTimes.Hour), async (req: AuthenticatedRequest, res) => {
  try {
    let { chain, network, } = req.params;
    let payload = {
      chain,
      network
    };
    var result = await ChainStateProvider.listallmasternodes(payload);

    return res.send(result || {});
  } catch (err) {
    return res.status(500).send(err);
  }
});


module.exports = {
  router: router,
  path: '/masternodes'
};
