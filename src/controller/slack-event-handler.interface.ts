import { SlackEvent } from '../model/slack/slack-event.model';
import { Message } from '../model/slack/message.model';
import { Observable } from 'rxjs/index';

export interface SlackEventHandler {
    onSlackEvent(event: SlackEvent<Message>): Observable<any>;
}
