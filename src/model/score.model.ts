export class Score {

    static create(obj: Partial<Score>): Score {
        return new Score(
          obj.memberId || '',
          obj.value || 0,
        );
    }

    constructor(
      public memberId: string,
      public value: number,
    ) {}
}
