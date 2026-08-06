/* ==========================================================================
   Module 5: 팀 간식 장보기 취합 (Snack Manager)
   ========================================================================== */

const SnackManager = (function () {
    const defaultSnacks = [
        { id: "snk-1", title: "카누 아이스 아메리카노 100T", category: "음료/커피", price: 24500, requester: "조다솜 AE", status: "담기", votes: 8, link: "https://www.coupang.com" },
        { id: "snk-2", title: "몽쉘 크림케이크 12입 x 3팩", category: "빵/간식거리", price: 15800, requester: "박아름 AE", status: "담기", votes: 6, link: "" },
        { id: "snk-3", title: "하리보 젤리 메가파티팩", category: "초콜릿/사탕", price: 18900, requester: "최민지 AE", status: "신청", votes: 5, link: "" },
        { id: "snk-4", title: "오리온 포카칩 오리지널 대용량", category: "과자/스낵", price: 12000, requester: "김예지 AE", status: "구매완료", votes: 9, link: "" },
        { id: "snk-5", title: "세키스이 스파클링 탄산수 24캔", category: "음료/커피", price: 14200, requester: "정완우 AE", status: "신청", votes: 4, link: "" }
    ];

    const monthlyBudget = 200000;
    let snacks = [];
    let currentFilter = "all";

    function init() {
        const stored = localStorage.getItem("emnet_snacks");
        if (stored) {
            try { snacks = JSON.parse(stored); }
            catch (e) { snacks = [...defaultSnacks]; }
        } else {
            snacks = [...defaultSnacks];
            saveStorage();
        }

        renderBudget();
        renderTable();
        bindEvents();
    }

    function saveStorage() {
        localStorage.setItem("emnet_snacks", JSON.stringify(snacks));
        App.updateBadges();
    }

    function renderBudget() {
        const totalSpent = snacks.reduce((acc, curr) => acc + Number(curr.price), 0);
        const remaining = Math.max(0, monthlyBudget - totalSpent);
        const progressPct = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

        const spentEl = document.getElementById("snack-spent-amount");
        const remainingBadge = document.getElementById("budget-remaining-badge");
        const progressBar = document.getElementById("budget-progress-fill");

        if (spentEl) spentEl.textContent = `₩${totalSpent.toLocaleString()}`;
        if (remainingBadge) remainingBadge.textContent = `잔여 예산 ₩${remaining.toLocaleString()}`;
        if (progressBar) progressBar.style.width = `${progressPct}%`;
    }

    function renderTable() {
        const tbody = document.getElementById("snacks-tbody");
        if (!tbody) return;

        // Sort by votes descending
        let sorted = [...snacks].sort((a, b) => b.votes - a.votes);

        if (currentFilter !== "all") {
            sorted = sorted.filter(s => s.status === currentFilter);
        }

        const searchTerm = (App.getSearchTerm() || "").toLowerCase();
        if (searchTerm) {
            sorted = sorted.filter(s =>
                s.title.toLowerCase().includes(searchTerm) ||
                s.category.toLowerCase().includes(searchTerm) ||
                s.requester.toLowerCase().includes(searchTerm)
            );
        }

        if (sorted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 30px; color: var(--text-muted);">신청된 간식 품목이 없습니다.</td></tr>`;
            return;
        }

        tbody.innerHTML = sorted.map(s => {
            let statusBadge = '<span class="badge badge-team">신청중</span>';
            if (s.status === "담기") statusBadge = '<span class="badge badge-media"><i class="fa-solid fa-cart-shopping"></i> 장바구니</span>';
            else if (s.status === "구매완료") statusBadge = '<span class="badge badge-intranet"><i class="fa-solid fa-check"></i> 구매완료</span>';

            return `
                <tr>
                    <td class="text-center">
                        <button class="vote-btn" onclick="SnackManager.voteSnack('${s.id}')" title="투표하기 (+1)">
                            <i class="fa-solid fa-heart" style="color: #ec4899;"></i> ${s.votes}
                        </button>
                    </td>
                    <td><strong>${escapeHtml(s.title)}</strong></td>
                    <td><span class="badge badge-team">${escapeHtml(s.category)}</span></td>
                    <td><strong>₩${Number(s.price).toLocaleString()}</strong></td>
                    <td>${escapeHtml(s.requester)}</td>
                    <td>
                        <select onchange="SnackManager.changeStatus('${s.id}', this.value)" class="select-input select-sm">
                            <option value="신청" ${s.status === "신청" ? "selected" : ""}>신청중</option>
                            <option value="담기" ${s.status === "담기" ? "selected" : ""}>장바구니</option>
                            <option value="구매완료" ${s.status === "구매완료" ? "selected" : ""}>구매완료</option>
                        </select>
                    </td>
                    <td>
                        ${s.link ? `<a href="${escapeHtml(s.link)}" target="_blank" style="color: var(--brand-primary); font-size: 0.82rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> 구매링크</a>` : "-"}
                    </td>
                    <td class="text-center">
                        <button class="btn-icon" onclick="SnackManager.deleteSnack('${s.id}')" title="삭제" style="color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function bindEvents() {
        document.querySelectorAll("#snack-status-filters .filter-chip").forEach(chip => {
            chip.addEventListener("click", function () {
                document.querySelectorAll("#snack-status-filters .filter-chip").forEach(c => c.classList.remove("active"));
                this.classList.add("active");
                currentFilter = this.getAttribute("data-status");
                renderTable();
            });
        });

        const addBtn = document.getElementById("add-snack-btn");
        if (addBtn) addBtn.addEventListener("click", () => openSnackModal());

        const printBtn = document.getElementById("print-snack-list-btn");
        if (printBtn) printBtn.addEventListener("click", () => window.print());

        const form = document.getElementById("form-snack");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                saveSnackFromForm();
            });
        }
    }

    function openSnackModal() {
        document.getElementById("form-snack").reset();
        document.getElementById("modal-snack").classList.remove("hidden");
    }

    function saveSnackFromForm() {
        const title = document.getElementById("snack-title").value;
        const category = document.getElementById("snack-category").value;
        const price = Number(document.getElementById("snack-price").value);
        const requester = document.getElementById("snack-requester").value;
        const link = document.getElementById("snack-link").value;

        snacks.push({
            id: "snk-" + Date.now(),
            title, category, price, requester, link,
            status: "신청", votes: 1
        });

        saveStorage();
        renderBudget();
        renderTable();
        document.getElementById("modal-snack").classList.add("hidden");
        App.showToast("팀 간식 희망 품목이 추가되었습니다! 🍫", "success");
    }

    function voteSnack(id) {
        const snack = snacks.find(s => s.id === id);
        if (snack) {
            snack.votes++;
            saveStorage();
            renderTable();
            App.showToast(`'${snack.title}' 품목에 투표가 반영되었습니다 (+1)!`, "success");
        }
    }

    function changeStatus(id, newStatus) {
        const snack = snacks.find(s => s.id === id);
        if (snack) {
            snack.status = newStatus;
            saveStorage();
            renderBudget();
            renderTable();
            App.showToast(`간식 구매 상태가 '${newStatus}'(으)로 변경되었습니다.`, "success");
        }
    }

    function deleteSnack(id) {
        if (confirm("해당 간식 신청을 삭제하시겠습니까?")) {
            snacks = snacks.filter(s => s.id !== id);
            saveStorage();
            renderBudget();
            renderTable();
            App.showToast("간식 신청이 삭제되었습니다.", "danger");
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    return {
        init,
        renderTable,
        voteSnack,
        changeStatus,
        deleteSnack,
        getPendingCount: () => snacks.filter(s => s.status === "신청").length,
        setSnacks: (data) => { snacks = data; saveStorage(); renderBudget(); renderTable(); }
    };
})();
