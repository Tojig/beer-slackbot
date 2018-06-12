import 'reflect-metadata';
import { SlackEvent } from '../../model/slack/slack-event.model';
import { Message } from '../../model/slack/message.model';
import { combineLatest, EMPTY, Observable, of } from 'rxjs/index';
import { catchError, filter, map, switchMap, tap } from 'rxjs/internal/operators';
import { LoggerFactory } from '../../logger/logger.factory';
import { DailyLimitExceededError } from '../../service/errors/daily-limit-exceeded.error';
import { SelfScoreError } from '../../service/errors/self-score.error';
import { ScoreService } from '../../service/score-service.interface';
import { TeamService } from '../../service/team-service.interface';
import { SlackApiService } from '../../service/slack-api-service.interface';
import { inject, injectable } from 'inversify';
import { SlackEventHandler } from '../slack-event-handler.interface';
import { SERVICE_TYPES } from '../../service/di/service.types';

@injectable()
export class SlackEventHandlerImpl implements SlackEventHandler {

    private readonly logger = LoggerFactory.getLogger('SlackEventHandler');
    private readonly EMOTICON_REGEX = /<@(\w+)>+(?=.*:beer:)/g;

    constructor(@inject(SERVICE_TYPES.ScoreService) private scoreService: ScoreService,
                @inject(SERVICE_TYPES.TeamService) private teamService: TeamService,
                @inject(SERVICE_TYPES.SlackApiService) private slackApiService: SlackApiService) {
    }

    getReceiverIds(messageText: string): string[] {
        const match = messageText.match(this.EMOTICON_REGEX) || [];
        const receiversIds = match.map(userCode => userCode.substring(2, userCode.length - 1));
        return receiversIds;
    }

    getScoreIntentionResult(teamId: string, giver: string, receiversIds: string[]): Observable<string> {
        return this.scoreService.onScoreIntention(teamId, giver, receiversIds)
          .pipe(
            tap(scores => this.logger.debug(`Scores updated: ${JSON.stringify(scores)}`)),
            // TODO return string with response and remaining beers
            map(scores => 'La bière a été donnée'),
            catchError((error) => {
                switch (error.name) {
                    case DailyLimitExceededError.NAME:
                        return of('La limite de bières a été atteinte aujourdhui.');
                    case SelfScoreError.NAME:
                        return of('On ne peut pas donner de bière à soi même.');
                    default:
                        return EMPTY;
                }
            }),
          );
    }

    onSlackEvent(event: SlackEvent<Message>): Observable<any> {

        this.logger.debug(`onSlackEvent. event: ${JSON.stringify(event)}`);

        const message = event.event;

        if (!this.EMOTICON_REGEX.test(message.text)) {
            return EMPTY;
        }

        const receiversIds = this.getReceiverIds(message.text);

        return combineLatest(
          this.teamService.findTeamById(event.team_id),
          this.getScoreIntentionResult(event.team_id, message.user, receiversIds),
        ).pipe(
          filter(([, scoringResultMessage]) => scoringResultMessage != null),
          switchMap(([team, scoringResultMessage]) => this.slackApiService.sendEphemeralMessage(
            message.channel, scoringResultMessage, message.user, team.bot.bot_access_token),
          ),
        );
    }
}
