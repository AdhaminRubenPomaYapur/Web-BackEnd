const Users = require('../models/Users')
const Clients = require('../models/Clients')
const Banks = require('../models/Banks')
const BranchOffices = require('../models/BranchOffices')
const Accounts = require('../models/Accounts')
const Transactions = require('../models/Transactions')
const Deposits = require('../models/Deposits')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");


require('dotenv').config({path:'variables.env'})

const CreateTokenUser = (User, secret, expiresIn) => {
    const {id, name, lastname, email, create, bankId} = User
    return jwt.sign({id, name, lastname, email, create, bankId}, secret, {expiresIn})
}

const CreateTokenBank = (Bank, secret, expiresIn) => {
    const {id, name} = Bank
    return jwt.sign({id, name}, secret, {expiresIn})
}

const resolvers = {
    Query: {
        //Users
        getUsers: async () => {
            try {
                return await Users.find({})
            } catch (e) {
                console.log(e)
            }
        },
        getUserID: async (_,{id}) => {
            try {
                return await Users.findById({_id:id})
            } catch (e) {
                console.log(e)
            }
        },
        getUserToken: async (_,{},context) => {
            return Users.findOne({_id:context.Authorization.id}).populate('bankId')
        },
        getUsersBank: async (_,{bankId}) => {
            const Bank = await Banks.findById({_id:bankId})
            if(!Bank)
                throw Error(`This bank don't exists in database`)

            try {
                return  await Users.find({bankId})
            } catch (e) {
                console.log(e)
            }
        },
        getUsersBankName: async (_, {name}) => {
            const Bank = await Banks.findOne({name})
            if(!Bank)
                throw Error(`This bank with name: ${name} don't exists in database`)

            try {
                return await Users.find({bankId:Bank.id})
            } catch (e) {
                console.log(e)
            }
        },

        //Clients
        getClients: async () => {
            try {
                return await Clients.find({})
            }catch (e) {
                console.log(e)
            }
        },
        getClient: async (_, {id}, context) => {
            const Client = await Clients.findById({_id:id})
            if(!Client)
                throw Error(`This client with id: ${id} don't exists in database`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permissions for view this clients`)

            try {
                return Client
            } catch (e) {
                console.log(e)
            }
        },
        getClientsUser: async (_,{},context) => {
            const User = await Users.findById({_id:context.Authorization.id})
            if(!User)
                throw Error(`This user with id: ${context.Authorization.id} don't exists in database`)

            try {
                return await Clients.find({userId:context.Authorization.id})
            } catch (e) {
                console.log(e)
            }
        },
        getClientsUsername: async (_,{email}) => {
            const User = await Users.findOne({email})
            if(!User)
                throw Error(`This user: ${email} don't exists in database`)

            try {
                return await Clients.find({userId:User.id})
            } catch (e) {
                console.log(e)
            }
        },

        //Banks
        getBanks: async () => {
            try {
                return await Banks.find({})
            } catch (e) {
                console.log(e)
            }
        },
        getBanksID: async (_, {id}) => {
            try {
                return await Banks.findById({_id:id})
            } catch (e) {
                console.log(e)
            }
        },
        getBankToken: async (_, {token}) => {
            const Bank = await jwt.verify(token, process.env.SECRET)
            return Bank
        },

        //BranchOffices
        getBranchOffices: async () => {
            try {
                return await BranchOffices.find({})
            } catch (e) {
                console.log(e)
            }
        },
        getBranchOfficeID: async (_, {id,bankId}) => {
            const BranchOffice = await BranchOffices.findById({_id:id})
            if(!BranchOffice)
                throw Error(`This branch with id: ${id} don't exists in the database`)

            const Bank = await Banks.findById({_id:bankId})
            if(!Bank)
                throw Error(`This bank with id: ${bankId} don't exists in the database`)

            if(BranchOffice.bankId.toString() !== Bank.id)
                throw Error(`This branch: ${BranchOffice.name} belongs to another bank `)

            try {
                return BranchOffice
            } catch (e) {
                console.log(e)
            }
        },
        getBranchOfficesBank: async (_, {bankId}) => {
            const Bank = await Banks.findById({_id:bankId})
            if(!Bank)
                throw Error(`This bank with id: ${bankId} don't exists in database`)

            try {
                return await BranchOffices.find({bankId})
            } catch (e) {
                console.log(e)
            }
        },
        getBranchOfficesBankName: async (_, {name}) => {
            const Bank = await Banks.findOne({name})
            if(!Bank)
                throw Error(`This bank with name: ${name} don't exists in the database`)

            try {
                return await BranchOffices.find({bankId:Bank.id})
            } catch (e) {
                console.log(e)
            }
        },

        //Accounts
        getAccounts: async () => {
            try {
                return await Accounts.find({})
            } catch (e) {
                console.log(e)
            }
        },
        getAccount: async (_,{id}) => {
            try {
                return await Accounts.findById({_id:id}).populate('clientId')
            } catch (e) {
                console.log(e)
            }
        },
        getAccountsClient: async (_,{clientId},context) => {
            const Client = await Clients.findById({_id:clientId})
            if(!Client)
                throw Error(`This client don't exists in the database`)
            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permission for manage this client`)
            try {
                return await Accounts.find({clientId}).populate('branchId')
            } catch (e) {
                console.log(e)
            }
        },

        //Transactions
        getTransactions: async (_,{},context) => {
            try {
                return await Transactions.find({userId:context.Authorization.id})
            } catch (e) {
                console.log(e)
            }
        },
        getAccountsBalanceClient: async (_,{branchId}) => {
            try {
                return  await Accounts.aggregate([
                    { $match: { branchId: new mongoose.Types.ObjectId(`${branchId}`)}},
                    { $group: { _id: "$clientId", totalBalance: { $sum: '$accountBalance'}}},
                    { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'client'}}
                ])
            } catch (e) {
                console.log(e)
            }
        },
        getClientTransferMore: async (_, {branchId}, context) => {
            const User = Users.findById({_id:context.Authorization.id})
            if(!User)
                throw Error(`This user don't exists`)

            const Branch = await BranchOffices.findById({_id:branchId})
            if(!Branch)
                throw Error(`This branch don't exists`)

            const accountsBranch = await Accounts.find({branchId})
            const TransactionsAccounts = await Transactions.find({})
            let clientSelect
            let cont = 0;


            for (const a of accountsBranch){
                let aux = 0
                for (const c of TransactionsAccounts){
                    if(a.id.toString() === c.accountOrigin.toString()){
                        aux++
                    }
                }
                if(aux > cont) {
                    cont = aux
                    clientSelect = a
                }
            }

            let ObjectReturn = {
                nameClient: '',
                nameBranch: '',
                transfer: 0
            }

            const Client = await Clients.findById({_id:clientSelect.clientId})
            const BranchOffice = await BranchOffices.findById({_id:clientSelect.branchId})

            ObjectReturn.nameClient = Client.name.toString()
            ObjectReturn.nameBranch = BranchOffice.name.toString()
            ObjectReturn.transfer = cont

            return ObjectReturn

        },
        getMajorClientsUser: async () => {
            const users = await Users.find({})
            if(!users)
                throw Error(`This users don't create`)

            let clients = []
            let cont = 0
            let objectUser
            for(const u of users){
                let aux = 0
                clients = await Clients.find({userId:u.id})
                for(c of clients){
                    aux++
                }
                if(aux > cont){
                    cont = aux
                    objectUser = u
                }

            }
            try {
                return await Users.findOne({_id:objectUser.id})
            } catch (e) {
                console.log(e)
            }
        },

        //Deposits
        getDeposits: async (_, {}, context) => {
            try {
                return await Deposits.find({userId:context.Authorization.id}).populate('clientId').populate('branchId')
            } catch (e) {
                console.log(e)
            }
        },
        getDeposit: async (_,{id}) => {
            try {
                return await Deposits.findById({_id:id})
            } catch (e) {
                console.log(e)
            }
        },
        getInfoClientMajorDeposit: async (_,{},context) => {

            let major = 0
            let DepositSelect
            const DepositClient = await Deposits.find({})
            const ClientsUser = await Clients.find({userId:context.Authorization.id})

            for(const a of DepositClient) {
                let aux = 0
                aux = a.amount
                if(aux > major){
                    major = aux
                    DepositSelect = a
                }
            }

            let ObjectView = {
                nameClient: '',
                AmountDeposit: 0,
                Coin: '',
                term: '',
                nameUser: ''
            }

            const Client = await Clients.findById({_id:DepositSelect.clientId})
            if(!Client)
                throw Error(`This client don't exists`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permissions deny`)

            const Branch = await BranchOffices.findById({_id:DepositSelect.branchId})
            if(!Branch)
                throw Error(`This branch don't exists`)

            const User = await Users.findById({_id:context.Authorization.id})
            if(!User)
                throw Error(`This user don't exists`)

            ObjectView.nameClient = Client.name
            ObjectView.AmountDeposit = DepositSelect.amount
            ObjectView.Coin = DepositSelect.coin
            ObjectView.term = DepositSelect.depositTerm
            ObjectView.nameUser = User.name
            
            return ObjectView





        }

    },

    Mutation: {
        //Users
        NewUser: async (_, {input}) => {
            const {email, password, dni, bankId} = input

            const Bank = await Banks.findById({_id:bankId})
            if(!Bank)
                throw Error(`This bank with id: ${bankId} don't exists in database`)

            const User = await Users.findOne({dni, email})
            if (User)
                throw Error(`The users with email: ${dni} exists in database`)

            const salt = await bcryptjs.genSaltSync(10)
            input.password = await bcryptjs.hash(password, salt)

            try {
                const newUser = new Users(input)
                await newUser.save()
                return newUser
            } catch (e) {
                console.log(e)
            }
        },
        AuthenticateUser: async (_, {input}) => {
            const {email, password, bankId} = input
            const User = await Users.findOne({email})
            if (!User)
                throw Error(`The user with email: ${email} don't exists in data base`)

            const Bank = await Banks.findById({_id:bankId})
            if(!Bank)
                throw Error(`This bank don't exists`)

            if(Bank.id.toString() !== User.bankId.toString())
                throw Error(`This user do not belongs to this bank`)

            const PasswordCorrect = await bcryptjs.compare(password, User.password)
            if (!PasswordCorrect)
                throw Error(`This password ${password} isn't correct`)

            return {token: CreateTokenUser(User, process.env.SECRET, 300000)}
        },

        //Clients
        NewClient: async (_,{input}, context) => {
            const { dni, telephone } = input
            let Client = await Clients.findOne({dni})
            if(Client || await Users.findOne({dni}))
                throw Error(`This dni: ${dni} exists in the database`)

            Client = await Clients.findOne({telephone})
            if(Client && Client.telephone === telephone)
                throw Error(`This telephone: ${telephone} belongs to another client`)

            try {
                const newClient = new Clients(input)
                newClient.userId = context.Authorization.id
                await newClient.save()
                return newClient
            } catch (e) {
                console.log(e)
            }
        },
        UpdateClient: async (_,{id, input}, context) => {
            let Client = await Clients.findById({_id:id})
            if(!Client)
                throw Error(`This client with id: ${id} don't exists in the database`)


            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permissions of the clients`)

            const { dni, telephone } = input

            Client = await Clients.findOne({dni})
            if(Client && Client.dni !== dni || await Users.findOne({dni}))
                throw Error(`This client with name: ${dni} exists in the database`)

            Client = await Clients.findOne({telephone})
            if(Client && Client.telephone !== telephone)
                throw Error(`This telephone: ${telephone} belongs to other client`)

            Client = await Clients.findByIdAndUpdate({_id:id}, input, {new:true})
            return Client
        },
        DeleteClient: async (_,{id}, context) => {
            const Client = await Clients.findById({_id:id})
            if(!Client)
                throw Error(`This client with id: ${id} don't exists`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permissions of the clients`)

            const AccountsClient = await Accounts.find({clientId:id})
            for(const a of AccountsClient){
                const TransactionsClient = await Transactions.find({_id:a.id})
                for(const t of TransactionsClient){
                    await Transactions.findByIdAndDelete({_id:t.id})
                }
                await Accounts.findByIdAndDelete({_id:a.id})
            }
            try {
                await Clients.findByIdAndDelete({_id:id})
                return 'This client delete successful'
            } catch (e) {
                console.log(e)
            }
        },

        //Banks
        NewBank: async (_, {input}) => {
            const {name} = input
            const Bank = await Banks.findOne({name})
            if(Bank)
                throw Error(`The bank with name ${name} exists in database`)

            try {
                const newBank = new Banks(input)
                await newBank.save()
                return newBank
            } catch (e) {
                console.log(e)
            }
        },
        AuthenticateBank: async (_, {id}) => {
            const Bank = await Banks.findById({_id:id})
            if(!Bank)
                throw Error(`This bank: ${name} don't exists in the database`)

            try {
                return {token: CreateTokenBank(Bank, process.env.SECRET, 300000 )}
            } catch (e) {
                console.log(e)
            }
        },
        UpdateBank: async (_,{id, input}) => {
            let Bank = await Banks.findById({_id:id})
            if (!Bank)
                throw Error(`This bank with id: ${id} don't exists in database`)

            const {name} = input
            Bank = await Banks.findOne({name})
            if(Bank && Bank.id !== id)
                throw Error(`There is already a bank with this name ${name}`)

            try {
                Bank = await Banks.findByIdAndUpdate({_id:id}, input, {new:true})
                return Bank
            } catch (e) {
                console.log(e)
            }
        },
        DeleteBank: async (_, {id}) => {
            const Bank = await Banks.findById({_id:id})
            if (!Bank)
                throw Error(`This bank with id: ${id} don't exists in database`)

            try {
                await Banks.findByIdAndDelete({_id:id})
                return `The bank: ${Bank.name} delete successful`
            } catch (e) {
                console.log(e)
            }
        },

        //BranchOffices
        NewBranchOffices: async (_, {input}) => {
            const {name, address, bankId} = input

            const Bank =  await Banks.findById({_id:bankId})
            if(!Bank)
                throw Error(`This bank with id: ${bankId} don't exists in database`)

            let BranchOffice = await BranchOffices.findOne({ address })
            if(BranchOffice)
                throw Error(`This exists address: ${address} for other branchOffices`)

            BranchOffice = await BranchOffices.find({name})
            for( const branch of BranchOffice ) {
                if(branch && branch.bankId.toString() === bankId)
                    throw Error(`A branch with this name: ${branch.name} already exists for this bank: ${Bank.name}`)
            }

           try {
                const newBranchOffice = new BranchOffices(input)
                await newBranchOffice.save()
                return newBranchOffice
            } catch (e) {
                console.log(e)
            }
        },
        UpdateBranchOffices: async (_,{id, input}) => {
            const {name, address, bankId} = input

            const Bank = await Banks.findById({_id:bankId})
            if(!Bank)
                throw Error(`This bank with id: ${bankId} doesn't exists in the database`)

            let BranchOffice = await BranchOffices.findOne({name, bankId})
            if(!BranchOffice)
                throw Error(`This branchOffice with id: ${name} don't exists in the database or does not belong to this bank: ${Bank.name} `)

            if(BranchOffice.id !== id){
                throw Error(`This branch with name: ${name} exists in database`)
            }

            if( BranchOffice.address !== address ) {
                if (await BranchOffices.findOne({address})) {
                    throw Error(`This address: ${address} exists in database for other branch`)
                }
            }

            try {
                BranchOffice = await BranchOffices.findByIdAndUpdate({_id:id}, input, {new:true})
                return BranchOffice
            } catch (e) {
                console.log(e)
            }
        },
        DeleteBranchOffices: async (_,{id}) => {
            const BranchOffice = await BranchOffices.findById({_id:id})
            if(!BranchOffice)
                throw Error(`This branchOffice with id: ${id} don't exists in database`)
            try {
                await BranchOffices.findByIdAndDelete({_id:id})
                return 'This Branch delete Successful'
            } catch (e) {
                console.log(e)
            }
        },

        //Accounts
        NewAccount: async (_, {input}, context) => {
            const {clientId, branchId, numberAccount, accountBalance} = input

            const Client = await Clients.findById({_id:clientId})
            if(!Client)
                throw Error(`This client with id: ${clientId} don't exists in the database`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permissions for view this client`)

            const BranchOffice = await BranchOffices.findById({_id:branchId})
            if(!BranchOffice)
                throw Error(`This branch with id: ${branchId} don't exists in the database`)

            const Bank = await Banks.findOne({bankId:BranchOffice.bankId})
            if(!Bank)
                throw Error(`This bank with id: ${BranchOffice.bankId} don't exists`)

            let Account = []
            let clients = await Clients.find({userId:context.Authorization.id})

            for(const client of clients){
                Account = await Accounts.find({clientId:client.id})
                for(const account of Account) {
                    if(account.bankId.toString() !== BranchOffice.bankId.toString())
                        throw Error(`This user: ${context.Authorization.name} only manages bank clients: ${Bank.name}`)
                }
            }

            let account = await Accounts.findOne({numberAccount})
            if(account)
                throw Error(`This number account: ${numberAccount} already exists in the database`)

            Client.current_balance = Client.current_balance + accountBalance
            await Clients.findByIdAndUpdate({_id:clientId}, Client, {new:true})

            try {
                const newAccount = new Accounts(input)
                newAccount.bankId = Bank.id
                await newAccount.save()
                return newAccount
            } catch (e) {
                console.log(e)
            }

        },
        UpdateAccount: async (_, {id, input}, context) => {
            const {clientId, branchId, numberAccount, accountBalance} = input
            let Account = await Accounts.findById({_id:id})
            if(!Account)
                throw Error(`This Account with id: ${id} don't exists in the database`)

            if(await Accounts.findOne({numberAccount}) && Account.numberAccount !== numberAccount)
                throw Error(`This number Account already exists in the database do not belongs to this Account`)

            let Client = await Clients.findById({_id:clientId})
            if(!Client)
                throw Error(`This client with id: ${clientId} don't exists in the database`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permissions for manage this client`)

            if(Account.clientId.toString() !== clientId)
                throw Error(`This Account belongs to another client: ${Client.name}`)

            let Branch = await BranchOffices.findById({_id:branchId})
            if(!Branch)
                throw Error(`This branch with id: ${branchId} don't exists in the database`)

            let Bank = await Banks.findById({_id:Account.bankId})
            if(!Bank)
                throw Error(`This bank with id: ${Bank.id} don't exists in the database`)

            if(Account.branchId.toString() !== branchId && Branch.bankId.toString() !== Account.bankId.toString()){
                throw Error(`This Account belongs to another bank`)
            }

            if(accountBalance === 0)
                throw Error(`This account balance different of zero`)

            Client.current_balance = Client.current_balance - Account.accountBalance
            Client.current_balance = Client.current_balance + accountBalance

            await Clients.findByIdAndUpdate({_id:Client.id}, Client, {new:true})

            try {
                return await Accounts.findByIdAndUpdate({_id:id}, input, {new:true})
            } catch (e) {
                console.log(e)
            }
        },
        DeleteAccount: async (_,{id, clientId, branchId}, context) => {
            const Account = await Accounts.findById({_id:id})
            if(!Account)
                throw Error(`This account with id: ${id} don't exists`)

            let Client = await Clients.findById({_id:clientId})
            if(!Client)
                throw Error(`This client with id: ${id} don't exists`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permissions for manage this client`)

            const Branch = await BranchOffices.findById({_id:branchId})
            if(!Branch)
                throw Error(`This branch with id: ${branchId} don't exists`)

            if (Account.clientId.toString() !== clientId)
                throw Error(`This client does not own this bank account`)

            if(Account.branchId.toString() !== branchId)
                throw Error(`This branch does not have this bank account`)

            if(Account.bankId.toString() !== Branch.bankId.toString())
                throw Error(`This bank does not have this bank account `)

            Client.current_balance = Client.current_balance - Account.accountBalance
            await Clients.findByIdAndUpdate({_id:clientId}, Client, {new:true})
            await Accounts.findByIdAndDelete({_id:id})
            return `This account by client: ${Client.name} delete successful`

        },

        //Transactions
        NewTransaction: async (_,{input}, context) => {
            const {accountOrigin, accountDestination, amount} = input

            let AccountOrg = await Accounts.findById({_id: accountOrigin})
            if (!AccountOrg)
                throw Error(`This Account origin don't exists in the database`)

            let AccountDes = await Accounts.findById({_id: accountDestination})
            if (!AccountDes)
                throw Error(`This Account destination don't exists in the database`)

            if(AccountOrg.bankId.toString() !== AccountDes.bankId.toString())
                throw Error(`This Accounts do not belongs to the same bank `)

            const ClientOrigin = await Clients.findById({_id:AccountOrg.clientId})
            if(!ClientOrigin)
                throw Error(`This client of the account origin don't exists`)

            const ClientDestination = await Clients.findById({_id:AccountDes.clientId})
            if(!ClientDestination)
                throw Error(`This client of the account destination don't exists`)

            if(ClientOrigin.userId.toString() !== context.Authorization.id )
                throw Error(`This client origin do not belongs to this User: ${context.Authorization.name}`)

            if(ClientDestination.userId.toString() !== context.Authorization.id)
                throw Error(`This client origin do not belongs to this User: ${context.Authorization.name}`)

            if(amount > AccountOrg.accountBalance)
                throw Error(`The amount is greater than your current balance`)


            AccountOrg.accountBalance = AccountOrg.accountBalance - amount
            AccountDes.accountBalance = AccountDes.accountBalance + amount

            await Accounts.findByIdAndUpdate({_id:accountOrigin}, AccountOrg, {new:true})
            await Accounts.findByIdAndUpdate({_id:accountDestination}, AccountDes, {new:true})

            if(ClientOrigin.id.toString() === ClientDestination.id.toString()){
                const AccountsClient = await Accounts.find({clientId:ClientOrigin.id})
                let total = 0
                for(const a of AccountsClient) {
                    total = total + a.accountBalance
                }
                ClientDestination.current_balance = total
            }else {
                ClientOrigin.current_balance = ClientOrigin.current_balance - amount
                ClientDestination.current_balance = ClientDestination.current_balance + amount
            }

            await Clients.findByIdAndUpdate({_id:AccountOrg.clientId}, ClientOrigin, {new:true})
            await Clients.findByIdAndUpdate({_id:AccountDes.clientId}, ClientDestination, {new:true})

            try {
                const newTransaction = new Transactions(input)
                newTransaction.userId = context.Authorization.id
                return  await newTransaction.save()
            } catch (e) {
                console.log(e)
            }
        },
        DeleteTransaction: async (_,{id},context) => {
            const Transaction = await Transactions.findById({_id:id})
            if(!Transaction)
                throw Error(`This transactions don't exists`)

            if(Transaction.userId.toString() !== context.Authorization.id)
                throw Error(`This transactions don't belongs to this user`)

            const { amount } = Transaction

            const AccountOrigin = await Accounts.findById({_id:Transaction.accountOrigin})
            if(!AccountOrigin)
                throw Error(`This account origin don't exists`)

            const AccountDestination = await Accounts.findById({_id:Transaction.accountDestination})
            if(!AccountDestination)
                throw Error(`This account destination don't exists`)

            const ClientOrigin = await Clients.findById({_id:AccountOrigin.clientId})
            if(!ClientOrigin)
                throw Error(`This client origin don't exists`)

            const ClientDestination = await Clients.findById({_id:AccountDestination.clientId})
            if(!ClientDestination)
                throw Error(`This client destination don't exists`)

            if(ClientOrigin.userId.toString() !== context.Authorization.id && ClientDestination.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permission for manage this clients`)

            if(AccountDestination.accountBalance > amount){
                AccountDestination.accountBalance = AccountDestination.accountBalance - amount
                AccountOrigin.accountBalance = AccountOrigin.accountBalance + amount
            }else{
                throw Error(`insufficient balance`)
            }

            await Accounts.findByIdAndUpdate({_id:AccountOrigin.id}, AccountOrigin, {new:true})
            await Accounts.findByIdAndUpdate({_id:AccountDestination.id}, AccountDestination, {new:true})

            if(ClientOrigin.id.toString() !== ClientDestination.id.toString()){
                ClientDestination.current_balance = ClientDestination.current_balance - amount
                ClientOrigin.current_balance = ClientOrigin.current_balance + amount
            }else {
                const AccountsClient = await Accounts.find({clientId:ClientOrigin.id})
                let total = 0
                for(const a of AccountsClient) {
                    total = total + a.accountBalance
                }
                ClientOrigin.current_balance = total
            }

            await Clients.findByIdAndUpdate({_id:AccountDestination.clientId}, ClientDestination, {new:true})
            await Clients.findByIdAndUpdate({_id:AccountOrigin.clientId}, ClientOrigin, {new:true})

            try {
                await Transactions.findByIdAndDelete({_id:id})
                return 'Transaction invert'
            } catch (e) {
                console.log(e)
            }

        },

        //Deposits
        NewDeposit: async (_, {input}, context) => {
            const { clientId, branchId, depositTerm, coin, amount } = input

            const User = await Users.findById({_id:context.Authorization.id})
            if(!User)
                throw Error(`This user don't exists`)

            const Client = await Clients.findById({_id:clientId})
            if(!Client)
                throw Error(`This client don't exists`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permission for manage this client`)

            if(amount < 0 )
                throw Error(`This amount is negative`)

            // if(amount > Client.current_balance)
            //     throw Error(`The amount is greater than the customer's balance`)

            Client.current_balance = Client.current_balance + amount
            await Clients.findByIdAndUpdate({_id:clientId}, Client, {new:true})

            const Branch = await BranchOffices.findById({_id:branchId})
            if(!Branch)
                throw Error(`This branch don't exists`)

            try {
                const newDeposits = new Deposits(input)
                newDeposits.userId = context.Authorization.id
                newDeposits.amount = amount
                await newDeposits.save()
                return newDeposits
            } catch (e) {
                console.log(e)
            }
        },
        UpdateDeposit: async (_,{id, input}, context) => {
            let { clientId, branchId , amount } = input
            input.dateDeposit = Date.now()

            let Deposit = await Deposits.findById({_id:id})
            if(!Deposit)
                throw Error(`This deposit don't exists in the database`)

            const User = await Users.findById({_id:context.Authorization.id})
            if(!User)
                throw Error(`This user don't exists`)

            const Client = await Clients.findById({_id:clientId})
            if(!Client)
                throw Error(`This client don't exists`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permission for manage this client`)

            const Branch = await BranchOffices.findById({_id:branchId})
            if(!Branch)
                throw Error(`This branch don't exists`)

            if(amount === 0)
                throw Error(`This amount different to zero`)

            if(amount < 0 )
                throw Error(`This amount is negative`)

            if(amount >= Deposit.amount){
                Client.current_balance = Client.current_balance + (amount - Deposit.amount)
            }else{
                Client.current_balance = Client.current_balance - (Deposit.amount - amount)
            }

            await Clients.findByIdAndUpdate({_id:clientId}, Client, {new:true})

            try {
                Deposit = await Deposits.findByIdAndUpdate({_id:id}, input, {new:true})
                return Deposit
            } catch (e) {
                console.log(e)
            }
        },
        DeleteDeposit: async (_,{id},context) => {
            const Deposit = await Deposits.findById({_id:id})
            if(!Deposit)
                throw Error(`This deposit don't exists`)

            const Client = await Clients.findById({_id:Deposit.clientId})
            if(!Client)
                throw Error(`This client don't exists in the database`)

            if(Client.userId.toString() !== context.Authorization.id)
                throw Error(`You aren't permission for manage this client`)

            Client.current_balance = Client.current_balance - Deposit.amount

            await Clients.findByIdAndUpdate({_id:Deposit.clientId}, Client, {new:true})

            await Deposits.findByIdAndDelete({_id:id})
            return 'Delete Successful'

        }

    }
}

module.exports = resolvers