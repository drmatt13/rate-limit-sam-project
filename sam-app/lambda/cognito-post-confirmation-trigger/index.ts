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
        EventBusName: "BackendEventBus",
        Source: "account.created",
        DetailType: "Account Created Detail Type",
        Detail: JSON.stringify({
          user: event.userName,
          sub: event.request.userAttributes.sub,
        }),
      },
    ],
  };

  const command = new PutEventsCommand(params);

  let res: any;

  try {
    res = await client.send(command);
  } catch (error) {
    res = error;
  }

  if (typeof res === "object") {
    console.log(JSON.stringify(res));
  } else {
    console.log(res);
  }

  return event;
};
