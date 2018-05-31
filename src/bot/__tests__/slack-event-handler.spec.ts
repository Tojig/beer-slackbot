import { SlackEventHandler } from '../slack-event-handler';
import { ScoreService } from '../../beer/score.service';
import { TeamService } from '../team.service';
import { SlackApiService } from '../../slack/slack-api.service';
import { anything, instance, mock, when } from 'ts-mockito';
import { DailyLimitExceededError } from '../../beer/errors/daily-limit-exceeded.error';
import { expect } from 'chai';
import { of, throwError } from 'rxjs/index';
import { TeamMemberScore } from '../../model/team-member-score.model';

describe('SlackEventHandler', () => {

    let slackEventHandler: SlackEventHandler;
    let scoreServiceMock: ScoreService;
    let teamService: TeamService;
    let slackApiService: SlackApiService;

    beforeEach(() => {
        scoreServiceMock = mock(ScoreService);
        teamService = mock(TeamService);
        slackApiService = mock(SlackApiService);
    });

    // TODO ALL
    describe('getScoreIntentionResult', () => {
        let scoreService: ScoreService;

        it('Doit retourner le message de success', () => {
            when(scoreServiceMock.onScoreIntention(anything(), anything(), anything()))
              .thenReturn(of(TeamMemberScore.create({ teamId: '', events: [], scores: [] })));
            scoreService = instance(scoreServiceMock);

            slackEventHandler = new SlackEventHandler(scoreService, teamService, slackApiService);

            slackEventHandler.getScoreIntentionResult('', '', [])
              .subscribe((message) => {
                  expect(message).to.be.equal('La bière a été donnée');
              });
        });

        it('Doit retourner une message derreur en cas de limite depassée', () => {
            when(scoreServiceMock.onScoreIntention(anything(), anything(), anything()))
              .thenReturn(throwError(new DailyLimitExceededError('test daily limit exceed')));
            scoreService = instance(scoreServiceMock);

            slackEventHandler = new SlackEventHandler(scoreService, teamService, slackApiService);

            slackEventHandler.getScoreIntentionResult('', '', [])
              .subscribe((message) => {
                  expect(message).to.be.equal('La limite de bières a été atteinte aujourdhui');
              });
        });
    });

});
