const { gql } = require('apollo-server')

const typeDefs = gql `
    type Bank {
        id: ID
        name: String
    }
    input BankInputs {
        name: String!
    }
    
    type User {
        id: ID
        name: String
        lastname: String
        dni: String
        email: String
        create: String
        bankId: ID
    }
    
    type UserBank {
        id: ID
        name: String
        lastname: String
        dni: String
        email: String
        create: String
        bankId: Bank
    }
    
    input UserInputs {
        name: String!
        lastname: String!
        dni: String!
        email: String!
        password: String!
        bankId: ID!
    }
    input AuthenticateUserInput {
        email: String!
        password: String!
        bankId: ID!
    }

    type BranchOffice {
        id: ID
        name: String
        address: String
        bankId: ID
    }
    input BranchOfficeInputs {
        name: String
        address: String
        bankId: ID!
    }
    
    type Client {
        id: ID
        name: String
        lastname: String
        dni: String
        address: String
        telephone: String
        current_balance: Float
        typeClient: Client_type
        userId: ID
    }
    input ClientInputs {
        name: String!
        lastname: String!
        dni: String!
        address: String!
        telephone: String!
    }
    
    input ClientUpdateInputs {
        name: String
        lastname: String
        dni: String
        address: String
        telephone: String
        typeClient: Client_type
    }
    
    enum Client_type {
        CATEGORY_A
        CATEGORY_B
        CATEGORY_C
    }
    
    type Account {
        id: ID
        clientId: ID
        bankId: ID
        branchId: ID
        numberAccount: String
        accountBalance: Float
        typeAccount: Account_type
    }
    
    type AccountModify {
        id: ID
        clientId: ID
        bankId: ID
        branchId: BranchOffice
        numberAccount: String
        accountBalance: Float
        typeAccount: Account_type
    }
    
    type AccountClient {
        id: ID
        clientId: Client
        bankId: ID
        branchId: ID
        numberAccount: String
        accountBalance: Float
        typeAccount: Account_type
    }
    
    input AccountInputs {
        clientId: ID
        branchId: ID
        numberAccount: String
        accountBalance: Float
        typeAccount: Account_type
    }
    enum Account_type {
        SAVINGS_BANK
        CURRENT_ACCOUNT
    }

    type Transactions {
        id: ID
        accountOrigin: ID
        accountDestination: ID
        amount: Float
        userId: ID
    }
    input TransactionInputs {
        accountOrigin: ID
        accountDestination: ID
        amount: Float
    }
    #Pregunta 1
    type Deposits {
        id: ID
        userId: ID
        clientId: ID
        branchId: ID
        dateDeposit: String
        depositTerm: TermPlace
        coin: CoinValue
        amount: Float
    }
    
    type DepositsModify {
        id: ID
        userId: ID
        clientId: Client
        branchId: BranchOffice
        dateDeposit: String
        depositTerm: TermPlace
        coin: CoinValue
        amount: Float
    }
    
    input DepositsInputs {
        clientId: ID
        branchId: ID
        depositTerm: TermPlace
        coin: CoinValue
        amount: Float
    }
    
    
    #Pregunta 2
    type InfoClientMajorDeposit {
        nameClient: String,
        AmountDeposit: Float,
        Coin: String
        term: String
        nameUser: String
    }

    enum CoinValue {
        BOL
        USD
    }

    enum TermPlace {
        SIX_MONTHS
        TWELVE_MONTHS
        TWENTY_FOUR_MONTHS
    }
    
    
    
    
    type Token {
        token: String
    }
    
    type BalanceClient {
        totalBalance: Float
        client: [Client]
    }
    type ClientTransferMore {
        nameClient: String
        nameBranch: String
        transfer: Int
    }
    

    type Query {
        #Users
        getUsers: [User]
        getUserID(id: ID!): User
        getUserToken: UserBank
        getUsersBank(bankId: ID!): [User]
        getUsersBankName(name: String!): [User]
        
        #Clients
        getClients: [Client]
        getClient(id: ID!): Client
        getClientsUser: [Client]
        getClientsUsername(email: String!): [Client]
        
        #Banks
        getBanks: [Bank]
        getBanksID(id: ID!): Bank
        getBankToken(token: String): Bank
        
        #BranchOffices
        getBranchOffices: [BranchOffice]
        getBranchOfficeID(id: ID!, bankId: ID!): BranchOffice
        getBranchOfficesBank(bankId: ID!): [BranchOffice]
        getBranchOfficesBankName(name: String!): [BranchOffice]

        #Account
        getAccounts: [Account]
        getAccount(id: ID!): AccountClient
        getAccountsClient(clientId: ID!): [AccountModify]
        
        
        #Transactions
        getTransactions: [Transactions]
        getAccountsBalanceClient(branchId: ID!): [BalanceClient]
        getClientTransferMore(branchId: ID!): ClientTransferMore
        getMajorClientsUser: User
        
        #Deposits
        getDeposits: [DepositsModify]
        getDeposit(id: ID!): Deposits
        getInfoClientMajorDeposit: InfoClientMajorDeposit
        
        
        
    }
    
    type Mutation {
        #Users
        NewUser(input: UserInputs): User
        AuthenticateUser(input: AuthenticateUserInput): Token
        
        #Clients
        NewClient(input: ClientInputs): Client
        UpdateClient(id: ID!, input: ClientUpdateInputs): Client
        DeleteClient(id: ID!): String
        
        #Banks
        NewBank(input: BankInputs): Bank
        AuthenticateBank(id: ID!): Token
        UpdateBank(id: ID!, input: BankInputs): Bank
        DeleteBank(id: ID!): String
        
        #BranchOffices
        NewBranchOffices(input: BranchOfficeInputs): BranchOffice
        UpdateBranchOffices(id: ID!, input: BranchOfficeInputs): BranchOffice
        DeleteBranchOffices(id: ID!): String
        
        #Accounts
        NewAccount(input: AccountInputs): Account
        UpdateAccount(id: ID!, input: AccountInputs): Account
        DeleteAccount(id: ID!, clientId: ID!, branchId: ID!): String
        
        #Transactions
        NewTransaction(input: TransactionInputs): Transactions
        DeleteTransaction(id: ID!): String
        
        #Deposits
        NewDeposit(input: DepositsInputs): Deposits
        UpdateDeposit(id: ID!, input: DepositsInputs): Deposits
        DeleteDeposit(id: ID!): String
    }
`

module.exports = typeDefs