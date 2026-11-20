# Agent Storefront: submission draft (NOT submitted)

Fill in the TBD fields after deployment, then submit through the official
Binance hackathon submission form during the submission period
(2026-11-18 to 2026-12-09 08:00 UTC). Do not submit this draft as is.

## Project name

Agent Storefront

## One paragraph description

Agent Storefront gives every Binance Agent ID holder one public profile
page with two ways to earn on BNB Smart Chain: a pay link for fast
payments and tips, and a skill shop where buyers pay into escrow and funds
are released only after the buyer confirms delivery. A leaderboard ranks
agents by real on chain payments, sales, and buyer ratings, so reputation
is public and earned, not claimed.

## Agent ID usage description

Agent ID is used at the core of the product, in the contracts, not only in
the frontend. Creating a pay link and listing a skill both require the
caller to hold at least one Agent ID, checked on chain with
`balanceOf(msg.sender) > 0` on the SPACE ID Agent ID contract
(`0x60b9262456de011f7d15a54cdd8c48baaa8b022f`). Paying and buying are open
to anyone, so every interaction that counts is tied to a real Agent ID
holder on the creation side. Payments, sales, and ratings are recorded on
chain next to the agent address and feed the leaderboard. The `.ai` name
shown next to a link is a label typed by the creator and is marked as
unverified in the product, because the Agent ID contract does not expose
an enumerable token list or a name lookup by address. The contract proves
the creator holds an Agent ID, not which name they hold.

## Contracts (BNB Smart Chain, chain 56)

- PayLink: 0x82916735109FBFE5E42aAca4b7163E00220dEf69 (DEPLOYED 2026-11-20, tx 0xa604a19f1cb605c3819b7843823294c81d8528e8cd7cc6a8b5c6700064546d0b, deployer 0xEEE668f3010a9A12988590Da708160A42Dfe8F07, code verified on-chain, BscScan source verification still pending)
- SkillMarketplace: 0x324346336AB365B7220cAa0E4Bf3A426D4ad2484 (DEPLOYED 2026-11-20, tx 0x8b5ee8b569b8e70a27d428d2c7e231d9340163133890815e206ddfe09b168b25, deployer 0xEEE668f3010a9A12988590Da708160A42Dfe8F07, code verified on-chain, BscScan source verification still pending)
- Leaderboard: 0x7104Fc5B54bA58A5d11Bd80E692988d2b1850644 (DEPLOYED 2026-11-20, tx 0xe12d5cd950a150a783519ac5939750d7fbf9e4453cb7ce4b81843a3cd0f74f8c, deployer 0xEEE668f3010a9A12988590Da708160A42Dfe8F07, code verified on-chain, BscScan source verification still pending)
- Agent ID contract used: 0x60b9262456de011f7d15a54cdd8c48baaa8b022f
- All three contracts verified and open source on BscScan: TBD (links after verification)

## Website

TBD (GitHub Pages URL after the repo is created and Pages is enabled)

## Source code

TBD (public GitHub repo URL after push)

## Reward receiving address

0xBAee142b867519E6ca3a6a3047d88b14C8Cac43d

Note: this is King's payout wallet, noted here only as a draft. Confirm
it is still the right receiving address before submitting.

## Team

King (Muhammad Arizal Annanda Syach), Telegram @devlnation, X 0xreallity,
GitHub devLnation. Agent ID held on both Binance wallets used for this
project, verified on chain 2026-11-20 (hanamibtc and ngary, each
balanceOf 1 on the Agent ID contract).

## Awards aimed at

- Pioneer Award: the product is built to drive cheap, repeatable
  interactions from Agent ID holders (create a link, pay a link, list a
  skill, buy, confirm, rate), all counted on chain.
- Innovation Award: Agent ID depth is the core mechanic (gated creation,
  on chain reputation, leaderboard), the product is live and complete,
  and the combined pay link plus escrow marketplace is a use case not
  covered by the task board entries already live.
- Minimum eligibility for the Innovation Award: at least 30 distinct
  Agent ID addresses interacting with the submitted contracts during the
  submission period. This is not met yet. It needs real outreach after
  launch: share the storefront, invite Agent ID holders to create a link
  or list a skill, and track the count from Payment and OrderCreated
  events.
