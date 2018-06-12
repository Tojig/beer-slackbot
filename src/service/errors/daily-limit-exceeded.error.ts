export class DailyLimitExceededError extends Error {
    static readonly NAME = 'DailyLimitPointsExceededError';

    constructor(message: string) {
        super(message);
        this.name = DailyLimitExceededError.NAME;
    }
}
