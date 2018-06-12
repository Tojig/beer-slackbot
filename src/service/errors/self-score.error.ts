export class SelfScoreError extends Error {
    static readonly NAME = 'SelfScoreError';

    constructor(message: string) {
        super(message);
        this.name = SelfScoreError.NAME;
    }
}
