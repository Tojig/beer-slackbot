import { Callback, Context, Handler } from 'aws-lambda';
import { catchError, tap } from 'rxjs/internal/operators';
import { LoggerFactory } from '../logger/logger.factory';
import { of } from 'rxjs/index';
import { SERVICE_TYPES } from '../service/di/service.types';
import { appContainer } from '../config/inversify';
import { SlackEventHandler } from '../controller/slack-event-handler.interface';
import { ChallengeVerifier } from '../service/challenge-verifier.interface';
import { CONTROLLER_TYPES } from '../controller/di/controller.types';

const logger = LoggerFactory.getLogger('eventApiHandler');

const eventApiHandler: Handler = (request: any, context: Context, callback: Callback) => {

    logger.debug(request.body);

    const challengeVerifier = appContainer.get<ChallengeVerifier>(SERVICE_TYPES.ChallengeVerifier);
    challengeVerifier.verifyToken(request.body.token, context);
    if (request.body.challenge != null) {
        return context.succeed(request.body.challenge);
    }

    const slackEventHandler = appContainer.get<SlackEventHandler>(CONTROLLER_TYPES.SlackEventHandler);
    slackEventHandler.onSlackEvent(request.body)
      .pipe(
        catchError(error => of(JSON.stringify(error, null, 4))),
        tap(err => logger.error(err)),
        tap(() => callback(null, {})),
      )
      .subscribe();
};

export { eventApiHandler };
