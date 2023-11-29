import { EventBridgeEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event: EventBridgeEvent<any, any>) => {
  console.log("event:", JSON.stringify(event));

  // Extract data from the event detail
  const { sub } = event.detail as { sub: string };

  // Assuming you want to generate an API key and set other default values
  const apiKey = uuidv4(); // A function to generate a unique API key
  const currentDate = new Date().toISOString();
  const hundredYearsFromNow = new Date();
  hundredYearsFromNow.setFullYear(hundredYearsFromNow.getFullYear() + 100);

  const params = {
    TableName: "ApiKeys",
    Item: {
      user_id: { S: sub },
      api_key: { S: apiKey },
      tier: { S: "free" },
      ttl: { N: Math.floor(hundredYearsFromNow.getTime() / 1000).toString() }, // TTL in seconds since epoch
    },
  };

  try {
    await dynamoClient.send(new PutItemCommand(params));
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};
