import { ChainStateProvider } from './providers/chain-state';
import * as _ from 'lodash';
import logger from './logger';
import { HEATHCHECK_TIME } from './constants/config';

class HealthCheck {
  public criticalCount: number = 0; //0 shows healthy status of BE
  private previous = 0;
  private isAlreadyRunning = false; // to make sure only single instance of this is running

  private cronJob = async ({ chain, network }) => {
    try {
      if (!this.isAlreadyRunning) this.isAlreadyRunning = true;
      const latestBlock = await ChainStateProvider.getBlock({
        chain,
        network: network.toLowerCase(),
        args: {
          limit: 1,
        },
      });

      if (latestBlock && this.previous < latestBlock.height) {
        this.criticalCount = 0;
        this.previous = latestBlock.height;
      } else {
        this.criticalCount += 1;
      }
    } catch (err) {
      this.criticalCount += 1;
      logger.info(err);
    } finally {
      setTimeout(async () => {
        await this.cronJob({ chain, network });
      }, HEATHCHECK_TIME);
    }
  };

  public startJob = (chain, network) => {
    if (!(process.env.DISABLE_HEALTH_CRON === 'true')) {
      if (!this.isAlreadyRunning) {
        this.cronJob({ chain, network });
      }
    }
  };
}
const HealthCheckObj = new HealthCheck();

export default HealthCheckObj;
