import { Callback, Context, Handler } from 'aws-lambda';
import { SlackApiService } from '../slack-api.service';
import { TeamRepository } from '../../aws/repository/team.repository';
import { catchError, finalize, switchMap } from 'rxjs/internal/operators';
import { of } from 'rxjs/index';
import { SlackOauthResponse } from '../../model/slack-oauth-response.model';
import { LoggerFactory } from '../../logger/logger.factory';

const logger = LoggerFactory.getLogger('installHandler');

const redirect = (context: Context, url: string) => context.fail(url);

const getAfterInstallRedirectUrl = (queryParams: any): string => {

    const afterInstallRedirect: string = process.env.SLACK_AFTER_INSTALL_REDIRECT_URL!;

    return`${afterInstallRedirect}?${SlackApiService.stringify(queryParams)}`;
};


const install: Handler = (request: any, context: Context, callback: Callback) => {

    const queryParams = request.query || {};
    if (!queryParams || !queryParams.code) {
        // redirect to Slack's OAuth flow
        logger.debug('Redirecting to install url...');
        redirect(context, SlackApiService.getInstallUrl(queryParams));
    }

    // prepare redirect querystring
    const query: any = {};
    if (queryParams.state) query.state = queryParams.state;

    return new SlackApiService()
      .authorize(queryParams.code)
      .pipe(
        switchMap(authResult => new TeamRepository().save(authResult as SlackOauthResponse)),
        catchError((error) => {
            query.error = error;
            logger.error(error);
            return of(query);
        }),
        finalize(() => redirect(context, getAfterInstallRedirectUrl(query))),
      ).toPromise();
};

export { install };
