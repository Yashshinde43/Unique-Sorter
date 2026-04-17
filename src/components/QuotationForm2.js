"use client";

import { useState, useRef } from "react";
import Link from "next/link";

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(+n || 0);
const todayISO = () => new Date().toISOString().split("T")[0];
const fmtDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const _2 = (n) =>
  !n
    ? ""
    : n < 20
      ? ONES[n]
      : TENS[~~(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
const _3 = (n) =>
  !n
    ? ""
    : n < 100
      ? _2(n)
      : ONES[~~(n / 100)] + " Hundred" + (n % 100 ? " " + _2(n % 100) : "");
function toWords(a) {
  const n = Math.round(+a || 0);
  if (!n) return "";
  let r = n;
  const p = [];
  const c = ~~(r / 1e7);
  r %= 1e7;
  const l = ~~(r / 1e5);
  r %= 1e5;
  const t = ~~(r / 1e3);
  r %= 1e3;
  if (c) p.push(_2(c) + " Crore");
  if (l) p.push(_2(l) + " Lakh");
  if (t) p.push(_2(t) + " Thousand");
  if (r) p.push(_3(r));
  return "Rs. " + p.join(" ") + " Only.";
}

/* ─── Product catalogue (green-highlighted fields) ───────────── */
const PRODUCTS = [
  {
    id: "pinnacle6v",
    label: "PINNACLE 6 (USEPL 6V) — 6 Chute",
    model: "PINNACLE 6 (USEPL 6V)",
    modules: "6 Modules/378 channels",
    cameras: "12 Nos HOLOGRAPHIC TRICHROMATIC FLASH cameras",
    airReq: ">90CFM Water & Oil Free air @ 4.2 Kg/Cm²",
    basePrice: "2415254",
  },
  {
    id: "pinnacle8v",
    label: "PINNACLE 8 (USEPL 8V) — 8 Chute",
    model: "PINNACLE 8 (USEPL 8V)",
    modules: "8 Modules/504 channels",
    cameras: "16 Nos HOLOGRAPHIC TRICHROMATIC FLASH cameras",
    airReq: ">120CFM Water & Oil Free air @ 4.2 Kg/Cm²",
    basePrice: "3220339",
  },
  {
    id: "pinnacle10v",
    label: "PINNACLE 10 (USEPL 10V) — 10 Chute",
    model: "PINNACLE 10 (USEPL 10V)",
    modules: "10 Modules/630 channels",
    cameras: "20 Nos HOLOGRAPHIC TRICHROMATIC FLASH cameras",
    airReq: ">150CFM Water & Oil Free air @ 4.2 Kg/Cm²",
    basePrice: "4025424",
  },
];

/* ─── Initial state ───────────────────────────────────────────── */
const INIT = () => ({
  refNo: "USEPL/Q-D/2026/005/R0",
  refDate: todayISO(),
  companyPrefix: "",
  company: "",
  address: "",
  gstin: "",
  contact: "",
  mobile: "",
  productId: "",
  model: "",
  modules: "",
  cameras: "",
  airReq: "",
  basePrice: "",
  freight: "In your scope.",
  paymentTerms: "50% as advance along with order.\nBalance payment before dispatch.",
  deliveryFrom: "7",
  deliveryTo: "8",
  commodity: "Rice",
  quotationValidity: "30",
});

/* ─── Shared letterhead (injected on every page) ──────────────── */
const LETTERHEAD = `
  <div class="lh">
    <div class="logo-cell"><img src="/logo.png" alt="Unique Sorter &amp; Equipments Pvt. Ltd."/></div>
    <div class="co-info">
      <div class="co-name"><span>UNIQUE SORTER &amp; EQUIPMENTS PVT. LTD.</span></div>
      <div class="co-addr">
        <div>H. No.: C-77, Sector-1, Hemu Kalyani Ward-35, Devendra Nagar, Raipur (Chhattisgarh)</div>
        <div>492009 Ph.: 0771 - 4001442, 3566497, CIN No.: U51909CT2021PTC011465,</div>
        <div>GST No. 22AACCU8116G1ZL</div>
        <div>Web: <a href="https://www.uniquesorter.in" target="_blank" style="color:#1A37AA;text-decoration:none;">www.uniquesorter.in</a> , Email: <a href="mailto:raipur@uniquesorter.in" style="color:#1A37AA;text-decoration:none;">raipur@uniquesorter.in</a></div>
      </div>
    </div>
  </div>
  <div style="height:0;border-top:2px solid #444;margin:6px 0 0;"></div>`;

/* ─── Build full 6-page HTML ──────────────────────────────────── */
function buildHTML(f) {
  const base = parseFloat(f.basePrice) || 0;
  const gst18 = base * 0.18;
  const total = base + gst18;

  const refRow = (page, total) => `
  <div class="ref-row">
    <div>Ref No. <strong>${esc(f.refNo) || "—"}</strong></div>
    <div>Date: <strong>${fmtDate(f.refDate) || "—"}</strong></div>
  </div>
  <div style="height:0;border-top:1px solid #444;margin:0;"></div>
  <div class="page-num">Page ${page} | 6</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Quotation — Unique Sorter &amp; Equipments Pvt. Ltd.</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background:#a0a8b8; font-family:Arial,Helvetica,sans-serif; padding:32px 16px 60px; display:flex; flex-direction:column; align-items:center; gap:20px; }
  .page { width:794px; min-height:1123px; background:#fff; padding:24px 36px 36px; box-shadow:0 8px 48px rgba(0,0,0,.35); font-size:10.5pt; color:#000; line-height:1.45; position:relative; }
  .lh { display:flex; align-items:stretch; gap:0; margin-bottom:5px; }
  .logo-cell { width:150px; flex-shrink:0; display:flex; align-items:center; justify-content:center; padding:14px 10px; background:#fff; }
  .logo-cell img { width:130px; height:44px; object-fit:contain; display:block; }
  .co-info { flex:1; display:flex; flex-direction:column; min-width:0; }
  .co-name { background:#52ba4f;  padding: 4px 8px 4px; text-align:center; flex-shrink:0; }
  .co-name span { color:#fff; font-weight:900; font-size:15.5pt; letter-spacing:.35px; font-family:Arial,Helvetica,sans-serif; white-space:nowrap; }
  .co-addr { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-size:9.5pt; line-height:1.72; padding:8px 10px 7px; color:#111; }
  .ref-row { display:flex; align-items:center; justify-content:space-between; padding:6px 2px 5px; font-size:10.5pt; }
  .page-num { text-align:right; font-size:9pt; color:#666; position:absolute; bottom:70px; right:36px; margin:0; }
  .address-container { border:1px solid #444; padding:0; margin:15px 0; }
  .address-content { display:flex; align-items:stretch; }
  .address-section { flex:1; padding:15px; }
  .address-divider { width:1px; background:#444; margin:0; align-self:stretch; min-height:100%; }
  .letter-content { margin:20px 0; line-height:1.7; }
  .letter-content p { margin-bottom:12px; text-align:justify; }
  .letter-footer { margin-top:30px; }
  .letter-signature { margin-top:20px; }
  .yl { padding:0 1px; }
  .specs-title { font-size:13pt; font-weight:900; margin:20px 0 10px; text-decoration:underline; }
  .tech-specs-table { width:100%; border-collapse:collapse; margin:15px 0; font-size:10.5pt; }
  .tech-specs-table td { padding:8px 10px; border:1px solid #bbb; vertical-align:top; }
  .tech-specs-table td:first-child { width:8%; text-align:center; font-weight:700; }
  .tech-specs-table td:nth-child(2) { width:32%; font-weight:700; }
  .tech-specs-table td:nth-child(3) { width:60%; }
  .qt { width:100%; border-collapse:collapse; font-size:10.5pt; border:1px solid #999; margin-bottom:4px; }
  .qt thead tr { border-top:2px solid #222; border-bottom:2px solid #222; }
  .qt th { padding:7px 8px; font-weight:700; font-size:11pt; background:#fff; }
  .qt td { padding:7px 8px; vertical-align:top; }
  .th-qty  { text-align:center; border-right:1px solid #bbb; width:10%; }
  .th-desc { text-align:center; border-right:1px solid #bbb; }
  .th-price{ text-align:right; width:20%; }
  .td-qty  { text-align:center; border-right:1px solid #ccc; width:8%; padding-top:9px; }
  .td-model{ border-right:1px solid #ccc; width:20%; font-weight:600; font-size:10pt; padding-top:9px; }
  .td-desc { border-right:1px solid #ccc; }
  .td-price{ text-align:right; width:20%; font-weight:600; font-size:11pt; letter-spacing:.2px; }
  .td-gst-lbl { text-align:right; padding:5px 8px; border-right:1px solid #ccc; }
  .td-gst-val { text-align:right; padding:5px 8px; }
  .td-total { text-align:right; padding:5px 8px 8px; font-weight:900; font-size:12.5pt; border-top:1.5px solid #000; letter-spacing:.2px; }
  .item-row td { border-bottom:1px solid #e0e0e0; }
  .amt-words { font-style:italic; font-weight:700; font-size:10.5pt; padding:6px 0 8px; border-bottom:1px solid #ccc; margin-bottom:9px; }
  .terms { font-size:10.5pt; margin-bottom:12px; }
  .term { display:flex; align-items:flex-start; gap:0; margin-bottom:3px; line-height:1.6; }
  .term-lbl { width:200px; flex-shrink:0; font-weight:700; }
  .term-val { flex:1; }
  .bank-details { background:#f9f9f9; padding:12px; margin:15px 0 10px 30px; border-left:4px solid #52ba4f; }
  .exclusions-list { list-style:none; margin:10px 0 20px 30px; }
  .exclusions-list li { margin-bottom:6px; line-height:1.5; position:relative; padding-left:20px; }
  .exclusions-list li::before { content:"•"; position:absolute; left:0; font-weight:700; }
  .stamp-row { margin:30px 0 4px 0; }
  .for-row { display:flex; justify-content:space-between; font-size:10.5pt; font-weight:500; margin-bottom:10px; }
  .doc-footer { text-align:center; font-size:10.5pt; color:#555; padding-top:8px; border-top:1px solid #ddd; }
  @media print {
    body { background:white; padding:0; }
    .page { box-shadow:none; width:100%; min-height:auto; page-break-after:always; }
    .page:last-child { page-break-after:avoid; }
    @page { size:A4; margin:6mm 8mm; }
  }
</style>
</head>
<body>

<!-- PAGE 1: COVER LETTER -->
<div class="page">
  ${LETTERHEAD}
  ${refRow(1)}

  <div class="address-container">
    <div class="address-content">
      <div class="address-section">
        <strong>To,</strong><br/>
        <strong><span class="yl">${f.company ? (f.companyPrefix ? esc(f.companyPrefix) + " " : "") + esc(f.company) : "—"}</span></strong><br/>
        <span class="yl">${esc(f.address) || "—"}</span><br/>
        <span class="yl">GSTIN: ${esc(f.gstin) || "—"}</span>
      </div>
      <div class="address-divider"></div>
      <div class="address-section">
        <strong>Kind Attention:</strong><br/>
        <span class="yl">${esc(f.contact) || "—"}</span><br/>
        <span class="yl">Mobile: ${esc(f.mobile) || "—"}</span>
      </div>
    </div>
  </div>

  <div class="letter-content">
    <p><strong>Subject:</strong> Offer for supply &amp; commissioning of advanced UNIQUE Color Sorter Machine.</p>
    <p><strong>Dear Sir,</strong></p>
    <p>At the outset we thank you for showing interest in <strong>UNIQUE HIGH END PINNACLE SERIES COLOUR SORTERS</strong> with features available only with us in the industry currently. As a pioneer in sorting technology UNIQUE is the most PREFERRED sorter of exporters and as well as domestic millers.</p>
    <p>We wish to make a mention that though this is a multiproduct machine, it has been especially designed keeping rice as the prime commodity.</p>
    <p>As explained the camera is the first of it's kind <strong>HOLOGRAPHIC CAMERA</strong> which makes a 360° view of the grain. HD image panoramic view 262 million pixel resolution, with 0.01sqmm defect detection capability, Imported from JAPAN.</p>
    <p>Other important feature is that the machine has the ability to set the sensitivity automatically, unlike in any other machine where it totally depends on the operator skill to set the sensitivity.</p>
    <p>The machine is equipped with multi-chromatic LED in the background. Here also we have used a <strong>LOW WATTAGE-HIGH LUMENS PATENTED TECHNOLOGY</strong> which consumes less power. We can create background of 16 million color shades depending on the product. This feature enhances the sorting efficiency and there by gives superior end results.</p>
    <p>Reverse sort is available in all the chutes, unlike in the last chute of the competitor machines.</p>
    <p>The ejectors are of metallic body having 12 billion cycles of life, block type, serviceable at a very low price, the air consumption per chute is the lowest in industry.</p>
  </div>
</div>

<!-- PAGE 2: LETTER CONTINUED -->
<div class="page">
  ${LETTERHEAD}
  ${refRow(2)}

  <div class="letter-content">
    <p>The machine is equipped with imported ejectors Other features are GUI (monitor) can be accessed on smart phone/ iPad within a specific distance via WiFi through a built-in modem.</p>
    <p>Flow monitor, Shape sorting, Mapping Reverse Sort, Chalky removal feature with efficiency as high as 98%. Micro-discolor separation with efficiency up to 98%, Overall efficiency 99.999% in Single and Dual rejection is possible.</p>
    <p>The machine incorporates new age wiping system improving total output capacity.</p>
    <p>We ensure that we are committed to extend after sales service and spares with minimum downtime.</p>
    <p>Having sold over <strong>1500+ machines</strong> across India covering 23 states with major top brands using our machine/(s) we confirm that you will have the same satisfactory experience in promoting your rice in domestic and worldwide market.</p>
    <p>Please find the offer for color sorter suitable for your need as attached.</p>
    <p>In case of queries please let us know. We will be happy to discuss.</p>
    <div class="letter-footer">
      <p>Thanking you,</p>
      <div class="letter-signature">
        <strong>Subhas Siware</strong><br/>
        Admin Manager
      </div>
    </div>
  </div>
</div>

<!-- PAGE 3: TECHNICAL SPECIFICATIONS -->
<div class="page">
  ${LETTERHEAD}
  ${refRow(3)}

  <h2 class="specs-title">TECHNICAL SPECIFICATIONS:</h2>
  <table class="tech-specs-table">
    <tr><td><strong>01</strong></td><td><strong>Sorter Model</strong></td><td>${esc(f.model)}</td></tr>
    <tr><td><strong>02</strong></td><td><strong>Number of Modules/channels</strong></td><td>${esc(f.modules)}</td></tr>
    <tr><td><strong>03</strong></td><td><strong>Sorting modes</strong></td><td>Regular &amp; reverse sorting available</td></tr>
    <tr><td><strong>04</strong></td><td><strong>Total Cameras</strong></td><td>${esc(f.cameras)}</td></tr>
    <tr><td><strong>05</strong></td><td><strong>Lighting system</strong></td><td>Hi Lux LOW WATTAGE LED multi strips</td></tr>
    <tr><td><strong>06</strong></td><td><strong>Air Filter System</strong></td><td>Set of micro filters</td></tr>
    <tr><td><strong>07</strong></td><td><strong>Compressed Air Required</strong></td><td>${esc(f.airReq)}</td></tr>
    <tr><td><strong>08</strong></td><td><strong>GUI Configuration</strong></td><td>USEPL, INDIA</td></tr>
    <tr><td><strong>09</strong></td><td><strong>Sorting algorithm</strong></td><td>USEPL, INDIA</td></tr>
    <tr><td><strong>10</strong></td><td><strong>Product sprouting</strong></td><td>Provided, MOC: Stainless Steel</td></tr>
    <tr><td><strong>11</strong></td><td><strong>Aspiration system</strong></td><td>Multipoint with sprouts. PVC connecting pipes are provided.</td></tr>
    <tr><td><strong>12</strong></td><td><strong>Power Required</strong></td><td>1-Phase 230V AC. Only UPS Supply.</td></tr>
  </table>
</div>

<!-- PAGE 4: COMMERCIAL OFFER & TERMS -->
<div class="page">
  ${LETTERHEAD}
  ${refRow(4)}

  <h2 class="specs-title">COMMERCIAL OFFER:</h2>
  <table class="qt">
    <colgroup>
      <col style="width:8%"/><col style="width:20%"/><col style="width:32%"/>
      <col style="width:10%"/><col style="width:15%"/><col style="width:15%"/>
    </colgroup>
    <thead>
      <tr>
        <th class="th-qty">Sl. No.</th>
        <th class="th-desc" colspan="2">MODEL</th>
        <th class="th-qty">QTY</th>
        <th class="th-price">UNIT PRICE</th>
        <th class="th-price">TOTAL AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      <tr class="item-row">
        <td class="td-qty">1.</td>
        <td class="td-model"><strong>${esc(f.model).replace(" (", "<br/>(")}</strong></td>
        <td class="td-desc">
          <div><strong>UNIQUE Color Sorter</strong></div>
          <div>With Intelligent sorting technology</div>
        </td>
        <td class="td-qty">1 Nos</td>
        <td class="td-price"><strong>${base ? "₹ " + fmtINR(base) : "—"}</strong></td>
        <td class="td-price"><strong>${base ? "₹ " + fmtINR(base) : "—"}</strong></td>
      </tr>
      <tr>
        <td style="border-right:1px solid #ccc;padding:5px 8px"></td>
        <td style="border-right:1px solid #ccc;padding:5px 8px"></td>
        <td class="td-gst-lbl"><strong>Add GST 18%</strong></td>
        <td style="border-right:1px solid #ccc;padding:5px 8px"></td>
        <td style="border-right:1px solid #ccc;padding:5px 8px"></td>
        <td class="td-gst-val"><strong>${base ? "₹ " + fmtINR(gst18) : "—"}</strong></td>
      </tr>
      <tr style="border-top:2px solid #000;">
        <td style="border-right:1px solid #ccc;padding:2px 8px"></td>
        <td style="border-right:1px solid #ccc;padding:2px 8px"></td>
        <td style="border-right:1px solid #ccc;padding:2px 8px"></td>
        <td style="border-right:1px solid #ccc;padding:2px 8px"></td>
        <td style="border-right:1px solid #ccc;padding:2px 8px;text-align:right;font-weight:900;"><strong>TOTAL</strong></td>
        <td class="td-total"><strong>${base ? "₹ " + fmtINR(total) : "—"}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="amt-words">
    Amount In words: <span class="yl">${base ? toWords(total) : "—"}</span>
  </div>

  <h3 class="specs-title">TERMS &amp; CONDITIONS:</h3>
  <div class="terms">
    <div class="term"><span class="term-lbl">1. Taxes &amp; levies:</span><span class="term-val">GST 18% added in above price. Any other taxes and levies applicable during the invoice will be extra.</span></div>
    <div class="term"><span class="term-lbl">2. Freight &amp; transit insurance:</span><span class="term-val"><span class="yl">${esc(f.freight) || "—"}</span></span></div>
    <div class="term"><span class="term-lbl">3. Payment terms:</span><span class="term-val"><span class="yl">${esc(f.paymentTerms).replace(/\n/g, "<br/>") || "—"}</span></span></div>
    <div class="term"><span class="term-lbl">4. Delivery:</span><span class="term-val"><span class="yl">${esc(f.deliveryFrom) || "—"} To ${esc(f.deliveryTo) || "—"}</span> working weeks from Receipt of confirmed purchase order with advance.</span></div>
    <div class="term"><span class="term-lbl">5. Commodity:</span><span class="term-val"><span class="yl">${esc(f.commodity) || "—"}</span>, must be free from Stone &amp; other impurities.</span></div>
    <div class="term"><span class="term-lbl">6. Warranty:</span><span class="term-val">12 months from the date of commissioning or 14 months from date of invoicing whichever is earlier. Warranty doesn't cover glass, wiper brush &amp; wiper rubber. Warranty doesn't cover defects or performance issues of parts occurred by (1) water/moisture damage of compressed air, (2) by not changing the air filters in time (3) by poor earthing (4) by faults due to failure of CVCF.</span></div>
    <div class="term"><span class="term-lbl">7. Commissioning:</span><span class="term-val">In our scope. Arrangement needs to be done by you for commutation of engineer from lodging place to mill.</span></div>
  </div>
</div>

<!-- PAGE 5: TERMS CONTINUED, BANK, EXCLUSIONS -->
<div class="page">
  ${LETTERHEAD}
  ${refRow(5)}

  <div class="terms">
    <div class="term"><span class="term-lbl">8. Quotation Validity:</span><span class="term-val"><span class="yl">${esc(f.quotationValidity) || "—"}</span> days only.</span></div>
    <div class="term"><span class="term-lbl">9. Our Bank Details:</span><span class="term-val"></span></div>
  </div>

  <div class="bank-details">
    <p><strong>A/c Name:</strong> UNIQUE SORTER &amp; EQUIPMENTS (P) LTD.</p>
    <p><strong>A/c No.:</strong> 0047 846 0000 1921</p>
    <p><strong>Bank:</strong> YES BANK</p>
    <p><strong>Branch:</strong> CIVIL LINE, RAIPUR</p>
    <p><strong>IFSC Code:</strong> YESB0 00 00 47</p>
  </div>

  <h3 class="specs-title">EXCLUSIONS:</h3>
  <ul class="exclusions-list">
    <li>Air Compressor, Air Dryer, Air Receiver Tank, Air Filters Etc. It can be sourced from any of the manufacturers having good service with an assurance of oil &amp; water free air.</li>
    <li>CVCF (Constant Voltage Constant Frequency) 220V, Single phase, 7.5-KVA</li>
    <li>Elevators of suitable capacity with provision of aspiration points.</li>
    <li>Fabrications of structure, erection of machines and any other thing which is not mentioned above are not included in the supply.</li>
    <li>Sorter Cabin, AC, Exhaust Fan to be arranged &amp; commissioned before commissioning of sorter machine.</li>
    <li>Dust aspiration fan and related piping connection to be done before commissioning.</li>
    <li>Earthing: 0 V megger value is required. This is compulsory need to dedicated Earth pit for Sorter machine only. No other device to be used.</li>
  </ul>
</div>

<!-- PAGE 6: FORCE MAJEURE & SIGNATURE -->
<div class="page">
  ${LETTERHEAD}
  ${refRow(6)}

  <h3 class="specs-title">Force Majeure:</h3>
  <p style="line-height:1.6;margin-bottom:15px;">Neither party shall be held liable for any failure or delay in fulfilling their obligations under this quotation (excluding outstanding payment obligations) if such failure or delay is caused by events beyond their reasonable control.</p>
  <p style="line-height:1.6;margin-bottom:20px;">Such events include, but are not limited to: acts of God, natural disasters, war, armed conflict, trade embargoes, international sanctions, strikes or labor disputes, government interventions, severe supply chain or raw material shortages, and sudden operational disruptions at the Port of Shanghai (including port closures, strikes, or extreme congestion).</p>

  <div class="stamp-row">
    <img src="/stamp.png" alt="Company Stamp" style="display:block;width:47%;object-fit:contain;"/>
  </div>
  <div style="height:0;border-top:1px solid #555;width:47%;margin:2px 0 8px;"></div>

  <div class="for-row">
    <span>For, Unique Sorter &amp; Equipments Pvt. Ltd:</span>
    <span>Accepted by Customer:</span>
  </div>

  <div style="text-align:right;margin-top:20px;">
    <strong>Subhas Siware</strong><br/>
    Admin Manager
  </div>

  <div class="doc-footer">This is Computer Generated Quotation</div>
</div>

</body>
</html>`;
}

/* ─── Form UI styles ──────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .qf-root { min-height:100vh; background:#eef0f5; font-family:'DM Sans',sans-serif; }
  .qf-bar { position:sticky; top:0; z-index:100; height:52px; background:#0d1828; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; gap:12px; padding:0 24px; }
  .qf-bar-back { display:flex; align-items:center; gap:6px; color:rgba(255,255,255,.38); font-size:12px; font-weight:500; text-decoration:none; letter-spacing:.2px; transition:color .15s; }
  .qf-bar-back:hover { color:rgba(255,255,255,.8); }
  .qf-bar-dot { width:1px; height:22px; background:rgba(255,255,255,.1); }
  .qf-bar-title { font-family:'Inter',sans-serif; font-size:13.5px; font-weight:700; color:#fff; letter-spacing:.2px; }
  .qf-bar-space { flex:1; }
  .qf-bar-btn { height:30px; padding:0 14px; border-radius:6px; border:1px solid rgba(255,255,255,.12); background:transparent; color:rgba(255,255,255,.45); font-size:12px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .15s; }
  .qf-bar-btn:hover { border-color:rgba(255,255,255,.28); color:rgba(255,255,255,.8); }
  .qf-bar-btn-primary { height:30px; padding:0 16px; border-radius:6px; border:none; background:#1A37AA; color:#fff; font-size:12px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 10px rgba(26,55,170,.5); transition:all .15s; }
  .qf-bar-btn-primary:hover { background:#1e42cc; transform:translateY(-1px); }
  .qf-content { max-width:1080px; margin:0 auto; padding:36px 32px 80px; }
  .qf-page-head { margin-bottom:32px; padding-bottom:24px; border-bottom:2px solid rgba(13,24,40,.08); display:flex; align-items:flex-end; justify-content:space-between; }
  .qf-page-head h1 { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#0d1828; letter-spacing:-.3px; line-height:1.25; }
  .qf-page-head p { font-family:'Inter',sans-serif; font-size:13px; color:#6b7a90; margin-top:4px; font-weight:400; }
  .qf-page-head-meta { font-family:'Barlow Condensed',sans-serif; font-size:11px; font-weight:600; letter-spacing:1.2px; color:#9aa5b8; text-transform:uppercase; }
  .qf-section { animation:qf-rise .35s cubic-bezier(.22,.68,0,1.05) both; }
  @keyframes qf-rise { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .qf-divider { display:flex; align-items:center; gap:14px; margin:36px 0 20px; }
  .qf-divider:first-child { margin-top:0; }
  .qf-divider-num { width:24px; height:24px; border-radius:50%; background:#1A37AA; color:#fff; font-family:'Barlow Condensed',sans-serif; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .qf-divider-label { font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:#0d1828; letter-spacing:.1px; white-space:nowrap; }
  .qf-divider-line { flex:1; height:1px; background:rgba(13,24,40,.1); }
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
  .mt { margin-top:16px; }
  .qf-f { display:flex; flex-direction:column; gap:5px; }
  .qf-lbl { font-size:11px; font-weight:600; color:#4a5568; letter-spacing:.3px; display:flex; align-items:center; gap:4px; }
  .req { color:#e05555; }
  .qf-in, .qf-sel, .qf-ta { width:100%; border:1.5px solid #d8dfe8; border-radius:8px; padding:10px 13px; font-size:13.5px; font-family:'DM Sans',sans-serif; color:#0d1828; background:#fff; line-height:1.5; transition:border-color .18s,box-shadow .18s,background .18s; }
  .qf-in::placeholder, .qf-ta::placeholder { color:#b0bbc9; }
  .qf-in:hover, .qf-sel:hover { border-color:#b0bbc9; }
  .qf-in:focus, .qf-sel:focus, .qf-ta:focus { border-color:#1A37AA; box-shadow:0 0 0 3px rgba(26,55,170,.09); outline:none; background:#fafbff; }
  .qf-sel { cursor:pointer; appearance:none; padding-right:34px; background-image:url("data:image/svg+xml,%3Csvg width='11' height='7' viewBox='0 0 11 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5.5 5.5L10 1' stroke='%236b7a90' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; }
  .qf-in.readonly { background:#f2f4f8; color:#7a8899; cursor:default; border-color:#e0e5ed; border-style:dashed; }
  .qf-pricing-panel { background:#0d1828; border-radius:12px; padding:22px 28px; margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:0; position:relative; overflow:hidden; }
  .qf-pricing-panel::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 80% at 100% 50%,rgba(26,55,170,.25) 0%,transparent 70%); pointer-events:none; }
  .qf-pricing-left { display:flex; flex-direction:column; gap:10px; padding-right:28px; border-right:1px solid rgba(255,255,255,.08); }
  .qf-pricing-right { display:flex; flex-direction:column; justify-content:center; padding-left:28px; }
  .qf-pricing-row { display:flex; justify-content:space-between; align-items:center; }
  .qf-pricing-lbl { font-size:12px; color:rgba(255,255,255,.45); }
  .qf-pricing-val { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:600; color:rgba(255,255,255,.75); letter-spacing:.3px; }
  .qf-pricing-sep { height:1px; background:rgba(255,255,255,.07); margin:4px 0; }
  .qf-total-label { font-size:10px; font-weight:700; color:rgba(255,255,255,.4); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  .qf-total-amount { font-family:'Barlow Condensed',sans-serif; font-size:34px; font-weight:800; color:#fff; letter-spacing:.5px; line-height:1; }
  .qf-total-words { font-size:11px; color:rgba(255,255,255,.35); font-style:italic; margin-top:7px; line-height:1.5; }
  .qf-footer { margin-top:40px; padding-top:24px; border-top:1px solid rgba(13,24,40,.08); display:flex; justify-content:flex-end; gap:10px; align-items:center; }
  .qf-footer-reset { height:42px; padding:0 20px; border-radius:8px; border:1.5px solid #d0d8e4; background:transparent; color:#6b7a90; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; transition:all .15s; }
  .qf-footer-reset:hover { border-color:#b0bbc9; color:#0d1828; background:rgba(13,24,40,.03); }
  .qf-footer-preview { height:42px; padding:0 22px; border-radius:8px; border:1.5px solid #1A37AA; background:transparent; color:#1A37AA; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all .18s; }
  .qf-footer-preview:hover { background:rgba(26,55,170,.06); }
  .qf-footer-save { height:42px; padding:0 28px; border-radius:8px; border:none; background:#1A37AA; color:#fff; font-size:13.5px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 2px 12px rgba(26,55,170,.45); transition:all .18s; }
  .qf-footer-save:hover { background:#1e42cc; transform:translateY(-1px); }
  .qf-footer-save-green { height:42px; padding:0 28px; border-radius:8px; border:none; background:#52ba4f; color:#fff; font-size:13.5px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 2px 12px rgba(82,186,79,.45); transition:all .18s; }
  .qf-footer-save-green:hover { background:#47a844; transform:translateY(-1px); }
  .qf-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#1a2a1a; color:#7edd7b; border:1px solid #3a6b38; border-radius:10px; padding:10px 20px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px; z-index:9999; box-shadow:0 8px 32px rgba(0,0,0,.35); animation:qf-toast-in .2s ease both; }
  @keyframes qf-toast-in { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
  .qf-overlay { position:fixed; inset:0; z-index:200; background:rgba(10,16,32,.72); backdrop-filter:blur(4px); display:flex; flex-direction:column; animation:qf-fade-in .18s ease both; }
  @keyframes qf-fade-in { from{opacity:0} to{opacity:1} }
  .qf-modal-bar { flex-shrink:0; height:54px; background:#0d1828; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:12px; padding:0 20px; }
  .qf-modal-title { font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:#fff; letter-spacing:.2px; flex:1; }
  .qf-modal-close { height:30px; padding:0 14px; border-radius:6px; border:1px solid rgba(255,255,255,.12); background:transparent; color:rgba(255,255,255,.5); font-size:12px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .15s; }
  .qf-modal-close:hover { border-color:rgba(255,255,255,.3); color:#fff; }
  .qf-modal-download { height:30px; padding:0 16px; border-radius:6px; border:none; background:#52ba4f; color:#fff; font-size:12px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 10px rgba(82,186,79,.4); transition:all .15s; }
  .qf-modal-download:hover { background:#47a844; transform:translateY(-1px); }
  .qf-modal-iframe-wrap { flex:1; overflow:auto; background:#a0a8b8; display:flex; flex-direction:column; align-items:center; padding:24px 16px 40px; gap:20px; }
  .qf-modal-iframe-wrap iframe { border:none; width:860px; height:1200px; flex-shrink:0; background:#fff; box-shadow:0 8px 48px rgba(0,0,0,.35); }
`;

/* ─── Tiny helpers ────────────────────────────────────────────── */
function Div({ label, n }) {
  return (
    <div className="qf-divider">
      <span className="qf-divider-num">{n}</span>
      <span className="qf-divider-label">{label}</span>
      <span className="qf-divider-line" />
    </div>
  );
}
function F({ label, required, children }) {
  return (
    <div className="qf-f">
      <label className="qf-lbl">
        {label}
        {required && <span className="req">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function QuotationForm2() {
  const [f, setF] = useState(INIT());
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);
  const iframeRef = useRef(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const selectProduct = (id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    setF((prev) => ({
      ...prev,
      productId: id,
      model: p.model,
      modules: p.modules,
      cameras: p.cameras,
      airReq: p.airReq,
      basePrice: p.basePrice,
    }));
  };

  const handleSave = () => {
    const base = parseFloat(f.basePrice) || 0;
    const gst18 = base * 0.18;
    const total = base + gst18;
    const record = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      ...f,
      gst18,
      total,
      gstRate: 18,
    };
    const existing = JSON.parse(
      localStorage.getItem("usepl_quotations2") || "[]",
    );
    localStorage.setItem(
      "usepl_quotations2",
      JSON.stringify([record, ...existing]),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const base = parseFloat(f.basePrice) || 0;
  const gst18 = base * 0.18;
  const total = base + gst18;

  /* ── Download: capture each .page div as one PDF page ── */
  const handleDownload = async () => {
    setDownloading(true);
    /* Clean up any leaked elements from a previous failed download */
    document.querySelectorAll("style[data-qf2]").forEach((s) => s.remove());
    document.querySelectorAll("[data-qf2-shell]").forEach((s) => s.remove());
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const parser = new DOMParser();
      const doc = parser.parseFromString(buildHTML(f), "text/html");

      const rawStyle = doc.querySelector("style")?.textContent || "";
      const cleanStyle = rawStyle
        .replace(/\bbody\s*\{[^}]*\}/gs, "")
        .replace(/\bhtml\s*\{[^}]*\}/gs, "");

      /* Convert stamp to base64 so html2canvas can render it off-screen */
      const stampB64 = await fetch("/stamp.png")
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise((res) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result);
              reader.readAsDataURL(blob);
            }),
        );
      doc.querySelectorAll('img[alt="Company Stamp"]').forEach((img) => {
        img.src = stampB64;
      });

      /* Inject CSS into main document */
      const styleEl = document.createElement("style");
      styleEl.setAttribute("data-qf2", "1");
      styleEl.textContent = cleanStyle;
      document.head.appendChild(styleEl);

      /* Place all .page elements off-screen */
      const shell = document.createElement("div");
      shell.setAttribute("data-qf2-shell", "1");
      shell.style.cssText =
        "position:fixed;top:0;left:-9999px;width:794px;overflow:visible;z-index:-1;display:flex;flex-direction:column;gap:20px;";
      doc.querySelectorAll(".page").forEach((p) => shell.appendChild(p));
      document.body.appendChild(shell);

      await document.fonts.ready;
      await Promise.all(
        Array.from(shell.querySelectorAll("img")).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              }),
        ),
      );
      await new Promise((r) => setTimeout(r, 300));

      const pages = Array.from(shell.querySelectorAll(".page"));
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const filename = `Quotation-3pg${f.refNo ? "_" + f.refNo.replace(/\//g, "-") : ""}.pdf`;

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 794,
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        const imgH = pdfW * (canvas.height / canvas.width);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfW, Math.min(imgH, pdfH));

        /* Link annotations */
        const pageRect = pages[i].getBoundingClientRect();
        const scaleX = pdfW / pages[i].offsetWidth;
        const scaleY = Math.min(imgH, pdfH) / pages[i].offsetHeight;
        pages[i].querySelectorAll("a[href]").forEach((a) => {
          const r = a.getBoundingClientRect();
          pdf.link(
            (r.left - pageRect.left) * scaleX,
            (r.top - pageRect.top) * scaleY,
            r.width * scaleX,
            r.height * scaleY,
            { url: a.href },
          );
        });
      }

      pdf.save(filename);
    } finally {
      document.querySelectorAll("style[data-qf2]").forEach((s) => s.remove());
      const shell = document.querySelector("[data-qf2-shell]");
      if (shell) shell.remove();
      setDownloading(false);
    }
  };

  return (
    <div className="qf-root">
      <style>{CSS}</style>

      {/* ── SAVE TOAST ── */}
      {saved && (
        <div className="qf-toast">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Quotation saved successfully
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {showPreview && (
        <div className="qf-overlay">
          <div className="qf-modal-bar">
            <span className="qf-modal-title">
              Quotation Preview — 6 Pages{f.refNo && ` · ${f.refNo}`}
            </span>
            <button
              className="qf-modal-download"
              onClick={handleDownload}
              disabled={downloading}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloading ? "Generating…" : "Download PDF"}
            </button>
            <button
              className="qf-modal-close"
              onClick={() => setShowPreview(false)}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close
            </button>
          </div>
          <div className="qf-modal-iframe-wrap">
            <iframe
              ref={iframeRef}
              srcDoc={buildHTML(f)}
              title="Quotation Preview"
              style={{
                width: "860px",
                height: "1200px",
                border: "none",
                background: "#fff",
                boxShadow: "0 8px 48px rgba(0,0,0,.35)",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="qf-bar">
        <Link href="/dashboard" className="qf-bar-back">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </Link>
        <div className="qf-bar-dot" />
        <span className="qf-bar-title">New Quotation (6-Page)</span>
        <div className="qf-bar-space" />
        <button className="qf-bar-btn" onClick={() => setF(INIT())}>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
          </svg>
          Reset
        </button>
        <button className="qf-bar-btn" onClick={() => setShowPreview(true)}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
        <button
          className="qf-bar-btn-primary"
          onClick={handleDownload}
          disabled={downloading}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? "Generating…" : "Download PDF"}
        </button>
        <button
          className="qf-bar-btn-save"
          style={{
            height: 30,
            padding: "0 16px",
            borderRadius: 6,
            border: "none",
            background: "#52ba4f",
            color: "#fff",
            fontSize: 12,
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 10px rgba(82,186,79,.4)",
          }}
          onClick={handleSave}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save
        </button>
      </div>

      <div className="qf-content">
        <div className="qf-page-head">
          <div>
            <h1>Create Quotation — 6 Page Format</h1>
            <p>Fill in the client details below. All static content is pre-filled automatically.</p>
          </div>
          <span className="qf-page-head-meta">Unique Sorter &amp; Equipments</span>
        </div>

        <div className="qf-section">
            {/* ── QUOTATION REFERENCE ── */}
            <Div label="Quotation Reference" n={1} />
            <div className="g2">
              <F label="Ref Number" required>
                <input
                  className="qf-in"
                  value={f.refNo}
                  onChange={(e) => set("refNo", e.target.value)}
                  placeholder="USEPL/Q-D/2026/005/R0"
                />
              </F>
              <F label="Date" required>
                <input
                  className="qf-in"
                  type="date"
                  value={f.refDate}
                  onChange={(e) => set("refDate", e.target.value)}
                />
              </F>
            </div>

            {/* ── CLIENT DETAILS ── */}
            <Div label="Client Details" n={2} />
            <div className="g2">
              <F label="Company Name" required>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    className="qf-sel"
                    value={f.companyPrefix}
                    onChange={(e) => set("companyPrefix", e.target.value)}
                    style={{ width: 90, flexShrink: 0 }}
                  >
                    <option value="">— Prefix</option>
                    <option>M/s.</option>
                    <option>Mr.</option>
                    <option>Mrs.</option>
                    <option>Ms.</option>
                    <option>Dr.</option>
                    <option>Er.</option>
                  </select>
                  <input
                    className="qf-in"
                    value={f.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="Company / Person name"
                    style={{ flex: 1 }}
                  />
                </div>
              </F>
              <F label="GSTIN">
                <input
                  className="qf-in"
                  value={f.gstin}
                  onChange={(e) => set("gstin", e.target.value)}
                  placeholder="21AAICP5617PZ3"
                />
              </F>
            </div>
            <div className="mt">
              <F label="Address" required>
                <input
                  className="qf-in"
                  value={f.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="CHHAGAON, GURUDIJHATIA CUTTACK – [ODISHA]"
                />
              </F>
            </div>
            <div className="g2 mt">
              <F label="Contact Person" required>
                <input
                  className="qf-in"
                  value={f.contact}
                  onChange={(e) => set("contact", e.target.value)}
                  placeholder="Col. P. K Mohanty (Retd)"
                />
              </F>
              <F label="Mobile" required>
                <input
                  className="qf-in"
                  value={f.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  placeholder="+91 9692160283"
                />
              </F>
            </div>

            {/* ── COMMERCIAL OFFER ── */}
            <Div label="Commercial Offer" n={3} />
            <F label="Select Product Model" required>
              <select
                className="qf-sel"
                value={f.productId}
                onChange={(e) => selectProduct(e.target.value)}
                style={!f.productId ? { color: "#b0bbc9" } : {}}
              >
                <option value="" disabled>— Choose PINNACLE model (6V / 8V / 10V) —</option>
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </F>
            {!f.productId && (
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 8, fontSize: 12, color: "#8a6d00" }}>
                Select a product above to auto-fill model specs and price.
              </div>
            )}
            <div className="g2 mt">
              <F label="Model Name">
                <input
                  className={`qf-in${!f.productId ? "" : " readonly"}`}
                  readOnly={!!f.productId}
                  value={f.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="Auto-filled from product selection"
                />
              </F>
              <F label="Modules / Channels">
                <input
                  className={`qf-in${!f.productId ? "" : " readonly"}`}
                  readOnly={!!f.productId}
                  value={f.modules}
                  onChange={(e) => set("modules", e.target.value)}
                  placeholder="Auto-filled from product selection"
                />
              </F>
            </div>
            <div className="g2 mt">
              <F label="Total Cameras">
                <input
                  className={`qf-in${!f.productId ? "" : " readonly"}`}
                  readOnly={!!f.productId}
                  value={f.cameras}
                  onChange={(e) => set("cameras", e.target.value)}
                  placeholder="Auto-filled from product selection"
                />
              </F>
              <F label="Compressed Air Required">
                <input
                  className={`qf-in${!f.productId ? "" : " readonly"}`}
                  readOnly={!!f.productId}
                  value={f.airReq}
                  onChange={(e) => set("airReq", e.target.value)}
                  placeholder="Auto-filled from product selection"
                />
              </F>
            </div>
            <div className="g2 mt">
              <F label="Base Price (₹)" required>
                <input
                  className="qf-in"
                  type="number"
                  value={f.basePrice}
                  onChange={(e) => set("basePrice", e.target.value)}
                  placeholder="Select product or enter manually"
                />
              </F>
              <F label="GST Amount (₹) — 18%">
                <input
                  className="qf-in readonly"
                  readOnly
                  value={base ? fmtINR(gst18) : ""}
                  placeholder="Auto-calculated"
                />
              </F>
            </div>

            {base > 0 && (
              <div className="qf-pricing-panel" style={{ marginTop: 16 }}>
                <div className="qf-pricing-left">
                  <div className="qf-pricing-row">
                    <span className="qf-pricing-lbl">
                      Base Price (excl. GST)
                    </span>
                    <span className="qf-pricing-val">₹ {fmtINR(base)}</span>
                  </div>
                  <div className="qf-pricing-sep" />
                  <div className="qf-pricing-row">
                    <span className="qf-pricing-lbl">GST @ 18%</span>
                    <span className="qf-pricing-val">₹ {fmtINR(gst18)}</span>
                  </div>
                  <div className="qf-pricing-sep" />
                  <div className="qf-pricing-row">
                    <span className="qf-pricing-lbl">Total Payable</span>
                    <span
                      className="qf-pricing-val"
                      style={{ color: "#fff", fontSize: 17 }}
                    >
                      ₹ {fmtINR(total)}
                    </span>
                  </div>
                </div>
                <div className="qf-pricing-right">
                  <div className="qf-total-label">Amount in Words</div>
                  <div className="qf-total-amount">₹{fmtINR(total)}</div>
                  <div className="qf-total-words">{toWords(total)}</div>
                </div>
              </div>
            )}

            {/* ── TERMS & CONDITIONS ── */}
            <Div label="Terms & Conditions" n={4} />
            <div className="g2">
              <F label="Freight & Transit Insurance">
                <input
                  className="qf-in"
                  value={f.freight}
                  onChange={(e) => set("freight", e.target.value)}
                  placeholder="In your scope."
                />
              </F>
              <F label="Commodity">
                <input
                  className="qf-in"
                  value={f.commodity}
                  onChange={(e) => set("commodity", e.target.value)}
                  placeholder="Rice"
                />
              </F>
            </div>
            <div className="mt">
              <F label="Payment Terms">
                <textarea
                  className="qf-ta"
                  rows={3}
                  value={f.paymentTerms}
                  onChange={(e) => set("paymentTerms", e.target.value)}
                  placeholder="50% as advance along with order.&#10;Balance payment before dispatch."
                />
              </F>
            </div>
            <div className="g3 mt">
              <F label="Delivery — From (weeks)">
                <input
                  className="qf-in"
                  type="number"
                  min="1"
                  value={f.deliveryFrom}
                  onChange={(e) => set("deliveryFrom", e.target.value)}
                  placeholder="7"
                />
              </F>
              <F label="Delivery — To (weeks)">
                <input
                  className="qf-in"
                  type="number"
                  min="1"
                  value={f.deliveryTo}
                  onChange={(e) => set("deliveryTo", e.target.value)}
                  placeholder="8"
                />
              </F>
              <F label="Quotation Validity (days)">
                <input
                  className="qf-in"
                  type="number"
                  min="1"
                  value={f.quotationValidity}
                  onChange={(e) => set("quotationValidity", e.target.value)}
                  placeholder="30"
                />
              </F>
            </div>
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#f6f8fc", border: "1px solid #e0e5ed", borderRadius: 8, fontSize: 12, color: "#6b7a90", lineHeight: 1.6 }}>
              <strong style={{ color: "#4a5568" }}>Static fields (pre-filled in PDF):</strong> Taxes &amp; levies · Warranty · Commissioning
            </div>

            {/* ── ACTIONS ── */}
            <div className="qf-footer">
              <button className="qf-footer-reset" onClick={() => setF(INIT())}>
                Reset Form
              </button>
              <button
                className="qf-footer-preview"
                onClick={() => setShowPreview(true)}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preview
              </button>
              <button className="qf-footer-save-green" onClick={handleSave}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Quotation
              </button>
              <button
                className="qf-footer-save"
                onClick={handleDownload}
                disabled={downloading}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {downloading ? "Generating…" : "Download PDF"}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
