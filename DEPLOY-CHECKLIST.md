# Agent Storefront: deploy checklist

Nothing here is deployed automatically. Every step below is done by King
himself from his own wallet. Do not start until King says go.

## Measured deploy gas (local chain, 2026-11-20)

Deploy script run against a local Anvil chain with the real constructor
arguments (Agent ID contract and USDT on BSC):

| Contract | Gas used |
| --- | --- |
| PayLink | 1,880,149 |
| SkillMarketplace | 3,826,778 |
| Leaderboard | 410,393 |
| **Total** | **6,117,320** |

Cost depends on the live BSC gas price at deploy time. At 1 gwei that is
about 0.0061 BNB for all three. At 3 gwei it is about 0.018 BNB. Check
the gas price in the wallet before confirming, and keep extra BNB in the
deploying wallet for the three transactions plus a small buffer.

## Before deploying

- [ ] King confirms the project name (Agent Storefront) and that the
      combined pay link plus skill marketplace is what he wants to submit.
- [ ] King confirms which of his two Agent ID wallets deploys the
      contracts (hanamibtc or ngary). Either works: both hold one Agent ID.
- [ ] The deploying wallet holds enough BNB for gas (see table above) plus
      a buffer.
- [ ] The repo below exists and this code is the version being deployed.

## 1. Create the GitHub repo

- [ ] Create a new public repo on GitHub as devLnation, for example
      `agent-storefront`.
- [ ] Push this folder to it (README, contracts, docs). Keep the repo
      public: the hackathon requires open source code.
- [ ] Do not put any private key, seed phrase, or `.env` file in the repo.

## 2. Deploy the contracts (King, from his own wallet)

From `contracts/` on a machine King trusts:

```
forge script script/Deploy.s.sol --rpc-url https://bsc-dataseed1.binance.org --broadcast --sender <DEPLOYER_ADDRESS>
```

Foundry will ask for the deployer key through its normal signing flow.
King enters it himself. AgentX does not hold or type King's keys.

Deploy order is fixed by the script: PayLink, then SkillMarketplace,
then Leaderboard (which takes the first two addresses as inputs).

- [ ] Record the three deployed addresses.
- [ ] Check each address on BscScan shows the deployed code.

## 3. Verify on BscScan

For each of the three contracts:

```
forge verify-contract <ADDRESS> <ContractName> --chain 56 --etherscan-api-key <BSCSCAN_KEY>
```

Or verify by hand on bscscan.com with the flattened source and the exact
constructor arguments (Agent ID address, USDT address, then the two
contract addresses for Leaderboard).

- [ ] PayLink verified, source public.
- [ ] SkillMarketplace verified, source public.
- [ ] Leaderboard verified, source public.

## 4. Point the frontend at the contracts

- [ ] Edit `frontend/config.js`: set `payLinkAddress`,
      `marketplaceAddress`, and `leaderboardAddress` to the deployed
      addresses.
- [ ] Commit and push.
- [ ] Open the site and connect with an Agent ID wallet. Create one test
      pay link with a tiny amount and pay it from the second wallet to
      prove the full flow works on mainnet. Do this with small amounts
      only.

## 5. Publish with GitHub Pages (no Cloudflare)

- [ ] In the repo, Settings, Pages, set Source to "Deploy from a branch",
      branch `main`, folder `/frontend`.
- [ ] Wait for Pages to build. Open the Pages URL and check all three
      pages load: pay links, marketplace, leaderboard.
- [ ] Record the Pages URL for the submission.

## 6. Reach 30 Agent ID interactions (needed for the Innovation Award)

- [ ] Share the storefront on X and in Agent ID communities.
- [ ] Invite Agent ID holders to create a pay link or list a skill.
- [ ] Track distinct Agent ID addresses from Payment and OrderCreated
      events. Do not fake activity and do not create mass accounts: the
      rules disqualify manipulated volume.
- [ ] Submit only after the count is real and checkable on chain.

## 7. Submit to Binance

- [ ] Fill in SUBMISSION-DRAFT.md with the real contract addresses,
      BscScan links, Pages URL, and repo URL.
- [ ] Confirm the reward receiving address
      (0xBAee142b867519E6ca3a6a3047d88b14C8Cac43d) is still correct.
- [ ] Submit through the official hackathon form before 2026-12-09
      08:00 UTC.
- [ ] Save the submission confirmation.

## If something goes wrong

- A failed deploy transaction still costs gas. Check the error, fix the
  cause, and redeploy. A redeploy means new contract addresses: update
  `config.js` and re-verify.
- If a contract address is entered wrong in `config.js`, the site shows
  the preview message and refuses contract calls. Fix the address and
  republish.
