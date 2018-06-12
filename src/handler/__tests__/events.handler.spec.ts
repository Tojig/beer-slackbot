import { eventApiHandler } from '../events-handler';
import { describe } from 'mocha';

describe('App', () => {

    // TODO ALL
    describe('Challenge', () => {

        beforeEach(() => {
        });

        it('responds with the challenge if one is provided', () => {

            const body = {
                challenge: 'challenge_string',
                type: 'url_challenge',
                token: 'some_token',
            };

            eventApiHandler({ body: JSON.stringify(body) }, {} as any, () => {});
        });
    });

});
