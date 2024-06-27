# NestJS Authentication

# Overview

```mermaid
graph TD
    A["User Request"]
    style A fill:#ffccaa,stroke:#ff7744,stroke-width:2px;
    
    subgraph "NestJS Application"
        B["Middleware"]
        style B fill:#ccffcc,stroke:#44ff44,stroke-width:2px;
        C["Guards"]
        style C fill:#ffccff,stroke:#ff44ff,stroke-width:2px;
        D["Controllers"]
        style D fill:#ffccaa,stroke:#ff7744,stroke-width:2px;
        E["Services"]
        style E fill:#ccffcc,stroke:#44ff44,stroke-width:2px;

        A --pre-processes request--> B
        B --validates authentication--> C
        C --controls access--> D
        D --handles business logic--> E

        subgraph "Authentication Strategies"
            F["Passport"]
            style F fill:#ffccff,stroke:#ff44ff,stroke-width:2px;
            G["Local"]
            style G fill:#ccffcc,stroke:#44ff44,stroke-width:2px;
            H["JWT"]
            style H fill:#ccffcc,stroke:#44ff44,stroke-width:2px;
            I["OAuth"]
            style I fill:#ccffcc,stroke:#44ff44,stroke-width:2px;
        end
    end

    subgraph "Security Modules"
        J["Encryption and Hashing"]
        style J fill:#ccffcc,stroke:#44ff44,stroke-width:2px;
        K["crypto"]
        style K fill:#ffccff,stroke:#ff44ff,stroke-width:2px;
        L["bcrypt"]
        style L fill:#ffccff,stroke:#ff44ff,stroke-width:2px;
    end

    E --uses library--> F
    F --supports strategy--> G
    F --supports strategy--> H
    F --supports strategy--> I
    G --provides authentication methods--> J
    H --provides authentication methods--> J
    I --provides authentication methods--> J
    J --performs cryptographic operations--> K
    J --hashes passwords--> L

```

## Sign Up Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthGuard
    participant AuthController
    participant AuthService
    participant UserService
    participant UserEntity
    participant Database

    Client->>AuthGuard: Request (POST /auth/signup)
    AuthGuard->>AuthController: Request passes guard
    AuthController->>AuthService: signup(user data)
    AuthService->>UserService: getByEmail(user.email)
    UserService->>Database: Query user by email
    Database-->>UserService: User not found
    UserService-->>AuthService: No existing user
    AuthService->>UserService: createUser(user data)
    UserService->>Database: Insert new user (hashed password)
    Database-->>UserService: Return new user
    UserService-->>AuthService: Return new user
    AuthService-->>AuthController: Return new user
    AuthController->>AuthGuard: Response
    AuthGuard->>Client: Response passes guard
    AuthController-->>Client: Return new user (JSON response)

```

## Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant LocalAuthGuard
    participant LocalStrategy
    participant AuthController
    participant AuthService
    participant UserService
    participant Database


    Client->>LocalAuthGuard: Request (POST /auth/login)
    LocalAuthGuard->>LocalStrategy: Validate credentials
    LocalStrategy->>AuthService: validateUser(username, password)
    AuthService->>UserService: getByEmail(username)
    UserService->>Database: Query user by email
    Database-->>UserService: Return user
    UserService-->>AuthService: Return user
    AuthService-->>LocalStrategy: Return user if valid
    LocalStrategy-->>LocalAuthGuard: User is valid
    LocalAuthGuard->>AuthController: Request passes guard
    AuthController-->>Client: Return user (JSON response)

```
## Order Retrieval Flow
```mermaid
sequenceDiagram
    participant Client
    participant JwtAuthGuard
    participant JwtStrategy
    participant AuthService
    participant UserService
    participant Database
    participant OrderController

    Client->>JwtAuthGuard: Request (GET /order)
    JwtAuthGuard->>JwtStrategy: Validate JWT token
    JwtStrategy->>AuthService: validate(payload)
    AuthService->>UserService: getByEmail(payload.username)
    UserService->>Database: Query user by email
    Database-->>UserService: Return user
    UserService-->>AuthService: Return user
    AuthService-->>JwtStrategy: Return user if valid
    JwtStrategy-->>JwtAuthGuard: User is valid
    JwtAuthGuard->>OrderController: Request passes guard
    OrderController-->>Client: Return order data (JSON response)

```


