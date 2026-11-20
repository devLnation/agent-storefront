# Agent Storefront

Agent Storefront is a hackathon entry for the Binance Agent ID Hackathon
(submission period 2026-11-18 to 2026-12-09 08:00 UTC, 60,000 USDC total
rewards). It is one product page per Agent ID holder with two ways to earn:
a pay link for fast payments and tips, and a skill shop with escrow. A
leaderboard ranks agents by real on chain activity only.

This is an independent project. It is not affiliated with Binance or BNB
Chain, and it does not use their brand in its name or domain.

## What it is

1. **PayLink**: an Agent ID holder creates a pay link with a fixed amount in
   BNB or USDT on BNB Smart Chain. Anyone can pay through the contract. The
   payment is forwarded straight to the recipient in the same transaction.
   The contract keeps nothing and charges no fee.
2. **SkillMarketplace**: an Agent ID holder lists a skill with a price. The
   buyer pays into escrow. The seller submits delivery proof. The buyer
   confirms and the funds are released. If there is a problem, the buyer
   raises a dispute. A disputed order ends only when the seller refunds or
   the buyer releases. No admin can take escrowed funds.
3. **Leaderboard**: a read only contract plus a frontend page. Rankings use
   on chain counters and events only: payments received, skills sold,
   totals earned, and buyer ratings. An agent appears only after real
   on chain activity. Nothing is invented.

## How Agent ID is used

Agent ID is the on chain name of an Agentic Wallet, in the form name.ai.
The Agent ID contract on BNB Chain is
`0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (SPACE ID Agent ID, ERC-721,
symbol AI, non-transferable).

- Creating a pay link and listing a skill both require
  `balanceOf(msg.sender) > 0` on that contract. The check happens in the
  contract, not only in the frontend, so it cannot be bypassed by calling
  the contract directly.
- Paying and buying are open to anyone. Only creation is gated.
- The `.ai` name shown next to a link or skill is a label typed by the
  creator. It is **not verified on chain**. This is honest, not a bug in
  our code: the Agent ID contract was checked live on 2026-11-20 and it
  supports ERC-721 metadata but **not** the enumerable extension. There is
  no `tokenOfOwnerByIndex` and no `totalSupply`, so a contract cannot look
  up which token id or name an address holds. The contract proves the
  creator holds an Agent ID. It does not prove which name they hold. The
  frontend says this next to every name label.
- Agent ID is not used as a tool to look up other people's wallets by name.
  There is no name search and no reverse lookup in this product.

## Owner permissions

- **PayLink**: none. The deployer has no admin functions. No pause, no
  fee change, no withdrawal. Funds pass through in the same transaction.
- **SkillMarketplace**: none. The deployer has no admin functions. Escrow
  can only move by buyer confirm, buyer dispute release, or seller refund.
- **Leaderboard**: read only. No funds, no admin functions.
- The USDT address is fixed at deployment to the well known USDT contract
  on BSC: `0x55d398326f99059fF775485246999027B319FEEf`.

## Safety notes

- No QR code login anywhere. Users connect with their own wallet extension
  (Binance Wallet or any injected EIP-1193 provider).
- No server and no stored sessions. The frontend is static files only.
- Every payment is a transaction the user reviews and confirms in their
  own wallet. Nothing is scheduled, bundled, or sent automatically.
- USDT payments need an approval for the exact amount, made by the user in
  their own wallet. The contracts never ask for unlimited approval.
- This site never asks for a seed phrase, private key, API secret, or
  pairing code. Never share those with anyone.
- Risk warnings are shown on the pay and buy pages. Payments are final
  once confirmed on chain. Escrow refunds only happen through the seller
  refund path or a dispute the two parties resolve themselves.
- No returns are promised anywhere in this product or its docs.

## Project layout

```
contracts/            Foundry project
  src/PayLink.sol
  src/SkillMarketplace.sol
  src/Leaderboard.sol
  src/Interfaces.sol
  script/Deploy.s.sol
  test/AgentStorefront.t.sol
  test/Mocks.sol
frontend/             Static site for GitHub Pages
  index.html          Pay links
  marketplace.html    Skill marketplace
  leaderboard.html    Leaderboard
  app.js              Wallet, contract calls, leaderboard reading
  config.js           Chain and contract addresses (placeholders until deploy)
  styles.css
README.md
SUBMISSION-DRAFT.md
DEPLOY-CHECKLIST.md
```

## Tests

From `contracts/`:

```
forge test
```

Result on 2026-11-20: **18 passed, 0 failed**. Coverage includes: a
non Agent ID holder cannot create a link or list a skill; a pay forwards
the exact amount to the recipient in BNB and in USDT; a wrong value
reverts; escrow releases only after buyer confirm; the seller refund path
returns the buyer in full; a dispute ends only by seller refund or buyer
release; ratings are recorded once per completed order; leaderboard
counters update from real payments and sales.

One bug was found and fixed during testing: the rating average multiplied
by 500 instead of 100, so 5 stars read as 2500. It now reads as 500,
which means 5.00 stars.

## Run locally

Frontend only, no build step:

```
cd frontend
python3 -m http.server 8000
```

Open http://localhost:8000. Wallet connect and Agent ID checks work
against BNB Smart Chain. Contract calls stay disabled until the real
contract addresses are put in `config.js`.

Contracts:

```
cd contracts
forge build
forge test
```

Deploy script dry run against a local chain is described in
DEPLOY-CHECKLIST.md. Nothing in this repo deploys or spends anything by
itself.

## Deploy and publish

See DEPLOY-CHECKLIST.md for the exact steps: deploy the three contracts
from King's own wallet, verify each on BscScan, put the addresses in
`frontend/config.js`, push the repo to GitHub, enable GitHub Pages, then
submit to Binance. Deployment and submission need King's explicit
go-ahead. They are not done by this repo.

## Known limitations

- The `.ai` name label is unverified, as explained above. A future version
  could resolve names through the SPACE ID public API, but that would be an
  off chain lookup, not an on chain proof, and it is not wired in here.
- The leaderboard reads Payment events from block 0 on page load. On a
  busy chain that query gets slow. A production version should start from
  the deployment block and cache results.
- There is no admin arbitrator for disputes. If buyer and seller cannot
  agree, escrow stays locked. This is deliberate: it means no admin can
  seize funds, but it also means a stuck dispute has no third party exit.
- USDT on BSC has 18 decimals. The frontend and contracts both use 18.
- The contracts were tested with Foundry only. They have not been audited.
