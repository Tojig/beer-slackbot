export class SlackEvent<T> {
    public token: string;
    public team_id: string;
    public "api_app_id": string;
    public event: T;
    public type: string;
    public authed_users: string[];
    public event_id: string;
    public event_time: number;
}