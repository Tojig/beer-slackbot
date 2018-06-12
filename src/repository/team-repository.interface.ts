import { Observable } from 'rxjs/index';
import { SlackOauthResponse } from '../model/slack-oauth-response.model';

export interface TeamRepository {
    findByTeamId(teamId: string): Observable<SlackOauthResponse>;

    /**
     * Save a record
     *
     * @param {Object} record - The record to save
     * @return {Observable} An Observable with the save results
     */
    save(record: SlackOauthResponse): Observable<any>;
}
