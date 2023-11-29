## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 1</div>

<div style="color: #99ccff">First bootstrap a typescript react frontend. Create <span style="color: #00aa00">"/register"</span> and <span style="color: #00aa00">"/login"</span> pages then home <span style="color: #00aa00">"/"</span>, <span style="color: #00aa00">"/account"</span>, <span style="color: #00aa00">"/billing"</span>, and <span style="color: #00aa00">"api-key"</span> pages with dummy state/functionality and app wide context. Next create an application wide authorization wrapper component.</div>
</div>

### <span style="color: #ff3399">Create frontend</span>

```
npm create vite@latest frontend -- --template react-ts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 2</div>

<div style="color: #99ccff">Generated a SAM project and create both a UserPool + UserPoolClient. Additionally create a lambda function named PreSignUpTrigger to automate account create for the sake of testing and showcasing this project. <span style="color: #00aa00">"Test that the trigger works by manually creating a user in the Cognito console"</div>
</div>

### <span style="color: #ff3399">Generate SAM project</span>

```
sam init
```

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">UserPool, UserPoolClient</span></span>

```yaml
Resources:
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      LambdaConfig:
        PreSignUp: !GetAtt PreSignUpFunction.Arn
        PostConfirmation: !GetAtt PostConfirmationFunction.Arn
      Schema:
        - AttributeDataType: String
          Name: email
          Required: true
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireUppercase: false
          RequireLowercase: false
          RequireNumbers: false
          RequireSymbols: false

  # Client for UserPool
  UserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      UserPoolId: !Ref UserPool
```

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">PreSignUpFunction, PreSignUpFunctionResourceBasedPolicy</span></span>

```yaml
Resources:
  # ...
  PreSignUpFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/cognito-pre-signup-trigger
      Handler: index.handler
      Runtime: nodejs18.x
      Architectures:
        - x86_64
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2020"
        Sourcemap: true
        EntryPoints:
          - index.ts

  # Resource based policy which allows UserPool to invoke PreSignUpFunction
  PreSignUpFunctionResourceBasedPolicy:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !GetAtt PreSignUpFunction.Arn
      Principal: cognito-idp.amazonaws.com
      SourceArn: !GetAtt UserPool.Arn
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 3</div>

<div style="color: #99ccff">Install amazon-cognito-identity-js to front end, generate outputs in template.yaml for the cognito inputs, update env variables on frontend then create register and login functionality.</div>
</div>

### <span style="color: #ff3399">Create Outputs <span style="color: skyblue">UserPoolId, UserPoolClientId</span></span>

```yaml
Outputs:
  UserPoolId:
    Description: "The ID of the Cognito User Pool"
    Value: !Ref UserPool

  UserPoolClientId:
    Description: "The ID of the Cognito App Client"
    Value: !Ref UserPoolClient
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 4</div>

<div style="color: #99ccff">Create Cards, Payment and API key tables in DynamoDB.</div>
</div>

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">CreditCardsTable, PaymentsTable, ApiKeysTable</span></span>

```yaml
Resources:
  # ...
  CreditCardsTable:
    Type: AWS::Serverless::SimpleTable
    Properties:
      TableName: CreditCards
      PrimaryKey:
        Name: user_id
        Type: String

  PaymentsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Payments
      AttributeDefinitions:
        - AttributeName: user_id
          AttributeType: S
        - AttributeName: date
          AttributeType: S
      KeySchema:
        - AttributeName: user_id
          KeyType: HASH
        - AttributeName: date
          KeyType: RANGE
      BillingMode: PAY_PER_REQUEST

  ApiKeysTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: ApiKeys
      AttributeDefinitions:
        - AttributeName: user_id
          AttributeType: S
      KeySchema:
        - AttributeName: user_id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 5</div>

<div style="color: #99ccff">Create a lambda function named PostConfirmationTrigger and assign it to the userpool.</div>
</div>

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">PostConfirmationFunction, PostConfirmationFunctionResourceBasedPolicy</span></span>

```yaml
Resources:
  # ...
  PostConfirmationFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/cognito-post-confirmation-trigger
      Handler: index.handler
      Runtime: nodejs18.x
      Architectures:
        - x86_64
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2020"
        Sourcemap: true
        EntryPoints:
          - index.ts

  # Resource based policy which allows UserPool to invoke PostConfirmationFunction
  PostConfirmationFunctionResourceBasedPolicy:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !GetAtt PostConfirmationFunction.Arn
      Principal: cognito-idp.amazonaws.com
      SourceArn: !GetAtt UserPool.Arn
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 6</div>

<div style="color: #99ccff">Create a custom eventbus.</div>
</div>

### <span style="color: #ff3399">Create Resource <span style="color: skyblue">MyEventBus</span></span>

```yaml
Resources:
  # ...
  MyEventBus:
    Type: "AWS::Events::EventBus"
    Properties:
      Name: BackendEventBus
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 7</div>

