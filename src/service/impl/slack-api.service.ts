import 'reflect-metadata';
import { WebAPICallResult, WebClient } from '@slack/client';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { Observable } from 'rxjs/index';
import { LoggerFactory } from '../../logger/logger.factory';
import { tap } from 'rxjs/internal/operators';
import { SlackApiService } from '../slack-api-service.interface';
import { injectable } from 'inversify';

@injectable()
export class SlackApiServiceImpl implements SlackApiService {

    static readonly CLIENT_ID: string = process.env.SLACK_CLIENT_ID!;
    static readonly CLIENT_SECRET: string = process.env.SLACK_CLIENT_SECRET!;
    static readonly CLIENT_SCOPES: string = process.env.SLACK_CLIENT_SCOPES!;

    private readonly logger = LoggerFactory.getLogger('SlackApiServiceImpl');
    private client = new WebClient();

    authorize(code: string): Observable<WebAPICallResult> {
        this.logger.debug('Authorizing team');
        return fromPromise(
          this.client.oauth.access({
              code,
              client_id: SlackApiServiceImpl.CLIENT_ID,
              client_secret: SlackApiServiceImpl.CLIENT_SECRET,
          }))
          .pipe(
            tap(res => this.logger.debug(res),
                err => this.logger.error(err)),
          );
    }

    sendEphemeralMessage(channel: string, text: string, user: string, botToken: string): Observable<WebAPICallResult> {
        this.logger.debug(`Sending ephemeral message to channel: ${channel}, text: ${text}, user: ${user}`);
        return fromPromise(
          this.client.chat.postEphemeral({ channel, text, user, as_user: false, token: botToken } as any),
        );
    }

    sendMessage(channel: string, text: string): Observable<WebAPICallResult> {
        this.logger.debug(`Sending message to channel: ${channel}, text: ${text}`);
        return fromPromise(
          this.client.chat.postMessage({ channel, text }),
        );
    }

    /**
     * Get the authorization url
     *
     * @param {Object} payload - Arguments for the url
     * @return {String} The payload's response url
     */
    static getInstallUrl(payload: any): string {

        const params = Object.assign({}, payload, {
            client_id: SlackApiServiceImpl.CLIENT_ID,
            scope: SlackApiServiceImpl.CLIENT_SCOPES,
        });

        return `https://slack.com/oauth/authorize?${SlackApiServiceImpl.stringify(params)}`;
    }

    /**
     * Transform the object to an url query string
     * @param obj The object with the parameters to stringify
     * @returns {string} A string containing each of the the keys of the object
     */
    static stringify(obj: any): string {
        return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
    }
}
