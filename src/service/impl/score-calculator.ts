import 'reflect-metadata';
import { Score } from '../../model/score.model';
import { LoggerFactory } from '../../logger/logger.factory';
import { ScoreEvent } from '../../model/score-event.model';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { DateTime } from 'luxon';
import { Observable, of, throwError } from 'rxjs/index';
import { ScoreCalculator } from '../score-calculator.interface';
import { injectable } from 'inversify';
import { DailyLimitExceededError } from '../errors/daily-limit-exceeded.error';
import { SelfScoreError } from '../errors/self-score.error';
import { Constants } from '../../config/constants';

@injectable()
export class ScoreCalculatorImpl implements ScoreCalculator {

    private readonly logger = LoggerFactory.getLogger('ScoreCalculator');
    private readonly MAX_POINTS_DAILY = 5;
    private readonly APP_DEFAULT_TIMEZONE = Constants.DEFAULT_TIMEZONE;

    countScores(receivers: string[]): Map<string, Score> {
        this.logger.debug(`countScore. receivers: ${JSON.stringify(receivers)}`);

        return receivers
          .reduce((map, receiver) => {
              const currentScore = map.get(receiver);
              if (currentScore) {
                  currentScore.value = currentScore.value + 1;
                  map.set(receiver, currentScore);
              } else {
                  map.set(receiver, new Score(receiver, 1));
              }
              return map;
          }, new Map<string, Score>());
    }

    mergeScores(existingScores: Score[], addedScores: Map<string, Score>): Score[] {
        this.logger.debug(`mergeScores. existing: ${JSON.stringify(existingScores)}, added: ${JSON.stringify(Array.from(addedScores.values()))}`);

        const updatedScores = existingScores
          .map((existingScore) => {
              const toAdd = addedScores.get(existingScore.memberId);
              if (toAdd) {
                  existingScore.value = existingScore.value + toAdd.value;
                  addedScores.delete(existingScore.memberId);
              }
              return existingScore;
          });

        return updatedScores.concat(Array.from(addedScores.values()));
    }

    keepOnlySameDayEvents(teamScores: TeamMemberScore): TeamMemberScore {
        this.logger.debug(`keepOnlySameDayEvents. teamScores: ${JSON.stringify(teamScores)}`);

        const events = teamScores.events
          .filter(event => DateTime.fromSQL(event.date).hasSame(DateTime.local().setZone(this.APP_DEFAULT_TIMEZONE), 'day'));
        return Object.assign(teamScores, { events });
    }

    // TODO TEST
    isDailyExceeded(wantedScore: ScoreEvent, teamScores: TeamMemberScore): boolean {
        this.logger.debug(`isDailyExceeded. wantedScore: ${JSON.stringify(wantedScore)}, teamScores: ${JSON.stringify(teamScores)}`);

        const beersGiven: number = teamScores.events
          .reduce((count, event) => event.giver === wantedScore.giver ? count + event.receivers.length : count, 0);
        return beersGiven + wantedScore.receivers.length > this.MAX_POINTS_DAILY;
    }

    // TODO TEST
    errorIfDailyLimit(wantedScore: ScoreEvent, scores: TeamMemberScore): Observable<TeamMemberScore> {
        this.logger.debug(`errorIfDailyLimit. wantedScore: ${JSON.stringify(wantedScore)}, scores: ${JSON.stringify(scores)}`);

        if (this.isDailyExceeded(wantedScore, scores)) {
            return throwError(new DailyLimitExceededError(`The user ${wantedScore.giver} has execeed the daily limit score.`));
        }
        return of(scores);
    }

    // TODO TEST
    errorIfBeerToSelf(wantedScore: ScoreEvent, scores: TeamMemberScore): Observable<TeamMemberScore> {
        this.logger.debug(`errorIfBeerToSelf. wantedScore: ${JSON.stringify(wantedScore)}, scores: ${JSON.stringify(scores)}`);

        if (wantedScore.receivers.find(receiver => receiver === wantedScore.giver) != null) {
            return throwError(new SelfScoreError(`The user ${wantedScore.giver} tried to give a beer to itself.`));
        }

        return of(scores);
    }
}
