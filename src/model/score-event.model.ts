import { DateTime } from 'luxon';
import { Constants } from '../bot/constants';

export class ScoreEvent {

    static create(obj: Partial<ScoreEvent>) {
        return new ScoreEvent(
          obj.giver || '',
          obj.receivers || [],
          obj.date || DateTime.local().setZone(Constants.DEFAULT_TIMEZONE).toSQL(),
        );
    }

    constructor(
      public giver: string,
      public receivers: string[],
      public date: string,
    ) {}
}
