import { Score } from './score.model';
import { ScoreEvent } from './score-event.model';

/**
 * Objet représentant une équipe et les scores des membres
 */
export class TeamMemberScore {

    static create(obj: Partial<TeamMemberScore>): TeamMemberScore {
        return new TeamMemberScore(
          obj.teamId!,
          obj.events,
          obj.scores,
        );
    }

    constructor (
      public teamId: string,
      public events: ScoreEvent[] = [],
      public scores: Score[] = [],
    ) {}
}
