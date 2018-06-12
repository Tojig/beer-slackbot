import { Score } from '../model/score.model';
import { TeamMemberScore } from '../model/team-member-score.model';
import { ScoreEvent } from '../model/score-event.model';
import { Observable } from 'rxjs/index';

export interface ScoreCalculator {

    countScores(receivers: string[]): Map<string, Score>;

    mergeScores(existingScores: Score[], addedScores: Map<string, Score>): Score[];

    keepOnlySameDayEvents(teamScores: TeamMemberScore): TeamMemberScore;

    isDailyExceeded(wantedScore: ScoreEvent, teamScores: TeamMemberScore): boolean;

    errorIfDailyLimit(wantedScore: ScoreEvent, scores: TeamMemberScore): Observable<TeamMemberScore>;

    errorIfBeerToSelf(wantedScore: ScoreEvent, scores: TeamMemberScore): Observable<TeamMemberScore>;

}
