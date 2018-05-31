import { SlackEvent } from '../slack/model/slack-event.model';
import { Message } from '../slack/model/message.model';
import { ScoreService } from '../beer/score.service';
import { Observable, combineLatest, EMPTY, of } from 'rxjs/index';
import { catchError, filter, map, switchMap, tap } from 'rxjs/internal/operators';
import { SlackApiService } from '../slack/slack-api.service';
import { LoggerFactory } from '../logger/logger.factory';
import { TeamService } from './team.service';
import { DailyLimitExceededError } from '../beer/errors/daily-limit-exceeded.error';

export class SlackEventHandler {

    private readonly logger = LoggerFactory.getLogger('SlackEventHandler');
    private readonly EMOTICON_REGEX = /<@(\w+)>+(?=.*:beer:)/g;

    constructor(private scoreService: ScoreService,
                private teamService: TeamService,
                private slackApiService: SlackApiService) {
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
              catchError(error => error.name === DailyLimitExceededError.NAME ? of('La limite de bières a été atteinte aujourdhui') : EMPTY),
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
