/* Agent Storefront configuration.
   Fill in the three contract addresses after deployment and verification
   on BscScan. Until then the site runs in preview mode: wallet connect and
   Agent ID checks work, contract calls are disabled with a clear message. */
const CONFIG = {
  chainId: 56,
  chainName: "BNB Smart Chain",
  rpcUrl: "https://bsc-dataseed1.binance.org",
  agentIdAddress: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f",
  usdtAddress: "0x55d398326f99059fF775485246999027B319FEEf",
  payLinkAddress: "0x82916735109FBFE5E42aAca4b7163E00220dEf69",
  marketplaceAddress: "0x324346336AB365B7220cAa0E4Bf3A426D4ad2484",
  leaderboardAddress: "0x7104Fc5B54bA58A5d11Bd80E692988d2b1850644",
  bscScan: "https://bscscan.com"
};

const AGENT_ID_ABI = ["function balanceOf(address owner) view returns (uint256)"];

const PAYLINK_ABI = [
  "function createLink(uint256 amount, address token, string memo, string nameLabel) returns (uint256)",
  "function pay(uint256 linkId) payable",
  "function deactivateLink(uint256 linkId)",
  "function getLink(uint256 linkId) view returns (tuple(address creator, uint256 amount, address token, string memo, string nameLabel, bool active, uint256 payments))",
  "function nextLinkId() view returns (uint256)",
  "function totalPayments() view returns (uint256)",
  "function agentStats(address agent) view returns (uint256, uint256, uint256, uint256)",
  "event LinkCreated(uint256 indexed linkId, address indexed creator, uint256 amount, address indexed token, string nameLabel)",
  "event Payment(uint256 indexed linkId, address indexed payer, address indexed recipient, uint256 amount, address token)"
];

const MARKETPLACE_ABI = [
  "function listSkill(string title, string description, uint256 price, address token) returns (uint256)",
  "function delistSkill(uint256 skillId)",
  "function buySkill(uint256 skillId) payable returns (uint256)",
  "function submitDelivery(uint256 orderId, string proof)",
  "function confirmDelivery(uint256 orderId)",
  "function refund(uint256 orderId)",
  "function raiseDispute(uint256 orderId)",
  "function resolveDisputeRelease(uint256 orderId)",
  "function rateOrder(uint256 orderId, uint8 stars)",
  "function getSkill(uint256 skillId) view returns (tuple(address seller, string title, string description, uint256 price, address token, bool active, uint256 sold))",
  "function getOrder(uint256 orderId) view returns (tuple(uint256 skillId, address buyer, address seller, uint256 amount, address token, uint8 state, string deliveryProof, uint8 rating, bool rated))",
  "function nextSkillId() view returns (uint256)",
  "function nextOrderId() view returns (uint256)",
  "function agentStats(address agent) view returns (uint256, uint256, uint256, uint256, uint256)",
  "event SkillListed(uint256 indexed skillId, address indexed seller, uint256 price, address indexed token, string title)",
  "event OrderCreated(uint256 indexed orderId, uint256 indexed skillId, address indexed buyer, address seller, uint256 amount)",
  "event OrderCompleted(uint256 indexed orderId, address indexed seller, uint256 amount)",
  "event OrderRefunded(uint256 indexed orderId, address indexed buyer, uint256 amount)"
];

const LEADERBOARD_ABI = [
  "function agentStats(address agent) view returns (tuple(uint256 receivedBNB, uint256 receivedUSDT, uint256 payments, uint256 linksCreated, uint256 skillsSold, uint256 earnedBNB, uint256 earnedUSDT, uint256 avgRatingBps, uint256 ratings))"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];
