import env from "dotenv";
env.config();

let accounts = [
  {
    account_number: "12345678",
    sort_code: "333333",
    type: "current",
    currency: "GBP",
  },
  {
    account_number: "09876543",
    sort_code: "999999",
    type: "savings",
    currency: "GBP",
  },
];

let balances = [
  {
    account_number: "12345678",
    sort_code: "333333",
    balance: 1000,
  },
  {
    account_number: "09876543",
    sort_code: "999999",
    balance: 500,
  },
];

// Get the list of accounts
const getAccounts = () => JSON.stringify(accounts);

// Get the balance for a specific accopunt
const getBalance = async (input) => {
  let acc = JSON.parse(input);
  let accNum = acc?.account_number;
  // let accNum = question.match(/\d{8}/);

  if (!accNum) return "Invalid account number";

  let a = balances.find(({ account_number }) => account_number == accNum);
  return a ? a.balance : "Unable to retrieve balance";
};

// Transfer funds from source account to destination account
const transferFundsBetweenAccounts = async (input) => {
  let transfer = JSON.parse(input);
  let sourceAccount = transfer?.source?.acc_num;
  let destinationAccount = transfer?.destination?.acc_num;
  let amount = transfer.amount;

  if (!sourceAccount) return "Incorrect account number";
  if (!destinationAccount) return "Incorrect account number";

  let s = balances.find(
    ({ account_number }) => account_number == sourceAccount
  );
  let d = balances.find(
    ({ account_number }) => account_number == destinationAccount
  );

  if (s.balance < amount) return "Insufficient funds";

  d.balance += amount;
  s.balance -= amount;

  return "Success. New balances are:";
};

////////////////////////////////

// const accessToken = {
//   access_token: process.env.MONZO_ACCESS_TOKEN,
//   client_id: process.env.MONZO_CLIENT_ID,
//   expires_in: process.env.MONZO_EXPIRES_IN,
//   refresh_token: process.env.MONZO_REFRESH_TOKEN,
//   scope: process.env.MONZO_SCOPE,
//   token_type: process.env.MONZO_TOKEN_TYPE,
//   user_id: process.env.MONZO_USER_ID,
// };

// const getMonzoAccounts = async (question) => {
//     const accountsUrl = 'https://api.monzo.com/accounts';
//     const { token_type, access_token } = accessToken;

//     const res = await fetch(accountsUrl, {
//        headers: {
//          Authorization: `${token_type} ${access_token}`
//        }
//      })

//     const { accounts } = await res.json();

//     return accounts;
//   };

export { getAccounts, getBalance, transferFundsBetweenAccounts };
