import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";

// types
import { JwtHeaderPayload } from "../types/requestPayloads";
import { CreditCardsTableItem } from "../types/tableItems";
import { MakeCreditCardPaymentResponse } from "../types/responses";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const eventBridgeClient = new EventBridgeClient({ region: "us-east-1" });

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "POST",
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authorizationHeader = event.headers["Authorization"] || "";

    const decodedPayloadString = Buffer.from(
      authorizationHeader.split(".")[1],
      "base64"
    ).toString();

    const payload: JwtHeaderPayload = JSON.parse(decodedPayloadString);

    const { Item } = await dynamoClient.send(
      new GetItemCommand({
        TableName: "CreditCards",
        Key: {
          user_id: { S: payload.sub },
        },
      })
    );

    const tableItem = Item as unknown as CreditCardsTableItem;

    // If Credit Card is not found, return 404
    if (!tableItem) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            name: "ItemNotFound",
            message: "Item not found",
          },
        } as MakeCreditCardPaymentResponse),
      };
    }

    // If Credit Card is valid
    if (tableItem.valid.BOOL) {
      const params: PutEventsCommandInput = {
        Entries: [
          {
            EventBusName: "TieredApiAccessManagerEventBus",
            Source: "payment.success",
            DetailType: "Valid Payment Detail Type",
            Detail: JSON.stringify({
              user_id: payload.sub,
            }),
          },
        ],
      };
      const command = new PutEventsCommand(params);
      await eventBridgeClient.send(command);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          paymentSuccess: true,
        } as MakeCreditCardPaymentResponse),
      };
    }

    // If Credit Card is invalid
    if (!tableItem.valid.BOOL) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          paymentSuccess: false,
        } as MakeCreditCardPaymentResponse),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        paymentSuccess: false,
      } as MakeCreditCardPaymentResponse),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        paymentSuccess: false,
        error,
      } as MakeCreditCardPaymentResponse),
    };
  }
};
