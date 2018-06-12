export interface ChallengeVerifier {
    verifyToken(token: string, context: any): void;
}