## Role Guards

```mermaid
sequenceDiagram
    participant Client
    participant NestJS
    participant RoleGuard
    participant Reflector
    participant Controller

    Client->>NestJS: HTTP Request
    NestJS->>RoleGuard: CanActivate call
    RoleGuard->>Reflector: Get handler roles
    Reflector-->>RoleGuard: Return handler roles
    RoleGuard->>Reflector: Get class roles
    Reflector-->>RoleGuard: Return class roles
    RoleGuard->>RoleGuard: Combine handler and class roles
    RoleGuard->>RoleGuard: Check if roles are defined
    RoleGuard->>NestJS: Return true (if no roles defined)
    RoleGuard->>RoleGuard: Retrieve user roles from request
    RoleGuard->>RoleGuard: Match roles with user roles
    RoleGuard-->>NestJS: Return true/false
    NestJS->>Controller: Call handler (if true)
    Controller-->>NestJS: Return response
    NestJS-->>Client: HTTP Response

```

## Execution Context

```mermaid
graph LR
    subgraph "Incoming Request"
        A[Request] --> B(Arguments)
        style A fill:#f9d423,stroke:#ff6600,stroke-width:2px
        style B fill:#f9d423,stroke:#ff6600,stroke-width:2px
    end

    subgraph "NestJS Components"
        C[Controller] --> D(Handler)
        style C fill:#8ec6c5,stroke:#2a9d8f,stroke-width:2px
        style D fill:#8ec6c5,stroke:#2a9d8f,stroke-width:2px
    end

    E([ExecutionContext])
    style E fill:#ffcccb,stroke:#ff4444,stroke-width:2px

    A --> E
    B --> E
    C --> E
    D --> E
    style E fill:#ffcccb,stroke:#ff4444,stroke-width:2px

```

Key Methods in ExecutionContext:

- `switchToHttp()`: Access the underlying HTTP request and response objects (if applicable).
- `getClass()`: Get the class of the controller handling the request.
- `getHandler()`: Get the specific handler method being executed.
- `getArgs()`: Get the arguments passed to the handler.

## JWT Guard

```mermaid
graph LR
   

    subgraph PassportStrategy
        B[PassportStrategy]
    end

    subgraph Your Custom Strategy
        D[JwtStrategy] -->|Extends| B
    end

    subgraph NestJS Guards
        E[AuthGuard] -->|Uses PassportStrategy| B
        F[JwtAuthGuard]
        F -->|Extends| E
    end
```
### JWT Strategy

```mermaid
classDiagram

class Passport {
  - strategy: Strategy
  + setStrategy(strategy: Strategy): void
  + authenticate(strategyName: string, options?: any): void 
}

class Strategy {
  <<interface>>
  +validate(payload: any): Promise<UserEntity> 
}

class JwtStrategy {
  +validate(payload: JwtPayload): Promise<UserEntity>
  -configService: ConfigService
  -userService: UserService
}

class LocalStrategy {
  +validate(username: string, password: string): Promise<UserEntity>
  -authService: AuthService
}

class GoogleStrategy {
  +validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): void
}

PassportStrategy <|-- JwtStrategy : "inherits from"
PassportStrategy <|-- LocalStrategy : "inherits from"
PassportStrategy <|-- GoogleStrategy : "inherits from"
Strategy <|.. JwtStrategy : "implements"
Strategy <|.. LocalStrategy : "implements"
Strategy <|.. GoogleStrategy : "implements"
Passport --> Strategy : "uses"
```
