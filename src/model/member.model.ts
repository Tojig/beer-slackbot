import { ScoreEvent } from './score-event.model';

export class Member {

    static create(obj: Partial<Member>): Member {
        return new Member(
          obj.id || '',
          [],
        );
    }

    constructor(
      public id: string,
      public lastEvents: ScoreEvent[],
    ) {}
}
