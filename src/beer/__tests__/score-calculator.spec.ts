import { expect } from 'chai';
import { ScoreCalculator } from '../score-calculator';
import { Score } from '../../model/score.model';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { ScoreEvent } from '../../model/score-event.model';
import { DateTime } from 'luxon';
import { Constants } from '../../bot/constants';

describe('ScoreCalculator', () => {

    let scoreCalculator: ScoreCalculator;

    describe('countScores', () => {
        let scores: string[] = [];

        beforeEach(() => {
            scoreCalculator = new ScoreCalculator();
            scores = ['a', 'a', 'a', 'b'];
        });

        it('should count scores', () => {
            const score = ['rec'];
            const countedScore = scoreCalculator.countScores(score);
            expect(Array.from(countedScore.values()).length).to.equal(1);
            expect(countedScore.get('rec')!.value).to.equal(1);
        });

        it('should remove duplicate scores', () => {
            const countedScores = scoreCalculator.countScores(scores).values();
            expect(Array.from(countedScores).length).to.equal(2);
        });

        it('should sum duplicate scores', () => {
            const countedScores = scoreCalculator.countScores(scores);
            expect(countedScores.get('a')!.value).to.equal(3);
            expect(countedScores.get('b')!.value).to.equal(1);
        });
    });

    describe('mergeScores', () => {
        let scores: Score[];

        beforeEach(() => {
            scoreCalculator = new ScoreCalculator();
            scores = [new Score('a', 1), new Score('b', 2)];
        });

        it('should add to existing scores and merge new scores', () => {
            const newScores: Map<string, Score> = new Map()
              .set('b', new Score('b', 2))
              .set('c', new Score('c', 2));

            const mergedScores = scoreCalculator.mergeScores(scores, newScores);
            expect(mergedScores.length).to.equal(3);
            expect(mergedScores).to.include.deep.members([
                new Score('a', 1),
                new Score('b', 4),
                new Score('c', 2),
            ]);

        });
    });

    describe('isDailyExceeded', () => {
        beforeEach(() => {
            scoreCalculator = new ScoreCalculator();
        });

        it('should be false if less than limit', () => {
            const teamScores = TeamMemberScore.create({ teamId: 'testTeam' });
            const wantedScore = ScoreEvent.create({ giver: 'giver', receivers: ['res'] });

            const isExceeded = scoreCalculator.isDailyExceeded(wantedScore, teamScores);
            expect(isExceeded).to.be.false;
        });

        it('should be true if more than limit', () => {
            // TODO
        });
    });

    describe('keepOnlySameDayEvents', () => {
        beforeEach(() => {
            scoreCalculator = new ScoreCalculator();
        });

        it('should keep same day events', () => {
            const todayEvents = [new ScoreEvent('', [], DateTime.local().setZone(Constants.DEFAULT_TIMEZONE).toSQL()),
                new ScoreEvent('', [], DateTime.local().setZone(Constants.DEFAULT_TIMEZONE).toSQL())];

            const teamScores = new TeamMemberScore('', todayEvents,[]);
            const updated = scoreCalculator.keepOnlySameDayEvents(teamScores);
            expect(updated.events.length).to.be.equal(2);
        });

        it('should remove older events', () => {
            const olderEvents = [new ScoreEvent('', [], DateTime.local(2018,5,29,10).setZone(Constants.DEFAULT_TIMEZONE).toSQL()),
                new ScoreEvent('', [], DateTime.local(2018, 5,29, 8).setZone(Constants.DEFAULT_TIMEZONE).toSQL())];

            const teamScores = new TeamMemberScore('', olderEvents,[]);
            const updated = scoreCalculator.keepOnlySameDayEvents(teamScores);
            expect(updated.events.length).to.be.equal(0);
        });
    });


});
