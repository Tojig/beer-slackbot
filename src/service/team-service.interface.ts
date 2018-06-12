import { Observable } from 'rxjs/index';
import { SlackOauthResponse } from '../model/slack-oauth-response.model';

export interface TeamService {
    findTeamById(teamId: string): Observable<SlackOauthResponse>;
}
