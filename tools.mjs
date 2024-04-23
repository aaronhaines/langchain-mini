import { Parser } from "expr-eval";
import env from "dotenv";
env.config();

// Simple calculator function
const calc = (input) => Parser.evaluate(input).toString();

const googleShoppingx = (question) => {
  return '[{"title":"Onn. 32" Class 720p HD LED Roku Smart TV","price":"$88.00"},{"title":"Insignia - 19" Class LED HD TV","price":"$59.99"},{"title":"Insignia NS-24F202NA23 2022 Model All-New Class F20 Series Smart Full HD 1080p ...","price":"$79.99"},{"title":"Insignia - 40" Class LED Full HD TV","price":"$139.99"},{"title":"TCL 32S350G 32 inch Class S3 1080p LED HDR Smart TV","price":"$149.99"}]';
};
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

      return JSON.stringify(res.slice(0, 5));
    });

export { googleShopping, calc };
