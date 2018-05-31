import { expect } from 'chai';
import { SlackApiService } from '../slack-api.service';
import { tap } from 'rxjs/internal/operators';

describe('SlackApiService', () => {

    let slackApiService: SlackApiService;
    const token = 'your_token_here';

    describe('init', () => {
        slackApiService = new SlackApiService();

        it('should start correctly', () => {
            expect(slackApiService).to.exist;
        });
    });

    describe('send ephemeral message', () => {
        slackApiService = new SlackApiService();

        it('should send message', () => {
            slackApiService.sendEphemeralMessage('your_channel_here', 'ephemeral', 'some_slack_user', token)
              .pipe(
                tap(console.log, err => console.log(err)),
              )
              .subscribe(res => console.log(res));
        });

    });

    describe('authorize', () => {

        beforeEach(() => {
            slackApiService = new SlackApiService();
        });

        it('should authorize', () => {
            slackApiService.authorize('code').subscribe(console.log);
        });
    });

});
