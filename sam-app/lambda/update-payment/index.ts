import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    console.log("record: ", record);
    const messageBody = JSON.parse(record.body);
    console.log("body: ", messageBody);
  }
  return;
};
