// Deterministic CFO policy. The AI's reading is an input; this function alone decides what may be captured.
function decide(po, reading, state) {
  const unitPrice = po.amount / po.units;
  const prevGood = state.good || 0, prevRecv = state.received || 0;
  const goodNow = Math.max(0, reading.units_received - reading.units_damaged);
  const good = Math.min(po.units, prevGood + goodNow);
  const earned = +(good * unitPrice).toFixed(2);
  const remainingAuth = +(po.amount - state.captured).toFixed(2);
  const due = +Math.max(0, earned - state.captured).toFixed(2);
  if (state.frozen) return { action: "HOLD", amount: 0, reason: "escrow frozen by dispute" };
  if (reading.dispute) return { action: "FREEZE", amount: 0, reason: reading.dispute_reason || "dispute flagged" };
  if (prevRecv + reading.units_received > po.units) return { action: "FREEZE", amount: 0, reason: "received more than ordered; recount" };
  if (due <= 0) return { action: "NONE", amount: 0, reason: "nothing newly earned", good, received: prevRecv + reading.units_received };
  const amt = Math.min(due, po.trancheCap, remainingAuth);
  const shortBy = po.units - good;
  return { action: "CAPTURE", amount: +amt.toFixed(2), final: false,
    reason: amt < due ? `tranche capped at CFO limit ${po.trancheCap}` : shortBy > 0 ? `pay for ${good} good units; ${shortBy} short/damaged withheld` : "full delivery verified",
    earned, good, received: prevRecv + reading.units_received };
}
module.exports = { decide };
