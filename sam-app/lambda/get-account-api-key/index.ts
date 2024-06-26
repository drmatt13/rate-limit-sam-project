import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

// types
import { JwtHeaderPayload } from "../types/requestPayloads";
import { APIKeysTableItem } from "../types/tableItems";
import { GetAccountApiKeyResponse } from "../types/responses";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "GET",
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
        TableName: "ApiKeys",
        Key: {
          user_id: { S: payload.sub },
        },
      })
    );

    const tableItem = Item as unknown as APIKeysTableItem;

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
        } as GetAccountApiKeyResponse),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        tableItem,
      } as GetAccountApiKeyResponse),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error,
      } as GetAccountApiKeyResponse),
    };
  }
};
