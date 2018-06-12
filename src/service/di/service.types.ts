const SERVICE_TYPES = {
    AnswerService: Symbol.for('AnswerService'),
    ScoreCalculator: Symbol.for('ScoreCalculator'),
    ScoreService: Symbol.for('ScoreService'),
    TeamService: Symbol.for('TeamService'),
    SlackApiService: Symbol.for('SlackApiService'),
    ChallengeVerifier: Symbol.for('ChallengeVerifier'),
};

export { SERVICE_TYPES };
