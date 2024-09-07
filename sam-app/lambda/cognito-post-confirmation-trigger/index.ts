import { PostConfirmationTriggerEvent } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";

const client = new EventBridgeClient({ region: "us-east-1" });

export const handler = async (event: PostConfirmationTriggerEvent) => {
  const params: PutEventsCommandInput = {
    Entries: [
      {
        EventBusName: "TieredApiAccessManagerEventBus",
        Source: "account.created",
        DetailType: "Account Created Detail Type",
        Detail: JSON.stringify({
          sub: event.request.userAttributes.sub,
        }),
      },
    ],
  };
  const command = new PutEventsCommand(params);
  await client.send(command);
  return event;
};
