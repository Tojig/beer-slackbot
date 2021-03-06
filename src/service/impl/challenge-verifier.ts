import 'reflect-metadata';
import { LoggerFactory } from '../../logger/logger.factory';
import { injectable } from 'inversify';
import { ChallengeVerifier } from '../challenge-verifier.interface';

@injectable()
export class ChallengeVerifierImpl implements ChallengeVerifier {

    private VERIFICATION_TOKEN: string = process.env.SLACK_VERIFICATION_TOKEN!;

    readonly logger = LoggerFactory.getLogger('ChallengeVerifier');

    private isTokenVerified(token: string): boolean {
        return token === this.VERIFICATION_TOKEN;
    }

    verifyToken(token: string, context: any) {
        if (!this.isTokenVerified(token)) {
            this.logger.debug(`Invalid token: ${token}, our token${this.VERIFICATION_TOKEN}`);
            return context.fail(`Invalid token: ${token}`);
        }
        this.logger.debug(`The token is valid!`);
    }

}
