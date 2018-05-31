import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { Observable } from 'rxjs/index';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { SlackOauthResponse } from '../../model/slack-oauth-response.model';
import { LoggerFactory } from '../../logger/logger.factory';

export class TeamRepository {
    readonly TABLE_NAME: string = process.env.TEAM_TABLE_NAME!;

    private logger = LoggerFactory.getLogger('TeamRepository');
    private dbClient = new DynamoDB.DocumentClient();

    findByTeamId(teamId: string): Observable<SlackOauthResponse> {
        const params = {
            Key: { team_id: teamId },
            TableName: this.TABLE_NAME,
        };

        return fromPromise(this.dbClient.get(params)
          .promise()
          .then(record => Promise.resolve(record.Item as SlackOauthResponse)));
    }

    /**
     * Save a record
     *
     * @param {Object} record - The record to save
     * @return {Observable} An Observable with the save results
     */
    save(record: SlackOauthResponse): Observable<any> {

        this.logger.debug('Saving record');

        const params = {
            Item: record,
            TableName: this.TABLE_NAME,
        };

        return fromPromise(this.dbClient.put(params).promise());
    }
}
