import { Callback, Context, Handler } from 'aws-lambda';
import { SlackApiServiceImpl } from '../service/impl/slack-api.service';
import { TeamRepositoryImpl } from '../repository/impl/team.repository';
import { catchError, finalize, switchMap } from 'rxjs/internal/operators';
import { of } from 'rxjs/index';
import { SlackOauthResponse } from '../model/slack-oauth-response.model';
import { LoggerFactory } from '../logger/logger.factory';
import { SERVICE_TYPES } from '../service/di/service.types';
import { appContainer } from '../config/inversify';
import { SlackApiService } from '../service/slack-api-service.interface';

const logger = LoggerFactory.getLogger('installHandler');

const redirect = (context: Context, url: string) => context.fail(url);

const getAfterInstallRedirectUrl = (queryParams: any): string => {

    const afterInstallRedirect: string = process.env.SLACK_AFTER_INSTALL_REDIRECT_URL!;

    return`${afterInstallRedirect}?${SlackApiServiceImpl.stringify(queryParams)}`;
};

const handle: Handler = (request: any, context: Context, callback: Callback) => {

    const queryParams = request.query || {};
    if (!queryParams || !queryParams.code) {
        // redirect to Slack's OAuth flow
        logger.debug('Redirecting to install url...');
        redirect(context, SlackApiServiceImpl.getInstallUrl(queryParams));
    }

    // prepare redirect querystring
    const query: any = {};
    if (queryParams.state) query.state = queryParams.state;

    const slackApiService = appContainer.get<SlackApiService>(SERVICE_TYPES.SlackApiService);
    slackApiService
      .authorize(queryParams.code)
      .pipe(
        switchMap(authResult => new TeamRepositoryImpl().save(authResult as SlackOauthResponse)),
        catchError((error) => {
            query.error = error;
            logger.error(error);
            return of(query);
        }),
        finalize(() => redirect(context, getAfterInstallRedirectUrl(query))),
      ).toPromise();
};

export { handle };
