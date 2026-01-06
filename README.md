<a id="readme-top"></a>

<br />
<div align="center">
  <h3 align="center">FinSight</h3>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#features">Features</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributors</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

**FinSight** is a full-stack web application designed to bring clarity to your personal finances and investments. The platform integrates real-time stock prices, portfolio tracking, transaction management, and visual analytics to provide a comprehensive overview of financial health.

Key goals:

- Provide intuitive dashboards and charts
- Track portfolios, transactions, and market positions
- Enable real-time live price updates
- Ensure secure, RLS-compatible multi-user architecture via Supabase

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![React][React.js]][React-url]
- [![Node][Node.js]][Node-url]
- [![PostgreSQL][PostgreSQL]][Postgres-url]
- [![Tailwind][Tailwind]][Tailwind-url]
- **Visualization:** Recharts
- **Icons:** Lucide React
- **Authentication:** JWT & Bcrypt
- **Backend DB Client:** Supabase (ANON key with RLS)
- **Python Worker:** Real-time stock price fetching

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

- **Visual Dashboard:** Total portfolio value, buying power, top holdings, and equity curve
- **Portfolio Management:** Create portfolios, add/remove positions, view holdings
- **Transaction Management:** Buy/Sell positions, track realized and unrealized PnL
- **Live Price Fetching:** Python worker asynchronously updates stock prices
- **Reporting:** Portfolio snapshots, equity curves, position metrics
- **Secure Authentication:** User accounts protected by JWT and Supabase RLS
- **Responsive UI:** Dark-mode-first interface built with Tailwind CSS

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Architecture

**Backend Services:**

- **PortfolioService:** Create/list portfolios
- **PortfolioPositionService:** Add positions, enqueue pending prices
- **TransactionService:** Record buy/sell transactions, update position metrics
- **ReportingService:** Generate portfolio reports, snapshot equity, fetch historical data
- **PortfolioMetricsAtomicService:** Atomic recalculation of position and portfolio metrics
- **Live Price Pipeline:** Python worker fetches real-time prices → Node.js bridge → database
- **Supabase:** Auth, RLS-protected database

**Frontend:**

- React app (Vite/CRA) hosted on Vercel
- Fetches data via Node.js backend API
- Visualizes portfolio metrics, transactions, and equity charts

**Database Tables:**

- portfolios, portfolio_positions, transactions, live_prices, price_history, pending_fetch, portfolio_position_metrics, portfolio_equity_curve

**Flow Example (Adding New Stock Position):**
User adds symbol → `pending_fetch` → Python worker fetch → Node parses JSON → `live_prices` upsert → `price_history` insert → `pending_fetch` cleanup

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Authentication (Login/Register with JWT)
- [x] Database Design (PostgreSQL schema with RLS)
- [x] Portfolio CRUD
- [x] Transaction CRUD
- [x] Live Price Fetching via Python worker
- [x] Visual Dashboard & Charts (Recharts)
- [ ] Date Filtering (Filter by Month/Year)
- [ ] Export Data (CSV/PDF)
- [ ] Budget Goals & Alerts
- [ ] Portfolio Deletion / Editing

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Meet the Team

|                                                                                                                                                    | GitHub                                                   | Name        | Role                               |
| :------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------- | :---------- | :--------------------------------- |
|          <a href="https://github.com/gbrds"><img src="https://github.com/gbrds.png" width="40" height="40" style="border-radius:50%"></a>          | **[@gbrds](https://github.com/gbrds)**                   | Juss Joosep | Project lead, Full Stack Developer |
| <a href="https://github.com/CarlRobertMots"><img src="https://github.com/CarlRobertMots.png" width="40" height="40" style="border-radius:50%"></a> | **[@CarlRobertMots](https://github.com/CarlRobertMots)** | Carl-Robert | Full Stack Developer               |
|      <a href="https://github.com/kylakarla"><img src="https://github.com/kylakarla.png" width="40" height="40" style="border-radius:50%"></a>      | **[@kylakarla](https://github.com/kylakarla)**           | Karl-Markus | Full Stack Developer               |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
