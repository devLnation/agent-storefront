/* Agent Storefront app logic. Plain browser JavaScript, ethers v6 from CDN.
   No server, no stored sessions, no QR login. Every payment is a transaction
   the user reviews and confirms in their own wallet. */
let provider = null;
let signer = null;
let account = null;
let hasAgentId = false;

const ZERO = "0x0000000000000000000000000000000000000000";
const $ = (id) => document.getElementById(id);
const short = (a) => (a ? a.slice(0, 6) + "..." + a.slice(-4) : "");
const isDeployed = (a) => a && a.toLowerCase() !== ZERO;

function note(msg, ok) {
  const el = $("status");
  if (el) {
    el.textContent = msg;
    el.className = ok === false ? "status bad" : "status";
  }
}

function contractsReady() {
  return isDeployed(CONFIG.payLinkAddress) && isDeployed(CONFIG.marketplaceAddress);
}

async function connect() {
  if (!window.ethereum) {
    note("No wallet found. Open this page in a browser with Binance Wallet installed.", false);
    return;
  }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    account = accounts[0];
    signer = await provider.getSigner();
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== CONFIG.chainId) {
      note("Wrong network. Please switch your wallet to BNB Smart Chain (chain 56).", false);
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }]
        });
      } catch (e) {
        note("Please switch your wallet to BNB Smart Chain (chain 56) by hand.", false);
        return;
      }
    }
    const agentId = new ethers.Contract(CONFIG.agentIdAddress, AGENT_ID_ABI, provider);
    const bal = await agentId.balanceOf(account);
    hasAgentId = bal > 0n;
    $("connectBtn").textContent = short(account) + (hasAgentId ? " (Agent ID verified)" : " (no Agent ID)");
    $("walletLine").textContent = hasAgentId
      ? "Connected as " + account + ". Agent ID held: yes. You can create pay links and list skills."
      : "Connected as " + account + ". Agent ID held: no. You can pay and buy, but creating links and listing skills needs an Agent ID.";
    note(hasAgentId ? "Connected. Agent ID verified on chain." : "Connected. This wallet holds no Agent ID, so creation is locked.");
  } catch (e) {
    note("Connect failed: " + (e.message || e), false);
  }
}

function needWallet() {
  if (!signer) {
    note("Connect your wallet first.", false);
    return false;
  }
  return true;
}

function needContracts() {
  if (!contractsReady()) {
    note("Contracts are not deployed yet. This preview cannot send transactions.", false);
    return false;
  }
  return true;
}

function tokenAddress(kind) {
  return kind === "USDT" ? CONFIG.usdtAddress : ZERO;
}

function parseAmount(value, kind) {
  if (kind === "USDT") return ethers.parseUnits(value, 18);
  return ethers.parseEther(value);
}

async function ensureUsdtApproval(amount) {
  const usdt = new ethers.Contract(CONFIG.usdtAddress, ERC20_ABI, signer);
  const allowed = await usdt.allowance(account, CONFIG.payLinkAddress);
  if (allowed < amount) {
    note("Approving USDT spend in your wallet. Review the approval yourself, it only covers this amount.");
    const tx = await usdt.approve(CONFIG.payLinkAddress, amount);
    await tx.wait();
  }
}

// ---- Pay links ----

async function createLink(ev) {
  ev.preventDefault();
  if (!needWallet() || !needContracts()) return;
  if (!hasAgentId) {
    note("Only Agent ID holders can create a pay link.", false);
    return;
  }
  const amount = parseAmount($("linkAmount").value, $("linkToken").value);
  const contract = new ethers.Contract(CONFIG.payLinkAddress, PAYLINK_ABI, signer);
  note("Sending create link transaction. Review it in your wallet.");
  const tx = await contract.createLink(amount, tokenAddress($("linkToken").value), $("linkMemo").value, $("linkName").value);
  const receipt = await tx.wait();
  note("Pay link created. Transaction: " + receipt.hash);
  loadLinks();
}

async function payLink(ev) {
  ev.preventDefault();
  if (!needWallet() || !needContracts()) return;
  const linkId = $("payLinkId").value;
  const contract = new ethers.Contract(CONFIG.payLinkAddress, PAYLINK_ABI, signer);
  const link = await contract.getLink(linkId);
  if (!link.active) {
    note("That link is not active.", false);
    return;
  }
  note("Risk warning: you are about to pay " + ethers.formatEther(link.amount) + " " + (link.token === ZERO ? "BNB" : "USDT") + " to " + link.creator + ". Check the address in your wallet before you confirm.");
  let tx;
  if (link.token === ZERO) {
    tx = await contract.pay(linkId, { value: link.amount });
  } else {
    await ensureUsdtApproval(link.amount);
    tx = await contract.pay(linkId);
  }
  const receipt = await tx.wait();
  note("Payment sent. Transaction: " + receipt.hash);
  loadLinks();
}

