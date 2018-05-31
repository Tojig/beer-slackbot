import { Callback, Context, Handler } from 'aws-lambda';
import { LoggerFactory } from '../../logger/logger.factory';
import { SlashCommand } from '../model/slash-command.model';
import { ScoreService } from '../../beer/score.service';
import { ScoreCalculator } from '../../beer/score-calculator';
import { ScoreRepository } from '../../aws/repository/score.repository';
import { AnswerService } from '../../beer/answer.service';
import { ChallengeVerifier } from '../challenge-verifier';
import { tap } from 'rxjs/internal/operators';

const logger = LoggerFactory.getLogger('SlashCommandHandler');

const onSlashCommand: Handler = (request: any, context: Context, callback: Callback): void => {

    const slashCommand: SlashCommand = request.body;
    logger.debug(`Command received: ${JSON.stringify(slashCommand)}`);

    new ChallengeVerifier().verifyToken(slashCommand.token, context);

    new ScoreService(new ScoreRepository(), new ScoreCalculator(), new AnswerService())
      .getLeaderboard(slashCommand.team_id)
      .pipe(
        tap(response => callback(null, response),
            err => callback(err)),
      )
      .subscribe();
};

export { onSlashCommand };
