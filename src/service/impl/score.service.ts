import 'reflect-metadata';
import { Observable } from 'rxjs/index';
import { map, switchMap, tap } from 'rxjs/internal/operators';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { LoggerFactory } from '../../logger/logger.factory';
import { SlashCommandResponseModel } from '../../model/slack/slash-command-response.model';
import { ScoreEvent } from '../../model/score-event.model';
import { inject, injectable } from 'inversify';
import { ScoreService } from '../score-service.interface';
import { AnswerService } from '../answer-service.interface';
import { ScoreCalculator } from '../score-calculator.interface';
import { SERVICE_TYPES } from '../di/service.types';
import { REPOSITORY_TYPES } from '../../repository/di/repository.types';
import { ScoreRepository } from '../../repository/score-repository.interface';

@injectable()
export class ScoreServiceImpl implements ScoreService {

    readonly logger = LoggerFactory.getLogger('ScoreService');

    constructor(@inject(REPOSITORY_TYPES.ScoreRepository) private scoreRepository: ScoreRepository,
                @inject(SERVICE_TYPES.ScoreCalculator) private scoreCalculator: ScoreCalculator,
                @inject(SERVICE_TYPES.AnswerService) private answerService: AnswerService,
                ) {}

    fetchScores(teamId: string): Observable<TeamMemberScore | null> {
        this.logger.debug(`fetchScores: teamId: ${teamId}`);

        return this.scoreRepository.getScoreByTeamId(teamId);
    }

    onScoreIntention(teamId: string, giver: string, receivers: string[]): Observable<TeamMemberScore> {
        this.logger.debug(`onScoreIntention: teamId: ${teamId}, giver: ${giver}, receivers: ${receivers}`);

        const scoreIntention = ScoreEvent.create({ giver, receivers });
        return this.addScores(teamId, scoreIntention);
    }

    addScores(teamId: string, scoreIntention: ScoreEvent): Observable<TeamMemberScore> {
        this.logger.debug(`addScores: teamId: ${teamId}, scoreIntention: ${JSON.stringify(scoreIntention)}`);

        const scoresToAdd = this.scoreCalculator.countScores(scoreIntention.receivers);

        return this.scoreRepository.getScoreByTeamId(teamId)
          .pipe(
            map(teamScores => teamScores ? TeamMemberScore.create(teamScores) : new TeamMemberScore(teamId, [], [])),
            map(teamScores => this.scoreCalculator.keepOnlySameDayEvents(teamScores)),
            switchMap(teamScores => this.scoreCalculator.errorIfBeerToSelf(scoreIntention, teamScores)),
            switchMap(teamScores => this.scoreCalculator.errorIfDailyLimit(scoreIntention, teamScores)),
            tap(teamScores => teamScores.events.push(scoreIntention)),
            tap(teamScores => teamScores.scores = this.scoreCalculator.mergeScores(teamScores.scores, scoresToAdd)),
            switchMap(teamScores => this.scoreRepository.saveScore(teamScores!)),
          );
    }

    getLeaderboard(teamId: string): Observable<any> {
        this.logger.debug(`getLeaderboard: teamId: ${teamId}`);

        return this.fetchScores(teamId)
          .pipe(
            map(scores => this.answerService.getLeaderboardText(scores || new TeamMemberScore(teamId, [], []))),
            map(text => new SlashCommandResponseModel(text)),
          );
    }

}