<div style="color: #99ccff">Return to the ConfirmationTriggerFunction and update it to generate an <span style="color: #00aa00">"Account Created"</span> Event for the custom event bus.</div>
</div>

### <span style="color: #ff3399">Create Resource <span style="color: skyblue">PostConfirmationFunctionPermissionPolicy</span></span>

```yaml
Resources:
  # ...

  # this updates the permission policy for the functions IAM Role to allow it to use the Action: "events:PutEvents"
  PostConfirmationFunctionPermissionPolicy:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: PostConfirmationFunctionPermissionPolicy
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action:
              - events:PutEvents
            Resource: !GetAtt MyEventBus.Arn
      Roles:
        - !Ref PostConfirmationFunctionRole # This references the automatically generated IAM role for your Lambda function by SAM.
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 8</div>

<div style="color: #99ccff">Create a lambda function named EditAccountAPIKey, then create a custom eventbridge rule that invokes that function when it catches <span style="color: #00aa00">"Account Created"</span> Events. <span style="color: #00aa00">"Test that the function is being invoked by monitoring it with CloudWatch to ensure eventbridge is working correctly after creating a new user"</span></div>
</div>

<!--
  - Create EditAccountAPIKeyFunction
  - Create AccountCreatedRule ~ Type: "AWS::Events::Rule"
    - Additionally, designate EditAccountAPIKeyFunction as the target to trigger when the rule is activated.
  - Create EditAccountAPIKeyFunctionResourceBasedPolicy ~ allow AccountCreatedRule to invoke
 -->

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">EditAccountAPIKeyFunction, AccountCreatedRule, EditAccountAPIKeyFunctionResourceBasedPolicy</span></span>

```yaml
Resources:
  # ...

  EditAccountAPIKeyFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/edit-account-api-key
      Handler: index.handler
      Runtime: nodejs18.x
      Architectures:
        - x86_64
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2020"
        Sourcemap: true
        EntryPoints:
          - index.ts

  AccountCreatedRule:
    Type: "AWS::Events::Rule"
    Properties:
      EventBusName: !Ref MyEventBus
      EventPattern:
        source:
          - "account.created"
      Targets:
        - Id: EditAccountAPIKeyTarget
          Arn: !GetAtt EditAccountAPIKeyFunction.Arn

  EditAccountAPIKeyFunctionResourceBasedPolicy:
    Type: "AWS::Lambda::Permission"
    Properties:
      FunctionName: !Ref EditAccountAPIKeyFunction
      Action: lambda:InvokeFunction
      Principal: events.amazonaws.com
      SourceArn: !GetAtt AccountCreatedRule.Arn
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 9</div>

<div style="color: #99ccff">Update the EditAccountAPIKey lambda function to create a new API-key for the newly created users respective _id || sub. <span style="color: #00aa00">"Test by checking for the item being created in the API Keys table".</span>
</div>

### <span style="color: #ff3399">Create Resource <span style="color: skyblue">EditAccountAPIKeyFunctionPermissionPolicy</span></span>

```yaml
Resources:
  # ...

  # this updates the permission policy for the functions IAM Role to allow it to use the Actions: "dynamodb:PutItem, dynamodb:UpdateItem, dynamodb:DeleteItem"
  EditAccountAPIKeyFunctionPermissionPolicy:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: EditAccountAPIKeyFunctionPermissionPolicy
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:PutItem
              - dynamodb:UpdateItem
              - dynamodb:DeleteItem
            Resource: !GetAtt ApiKeysTable.Arn
      Roles:
        - !Ref EditAccountAPIKeyFunctionRole # This references the automatically generated IAM role for your Lambda function by SAM.
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 10</div>

<div style="color: #99ccff">Create a Serverless API, configure a cognito authorizer on it, update outputs section, and update .env variables on frontend.
</div>

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">CognitoAuthorizer, MyApi</span></span>

```yaml
Resources:
  # ...

  CognitoAuthorizer:
    Type: AWS::ApiGateway::Authorizer
    Properties:
      Name: cognitoAuthorizer
      IdentitySource: method.request.header.Authorization
      RestApiId: !Ref MyApi
      Type: COGNITO_USER_POOLS
      ProviderARNs:
        - !GetAtt UserPool.Arn

  MyApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Cors:
        AllowOrigin: "'*'"
        AllowMethods: "'GET, POST, PUT, DELETE'"
        AllowHeaders: "'Content-Type, Authorization'"
      DefinitionBody:
        swagger: "2.0"
        info:
          title: !Ref AWS::StackName
        securityDefinitions:
          CognitoAuthorizer:
            type: "apiKey"
            name: "Authorization"
            in: "header"
            x-amazon-apigateway-authtype: "cognito_user_pools"
            x-amazon-apigateway-authorizer:
              type: "cognito_user_pools"
              providerARNs:
                - !GetAtt UserPool.Arn
        paths:
        # paths will be added here as they are created
