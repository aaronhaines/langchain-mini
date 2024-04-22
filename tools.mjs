import { Parser } from "expr-eval";
import env from "dotenv";
env.config();

// Simple calculator function
const calc = (input) => Parser.evaluate(input).toString();

// use serpapi to answer the question
const googleSearch = async (question) =>
  await fetch(
    `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`
  )
    .then((res) => res.json())
    .then((res) => {
      // try to pull the answer from various components of the response
      return res.shopping_results?.map(
        (item) => item.title + " (" + item.price + ")"
      );
    });

export { googleSearch, calc };
