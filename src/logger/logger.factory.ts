import { Logger } from 'ts-log-debug';

export class LoggerFactory {

    static getLogger(name: string): Logger {
        const logger = new Logger(name);
        logger.appenders
          .set('console', {
              type: 'stdout',
              layout: { type: 'basic' },
              level: ['debug', 'info', 'trace'],
          });

        return logger;
    }
}
