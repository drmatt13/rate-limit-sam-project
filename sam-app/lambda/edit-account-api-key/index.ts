import { SQSEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

// types
import { APIKeysTableItem } from "../types/tableItems";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event: SQSEvent) => {
  // Process each message in the SQS event
  for (const record of event.Records) {
    // Parse the message body, which contains the EventBridge event
    const messageBody = JSON.parse(record.body);
    switch (messageBody["source"]) {
      case "account.created":
        const { sub } = messageBody.detail;
        try {
          await dynamoClient.send(
            new PutItemCommand({
              TableName: "ApiKeys",
              Item: {
                user_id: { S: sub },
                api_key: { S: uuidv4() },
                tier: { S: "free" },
              } as APIKeysTableItem,
            })
          );
        } catch (error) {
          throw new Error("Failed to insert API key");
        }
        break;
      case "payment.success":
        try {
          console.log("Payment success");
        } catch (error) {
          throw new Error("Failed to insert payment record");
        }
        break;
      case "payment.failed":
        try {
        } catch (error) {
          console.log("Payment failed");
          throw new Error("Failed to insert payment record");
        }
        break;
      default:
        throw new Error("Unknown source");
    }
  }
};