async function loadLinks() {
  const list = $("linkList");
  if (!list || !isDeployed(CONFIG.payLinkAddress)) return;
  try {
    const read = new ethers.Contract(CONFIG.payLinkAddress, PAYLINK_ABI, provider);
    const count = Number(await read.nextLinkId());
    list.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const l = await read.getLink(i);
      const row = document.createElement("div");
      row.className = "card";
      row.innerHTML =
        "<b>Link #" + i + "</b> " + (l.active ? "active" : "closed") + "<br>" +
        "Creator: " + short(l.creator) + " (" + escapeHtml(l.nameLabel) + ", label supplied by creator, not verified on chain)<br>" +
        "Amount: " + ethers.formatEther(l.amount) + " " + (l.token === ZERO ? "BNB" : "USDT") + "<br>" +
        "Note: " + escapeHtml(l.memo) + "<br>Payments: " + l.payments;
      list.appendChild(row);
    }
    if (count === 0) list.innerHTML = "<p>No pay links yet.</p>";
  } catch (e) {
    list.innerHTML = "<p>Could not load links: " + escapeHtml(e.message || e) + "</p>";
  }
}

// ---- Skills ----

async function listSkill(ev) {
  ev.preventDefault();
  if (!needWallet() || !needContracts()) return;
  if (!hasAgentId) {
    note("Only Agent ID holders can list a skill.", false);
    return;
  }
  const price = parseAmount($("skillPrice").value, $("skillToken").value);
  const contract = new ethers.Contract(CONFIG.marketplaceAddress, MARKETPLACE_ABI, signer);
  note("Sending list skill transaction. Review it in your wallet.");
  const tx = await contract.listSkill($("skillTitle").value, $("skillDesc").value, price, tokenAddress($("skillToken").value));
  const receipt = await tx.wait();
  note("Skill listed. Transaction: " + receipt.hash);
  loadSkills();
}

async function buySkill(ev) {
  ev.preventDefault();
  if (!needWallet() || !needContracts()) return;
  const skillId = $("buySkillId").value;
  const contract = new ethers.Contract(CONFIG.marketplaceAddress, MARKETPLACE_ABI, signer);
  const skill = await contract.getSkill(skillId);
  if (!skill.active) {
    note("That skill is not active.", false);
    return;
  }
  note("Risk warning: your payment goes into escrow until you confirm delivery or the seller refunds. Check the price and seller in your wallet before you confirm.");
  let tx;
  if (skill.token === ZERO) {
    tx = await contract.buySkill(skillId, { value: skill.price });
  } else {
    const usdt = new ethers.Contract(CONFIG.usdtAddress, ERC20_ABI, signer);
    const allowed = await usdt.allowance(account, CONFIG.marketplaceAddress);
    if (allowed < skill.price) {
      const atx = await usdt.approve(CONFIG.marketplaceAddress, skill.price);
      await atx.wait();
    }
    tx = await contract.buySkill(skillId);
  }
  const receipt = await tx.wait();
  note("Order created, funds in escrow. Transaction: " + receipt.hash);
  loadSkills();
}

async function orderAction(action) {
  if (!needWallet() || !needContracts()) return;
  const orderId = $("orderId").value;
  const contract = new ethers.Contract(CONFIG.marketplaceAddress, MARKETPLACE_ABI, signer);
  let tx;
  if (action === "deliver") tx = await contract.submitDelivery(orderId, $("orderProof").value);
  if (action === "confirm") tx = await contract.confirmDelivery(orderId);
  if (action === "refund") tx = await contract.refund(orderId);
  if (action === "dispute") tx = await contract.raiseDispute(orderId);
  if (action === "release") tx = await contract.resolveDisputeRelease(orderId);
  if (action === "rate") tx = await contract.rateOrder(orderId, Number($("orderStars").value));
  note("Sending transaction. Review it in your wallet.");
  const receipt = await tx.wait();
  note("Done. Transaction: " + receipt.hash);
}