```

### <span style="color: #ff3399">Create Output <span style="color: skyblue">ApiGatewayEndpoint</span></span>

```yaml
Resources:
  # ...

  ApiGatewayEndpoint:
    Description: "The URL endpoint for the API Gateway"
    Value: !Sub "https://${MyApi}.execute-api.${AWS::Region}.amazonaws.com/prod"
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 11</div>

<div style="color: #99ccff">Create GetAccountAPIKey lambda function and configure it to just send basic json response. "Test API URL with service such as <span style="color: #00aa00">"PostMan || Thunder Client"</span> then update both the “/api-key” and "/billing" frontend pages to use the lambda function.
</div>

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">GetAccountApiKeyFunction, GetAccountApiKeyFunctionPermissionPolicy</span></span>

```yaml
Resources:
  # ...

  GetAccountApiKeyFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/get-account-api-key
      Handler: index.handler
      Runtime: nodejs18.x
      Architectures:
        - x86_64
      Events:
        MyApiEvent:
          Type: Api
          Properties:
            Path: /get-account-api-key
            Method: get
            RestApiId: !Ref MyApi
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2020"
        Sourcemap: true
        EntryPoints:
          - index.ts

  # # this updates the permission policy for the functions IAM Role to allow it to use the Action: "dynamodb:GetItem"
  GetAccountApiKeyFunctionPermissionPolicy:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: GetAccountApiKeyFunctionPermissionPolicy
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:GetItem
            Resource: !GetAtt ApiKeysTable.Arn
      Roles:
        - !Ref GetAccountApiKeyFunctionRole # This references the automatically generated IAM role for your Lambda function by SAM.
```

### <span style="color: #ff3399">Update Resource <span style="color: skyblue">MyApi</span></span>

```yaml
Resources:
  # ...

  MyApi:
    # ...
    paths:
      /get-account-api-key:
        get:
          responses: {}
          x-amazon-apigateway-integration:
            uri:
              Fn::Sub: arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${GetAccountApiKeyFunction.Arn}/invocations
            httpMethod: POST
            type: aws_proxy
          security:
            - CognitoAuthorizer: []
```

<br>

## <div style="font-weight: 500; "><div style="color: #eebb00; font-size: 1.5rem;">Step 12</div>

<div style="color: #99ccff">xxxxxxxxxxxx
</div>

### <span style="color: #ff3399">Create Resources <span style="color: skyblue">GetAccountApiKeyFunction</span></span>

```yaml
Resources:
  # ...

  GetAccountCreditCardFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/get-account-credit-card
      Handler: index.handler
      Runtime: nodejs18.x
      Architectures:
        - x86_64
      Events:
        MyApiEvent:
          Type: Api
          Properties:
            Path: /get-account-credit-card
            Method: get
            RestApiId: !Ref MyApi
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2020"
        Sourcemap: true
        EntryPoints:
          - index.ts

  # # this updates the permission policy for the functions IAM Role to allow it to use the Action: "dynamodb:GetItem" for the Resource: CreditCardsTable
  GetAccountCreditCardFunctionPermissionPolicy:
    Type: AWS::IAM::Policy
    Properties:
      PolicyName: GetAccountCreditCardFunctionPermissionPolicy
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:GetItem
            Resource: !GetAtt CreditCardsTable.Arn
      Roles:
        - !Ref GetAccountCreditCardFunctionRole # This references the automatically generated IAM role for your Lambda function by SAM.
```

### <span style="color: #ff3399">Update Resource <span style="color: skyblue">MyApi</span></span>

```yaml
Resources:
  # ...

  MyApi:
    # ...
    paths:
      /get-account-credit-card:
        get:
          responses: {}
          x-amazon-apigateway-integration:
            uri:
              Fn::Sub: arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${GetAccountCreditCardFunction.Arn}/invocations
            httpMethod: POST
            type: aws_proxy
          security:
            - CognitoAuthorizer: []
```

<br>

<!-- 12. create and edit ResetAccountAPIKey to allow free tier to reset key once a month, and paid teir once a week

x. update /api-key page to have reset key button

x. create the "ConfigureCardOnFile" function, have it take the options "valid" | "invalid" for card and update "cards" table

x. update /billing page to configure a card

x. create "GetCard" function "convert private card details to **\*\*\*** STARS", get metadata as well

x. update /billing page to get card details

x. create make payment function, have it get email from cognito using "sub"

x. create lambda layer for payment functions -->
