import {
  createPortfolio,
  getUserPortfolios,
} from "./src/services/portfolioService.js";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  try {
    const newPortfolio = await createPortfolio(
      email,
      password,
      "My Test Portfolio"
    );
    console.log("Created portfolio:", newPortfolio);

    const portfolios = await getUserPortfolios(email, password);
    console.log("User portfolios:", portfolios);
  } catch (err) {
    console.error(err);
  }
})();
