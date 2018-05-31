export enum ResponseType {
    IN_CHANNEL = 'in_channel',
    EPHEMERAL = 'ephemeral',
}

export class SlashCommandResponseModel {

    constructor(
      public text: string,
      public response_type: ResponseType = ResponseType.IN_CHANNEL,
      public attachments: any[] = [],
    ) {}
}
