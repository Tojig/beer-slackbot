import { expect } from 'chai';
import { ScoreRepository } from '../../aws/repository/score.repository';
import { anything, capture, instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs/index';
import { ScoreService } from '../score.service';
import { ScoreCalculator } from '../score-calculator';
import { AnswerService } from '../answer.service';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { Score } from '../../model/score.model';

describe('ScoreService', () => {

    let scoreService: ScoreService;
    let scoreRepositoryMock: ScoreRepository;

    describe('updateScores', () => {

        beforeEach(() => {
            scoreRepositoryMock = mock(ScoreRepository);
        });

        it('should create new object if not found', () => {
            when(scoreRepositoryMock.getScoreByTeamId('team')).thenReturn(of(null));
            when(scoreRepositoryMock.saveScore(anything())).thenReturn(of());

            const scoreRepository = instance(scoreRepositoryMock);

            scoreService = new ScoreService(scoreRepository, new ScoreCalculator(), new AnswerService());

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

        it('should work', () => {
            when(scoreRepositoryMock.getScoreByTeamId('team'))
              .thenReturn(of(new TeamMemberScore('teamId', [], [new Score('member', 2)])));

            const scoreRepository = instance(scoreRepositoryMock);

            scoreService = new ScoreService(scoreRepository, new ScoreCalculator(), new AnswerService());

            scoreService.getLeaderboard('team')
              .subscribe((answer) => {
                  console.log(answer);
                  expect(answer).to.equal('Leaderboard: \n');
              });

        });

    });

});
