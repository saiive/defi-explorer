import logger from '../logger';
import * as express from 'express';
import { RateLimitStorage } from '../models/rateLimit';
import { Config } from '../services/config';

type TimedRequest = {
  startTime?: Date;
} & express.Request;

function LogObj(logOut: { [key: string]: string }) {
  logger.verbose(
    `${logOut.time} | ${logOut.ip} | ${logOut.phase} | ${logOut.took} | ${logOut.method} | ${logOut.status} | ${
      logOut.url
    }`
  );
}

export function LogMiddleware() {
  return (req: TimedRequest, res: express.Response, next: express.NextFunction) => {
    req.startTime = new Date();
    const ip = req.header('CF-Connecting-IP') || req.socket.remoteAddress || req.hostname;
    const logOut = {
      time: req.startTime.toTimeString(),
      ip: ip.padStart(22, ' '),
      phase: 'START'.padStart(8, ' '),
      method: req.method.padStart(6, ' '),
      status: '...'.padStart(5, ' '),
      url: `${req.baseUrl}${req.url}`,
      took: '...'.padStart(10, ' ')
    };
    LogObj(logOut);

    const LogPhase = (phase: string) => () => {
      const endTime = new Date();
      const startTime = req.startTime ? req.startTime : endTime;
      const totalTime = endTime.getTime() - startTime.getTime();
      const totalTimeMsg = `${totalTime} ms`.padStart(10, ' ');
      logOut.phase = phase.padStart(8, ' ');
      logOut.took = totalTimeMsg.padStart(10, ' ');
      logOut.status = res.statusCode.toString().padStart(5, ' ');
      LogObj(logOut);
    };

    res.on('finish', LogPhase('END'));
    res.on('close', LogPhase('CLOSED'));
    next();
  };
}

export enum CacheTimes {
  None = 0,
  Second = 1,
  Minute = 60,
  Hour = CacheTimes.Minute * 60,
  Day = CacheTimes.Hour * 24,
  Month = CacheTimes.Day * 30,
  Year = CacheTimes.Day * 365
}
export function SetCache(res: express.Response, serverSeconds: number, browserSeconds: number = 0) {
  res.setHeader('Cache-Control', `s-maxage=${serverSeconds}, max-age=${browserSeconds}`);
}

export function CacheMiddleware(serverSeconds = CacheTimes.Second, browserSeconds = CacheTimes.None) {
  return (_: express.Request, res: express.Response, next: express.NextFunction) => {
    SetCache(res, serverSeconds, browserSeconds);
    next();
  };
}

function isWhiteListed(whitelist: Array<string> = [], ip: string) {
  return whitelist.some(listItem => ip.startsWith(listItem));
}

export function RateLimiter(method: string, perSecond: number, perMinute: number, perHour: number) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // TODO Add rate limiter later
      return next(); // Bypassing ratelimiter
      const identifier = req.header('CF-Connecting-IP') || req.socket.remoteAddress || '';
      const rateLimiter = Config.for('api').rateLimiter;
      const whitelist = rateLimiter!.whitelist;
      const isDisabled = rateLimiter!.disabled;
      if ( isDisabled || isWhiteListed(whitelist, identifier)) {
        return next();
      }
      let [perSecondResult, perMinuteResult, perHourResult] = await RateLimitStorage.incrementAndCheck(
        identifier,
        method
      );
      if (
        perSecondResult.value!.count > perSecond ||
        perMinuteResult.value!.count > perMinute ||
        perHourResult.value!.count > perHour
      ) {
        return res.status(429).send('Rate Limited');
      }
    } catch (err) {
      logger.error('Rate Limiter failed');
    }
    return next();
  };
}
