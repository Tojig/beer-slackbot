import 'reflect-metadata';
import { DynamoDB } from 'aws-sdk';
import { TeamMemberScore } from '../../model/team-member-score.model';
import { Observable } from 'rxjs/index';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { LoggerFactory } from '../../logger/logger.factory';
import { map } from 'rxjs/internal/operators';
import { ScoreRepository } from '../score-repository.interface';
import { injectable } from 'inversify';

@injectable()
export class ScoreRepositoryImpl implements ScoreRepository {

    readonly SCORES_TABLE_NAME: string = process.env.SCORES_TABLE_NAME!;

    private readonly logger = LoggerFactory.getLogger('ScoreRepository');
    private readonly dbClient = new DynamoDB.DocumentClient();

    getScoreByTeamId(teamId: string): Observable<TeamMemberScore | null> {

        this.logger.debug(`getting scores by team id ${teamId}`);

        const params = {
            Key: { teamId },
            TableName: this.SCORES_TABLE_NAME,
        };

        return fromPromise(
          this.dbClient.get(params)
            .promise()
            .then(record => Promise.resolve(record.Item as TeamMemberScore)),
        );
    }

    saveScore(teamScore: TeamMemberScore): Observable<TeamMemberScore> {
        this.logger.debug(`saving scores: ${JSON.stringify(teamScore)}`);

        const params = {
            Item: teamScore,
            TableName: this.SCORES_TABLE_NAME,
        };

        return fromPromise(
          this.dbClient.put(params).promise(),
        ).pipe(map(() => teamScore));
    }
}
