// ============================================================
//  dashboard1.js  —  FULL FIXED VERSION
//
//  Backend response shape (server.py wraps orchestrator output):
//  {
//    status: "success",
//    pipeline_output: {
//      status: "success",
//      total_time: N,
//      pipeline_log: { steps: [...] },
//      agent_outputs: {
//        agent1: [...records],
//        agent2: { agent2_output: { risks, risk_score, status, disease },
//                  input_used: {...} },
//        agent3: { agent, strategy_used, priority, budget, water,
//                  llm_reason, plan: { actions:[...], status, ... } }
//      },
//      final_output: <same as agent_outputs.agent3>
//    }
//  }
// ============================================================

const API_URL = "http://127.0.0.1:8001";

window.onload = function () {

    // ─── ELEMENT REFS ────────────────────────────────────────
    const runBtn          = document.getElementById("runPipelineBtn");
    const pipelineResult  = document.getElementById("pipelineResult");
    const pipelineStatus  = document.getElementById("pipelineStatus");
    const openChat        = document.getElementById("openChatbotBtn");
    const closeChat       = document.getElementById("chatbotClose");
    const chatPopup       = document.getElementById("chatbotPopup");
    const sendBtn         = document.getElementById("chatSend");
    const chatInput       = document.getElementById("chatInput");
    const chatBox         = document.getElementById("chatMessages");
    const soilSlider      = document.getElementById("soilSlider");
    const tempSlider      = document.getElementById("tempSlider");
    const humidSlider     = document.getElementById("humidSlider");
    const soilVal         = document.getElementById("soilVal");
    const tempVal         = document.getElementById("tempVal");
    const humidVal        = document.getElementById("humidVal");

    // ─── SLIDER FILL ─────────────────────────────────────────
    function fillSlider(slider) {
        const min = Number(slider.min) || 0;
        const max = Number(slider.max) || 100;
        const pct = ((Number(slider.value) - min) / (max - min)) * 100;
        slider.style.background =
            `linear-gradient(to right, var(--green-primary) 0%, var(--green-primary) ${pct}%, #ddd ${pct}%, #ddd 100%)`;
    }

    function syncSensor() {
        soilVal.textContent  = soilSlider.value  + "%";
        tempVal.textContent  = tempSlider.value  + "°C";
        humidVal.textContent = humidSlider.value + "%";
        fillSlider(soilSlider);
        fillSlider(tempSlider);
        fillSlider(humidSlider);
    }

    soilSlider.addEventListener("input",  syncSensor);
    tempSlider.addEventListener("input",  syncSensor);
    humidSlider.addEventListener("input", syncSensor);
    syncSensor(); // init on load

    // All other .green-slider elements (budget, water, alert, sensitivity, learning)
    document.querySelectorAll(".green-slider").forEach(s => {
        fillSlider(s);
        s.addEventListener("input", () => fillSlider(s));
    });

    // ─── LIVE LABELS FOR AGENT 2/3/4 CONTROLS ────────────────
    const sensSlider   = document.getElementById("sensSlider");
    const sensVal      = document.getElementById("sensVal");
    const budgetSlider = document.getElementById("budgetSlider");
    const budgetVal    = document.getElementById("budgetVal");
    const waterSlider  = document.getElementById("waterSlider");
    const waterVal     = document.getElementById("waterVal");
    const alertSlider  = document.getElementById("alertSlider");
    const alertVal     = document.getElementById("alertVal");

    function syncControls() {
        if (sensSlider && sensVal) {
            const v = Number(sensSlider.value);
            sensVal.textContent = v < 40 ? "LOW" : v < 75 ? "MEDIUM" : "HIGH";
        }
        if (budgetSlider && budgetVal)
            budgetVal.textContent = "₹" + Number(budgetSlider.value).toLocaleString("en-IN");
        if (waterSlider && waterVal)
            waterVal.textContent = Number(waterSlider.value).toLocaleString("en-IN") + " L";
        if (alertSlider && alertVal) {
            const v = Number(alertSlider.value);
            alertVal.textContent = v < 30 ? "Relaxed" : v < 70 ? "Standard" : "Aggressive";
        }
    }
    [sensSlider, budgetSlider, waterSlider, alertSlider].forEach(s => {
        if (s) s.addEventListener("input", syncControls);
    });
    syncControls();

    // ─── STRATEGY BUTTONS ────────────────────────────────────
    document.querySelectorAll(".strategy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".strategy-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // ─── CHATBOT (UNTOUCHED — working fine) ──────────────────
    openChat.addEventListener("click",  () => chatPopup.classList.remove("hidden"));
    closeChat.addEventListener("click", () => chatPopup.classList.add("hidden"));
    chatInput.addEventListener("keydown", e => { if (e.key === "Enter") sendBtn.click(); });

    sendBtn.addEventListener("click", async () => {
        const msg = chatInput.value.trim();
        if (!msg) return;
        appendChat("user", msg);
        chatInput.value = "";
        const tid = "typing-" + Date.now();
        chatBox.insertAdjacentHTML("beforeend",
            `<div class="chat-msg-row bot-row" id="${tid}">
                <div class="chat-avatar bot-av"></div>
                <div class="typing-bubble">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
             </div>`);
        chatBox.scrollTop = chatBox.scrollHeight;
        try {
            const res  = await fetch(API_URL + "/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            document.getElementById(tid)?.remove();
            appendChat("bot", data.reply || "No response");
        } catch {
            document.getElementById(tid)?.remove();
            appendChat("bot", "⚠️ Backend not reachable.");
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    function appendChat(role, text) {
        if (role === "user") {
            chatBox.insertAdjacentHTML("beforeend",
                `<div class="chat-msg-row user-row">
                    <div class="chat-bubble user-bubble">${text}</div>
                 </div>`);
        } else {
            chatBox.insertAdjacentHTML("beforeend",
                `<div class="chat-msg-row bot-row">
                    <div class="chat-avatar bot-av"></div>
                    <div class="chat-bubble bot-bubble">${text}</div>
                 </div>`);
        }
    }

    // ─── RUN HISTORY (real data for charts) ──────────────────
    function getRunHistory() {
        try { return JSON.parse(localStorage.getItem("run_history")) || []; }
        catch { return []; }
    }
    function pushRunHistory(entry) {
        const h = getRunHistory();
        h.push(entry);
        localStorage.setItem("run_history", JSON.stringify(h.slice(-12)));
    }
    function drawEmpty(canvas, msg) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#9aa89a";
        ctx.font = "10px 'IBM Plex Mono',monospace";
        ctx.textAlign = "center";
        ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    }

    // ─── SPARKLINE CHART (Agent 4) — soil moisture per run ───
    function drawSparkline() {
        const canvas = document.getElementById("monitorChart");
        if (!canvas) return;
        let runs = getRunHistory();
        if (runs.length === 0) { drawEmpty(canvas, "no runs yet"); return; }
        if (runs.length === 1) runs = [runs[0], runs[0]]; // flat line for a single run
        const ctx = canvas.getContext("2d");
        const W = canvas.width, H = canvas.height;
        const pts = runs.map(r => r.soil ?? 0);
        const mn = Math.min(...pts), mx = Math.max(...pts);
        const span = (mx - mn) || 1;
        const sy = v => H - 6 - ((v - mn) / span) * (H - 12);
        const sx = i => (i / (pts.length - 1)) * W;
        ctx.clearRect(0, 0, W, H);
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(76,175,80,0.35)");
        g.addColorStop(1, "rgba(76,175,80,0)");
        ctx.beginPath();
        ctx.moveTo(sx(0), sy(pts[0]));
        pts.forEach((v, i) => { if (i > 0) ctx.lineTo(sx(i), sy(v)); });
        ctx.lineTo(sx(pts.length - 1), H); ctx.lineTo(0, H); ctx.closePath();
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx(0), sy(pts[0]));
        pts.forEach((v, i) => { if (i > 0) ctx.lineTo(sx(i), sy(v)); });
        ctx.strokeStyle = "#4caf50"; ctx.lineWidth = 2; ctx.stroke();
    }

    // ─── HISTORICAL RISK CHART — risk score per run ──────────
    // Teal = detected risk score, blue = score after the plan
    function drawHistChart() {
        const canvas = document.getElementById("histChart");
        if (!canvas) return;
        let runs = getRunHistory();
        if (runs.length === 0) { drawEmpty(canvas, "Run the pipeline to build history"); return; }
        if (runs.length === 1) runs = [runs[0], runs[0]]; // flat line for a single run
        const ctx = canvas.getContext("2d");
        const W = canvas.width, H = canvas.height;
        const actual    = runs.map(r => r.score ?? 0);
        const predicted = runs.map(r => r.after ?? r.score ?? 0);
        const labels    = runs.map(r => r.t || "");
        const maxV = Math.max(5, ...actual) * 1.15;
        const pad = { l:30, r:10, t:10, b:22 };
        const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
        const denom = Math.max(1, labels.length - 1);
        const sx = i => pad.l + i * (cW / denom);
        const sy = v => pad.t + cH - (v / maxV) * cH;
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = "#e8eee8"; ctx.lineWidth = 1;
        [0.25, 0.5, 0.75].forEach(f => {
            ctx.beginPath(); ctx.moveTo(pad.l, sy(maxV * f)); ctx.lineTo(W - pad.r, sy(maxV * f)); ctx.stroke();
        });

        // Y-axis tick values (risk score) so the scale is explicit
        ctx.fillStyle = "#9aa89a";
        ctx.font = "9px 'IBM Plex Mono',monospace";
        ctx.textAlign = "right";
        [0, 0.25, 0.5, 0.75].forEach(f =>
            ctx.fillText((maxV * f).toFixed(0), pad.l - 4, sy(maxV * f) + 3));

        function dl(pts, color, showValues) {
            ctx.beginPath(); ctx.moveTo(sx(0), sy(pts[0]));
            pts.forEach((v, i) => { if (i > 0) ctx.lineTo(sx(i), sy(v)); });
            ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
            pts.forEach((v, i) => {
                ctx.beginPath(); ctx.arc(sx(i), sy(v), 3, 0, Math.PI * 2);
                ctx.fillStyle = color; ctx.fill();
                if (showValues) {
                    ctx.fillStyle = "#667";
                    ctx.font = "9px 'IBM Plex Mono',monospace";
                    ctx.textAlign = "center";
                    ctx.fillText(String(v), sx(i), sy(v) - 6);
                }
            });
        }
        dl(predicted, "#90caf9"); dl(actual, "#26a69a", true);
        ctx.fillStyle = "#aaa"; ctx.font = "9px 'IBM Plex Mono',monospace"; ctx.textAlign = "center";
        labels.forEach((l, i) => ctx.fillText(l, sx(i), H - 5));
    }

    drawSparkline();
    drawHistChart();

    // ─── PIPELINE STEP HELPERS ────────────────────────────────
    const steps = [1,2,3,4,5].map(n => document.getElementById("step" + n));

    function resetSteps() {
        steps.forEach(s => s.classList.remove("active", "done"));
    }
    function activateStep(idx) {
        steps.forEach((s, i) => {
            s.classList.remove("active", "done");
            if (i < idx)  s.classList.add("done");
            if (i === idx) s.classList.add("active");
        });
    }
    function completeAllSteps() {
        steps.forEach(s => { s.classList.remove("active"); s.classList.add("done"); });
    }
    function setStatus(html, success = false) {
        pipelineStatus.innerHTML  = html;
        pipelineStatus.className = "pipeline-status-text" + (success ? " success" : "");
    }

    // ─── POPULATE RESULT PANEL ───────────────────────────────
    // Uses EXACT keys returned by orchestrator.py
    function showResult(serverResp, sentPayload) {
        const po     = serverResp.pipeline_output || {};   // server.py wraps here
        const ao     = po.agent_outputs           || {};   // agent1, agent2, agent3

        // agent2 structure: { agent2_output: { risks, risk_score, status, disease }, input_used }
        const a2wrap = ao.agent2 || {};
        const a2out  = a2wrap.agent2_output || a2wrap;

        // agent3 / final_output structure:
        // { agent, strategy_used, priority, budget, water, llm_reason,
        //   plan: { actions:[{type,cost_inr,water_liters,start,end,notes},...], status, ... } }
        const a3      = ao.agent3     || {};
        const final   = po.final_output || a3;

        // ── Soil Moisture ─────────────────────────────────────
        document.getElementById("res-soil").textContent =
            (sentPayload.agent1.soil_moisture ?? soilSlider.value) + "%";

        // ── Risk Score ────────────────────────────────────────
        const riskScore = a2out.risk_score ?? final.risk_score ?? "—";
        const riskStatus = a2out.status    || "";
        const el_risk    = document.getElementById("res-risk");
        if (el_risk) el_risk.textContent =
            "Score " + riskScore + (riskStatus ? " · " + riskStatus : "");

        // ── Recommended Action ────────────────────────────────
        const actions = final.plan?.actions || a3.plan?.actions || [];
        let actionText = "No plan returned";
        if (actions.length > 0) {
            const a0 = actions[0];
            if (typeof a0 === "object" && a0 !== null) {
                // type is e.g. "scouting", notes has details
                const name  = a0.name  || a0.type  || "Action";
                const notes = a0.notes || "";
                actionText = name.charAt(0).toUpperCase() + name.slice(1);
                if (notes) actionText += " — " + notes;
            } else {
                actionText = String(a0);
            }
        }
        const el_action = document.getElementById("res-action");
        if (el_action) el_action.textContent = actionText;

        // ── Memory / Budget from agent3 ───────────────────────
        const budget = final.budget || a3.budget || "—";
        const water  = final.water  || a3.water  || "—";
        const strat  = final.strategy_used || a3.strategy_used || "";
        const inr = n => (n === "—" || n === undefined) ? "—" : Number(n).toLocaleString("en-IN");
        const el_mem = document.getElementById("res-memory");
        if (el_mem) el_mem.textContent =
            "Budget ₹" + inr(budget) + " · Water " + inr(water) + "L" +
            (strat ? " · " + strat : "");

        // ── Real plan numbers (from the optimizer) ─────────────
        const plan      = final.plan || a3.plan || {};
        const planCost  = plan.total_cost_inr;
        const planWater = plan.total_water_liters;
        const reduction = plan.expected_risk_reduction;   // 0.0 – 1.0

        const el_red = document.getElementById("res-reduction");
        if (el_red) {
            if (reduction !== undefined && riskScore !== "—") {
                const after = (Number(riskScore) * (1 - reduction)).toFixed(1);
                el_red.textContent =
                    (reduction * 100).toFixed(0) + "% (score " + riskScore + " → " + after + ")";
            } else {
                el_red.textContent = "—";
            }
        }

        const el_cost = document.getElementById("res-cost");
        if (el_cost) el_cost.textContent =
            (planCost !== undefined ? "₹" + inr(planCost) : "—") +
            (planWater !== undefined ? " / " + inr(planWater) + "L" : "");

        // ── Agent 2 card risk box (top of page) ────────────────
        const rv = document.getElementById("riskScoreValue");
        const rb = document.getElementById("riskScoreBar");
        const rw = document.getElementById("riskWarn");
        if (rv && riskScore !== "—") rv.textContent = riskScore;
        if (rb && riskScore !== "—")
            rb.style.width = Math.min(100, Number(riskScore) * 10) + "%";
        if (rw) {
            const risks = a2out.risks || [];
            rw.textContent = risks.length > 0
                ? "⚠️ " + risks.map(r => r[0] + " (" + r[1] + ")").join(" · ")
                : "✅ No risks detected";
        }

        // ── Big plan card (bottom-right) ───────────────────────
        const yv = document.getElementById("yieldValue");
        if (yv) {
            if (reduction !== undefined && riskScore !== "—") {
                const after = (Number(riskScore) * (1 - reduction)).toFixed(1);
                yv.textContent = riskScore + " → " + after;
            } else {
                yv.textContent = "—";
            }
        }
        const ymVal = document.getElementById("yieldMetricVal");
        const ymBar = document.getElementById("yieldMetricBar");
        if (ymVal && planCost !== undefined && budget !== "—") {
            ymVal.textContent = "₹" + inr(planCost) + " of ₹" + inr(budget);
            if (ymBar) ymBar.style.width =
                Math.min(100, (planCost / Number(budget)) * 100) + "%";
        }
        const ys = document.getElementById("yieldStrategy");
        if (ys && strat) ys.textContent = strat;

        // ── System health badge (derived from real risk score) ─
        if (riskScore !== "—") {
            const health = Math.max(0, 100 - Number(riskScore) * 8);
            const sh = document.getElementById("sysHealthVal");
            if (sh) sh.textContent = health + "% " +
                (health > 70 ? "Nominal" : health > 40 ? "Degraded" : "Critical");
        }

        // ── Agent 5 card: real learning insight ────────────────
        const learning = final.learning || a3.learning || "";
        const mq = document.getElementById("memoryQuote");
        if (mq && learning) {
            const txt = String(learning)
                .replace(/[#*`_>]/g, "").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
            mq.textContent = '"' + txt.slice(0, 180) + (txt.length > 180 ? "…" : "") + '"';
        }

        pipelineResult.classList.add("visible");
    }

    // ─── RUN AGAIN / CLEAR DATA BUTTONS ──────────────────────
    const runAgainBtn  = document.getElementById("runAgainBtn");
    const clearHistBtn = document.getElementById("clearHistBtn");

    if (runAgainBtn) runAgainBtn.addEventListener("click", () => {
        runBtn.dataset.done = "0";           // force a fresh run, not navigation
        runAgainBtn.style.display = "none";
        runBtn.click();
    });

    if (clearHistBtn) clearHistBtn.addEventListener("click", () => {
        localStorage.removeItem("pipeline_result");
        localStorage.removeItem("pipeline_inputs");
        localStorage.removeItem("run_history");
        location.reload();                    // reset every card to its empty state
    });

    // ─── EXPORT BUTTONS ──────────────────────────────────────
    function downloadBlob(content, filename, type) {
        const blob = new Blob([content], { type });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    const exportJsonBtn = document.getElementById("exportJsonBtn");
    if (exportJsonBtn) exportJsonBtn.addEventListener("click", () => {
        const raw = localStorage.getItem("pipeline_result");
        if (!raw) { alert("Run the pipeline first — there is no result to export yet."); return; }
        downloadBlob(JSON.stringify(JSON.parse(raw), null, 2),
            "farm_pipeline_result.json", "application/json");
    });

    const exportDocBtn = document.getElementById("exportDocBtn");
    if (exportDocBtn) exportDocBtn.addEventListener("click", () => {
        const raw   = localStorage.getItem("pipeline_result");
        const rawIn = localStorage.getItem("pipeline_inputs");
        if (!raw) { alert("Run the pipeline first — there is no result to export yet."); return; }

        const clean = s => String(s ?? "")
            .replace(/[#*`_>]/g, "").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();

        const data = JSON.parse(raw);
        const inp  = rawIn ? JSON.parse(rawIn) : {};
        const po   = data.pipeline_output || {};
        const ao   = po.agent_outputs || {};
        const a2w  = ao.agent2 || {};
        const a2   = a2w.agent2_output || {};
        const used = a2w.input_used || {};
        const a3   = ao.agent3 || {};
        const plan = a3.plan || {};
        const mon  = a3.monitoring_feedback || {};
        const risks = (a2.risks || []).map(r => `<li><b>${r[0]}</b> — severity: ${r[1]}</li>`).join("")
            || "<li>No risks detected</li>";
        const actions = (plan.actions || []).map(a =>
            `<li><b>${a.type}</b> — cost ₹${a.cost_inr}, water ${a.water_liters}L. ${a.notes || ""}</li>`
        ).join("") || "<li>No actions required</li>";
        const reduction = plan.expected_risk_reduction;
        const after = reduction !== undefined
            ? (Number(a2.risk_score || 0) * (1 - reduction)).toFixed(1) : "—";

        const html = `
<html><head><meta charset="utf-8"><title>Farm Intelligence Report</title></head>
<body style="font-family:Calibri,Arial,sans-serif;line-height:1.5">
<h1>Agentic AI Farm Intelligence — Run Report</h1>
<p><b>Generated:</b> ${new Date().toLocaleString()} &nbsp;|&nbsp; <b>Pipeline time:</b> ${po.total_time ?? "—"}s</p>

<h2>1. What the farmer entered (dashboard inputs)</h2>
<ul>
<li>Crop: <b>${inp.crop ?? "—"}</b> &nbsp; Region: <b>${inp.region ?? "—"}</b></li>
<li>Soil moisture: <b>${inp.soil_moisture ?? "—"}%</b>, Temperature: <b>${inp.temperature ?? "—"}°C</b>, Humidity: <b>${inp.humidity ?? "—"}%</b></li>
<li>Budget limit: <b>₹${a3.budget ?? "—"}</b>, Water limit: <b>${a3.water ?? "—"} L</b>, Strategy: <b>${a3.strategy_used ?? "—"}</b></li>
</ul>

<h2>2. Agent 2 — Risk Analysis</h2>
<p>Analysis mode: <b>${used.analysis_mode ?? "—"}</b>, Sensitivity: <b>${used.sensitivity ?? "—"}</b></p>
<p>Overall status: <b>${a2.status ?? "—"}</b> with a risk score of <b>${a2.risk_score ?? "—"}</b>
(each HIGH risk adds 3 points, MEDIUM adds 2). Detected risks:</p>
<ul>${risks}</ul>
<p>Image scan result: <b>${a2.disease ?? "—"}</b></p>

<h2>3. Agent 3 — Decision &amp; Action Plan</h2>
<p><b>AI reasoning:</b> ${clean(a3.llm_reason)}</p>
<p>The optimizer chose these actions within the budget and water limits:</p>
<ul>${actions}</ul>
<p><b>Plan cost:</b> ₹${plan.total_cost_inr ?? "—"} of ₹${a3.budget ?? "—"} budget &nbsp;|&nbsp;
<b>Water allocated:</b> ${plan.total_water_liters ?? "—"} L</p>
<p><b>Expected effect:</b> the plan addresses about <b>${reduction !== undefined ? (reduction * 100).toFixed(0) + "%" : "—"}</b>
of the detected risk — the risk score is expected to drop from <b>${a2.risk_score ?? "—"}</b> to <b>${after}</b>.</p>

<h2>4. Agent 4 — Monitoring</h2>
<p>Status: <b>${mon.status ?? "—"}</b> &nbsp;|&nbsp; Escalation to expert: <b>${mon.escalation ? "YES" : "no"}</b></p>
<p>${[].concat(mon.feedback || []).join(". ")}</p>
<p><b>AI monitoring insight:</b> ${clean(mon.llm_insight)}</p>

<h2>5. Agent 5 — Memory &amp; Learning</h2>
<p>${clean(a3.learning)}</p>

<hr><p style="color:#777;font-size:10pt">Generated automatically by the Agentic AI Farm Intelligence System
(Mistral API). Risk score scale: 0 = safe; higher = more severe.</p>
</body></html>`;

        downloadBlob(html, "farm_intelligence_report.doc", "application/msword");
    });

    // ─── RESTORE LAST RESULT ON PAGE LOAD ────────────────────
    // Keeps the risk box and result panel filled after a refresh,
    // while the button stays ready to run a fresh pipeline.
    try {
        const savedRes = localStorage.getItem("pipeline_result");
        const savedIn  = localStorage.getItem("pipeline_inputs");
        if (savedRes) {
            showResult(JSON.parse(savedRes),
                       { agent1: savedIn ? JSON.parse(savedIn) : {} });
            completeAllSteps();
            setStatus("✔ Showing last run — adjust inputs and run again", true);
        }
    } catch (e) { /* no stored result yet */ }

    // ─── RUN PIPELINE ─────────────────────────────────────────
    runBtn.addEventListener("click", async () => {

        // Already succeeded — act as navigate button
        if (runBtn.dataset.done === "1") {
            window.location.href = "dashboard2.html";
            return;
        }

        const sentPayload = {
            query: "farm analysis",
            agent1: {
                soil_moisture: Number(soilSlider.value),
                temperature:   Number(tempSlider.value),
                humidity:      Number(humidSlider.value),
                crop:          document.getElementById("agent1-crop-select")?.value || "Rice",
                region:        document.getElementById("agent1-region-select")?.value || ""
            },
            agent2: {
                mode:        document.getElementById("agent1-crop-select")?.value || "Rice",
                analysis:    document.getElementById("analysisSelect")?.value || "full",
                sensitivity: Number(sensSlider?.value ?? 100)
            },
            agent3: {
                strategy: document.querySelector(".strategy-btn.active")
                              ?.textContent?.trim() || "Optimize Resources",
                budget:   Number(budgetSlider?.value ?? 0),
                water:    Number(waterSlider?.value ?? 0)
            },
            agent4: {
                alert_level: Number(alertSlider?.value ?? 50)
            }
        };

        // UI: start state
        runBtn.textContent = "Running…";
        runBtn.disabled    = true;
        runBtn.classList.add("running");
        runBtn.dataset.done = "0";
        pipelineResult.classList.remove("visible");
        resetSteps();

        const STEP_LABELS = [
            "Agent 1: Collecting sensor data…",
            "Agent 2: Running risk analysis…",
            "Agent 3: Generating decision plan…",
            "Agent 4: Monitoring sync…",
            "Agent 5: Memory calibration…"
        ];

        // Real progress: the backend reports which agent is currently
        // running via GET /progress — we poll it instead of guessing
        // with a timer, so the bar always matches the terminal.
        let stepIdx = 0;
        activateStep(0);
        setStatus(`<span class="pipeline-spinner"></span> ${STEP_LABELS[0]}`);

        const stepTimer = setInterval(async () => {
            try {
                const r = await fetch(API_URL + "/progress");
                const p = await r.json();
                if (p.step > 0) {
                    const idx = Math.min(p.step - 1, steps.length - 1);
                    if (idx !== stepIdx) {
                        stepIdx = idx;
                        activateStep(idx);
                        setStatus(`<span class="pipeline-spinner"></span> ${STEP_LABELS[idx]}`);
                    }
                }
            } catch (e) {
                // backend busy or unreachable — keep last known step
            }
        }, 2000);

        try {
            const res  = await fetch(API_URL + "/run-agent", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(sentPayload)
            });
            const data = await res.json();
            clearInterval(stepTimer);

            if (data.status === "success") {
                completeAllSteps();
                setStatus("✔ Pipeline complete — all 5 agents synced", true);

                // Save everything to localStorage so dashboard2 can read it
                localStorage.setItem("pipeline_result", JSON.stringify(data));
                localStorage.setItem("pipeline_inputs", JSON.stringify(sentPayload.agent1));

                // Record this run in history and refresh the charts
                try {
                    const po2 = data.pipeline_output || {};
                    const ao2 = po2.agent_outputs || {};
                    const s   = Number(((ao2.agent2 || {}).agent2_output || {}).risk_score ?? 0);
                    const red = (ao2.agent3?.plan?.expected_risk_reduction) ?? 0;
                    pushRunHistory({
                        t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        score: s,
                        after: Number((s * (1 - red)).toFixed(1)),
                        soil:  Number(soilSlider.value),
                        success: Math.max(0, Math.round(100 - s * 8))
                    });
                    drawSparkline();
                    drawHistChart();
                } catch (e) { /* history is cosmetic — never block results */ }

                // Show inline result panel
                showResult(data, sentPayload);

                runBtn.textContent  = "✔ View Report →";
                runBtn.disabled     = false;
                runBtn.dataset.done = "1";
                runBtn.classList.remove("running");
                runBtn.classList.add("success-btn");
                if (runAgainBtn) runAgainBtn.style.display = "";

            } else {
                resetSteps();
                setStatus("⚠ Error: " + (data.message || data.error || "Unknown error"));
                runBtn.textContent = "🚀 Run AI Pipeline";
                runBtn.disabled    = false;
                runBtn.classList.remove("running");
            }

        } catch (err) {
            clearInterval(stepTimer);
            resetSteps();
            setStatus("⚠ Cannot reach backend — is the server running on port 8001?");
            runBtn.textContent = "🚀 Run AI Pipeline";
            runBtn.disabled    = false;
            runBtn.classList.remove("running");
        }
    });
};
