import { TeamMemberScore } from '../model/team-member-score.model';

export interface AnswerService {

    getLeaderboardText(teamScores: TeamMemberScore): string;

}
