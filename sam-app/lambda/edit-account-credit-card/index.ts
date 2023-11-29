import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

// types
import { JwtHeaderPayload } from "../types/requestPayloads";
import { CreditCardsTableItem } from "../types/tableItems";
import { GetAccountCreditCardResponse } from "../types/responses";
import { DynamoDBError } from "../types/errors";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const authorizationHeader = event.headers["Authorization"] || "";

  const decodedPayloadString = Buffer.from(
    authorizationHeader.split(".")[1],
    "base64"
  ).toString();

  const payload: JwtHeaderPayload = JSON.parse(decodedPayloadString);

  const params = {
    TableName: "CreditCards",
    Key: {
      user_id: { S: payload.sub },
    },
  };

  let tableItem: CreditCardsTableItem | undefined;
  let error: DynamoDBError | undefined;

  try {
    const { Item } = await dynamoClient.send(new GetItemCommand(params));
    if (!Item) {
      error = {
        name: "ItemNotFound",
        message: "Item not found",
        status: 404,
        retryable: false,
      };
    }
    tableItem = Item as unknown as CreditCardsTableItem;
  } catch (err) {
    error = err as DynamoDBError;
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Allow-Methods": "GET",
    },
    body: JSON.stringify({
      success: true,
      tableItem,
      error,
    } as GetAccountCreditCardResponse),
  };
};
