import { AxiosError } from "axios";
import { DynamoDBError } from "../../../sam-app/lambda/types/errors";

export interface CustomError extends AxiosError {
  response?: {
    data: {
      error: DynamoDBError;
    };
  } & AxiosError["response"];
}
