export interface DynamoDBError {
  name:
    | "AccessDeniedException"
    | "ConditionalCheckFailedException"
    | "IncompleteSignatureException"
    | "ItemCollectionSizeLimitExceededException"
    | "LimitExceededException"
    | "MissingAuthenticationTokenException"
    | "ProvisionedThroughputExceeded"
    | "ProvisionedThroughputExceededException"
    | "RequestLimitExceeded"
    | "ResourceInUseException"
    | "ResourceNotFoundException"
    | "ThrottlingException"
    | "UnrecognizedClientException"
    | "ValidationException"
    | "Internal Server Error"
    | "ItemNotFound"
    | "ItemAlreadyExists";
  message: string;
  status: number; // Like 400 or 500
  retryable: boolean; // A derived field that indicates if the error can be retried or not
}
