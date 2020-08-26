import { ChainStateProvider } from './providers/chain-state';
import * as _ from 'lodash';
import logger from './logger';

export let isCritical = false;
let previous;

export const cronJob = async ({ chain, network }) => {
  try {
    const latestBlock = await ChainStateProvider.getBlock({
      chain,
      network: network.toLowerCase(),
      args: {
        limit: 1
      }
    });
    if (!_.isEqual(previous, latestBlock)) {
      isCritical = false
    } else {
      isCritical = true;
    }
  } catch (err) {
    logger.info(err)
  } finally {
    setTimeout(async () => {
      await cronJob({ chain, network })
    }, 60 * 1000);
  }
}