export class EventChallenge {

    static create(obj: Partial<EventChallenge>) {
        return new EventChallenge(
          obj.challenge,
          obj.token,
          obj.type,
        );
    }

    constructor(
      public challenge: string | undefined,
      public token: string | undefined,
      public type: string | undefined,
    ) {}
}
