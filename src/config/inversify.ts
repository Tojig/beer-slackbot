import { Container } from 'inversify';
import { TeamRepository } from '../repository/team-repository.interface';
import { REPOSITORY_TYPES } from '../repository/di/repository.types';
import { TeamRepositoryImpl } from '../repository/impl/team.repository';
import { ScoreRepositoryImpl } from '../repository/impl/score.repository';
import { ScoreRepository } from '../repository/score-repository.interface';
import { SERVICE_TYPES } from '../service/di/service.types';
import { AnswerService } from '../service/answer-service.interface';
import { AnswerServiceImpl } from '../service/impl/answer.service';
import { ChallengeVerifierImpl } from '../service/impl/challenge-verifier';
import { ChallengeVerifier } from '../service/challenge-verifier.interface';
import { ScoreServiceImpl } from '../service/impl/score.service';
import { ScoreService } from '../service/score-service.interface';
import { ScoreCalculator } from '../service/score-calculator.interface';
import { ScoreCalculatorImpl } from '../service/impl/score-calculator';
import { SlackApiService } from '../service/slack-api-service.interface';
import { SlackApiServiceImpl } from '../service/impl/slack-api.service';
import { TeamService } from '../service/team-service.interface';
import { TeamServiceImpl } from '../service/impl/team.service';
import { SlackEventHandler } from '../controller/slack-event-handler.interface';
import { SlackEventHandlerImpl } from '../controller/impl/slack-event-handler';
import { CONTROLLER_TYPES } from '../controller/di/controller.types';

const appContainer = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: true,
});

appContainer.bind<TeamRepository>(REPOSITORY_TYPES.TeamRepository).to(TeamRepositoryImpl);
appContainer.bind<ScoreRepository>(REPOSITORY_TYPES.ScoreRepository).to(ScoreRepositoryImpl);

appContainer.bind<AnswerService>(SERVICE_TYPES.AnswerService).to(AnswerServiceImpl);
appContainer.bind<ChallengeVerifier>(SERVICE_TYPES.ChallengeVerifier).to(ChallengeVerifierImpl);
appContainer.bind<ScoreService>(SERVICE_TYPES.ScoreService).to(ScoreServiceImpl);
appContainer.bind<ScoreCalculator>(SERVICE_TYPES.ScoreCalculator).to(ScoreCalculatorImpl);
appContainer.bind<SlackApiService>(SERVICE_TYPES.SlackApiService).to(SlackApiServiceImpl);
appContainer.bind<TeamService>(SERVICE_TYPES.TeamService).to(TeamServiceImpl);

appContainer.bind<SlackEventHandler>(CONTROLLER_TYPES.SlackEventHandler).to(SlackEventHandlerImpl);

export { appContainer };
