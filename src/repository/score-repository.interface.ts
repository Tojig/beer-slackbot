import { Observable } from 'rxjs/index';
import { TeamMemberScore } from '../model/team-member-score.model';

export interface ScoreRepository {
    getScoreByTeamId(teamId: string): Observable<TeamMemberScore | null>;

    saveScore(teamScore: TeamMemberScore): Observable<TeamMemberScore>;
}