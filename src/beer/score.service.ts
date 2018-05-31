import { Observable } from 'rxjs/index';
import { ScoreCalculator } from './score-calculator';
import { map, switchMap, tap } from 'rxjs/internal/operators';
import { TeamMemberScore } from '../model/team-member-score.model';
import { ScoreRepository } from '../aws/repository/score.repository';
import { LoggerFactory } from '../logger/logger.factory';
import { AnswerService } from './answer.service';
import { SlashCommandResponseModel } from '../slack/model/slash-command-response.model';
import { ScoreEvent } from '../model/score-event.model';

export class ScoreService {

    readonly logger = LoggerFactory.getLogger('ScoreService');

    constructor(private scoreRepository: ScoreRepository,
                private scoreCalculator: ScoreCalculator,
                private answerService: AnswerService,
                ) {}

    fetchScores(teamId: string): Observable<TeamMemberScore | null> {
        this.logger.debug(`fetchScores: teamId: ${teamId}`);

        return this.scoreRepository.getScoreByTeamId(teamId);
    }

    onScoreIntention(teamId: string, giver: string, receivers: string[]): Observable<TeamMemberScore> {
        this.logger.debug(`onScoreIntention: teamId: ${teamId}, giver: ${giver}, receivers: ${receivers}`);

        const uniqueReceivers = receivers.filter(receiver => receiver !== giver);
        const scoreIntention = ScoreEvent.create({ giver, receivers: uniqueReceivers });
        return this.addScores(teamId, scoreIntention);
    }

    addScores(teamId: string, scoreIntention: ScoreEvent): Observable<TeamMemberScore> {
        this.logger.debug(`addScores: teamId: ${teamId}, scoreIntention: ${JSON.stringify(scoreIntention)}`);

        const scoresToAdd = this.scoreCalculator.countScores(scoreIntention.receivers);

        return this.scoreRepository.getScoreByTeamId(teamId)
          .pipe(
            map(teamScores => teamScores ? TeamMemberScore.create(teamScores) : new TeamMemberScore(teamId, [], [])),
            map(teamScores => this.scoreCalculator.keepOnlySameDayEvents(teamScores)),
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
