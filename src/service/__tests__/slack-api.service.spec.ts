import { expect } from 'chai';
import { SlackApiServiceImpl } from '../impl/slack-api.service';
import { tap } from 'rxjs/internal/operators';

describe('SlackApiServiceImpl', () => {

    let slackApiService: SlackApiServiceImpl;
    const token = 'xoxb-211519690259-380180800902-d4r4Sc8WREUku26PSqg9tsOT';

    describe('init', () => {
        slackApiService = new SlackApiServiceImpl();

        it('should start correctly', () => {
            expect(slackApiService).to.exist;
        });
    });

    describe('send ephemeral message', () => {
        slackApiService = new SlackApiServiceImpl();

        it('should send message', (done) => {
            slackApiService.sendEphemeralMessage('CB70KF6MD', 'ephemeral', 'U681U7EBW', token)
              .pipe(
                tap(console.log, err => console.log(err)),
              )
              .subscribe((res) => {
                  console.log(res);
                  done();
              });
        });

    });

    describe('authorize', () => {

        beforeEach(() => {
            slackApiService = new SlackApiServiceImpl();
        });

        it('should authorize', () => {
            slackApiService.authorize('code').subscribe(console.log);
        });
    });

});
