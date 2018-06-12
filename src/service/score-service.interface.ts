import { TeamMemberScore } from '../model/team-member-score.model';
import { ScoreEvent } from '../model/score-event.model';
import { Observable } from 'rxjs/index';

export interface ScoreService {
    fetchScores(teamId: string): Observable<TeamMemberScore | null>;

    onScoreIntention(teamId: string, giver: string, receivers: string[]): Observable<TeamMemberScore>;

    addScores(teamId: string, scoreIntention: ScoreEvent): Observable<TeamMemberScore>;

    getLeaderboard(teamId: string): Observable<any>;
}
