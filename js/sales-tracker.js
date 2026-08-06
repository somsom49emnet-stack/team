/* ==========================================================================
   Module 2: 광고주 주간매출 취합 Hub (Excel Matrix & Accounting Engine)
   ========================================================================== */

const SalesTracker = (function () {
    const NET_RATE = 0.135; // 13.5% 순매출 회계 수수료율

    const columns = [
        { id: "w1", label: "8월1주차" },
        { id: "w2", label: "8월2주차", current: true },
        { id: "w3", label: "8월3주차" },
        { id: "w4", label: "8월4주차" },
        { id: "aug_close", label: "8월마감" },
        { id: "sep_exp", label: "9월예상마감" },
        { id: "sep_w1", label: "9월1주차" },
        { id: "sep_w2", label: "9월2주차" }
    ];

    const inputRows = [
        { id: "r1", code: "1", name: "직영DA", type: "innisfree_part" },
        { id: "r2", code: "2", name: "상시SA", type: "innisfree_part" },
        { id: "r3", code: "3", name: "BSA", type: "innisfree_part" },
        { id: "r4", code: "4", name: "카카오메시지", type: "innisfree_part" },
        { id: "r5", code: "5", name: "네이버", type: "innisfree_part" },
        { id: "r6", code: "6", name: "올리브영", type: "innisfree_part" },
        { id: "r7", code: "7", name: "쿠팡DA/PA", type: "innisfree_part" },
        { id: "rB", code: "B", name: "에뛰드", type: "brand_etude" },
        { id: "rC", code: "C", name: "에스쁘아", type: "brand_espoir" }
    ];

    // Default Matrix Values
    const defaultMatrix = {
        r1: { w1: 15000000, w2: 16000000, w3: 15500000, w4: 17000000, aug_close: 63500000, sep_exp: 65000000, sep_w1: 16000000, sep_w2: 16500000 },
        r2: { w1: 32000000, w2: 35000000, w3: 34000000, w4: 36000000, aug_close: 137000000, sep_exp: 140000000, sep_w1: 35000000, sep_w2: 36000000 },
        r3: { w1: 12000000, w2: 12500000, w3: 13000000, w4: 12500000, aug_close: 50000000, sep_exp: 52000000, sep_w1: 13000000, sep_w2: 13500000 },
        r4: { w1: 8000000, w2: 8500000, w3: 9000000, w4: 8500000, aug_close: 34000000, sep_exp: 36000000, sep_w1: 9000000, sep_w2: 9500000 },
        r5: { w1: 22000000, w2: 25000000, w3: 24000000, w4: 26000000, aug_close: 97000000, sep_exp: 100000000, sep_w1: 25000000, sep_w2: 26000000 },
        r6: { w1: 42000000, w2: 45000000, w3: 46000000, w4: 48000000, aug_close: 181000000, sep_exp: 190000000, sep_w1: 46000000, sep_w2: 47000000 },
        r7: { w1: 17000000, w2: 18000000, w3: 18500000, w4: 19000000, aug_close: 72500000, sep_exp: 75000000, sep_w1: 18000000, sep_w2: 18500000 },

        rB: { w1: 62000000, w2: 65000000, w3: 66000000, w4: 68000000, aug_close: 261000000, sep_exp: 270000000, sep_w1: 67000000, sep_w2: 68000000 },
        rC: { w1: 52000000, w2: 55000000, w3: 56000000, w4: 58000000, aug_close: 221000000, sep_exp: 230000000, sep_w1: 57000000, sep_w2: 58000000 }
    };

    const defaultComments = {
        brandA: "올리브영 기획전 집행 및 상시SA 매출 호조로 전주 대비 +7.3% 성장을 기록하였습니다.",
        brandB: "에뛰드 립케어 메인 프로모션 매출이 안정적으로 달성되는 중입니다.",
        brandC: "에스쁘아 비벨벳 쿠션 신규 캠페인 가동으로 신규 유입이 확대되었습니다."
    };

    let matrixData = {};
    let comments = {};

    function init() {
        const stored = localStorage.getItem("emnet_sales_matrix_v4");
        if (stored) {
            try { matrixData = JSON.parse(stored); }
            catch (e) { matrixData = JSON.parse(JSON.stringify(defaultMatrix)); }
        } else {
            matrixData = JSON.parse(JSON.stringify(defaultMatrix));
            saveStorage();
        }

        const storedComms = localStorage.getItem("emnet_brand_comments");
        if (storedComms) {
            try { comments = JSON.parse(storedComms); }
            catch (e) { comments = { ...defaultComments }; }
        } else {
            comments = { ...defaultComments };
            saveCommentsStorage();
        }

        renderMatrix();
        renderComments();
        bindEvents();
    }

    function saveStorage() {
        localStorage.setItem("emnet_sales_matrix_v4", JSON.stringify(matrixData));
    }

    function saveCommentsStorage() {
        localStorage.setItem("emnet_brand_comments", JSON.stringify(comments));
    }

    // Dynamic Formulas (Gross, Net 13.5%, WoW Variance)
    function calcFormulas() {
        const result = {
            rA: {},          // 이니스프리 총매출 SUM(1..7)
            rA_net: {},      // 이니스프리 순매출 (A * 13.5%)
            rB_net: {},      // 에뛰드 순매출 (B * 13.5%)
            rC_net: {},      // 에스쁘아 순매출 (C * 13.5%)
            rTOTAL: {},      // 총매출 (A + B + C)
            rTOTAL_net: {},  // 총 순매출 (TOTAL * 13.5%)
            wowDiff: {},     // 전주 대비 증감 (₩)
            wowPct: {}       // 전주 대비 증감 (%)
        };

        columns.forEach((col, idx) => {
            const colId = col.id;
            let sumA = 0;
            for (let i = 1; i <= 7; i++) {
                sumA += Number(matrixData[`r${i}`]?.[colId]) || 0;
            }
            result.rA[colId] = sumA;
            result.rA_net[colId] = Math.round(sumA * NET_RATE);

            const valB = Number(matrixData["rB"]?.[colId]) || 0;
            const valC = Number(matrixData["rC"]?.[colId]) || 0;

            result.rB_net[colId] = Math.round(valB * NET_RATE);
            result.rC_net[colId] = Math.round(valC * NET_RATE);

            const totalGross = sumA + valB + valC;
            result.rTOTAL[colId] = totalGross;
            result.rTOTAL_net[colId] = Math.round(totalGross * NET_RATE);

            // WoW Variance
            if (idx > 0) {
                const prevColId = columns[idx - 1].id;
                const prevTotal = result.rTOTAL[prevColId] || 0;
                const diff = totalGross - prevTotal;
                const pct = prevTotal > 0 ? ((diff / prevTotal) * 100).toFixed(1) : "0.0";
                result.wowDiff[colId] = diff;
                result.wowPct[colId] = pct;
            } else {
                result.wowDiff[colId] = 0;
                result.wowPct[colId] = "0.0";
            }
        });

        return result;
    }

    function renderMatrix() {
        const tbody = document.getElementById("excel-matrix-tbody");
        if (!tbody) return;

        const formulas = calcFormulas();
        const activeCol = "w2"; // Default 8월 2주차

        // Top KPI Cards Update
        const totalRevW2 = formulas.rTOTAL[activeCol] || 0;
        const totalNetW2 = formulas.rTOTAL_net[activeCol] || 0;
        const innisfreeW2 = formulas.rA[activeCol] || 0;
        const innisfreeNetW2 = formulas.rA_net[activeCol] || 0;
        const etudeW2 = Number(matrixData.rB?.[activeCol]) || 0;
        const espoirW2 = Number(matrixData.rC?.[activeCol]) || 0;
        const othersW2 = etudeW2 + espoirW2;
        const othersNetW2 = Math.round(othersW2 * NET_RATE);

        const wowDiff = formulas.wowDiff[activeCol] || 0;
        const wowPct = formulas.wowPct[activeCol] || "0.0";

        document.getElementById("kpi-total-revenue").textContent = formatCurrency(totalRevW2);
        document.getElementById("kpi-net-revenue").textContent = formatCurrency(totalNetW2);
        document.getElementById("kpi-innisfree-total").textContent = formatCurrency(innisfreeW2);
        document.getElementById("kpi-innisfree-net").textContent = `순매출(13.5%): ${formatCurrency(innisfreeNetW2)}`;
        document.getElementById("kpi-others-total").textContent = formatCurrency(othersW2);
        document.getElementById("kpi-others-net").textContent = `순매출(13.5%): ${formatCurrency(othersNetW2)}`;

        const wowSubPill = document.getElementById("kpi-revenue-wow");
        if (wowSubPill) {
            const isPos = wowDiff >= 0;
            const sign = isPos ? "+" : "";
            wowSubPill.className = `kpi-sub ${isPos ? "positive" : "negative"}`;
            wowSubPill.innerHTML = `<i class="fa-solid fa-arrow-trend-${isPos ? "up" : "down"}"></i> 전주 대비 ${sign}${formatCurrency(wowDiff)} (${sign}${wowPct}%)`;
        }

        let html = "";

        // Rows 1~7 (Innisfree Sub-parts)
        for (let i = 1; i <= 7; i++) {
            const rKey = `r${i}`;
            const rInfo = inputRows.find(r => r.id === rKey);

            html += `<tr>
                <td class="excel-cat-cell"><span class="row-num-badge">${i}</span> <strong>${rInfo.name}</strong></td>`;

            columns.forEach(col => {
                const val = matrixData[rKey]?.[col.id] || 0;
                const highlightClass = col.current ? 'highlight-col' : '';
                html += `
                    <td class="excel-input-cell ${highlightClass}">
                        <input type="text" class="matrix-input" data-row="${rKey}" data-col="${col.id}" value="${formatNumber(val)}" placeholder="0" onblur="SalesTracker.onCellBlur(this)" onfocus="SalesTracker.onCellFocus(this)">
                    </td>`;
            });
            html += `</tr>`;
        }

        // Row A: 이니스프리 총매출 (Auto Calculated SUM 1~7)
        html += `<tr class="excel-row-calculated row-innisfree">
            <td class="excel-cat-cell"><span class="row-code-badge badge-a">A</span> <strong>이니스프리 (1~7 합산 총매출)</strong></td>`;
        columns.forEach(col => {
            const valA = formulas.rA[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `<td class="excel-calc-cell ${highlightClass}"><strong id="calc-A-${col.id}">${formatCurrency(valA)}</strong></td>`;
        });
        html += `</tr>`;

        // Row A (순매출 13.5%)
        html += `<tr class="excel-row-net">
            <td class="excel-cat-cell" style="padding-left: 28px !important; font-size: 0.8rem; color: #34d399;">┗ <strong>이니스프리 순매출 (13.5%)</strong></td>`;
        columns.forEach(col => {
            const valNetA = formulas.rA_net[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `<td class="excel-calc-cell cell-net ${highlightClass}"><span id="calc-A-net-${col.id}">${formatCurrency(valNetA)}</span></td>`;
        });
        html += `</tr>`;

        // Row B: 에뛰드 (Input Row)
        const infoB = inputRows.find(r => r.id === "rB");
        html += `<tr>
            <td class="excel-cat-cell"><span class="row-code-badge badge-b">B</span> <strong>${infoB.name} (총매출)</strong></td>`;
        columns.forEach(col => {
            const val = matrixData["rB"]?.[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `
                <td class="excel-input-cell ${highlightClass}">
                    <input type="text" class="matrix-input" data-row="rB" data-col="${col.id}" value="${formatNumber(val)}" placeholder="0" onblur="SalesTracker.onCellBlur(this)" onfocus="SalesTracker.onCellFocus(this)">
                </td>`;
        });
        html += `</tr>`;

        // Row C: 에스쁘아 (Input Row)
        const infoC = inputRows.find(r => r.id === "rC");
        html += `<tr>
            <td class="excel-cat-cell"><span class="row-code-badge badge-c">C</span> <strong>${infoC.name} (총매출)</strong></td>`;
        columns.forEach(col => {
            const val = matrixData["rC"]?.[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `
                <td class="excel-input-cell ${highlightClass}">
                    <input type="text" class="matrix-input" data-row="rC" data-col="${col.id}" value="${formatNumber(val)}" placeholder="0" onblur="SalesTracker.onCellBlur(this)" onfocus="SalesTracker.onCellFocus(this)">
                </td>`;
        });
        html += `</tr>`;

        // Row (A+B+C) 총매출 합계
        html += `<tr class="excel-row-total">
            <td class="excel-cat-cell"><span class="row-code-badge badge-total">합계</span> <strong>팀 전체 총매출 (A+B+C)</strong></td>`;
        columns.forEach(col => {
            const valTotal = formulas.rTOTAL[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `<td class="excel-calc-cell cell-total ${highlightClass}"><strong id="calc-TOTAL-${col.id}">${formatCurrency(valTotal)}</strong></td>`;
        });
        html += `</tr>`;

        // Row (A+B+C) 순매출 합계 (13.5%)
        html += `<tr class="excel-row-net-total">
            <td class="excel-cat-cell" style="padding-left: 28px !important; font-weight: 700; color: #047857;">┗ <strong>팀 전체 순매출 (13.5% 수수료기준)</strong></td>`;
        columns.forEach(col => {
            const valNetTotal = formulas.rTOTAL_net[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `<td class="excel-calc-cell cell-net-total ${highlightClass}"><strong id="calc-TOTAL-net-${col.id}">${formatCurrency(valNetTotal)}</strong></td>`;
        });
        html += `</tr>`;

        // Row 전주 대비 증감 (WoW Variance)
        html += `<tr class="excel-row-wow">
            <td class="excel-cat-cell"><i class="fa-solid fa-chart-line" style="color: var(--brand-primary); margin-right: 6px;"></i> <strong>전주 대비 증감 (WoW)</strong></td>`;
        columns.forEach(col => {
            const diff = formulas.wowDiff[col.id] || 0;
            const pct = formulas.wowPct[col.id] || "0.0";
            const isPos = diff >= 0;
            const sign = isPos ? "+" : "";
            const highlightClass = col.current ? 'highlight-col' : '';
            const colorClass = isPos ? 'style="color: #10b981; font-weight: 700;"' : 'style="color: #f87171; font-weight: 700;"';

            html += `<td class="excel-calc-cell ${highlightClass}" ${colorClass}>
                ${sign}${formatCurrency(diff)}<br><span style="font-size: 0.72rem; opacity: 0.9;">(${sign}${pct}%)</span>
            </td>`;
        });
        html += `</tr>`;

        tbody.innerHTML = html;
    }

    function renderComments() {
        const commA = document.getElementById("comment-brand-a");
        const commB = document.getElementById("comment-brand-b");
        const commC = document.getElementById("comment-brand-c");

        if (commA) commA.value = comments.brandA || "";
        if (commB) commB.value = comments.brandB || "";
        if (commC) commC.value = comments.brandC || "";
    }

    function onCellFocus(inputEl) {
        // Strip commas on focus for easy typing
        const raw = inputEl.value.replace(/,/g, "");
        inputEl.value = raw === "0" ? "" : raw;
        inputEl.select();
    }

    function onCellBlur(inputEl) {
        const rowId = inputEl.getAttribute("data-row");
        const colId = inputEl.getAttribute("data-col");
        const rawVal = Number(inputEl.value.replace(/,/g, "")) || 0;

        if (!matrixData[rowId]) matrixData[rowId] = {};
        matrixData[rowId][colId] = rawVal;

        inputEl.value = formatNumber(rawVal);
        saveStorage();
        renderMatrix();
    }

    function bindEvents() {
        const exportBtn = document.getElementById("export-sales-csv");
        if (exportBtn) exportBtn.addEventListener("click", exportSalesCSV);

        const resetBtn = document.getElementById("reset-matrix-data");
        if (resetBtn) resetBtn.addEventListener("click", resetMatrixData);

        // Brand Comment Textareas
        ["comment-brand-a", "comment-brand-b", "comment-brand-c"].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("change", function () {
                    if (id === "comment-brand-a") comments.brandA = this.value;
                    if (id === "comment-brand-b") comments.brandB = this.value;
                    if (id === "comment-brand-c") comments.brandC = this.value;
                    saveCommentsStorage();
                    App.showToast("브랜드 성과 요약 코멘트가 저장되었습니다.", "success");
                });
            }
        });
    }

    function resetMatrixData() {
        if (confirm("정말 예산 취합표 데이터를 초기 예시 데이터로 리셋하시겠습니까?")) {
            matrixData = JSON.parse(JSON.stringify(defaultMatrix));
            comments = { ...defaultComments };
            saveStorage();
            saveCommentsStorage();
            renderMatrix();
            renderComments();
            App.showToast("취합표 데이터 및 코멘트가 초기화되었습니다.", "success");
        }
    }

    function exportSalesCSV() {
        const formulas = calcFormulas();
        let csv = "구분," + columns.map(c => `"${c.label}"`).join(",") + "\n";

        // Rows 1~7
        for (let i = 1; i <= 7; i++) {
            const rKey = `r${i}`;
            const rInfo = inputRows.find(r => r.id === rKey);
            let rowVals = columns.map(col => matrixData[rKey]?.[col.id] || 0);
            csv += `"${i}. ${rInfo.name}",` + rowVals.join(",") + "\n";
        }

        // Row A
        let rowAVals = columns.map(col => formulas.rA[col.id] || 0);
        csv += `"A. 이니스프리 (총매출)",` + rowAVals.join(",") + "\n";
        let rowANetVals = columns.map(col => formulas.rA_net[col.id] || 0);
        csv += `"  └ 이니스프리 순매출(13.5%)",` + rowANetVals.join(",") + "\n";

        // Row B
        let rowBVals = columns.map(col => matrixData["rB"]?.[col.id] || 0);
        csv += `"B. 에뛰드 (총매출)",` + rowBVals.join(",") + "\n";

        // Row C
        let rowCVals = columns.map(col => matrixData["rC"]?.[col.id] || 0);
        csv += `"C. 에스쁘아 (총매출)",` + rowCVals.join(",") + "\n";

        // Row TOTAL
        let rowTotalVals = columns.map(col => formulas.rTOTAL[col.id] || 0);
        csv += `"(A+B+C) 팀 총매출 합계",` + rowTotalVals.join(",") + "\n";
        let rowTotalNetVals = columns.map(col => formulas.rTOTAL_net[col.id] || 0);
        csv += `"  └ 팀 순매출 합계(13.5%)",` + rowTotalNetVals.join(",") + "\n";

        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `eMnet_팀주간매출취합_회계리포트_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        App.showToast("주간 회계 예산 취합표가 CSV 엑셀 파일로 다운로드되었습니다.", "success");
    }

    function formatNumber(num) {
        return Number(num || 0).toLocaleString();
    }

    function formatCurrency(num) {
        return "₩" + Number(num || 0).toLocaleString();
    }

    return {
        init,
        onCellFocus,
        onCellBlur,
        setMatrixData: (data) => { matrixData = data; saveStorage(); renderMatrix(); }
    };
})();
