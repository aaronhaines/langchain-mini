import fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { googleShopping, calc } from "./tools.mjs";

import {
  getAccounts,
  getBalance,
  transferFundsBetweenAccounts,
} from "./bank.mjs";

import env from "dotenv";
env.config();

// Get the command-line arguments
const args = process.argv;
const debug = args.length > 2 && args[2] == "debug";

const rl = readline.createInterface({ input, output });
const promptTemplate = fs.readFileSync("prompt.txt", "utf8");
const mergeTemplate = fs.readFileSync("merge.txt", "utf8");

// tools that can be used to answer questions
const tools = {
  search: {
    description:
      "A shopping search engine. Useful for \
      when you need to find prices for items. \
      Input should be a search query.",
    execute: googleShopping,
  },
  calculator: {
    description:
      "Useful for getting the result of a math expression. \
      The input to this tool should be a valid mathematical \
      expression that could be executed by a simple calculator.",
    execute: calc,
  },
  getAccountsList: {
    description:
      "Useful for getting a list of all bank accounts for a user. \
      The list will contain the sort code and account number and \
      type of each account",
    execute: getAccounts,
  },
  getAccountBalance: {
    description:
      "Useful for getting the balance of a single specific \
      bank account. Input should be in valid JSON format \
      { account_number:8 digit account number, sort_code:6 digit sort code }",
    execute: getBalance,
  },
  transferFunds: {
    description:
      "Useful for moving money from one account to another. \
      Input shold be an 8 digit account number and a 6 digit \
      sort code for the source and destination accounts in valid JSON \
      format {source:{acc_num:, sort_code:}, destination:{acc_num:, sort_code:}, amount:}",
    execute: transferFundsBetweenAccounts,
  },
};

// use GPT to complete a given prompts
const completePrompt = async (prompt) =>
  await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 256,
      temperature: 0.7,
      stream: false,
      stop: ["Observation:"],
    }),
  })
    .then((res) => res.json())
    .then((res) => res.choices[0].message.content)
    .then((res) => {
      return res;
    });

const answerQuestion = async (question) => {
  // construct the prompt, with our question and the tools that the chain can use
  let prompt = promptTemplate
    .replace("${question}", question)
    .replace(
      "${tools}",
      Object.keys(tools)
        .map((toolname) => `${toolname}: ${tools[toolname].description}`)
        .join("\n")
    )
    .replace("${tool-names}", Object.keys(tools).join(","));

  if (debug) console.log("\x1b[91m" + prompt + "\x1b[0m");

  // allow the LLM to iterate until it finds a final answer
  while (true) {
    const response = await completePrompt(prompt);

    if (debug) console.log("\x1b[32m" + response + "\x1b[0m");

    // add this to the prompt
    prompt += response;

    const action = response.match(/Action: (.*)/)?.[1];
    const tool = action ? tools[action.trim()] : null;

    if (tool) {
      // execute the action specified by the LLMs
      const actionInput = response.match(/Action Input: "?(.*)"?/)?.[1];
      const result = await tool.execute(actionInput);

      if (debug)
        console.log("\x1b[32m" + `Observation: ${result}\n` + "\x1b[0m");

      prompt += `Observation: ${result}\n`;
    } else {
      return response.match(/Final Answer: (.*)/s)?.[1];
    }
  }
};

// merge the chat history with a new question
const mergeHistory = async (question, history) => {
  const prompt = mergeTemplate
    .replace("${question}", question)
    .replace("${history}", history);
  return await completePrompt(prompt);
};

// main loop - answer the user's questions
let history = "";
while (true) {
  let question = await rl.question("How can I help? ");
  if (history.length > 0) {
    question = await mergeHistory(question, history);
  }
  const answer = await answerQuestion(question);
  console.log(answer);
  history += `Q:${question}\nA:${answer}\n`;
}
