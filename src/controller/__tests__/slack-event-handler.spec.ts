import { SlackEventHandlerImpl } from '../impl/slack-event-handler';
import { TeamServiceImpl } from '../../service/impl/team.service';
import { SlackApiServiceImpl } from '../../service/impl/slack-api.service';
import { anything, instance, mock, when } from 'ts-mockito';
import { DailyLimitExceededError } from '../../service/errors/daily-limit-exceeded.error';
import { expect } from 'chai';
import { of, throwError } from 'rxjs/index';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { SelfScoreError } from '../../service/errors/self-score.error';
import { ScoreService } from '../../service/score-service.interface';
import { ScoreServiceImpl } from '../../service/impl/score.service';

describe('SlackEventHandler', () => {

    let slackEventHandler: SlackEventHandlerImpl;
    let scoreServiceMock: ScoreService;
    let teamService: TeamServiceImpl;
    let slackApiService: SlackApiServiceImpl;

    beforeEach(() => {
        scoreServiceMock = mock(ScoreServiceImpl);
        teamService = mock(TeamServiceImpl);
        slackApiService = mock(SlackApiServiceImpl);
    });

    // TODO ALL
    describe('getScoreIntentionResult', () => {
        let scoreService: ScoreService;

        it('Doit retourner le message de success', () => {
            when(scoreServiceMock.onScoreIntention(anything(), anything(), anything()))
              .thenReturn(of(TeamMemberScore.create({ teamId: '', events: [], scores: [] })));
            scoreService = instance(scoreServiceMock);

            slackEventHandler = new SlackEventHandlerImpl(scoreService, teamService, slackApiService);

            slackEventHandler.getScoreIntentionResult('', '', [])
              .subscribe((message) => {
                  expect(message).to.be.equal('La bière a été donnée');
              });
        });

        it('Doit retourner une message derreur en cas de limite depassée', () => {
            when(scoreServiceMock.onScoreIntention(anything(), anything(), anything()))
              .thenReturn(throwError(new DailyLimitExceededError('test daily limit exceed')));
            scoreService = instance(scoreServiceMock);

            slackEventHandler = new SlackEventHandlerImpl(scoreService, teamService, slackApiService);

            slackEventHandler.getScoreIntentionResult('', '', [])
              .subscribe((message) => {
                  expect(message).to.be.equal('La limite de bières a été atteinte aujourdhui.');
              });
        });

        it('Doit retourner une message derreur en cas de bière a soi meme', () => {
            when(scoreServiceMock.onScoreIntention(anything(), anything(), anything()))
              .thenReturn(throwError(new SelfScoreError('test self scoring')));
            scoreService = instance(scoreServiceMock);

            slackEventHandler = new SlackEventHandlerImpl(scoreService, teamService, slackApiService);

            slackEventHandler.getScoreIntentionResult('', '', [])
              .subscribe((message) => {
                  expect(message).to.be.equal('On ne peut pas donner de bière à soi même.');
              });
        });
    });

});
