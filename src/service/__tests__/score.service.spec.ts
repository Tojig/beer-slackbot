import { expect } from 'chai';
import { ScoreRepositoryImpl } from '../../repository/impl/score.repository';
import { anything, capture, instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs/index';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { Score } from '../../model/score.model';
import { ScoreService } from '../score-service.interface';
import { appContainer } from '../../config/inversify';
import { SERVICE_TYPES } from '../di/service.types';
import { ScoreRepository } from '../../repository/score-repository.interface';
import { REPOSITORY_TYPES } from '../../repository/di/repository.types';
import { AnswerService } from '../answer-service.interface';
import { ScoreCalculator } from '../score-calculator.interface';
import { ScoreServiceImpl } from '../impl/score.service';

describe('ScoreService', () => {

    let scoreService: ScoreService;
    let scoreRepositoryMock: ScoreRepositoryImpl;

    let scoreRepository: ScoreRepository;
    const scoreCalculator: ScoreCalculator = appContainer.get(SERVICE_TYPES.ScoreCalculator);
    const answerService: AnswerService = appContainer.get(SERVICE_TYPES.AnswerService);

    beforeEach(() => {
        appContainer.snapshot();
    });

    afterEach(() => {
        appContainer.restore();
    });

    describe('updateScores', () => {

        beforeEach(() => {
            scoreRepositoryMock = mock(ScoreRepositoryImpl);

            appContainer.unbind(REPOSITORY_TYPES.ScoreRepository);
        });

        it('should create new object if not found', () => {
            when(scoreRepositoryMock.getScoreByTeamId('team')).thenReturn(of(null));
            when(scoreRepositoryMock.saveScore(anything())).thenReturn(of());

            scoreRepository = instance(scoreRepositoryMock);

            scoreService = new ScoreServiceImpl(scoreRepository, scoreCalculator, answerService);

            scoreService.onScoreIntention('team', 'giver', ['receiver'])
              .subscribe((res) => {
                  expect(capture(scoreRepository.saveScore).last()).to.not.be.null;
              });
        });

        it('should sum duplicate scores', () => {

        });
    });

    describe('mergeScores', () => {

    });

    describe('getLeaderboard', () => {

        beforeEach(() => {
            scoreRepositoryMock = mock(ScoreRepositoryImpl);

            appContainer.unbind(REPOSITORY_TYPES.ScoreRepository);
        });

        it('should work', (done) => {
            when(scoreRepositoryMock.getScoreByTeamId('team'))
              .thenReturn(of(new TeamMemberScore('teamId', [], [new Score('member', 2)])));

            scoreRepository = instance(scoreRepositoryMock);

            scoreService = new ScoreServiceImpl(scoreRepository, scoreCalculator, answerService);

            scoreService.getLeaderboard('team')
              .subscribe((answer) => {
                  console.log(answer);
                  expect(answer.text).to.equal('Leaderboard: \n<@member> - 2 bières');
                  done();
              });

        });

    });

});
