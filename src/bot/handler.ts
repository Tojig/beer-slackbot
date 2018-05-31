import { Callback, Context, Handler } from 'aws-lambda';
import { SlackEventHandler } from './slack-event-handler';
import { catchError, tap } from 'rxjs/internal/operators';
import { ScoreService } from '../beer/score.service';
import { SlackApiService } from '../slack/slack-api.service';
import { ScoreCalculator } from '../beer/score-calculator';
import { ScoreRepository } from '../aws/repository/score.repository';
import { LoggerFactory } from '../logger/logger.factory';
import { ChallengeVerifier } from '../slack/challenge-verifier';
import { TeamService } from './team.service';
import { TeamRepository } from '../aws/repository/team.repository';
import { of } from 'rxjs/index';
import { AnswerService } from '../beer/answer.service';

const logger = LoggerFactory.getLogger('eventApiHandler');

const eventApiHandler: Handler = (request: any, context: Context, callback: Callback) => {

    logger.debug(request.body);

    new ChallengeVerifier().verifyToken(request.body.token, context);
    if (request.body.challenge != null) {
        return context.succeed(request.body.challenge);
    }

    new SlackEventHandler(
      new ScoreService(new ScoreRepository(), new ScoreCalculator(), new AnswerService()),
      new TeamService(new TeamRepository()),
      new SlackApiService(),
    )
      .onSlackEvent(request.body)
      .pipe(
        catchError(error => of(JSON.stringify(error, null, 4))),
        tap(err => logger.error(err)),
        tap(() => callback(null, {})),
      )
      .subscribe();
};

export { eventApiHandler };
