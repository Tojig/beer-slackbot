import 'reflect-metadata';
import { AnswerService } from '../answer-service.interface';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { injectable } from 'inversify';

@injectable()
export class AnswerServiceImpl implements AnswerService {

    getLeaderboardText(teamScores: TeamMemberScore): string {
        return 'Leaderboard: \n' + teamScores.scores
          .sort((score1, score2) => score2.value - score1.value)
          .map(score => `<@${score.memberId}> - ${score.value} bières`)
          .join('\n');
    }
}
