import { Callback, Context, Handler } from 'aws-lambda';
import { LoggerFactory } from '../logger/logger.factory';
import { SlashCommand } from '../model/slack/slash-command.model';
import { tap } from 'rxjs/internal/operators';
import { appContainer } from '../config/inversify';
import { ChallengeVerifier } from '../service/challenge-verifier.interface';
import { SERVICE_TYPES } from '../service/di/service.types';
import { ScoreService } from '../service/score-service.interface';

const logger = LoggerFactory.getLogger('SlashCommandHandler');

const onSlashCommand: Handler = (request: any, context: Context, callback: Callback): void => {

    const slashCommand: SlashCommand = request.body;
    logger.debug(`Command received: ${JSON.stringify(slashCommand)}`);

    const challengeVerifier = appContainer.get<ChallengeVerifier>(SERVICE_TYPES.ChallengeVerifier);
    challengeVerifier.verifyToken(slashCommand.token, context);

    const scoreService = appContainer.get<ScoreService>(SERVICE_TYPES.ScoreService);
    scoreService
      .getLeaderboard(slashCommand.team_id)
      .pipe(
        tap(response => callback(null, response),
            err => callback(err)),
      )
      .subscribe();
};

export { onSlashCommand };
