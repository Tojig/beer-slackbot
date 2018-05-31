import { Bot } from './bot.model';
import { IncomingWebhook } from './incoming-webhook.model';

export class SlackOauthResponse {

    access_token: string;
    bot: Bot;
    incoming_webhook: IncomingWebhook
    ok: boolean;
    scope: string;
    team_id: string;
    team_name: string;
    user_id: string;

}

