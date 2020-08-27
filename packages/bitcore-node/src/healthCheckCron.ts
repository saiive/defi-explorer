import { ChainStateProvider } from './providers/chain-state';
import * as _ from 'lodash';
import logger from './logger';
import { HEATHCHECK_TIME } from './constants/config'


class HealthCheck {
  public isCritical = false
  private previous: any = {};
  private isAlreadyRunning = false; // to make sure only single instance of this is running

  private cronJob = async ({ chain, network }) => {
    try {
      if (!this.isAlreadyRunning) this.isAlreadyRunning = true;
      const latestBlock = await ChainStateProvider.getBlock({
        chain,
        network: network.toLowerCase(),
        args: {
          limit: 1
        }
      });

      if (!_.isEqual(this.previous, latestBlock)) {
        this.isCritical = false
        this.previous = latestBlock;
      } else {
        this.isCritical = true;
      }
    } catch (err) {
      this.isCritical = true;
      logger.info(err)
    } finally {
      setTimeout(async () => {
        await this.cronJob({ chain, network })
      }, HEATHCHECK_TIME);
    }
  }

  public startJob = (chain, network) => {
    if (!this.isAlreadyRunning) {
      this.cronJob({ chain, network })
    }
  }
}
const HealthCheckObj = new HealthCheck();

export default HealthCheckObj;