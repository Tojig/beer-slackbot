import 'reflect-metadata';
import { Observable } from 'rxjs/index';
import { SlackOauthResponse } from '../../model/slack-oauth-response.model';
import { LoggerFactory } from '../../logger/logger.factory';
import { tap } from 'rxjs/internal/operators';
import { TeamService } from '../team-service.interface';
import { inject, injectable } from 'inversify';
import { REPOSITORY_TYPES } from '../../repository/di/repository.types';
import { TeamRepository } from '../../repository/team-repository.interface';

@injectable()
export class TeamServiceImpl implements TeamService {

    readonly logger = LoggerFactory.getLogger(TeamServiceImpl.name);

    constructor(
      @inject(REPOSITORY_TYPES.TeamRepository) private teamRepository: TeamRepository,
    ) {}

    findTeamById(teamId: string): Observable<SlackOauthResponse> {
        return this.teamRepository.findByTeamId(teamId)
          .pipe(
            tap(team => this.logger.debug(`findTeamById: team: ${JSON.stringify(team)}`)),
          );
    }
}
