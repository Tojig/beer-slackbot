import { Observable } from 'rxjs/index';
import { WebAPICallResult } from '@slack/client';

export interface SlackApiService {
    authorize(code: string): Observable<WebAPICallResult>;

    /**
     * Sends an ephemeral message ( only visible to the target user )
     * @param {string} channel The channel where the message will be sent
     * @param {string} text The text of the message
     * @param {string} user The user to who the message will be sent
     * @param {string} botToken The bot authorization token
     * @returns {Observable<WebAPICallResult>}
     */
    sendEphemeralMessage(channel: string, text: string, user: string, botToken: string): Observable<WebAPICallResult>;

    sendMessage(channel: string, text: string): Observable<WebAPICallResult>;

}