async function loadSkills() {
  const list = $("skillList");
  if (!list || !isDeployed(CONFIG.marketplaceAddress)) return;
  try {
    const read = new ethers.Contract(CONFIG.marketplaceAddress, MARKETPLACE_ABI, provider);
    const count = Number(await read.nextSkillId());
    list.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const s = await read.getSkill(i);
      const row = document.createElement("div");
      row.className = "card";
      row.innerHTML =
        "<b>Skill #" + i + "</b> " + (s.active ? "active" : "closed") + "<br>" +
        "Seller: " + short(s.seller) + "<br>" +
        "Title: " + escapeHtml(s.title) + "<br>" +
        "Price: " + ethers.formatEther(s.price) + " " + (s.token === ZERO ? "BNB" : "USDT") + "<br>" +
        "Sold: " + s.sold + "<br>" + escapeHtml(s.description);
      list.appendChild(row);
    }
    if (count === 0) list.innerHTML = "<p>No skills listed yet.</p>";
  } catch (e) {
    list.innerHTML = "<p>Could not load skills: " + escapeHtml(e.message || e) + "</p>";
  }
}

// ---- Leaderboard ----

async function loadLeaderboard() {
  const body = $("boardBody");
  if (!body) return;
  if (!isDeployed(CONFIG.payLinkAddress)) {
    body.innerHTML = "<tr><td colspan='6'>Contracts are not deployed yet. The leaderboard fills in once real payments and sales exist on chain.</td></tr>";
    return;
  }
  try {
    const read = new ethers.Contract(CONFIG.payLinkAddress, PAYLINK_ABI, provider);
    const fromBlock = 0;
    const payments = await read.queryFilter(read.filters.Payment, fromBlock);
    const agents = {};
    for (const ev of payments) {
      const a = ev.args.recipient;
      agents[a] = agents[a] || { address: a, payments: 0, receivedBNB: 0n, receivedUSDT: 0n };
      agents[a].payments++;
      if (ev.args.token === ZERO) agents[a].receivedBNB += ev.args.amount;
      else agents[a].receivedUSDT += ev.args.amount;
    }
    const board = new ethers.Contract(CONFIG.leaderboardAddress, LEADERBOARD_ABI, provider);
    const rows = [];
    for (const a of Object.values(agents)) {
      let sold = 0, earnedBNB = 0n, earnedUSDT = 0n, avg = 0n, ratings = 0n;
      if (isDeployed(CONFIG.leaderboardAddress)) {
        const s = await board.agentStats(a.address);
        sold = Number(s.skillsSold); earnedBNB = s.earnedBNB; earnedUSDT = s.earnedUSDT;
        avg = s.avgRatingBps; ratings = s.ratings;
      }
      rows.push({ ...a, sold, earnedBNB, earnedUSDT, avg, ratings });
    }
    rows.sort((x, y) => Number(y.payments + y.sold) - Number(x.payments + x.sold));
    body.innerHTML = "";
    if (rows.length === 0) {
      body.innerHTML = "<tr><td colspan='6'>No payments or sales yet. The leaderboard only shows real on chain activity, nothing is invented.</td></tr>";
      return;
    }
    rows.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = "<td>" + (i + 1) + "</td><td>" + short(r.address) + "</td><td>" + r.payments + "</td><td>" +
        ethers.formatEther(r.receivedBNB) + " BNB / " + ethers.formatEther(r.receivedUSDT) + " USDT</td><td>" + r.sold +
        "</td><td>" + (r.ratings > 0 ? (Number(r.avg) / 100).toFixed(2) + " (" + r.ratings + ")" : "no ratings") + "</td>";
      body.appendChild(tr);
    });
  } catch (e) {
    body.innerHTML = "<tr><td colspan='6'>Could not load leaderboard: " + escapeHtml(e.message || e) + "</td></tr>";
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = $("connectBtn");
  if (btn) btn.addEventListener("click", connect);
  const cf = $("createLinkForm");
  if (cf) cf.addEventListener("submit", createLink);
  const pf = $("payLinkForm");
  if (pf) pf.addEventListener("submit", payLink);
  const sf = $("listSkillForm");
  if (sf) sf.addEventListener("submit", listSkill);
  const bf = $("buySkillForm");
  if (bf) bf.addEventListener("submit", buySkill);
  document.querySelectorAll("[data-action]").forEach((b) => {
    b.addEventListener("click", () => orderAction(b.dataset.action));
  });
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  loadLinks();
  loadSkills();
  loadLeaderboard();
});
