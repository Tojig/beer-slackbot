import * as IAM from 'aws-sdk/clients/iam';
import { AWSError } from 'aws-sdk';
import { GetUserResponse } from 'aws-sdk/clients/iam';
import { Observable } from 'rxjs/index';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import * as SNS from 'aws-sdk/clients/sns';
import { map, switchMap } from 'rxjs/internal/operators';
import { PromiseResult } from 'aws-sdk/lib/request';
import { PublishResponse } from 'aws-sdk/clients/sns';

export class AwsSnsClient {
    readonly TOPIC_NAME: string = process.env.TOPIC_NAME!;
    readonly AWS_REGION: string = process.env.AWS_REGION!;
    readonly GIVE_BEER_TOPIC_NAME: string = process.env.GIVE_BEER_TOPIC_NAME!;

    private iam: IAM = new IAM();
    private sns: SNS = new SNS();

    /**
     * Get account id
     *
     * @return {Observable} An Observable with the account id
     */
    getId(): Observable<string> {
        const authorized = (data: GetUserResponse) => data.User.Arn;
        const unauthorized = (error: AWSError) => error.message;
        const match = (arn: string) => arn.match(/arn:aws:sts::(\d+):/)![1];

        return fromPromise(this.iam.getUser({})
          .promise()
          .then(authorized)
          .catch(unauthorized)
          .then(match));
    }

    /**
     * Publish the payload on SNS
     * @param payload
     * @returns {Observable<PromiseResult<SNS.PublishResponse, AWSError>>}
     */
    notify(payload: any): Observable<PromiseResult<PublishResponse, AWSError>> {
        return this.getId()
          .pipe(
            map(id => this.getSnsParams(id, payload, this.TOPIC_NAME)),
            switchMap(params => fromPromise(this.sns.publish(params).promise())),
          );
    }

    notifyBeer(payload: any): Observable<PromiseResult<PublishResponse, AWSError>> {
        return this.getId()
          .pipe(
            map(id => this.getSnsParams(id, payload, this.GIVE_BEER_TOPIC_NAME)),
            switchMap(params => fromPromise(this.sns.publish(params).promise())),
          );
    }

    private getSnsParams(messagePayload: any, accountId: string, topicName: string): any {
        return {
            Message: JSON.stringify(messagePayload),
            TopicArn: `arn:aws:sns:${this.AWS_REGION}:${accountId}:${topicName}`,
        };
    }

}
