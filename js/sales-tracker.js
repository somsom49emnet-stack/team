/* ==========================================================================
   Module 2: 광고주 주간매출 취합 Hub (Excel Matrix Spreadsheet Engine)
   ========================================================================== */

const SalesTracker = (function () {
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

    // Default Seed Data Matrix
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

    let matrixData = {};

    function init() {
        const stored = localStorage.getItem("emnet_sales_matrix_v3");
        if (stored) {
            try { matrixData = JSON.parse(stored); }
            catch (e) { matrixData = JSON.parse(JSON.stringify(defaultMatrix)); }
        } else {
            matrixData = JSON.parse(JSON.stringify(defaultMatrix));
            saveStorage();
        }

        renderMatrix();
        bindEvents();
    }

    function saveStorage() {
        localStorage.setItem("emnet_sales_matrix_v3", JSON.stringify(matrixData));
    }

    // Calculation Formulas:
    // A (이니스프리) = SUM(r1..r7)
    // TOTAL (합계) = A + rB + rC
    function calcFormulas() {
        const result = {
            rA: {},      // 이니스프리 합산
            rTOTAL: {}   // 총 합계 (A + B + C)
        };

        columns.forEach(col => {
            const colId = col.id;
            let sumA = 0;
            for (let i = 1; i <= 7; i++) {
                const val = Number(matrixData[`r${i}`]?.[colId]) || 0;
                sumA += val;
            }
            result.rA[colId] = sumA;

            const valB = Number(matrixData["rB"]?.[colId]) || 0;
            const valC = Number(matrixData["rC"]?.[colId]) || 0;

            result.rTOTAL[colId] = sumA + valB + valC;
        });

        return result;
    }

    function renderMatrix() {
        const tbody = document.getElementById("excel-matrix-tbody");
        if (!tbody) return;

        const formulas = calcFormulas();
        const activeCol = "w2"; // Default 8월 2주차

        // Top KPI Cards Update (based on 8월 2주차)
        const totalRevW2 = formulas.rTOTAL[activeCol] || 0;
        const innisfreeW2 = formulas.rA[activeCol] || 0;
        const etudeW2 = Number(matrixData.rB?.[activeCol]) || 0;
        const espoirW2 = Number(matrixData.rC?.[activeCol]) || 0;

        document.getElementById("kpi-total-revenue").textContent = formatCurrency(totalRevW2);
        document.getElementById("kpi-innisfree-total").textContent = formatCurrency(innisfreeW2);
        document.getElementById("kpi-etude-total").textContent = formatCurrency(etudeW2);
        document.getElementById("kpi-espoir-total").textContent = formatCurrency(espoirW2);

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
                        <input type="number" class="matrix-input" data-row="${rKey}" data-col="${col.id}" value="${val}" placeholder="0" onchange="SalesTracker.onCellChange(this)" onkeyup="SalesTracker.onCellChange(this)">
                    </td>`;
            });
            html += `</tr>`;
        }

        // Row A: 이니스프리 (Auto Calculated SUM(1~7))
        html += `<tr class="excel-row-calculated row-innisfree">
            <td class="excel-cat-cell"><span class="row-code-badge badge-a">A</span> <strong>이니스프리 (1~7 합산)</strong></td>`;
        columns.forEach(col => {
            const valA = formulas.rA[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `<td class="excel-calc-cell ${highlightClass}"><strong id="calc-A-${col.id}">${formatCurrency(valA)}</strong></td>`;
        });
        html += `</tr>`;

        // Row B: 에뛰드 (Input Row)
        const infoB = inputRows.find(r => r.id === "rB");
        html += `<tr>
            <td class="excel-cat-cell"><span class="row-code-badge badge-b">B</span> <strong>${infoB.name}</strong></td>`;
        columns.forEach(col => {
            const val = matrixData["rB"]?.[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `
                <td class="excel-input-cell ${highlightClass}">
                    <input type="number" class="matrix-input" data-row="rB" data-col="${col.id}" value="${val}" placeholder="0" onchange="SalesTracker.onCellChange(this)" onkeyup="SalesTracker.onCellChange(this)">
                </td>`;
        });
        html += `</tr>`;

        // Row C: 에스쁘아 (Input Row)
        const infoC = inputRows.find(r => r.id === "rC");
        html += `<tr>
            <td class="excel-cat-cell"><span class="row-code-badge badge-c">C</span> <strong>${infoC.name}</strong></td>`;
        columns.forEach(col => {
            const val = matrixData["rC"]?.[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `
                <td class="excel-input-cell ${highlightClass}">
                    <input type="number" class="matrix-input" data-row="rC" data-col="${col.id}" value="${val}" placeholder="0" onchange="SalesTracker.onCellChange(this)" onkeyup="SalesTracker.onCellChange(this)">
                </td>`;
        });
        html += `</tr>`;

        // Row (A+B+C): 합계 (Auto Calculated Highlighted Row)
        html += `<tr class="excel-row-total">
            <td class="excel-cat-cell"><span class="row-code-badge badge-total">합계</span> <strong>팀 전체 매출 (A+B+C)</strong></td>`;
        columns.forEach(col => {
            const valTotal = formulas.rTOTAL[col.id] || 0;
            const highlightClass = col.current ? 'highlight-col' : '';
            html += `<td class="excel-calc-cell cell-total ${highlightClass}"><strong id="calc-TOTAL-${col.id}">${formatCurrency(valTotal)}</strong></td>`;
        });
        html += `</tr>`;

        tbody.innerHTML = html;
    }

    function onCellChange(inputEl) {
        const rowId = inputEl.getAttribute("data-row");
        const colId = inputEl.getAttribute("data-col");
        const val = Number(inputEl.value) || 0;

        if (!matrixData[rowId]) matrixData[rowId] = {};
        matrixData[rowId][colId] = val;

        saveStorage();

        // Recalculate formulas dynamically
        const formulas = calcFormulas();

        // Fast DOM update for row A and Total for this column
        const elA = document.getElementById(`calc-A-${colId}`);
        if (elA) elA.textContent = formatCurrency(formulas.rA[colId]);

        const elTotal = document.getElementById(`calc-TOTAL-${colId}`);
        if (elTotal) elTotal.textContent = formatCurrency(formulas.rTOTAL[colId]);

        // Update Top KPI Cards (for 8월 2주차 'w2')
        if (colId === "w2") {
            document.getElementById("kpi-total-revenue").textContent = formatCurrency(formulas.rTOTAL["w2"]);
            document.getElementById("kpi-innisfree-total").textContent = formatCurrency(formulas.rA["w2"]);
            document.getElementById("kpi-etude-total").textContent = formatCurrency(matrixData.rB?.w2 || 0);
            document.getElementById("kpi-espoir-total").textContent = formatCurrency(matrixData.rC?.w2 || 0);
        }
    }

    function bindEvents() {
        const exportBtn = document.getElementById("export-sales-csv");
        if (exportBtn) exportBtn.addEventListener("click", exportSalesCSV);

        const resetBtn = document.getElementById("reset-matrix-data");
        if (resetBtn) resetBtn.addEventListener("click", resetMatrixData);
    }

    function resetMatrixData() {
        if (confirm("정말 예산 취합표 데이터를 초기 예시 데이터로 리셋하시겠습니까?")) {
            matrixData = JSON.parse(JSON.stringify(defaultMatrix));
            saveStorage();
            renderMatrix();
            App.showToast("취합표 데이터가 초기화되었습니다.", "success");
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
        csv += `"A. 이니스프리 (1~7합산)",` + rowAVals.join(",") + "\n";

        // Row B
        let rowBVals = columns.map(col => matrixData["rB"]?.[col.id] || 0);
        csv += `"B. 에뛰드",` + rowBVals.join(",") + "\n";

        // Row C
        let rowCVals = columns.map(col => matrixData["rC"]?.[col.id] || 0);
        csv += `"C. 에스쁘아",` + rowCVals.join(",") + "\n";

        // Row TOTAL
        let rowTotalVals = columns.map(col => formulas.rTOTAL[col.id] || 0);
        csv += `"(A+B+C) 팀 매출 합계",` + rowTotalVals.join(",") + "\n";

        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `eMnet_팀주간매출취합_Spreadsheet_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        App.showToast("주간 예산 취합표가 CSV 엑셀 파일로 다운로드되었습니다.", "success");
    }

    function formatCurrency(num) {
        return "₩" + Number(num).toLocaleString();
    }

    return {
        init,
        onCellChange,
        setMatrixData: (data) => { matrixData = data; saveStorage(); renderMatrix(); }
    };
})();
