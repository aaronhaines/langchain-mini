import { Parser } from "expr-eval";
import env from "dotenv";
env.config();

// Simple calculator function
const calc = (input) => Parser.evaluate(input).toString();

// use serpapi to answer the question
const googleShopping = async (question) =>
  await fetch(
    `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}&engine=google_shopping`
  )
    .then((res) => res.json())
    .then((res) => {
      res = res.shopping_results.map((item) => {
        return {
          title: item.title,
          price: item.price,
        };
      });

      return JSON.stringify(res);
    });

export { googleShopping, calc };
