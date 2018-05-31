import { TeamRepository } from '../aws/repository/team.repository';
import { Observable } from 'rxjs/index';
import { SlackOauthResponse } from '../model/slack-oauth-response.model';

export class TeamService {

    constructor(
      private teamRepository: TeamRepository,
    ) {}

    findTeamById(teamId: string): Observable<SlackOauthResponse> {
        return this.teamRepository.findByTeamId(teamId);
    }
}
