/* ==========================================================================
   eMnet Marketing AE Team Dashboard - Core App Controller (app.js)
   ========================================================================== */

const App = (function () {
    let activeTab = "accounts";
    let globalSearchTerm = "";

    function init() {
        initTheme();
        bindNavigation();
        bindGlobalEvents();
        bindModalHandlers();

        // Initialize all feature modules
        if (typeof AccountManager !== "undefined") AccountManager.init();
        if (typeof SalesTracker !== "undefined") SalesTracker.init();
        if (typeof LeaveCalendar !== "undefined") LeaveCalendar.init();
        if (typeof BirthdayTracker !== "undefined") BirthdayTracker.init();
        if (typeof SnackManager !== "undefined") SnackManager.init();

        updateBadges();
    }

    function initTheme() {
        const savedTheme = localStorage.getItem("emnet_theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);

        const toggleBtn = document.getElementById("theme-toggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                const current = document.documentElement.getAttribute("data-theme");
                const next = current === "dark" ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", next);
                localStorage.setItem("emnet_theme", next);
                showToast(`테마가 ${next === "dark" ? "다크" : "라이트"} 모드로 전환되었습니다.`, "success");
            });
        }
    }

    function bindNavigation() {
        const navItems = document.querySelectorAll(".nav-item");
        navItems.forEach(item => {
            item.addEventListener("click", function () {
                const targetTab = this.getAttribute("data-tab");
                switchTab(targetTab);

                // On mobile, close sidebar when clicking a tab
                document.getElementById("sidebar").classList.remove("mobile-open");
            });
        });

        // Mobile menu toggle
        const mobileBtn = document.getElementById("toggle-sidebar");
        if (mobileBtn) {
            mobileBtn.addEventListener("click", () => {
                document.getElementById("sidebar").classList.toggle("mobile-open");
            });
        }
    }

    function switchTab(tabId) {
        activeTab = tabId;
        document.querySelectorAll(".nav-item").forEach(item => {
            if (item.getAttribute("data-tab") === tabId) item.classList.add("active");
            else item.classList.remove("active");
        });

        document.querySelectorAll(".tab-pane").forEach(pane => {
            if (pane.id === `tab-${tabId}`) pane.classList.add("active");
            else pane.classList.remove("active");
        });

        // Re-render table if needed
        if (tabId === "accounts" && typeof AccountManager !== "undefined") AccountManager.renderTable();
        if (tabId === "sales" && typeof SalesTracker !== "undefined") SalesTracker.renderTable();
        if (tabId === "snacks" && typeof SnackManager !== "undefined") SnackManager.renderTable();
    }

    function bindGlobalEvents() {
        // Global search input
        const searchInput = document.getElementById("global-search");
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                globalSearchTerm = this.value;
                if (activeTab === "accounts" && typeof AccountManager !== "undefined") AccountManager.renderTable();
                if (activeTab === "sales" && typeof SalesTracker !== "undefined") SalesTracker.renderTable();
                if (activeTab === "snacks" && typeof SnackManager !== "undefined") SnackManager.renderTable();
            });
        }

        // Keyboard Shortcut: Ctrl + K
        window.addEventListener("keydown", function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                if (searchInput) searchInput.focus();
            }
        });

        // Data Manage Dropdown Toggle
        const dataBtn = document.getElementById("data-manage-btn");
        const dropdown = document.getElementById("data-dropdown");
        if (dataBtn && dropdown) {
            dataBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdown.classList.toggle("show");
            });

            document.addEventListener("click", () => dropdown.classList.remove("show"));
        }

        // Export JSON
        const exportJsonBtn = document.getElementById("export-json-btn");
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener("click", exportAllDataJSON);
        }

        // Import JSON
        const importJsonBtn = document.getElementById("import-json-btn");
        const importInput = document.getElementById("import-file-input");
        if (importJsonBtn && importInput) {
            importJsonBtn.addEventListener("click", () => importInput.click());
            importInput.addEventListener("change", importDataJSON);
        }

        // Reset to Default
        const resetBtn = document.getElementById("reset-default-btn");
        if (resetBtn) {
            resetBtn.addEventListener("click", resetAllDataToDefault);
        }
    }

    function bindModalHandlers() {
        document.querySelectorAll("[data-close-modal]").forEach(btn => {
            btn.addEventListener("click", function () {
                const backdrop = this.closest(".modal-backdrop");
                if (backdrop) backdrop.classList.add("hidden");
            });
        });

        document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
            backdrop.addEventListener("click", function (e) {
                if (e.target === this) this.classList.add("hidden");
            });
        });
    }

    function updateBadges() {
        if (typeof AccountManager !== "undefined") {
            const accBadge = document.getElementById("account-count-badge");
            if (accBadge) accBadge.textContent = AccountManager.getAccountsCount();
        }

        if (typeof SnackManager !== "undefined") {
            const snackBadge = document.getElementById("snack-pending-badge");
            if (snackBadge) snackBadge.textContent = SnackManager.getPendingCount();
        }
    }

    function showToast(message, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        const iconClass = type === "success" ? "fa-circle-check" : "fa-triangle-exclamation";
        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(100%)";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function exportAllDataJSON() {
        const fullBackup = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            accounts: localStorage.getItem("emnet_accounts"),
            sales: localStorage.getItem("emnet_sales"),
            leaves: localStorage.getItem("emnet_leaves"),
            bdays: localStorage.getItem("emnet_bdays"),
            wishes: localStorage.getItem("emnet_wishes"),
            snacks: localStorage.getItem("emnet_snacks")
        };

        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `eMnet_AE_Hub_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        showToast("전체 데이터 백업 파일(JSON)이 다운로드되었습니다.", "success");
    }

    function importDataJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                if (data.accounts) localStorage.setItem("emnet_accounts", data.accounts);
                if (data.sales) localStorage.setItem("emnet_sales", data.sales);
                if (data.leaves) localStorage.setItem("emnet_leaves", data.leaves);
                if (data.bdays) localStorage.setItem("emnet_bdays", data.bdays);
                if (data.wishes) localStorage.setItem("emnet_wishes", data.wishes);
                if (data.snacks) localStorage.setItem("emnet_snacks", data.snacks);

                showToast("백업 데이터가 성공적으로 복원되었습니다. 대시보드를 새로고침합니다.", "success");
                setTimeout(() => location.reload(), 1200);
            } catch (err) {
                showToast("올바르지 않은 백업 파일 형식입니다.", "danger");
            }
        };
        reader.readAsText(file);
    }

    function resetAllDataToDefault() {
        if (confirm("정말 초기 구글 시트 기반 데이터로 전체 리셋하시겠습니까? (수정 및 추가한 데이터가 삭제됩니다)")) {
            localStorage.removeItem("emnet_accounts");
            localStorage.removeItem("emnet_sales");
            localStorage.removeItem("emnet_leaves");
            localStorage.removeItem("emnet_bdays");
            localStorage.removeItem("emnet_wishes");
            localStorage.removeItem("emnet_snacks");

            showToast("초기 구글 시트 데이터로 리셋되었습니다.", "success");
            setTimeout(() => location.reload(), 1000);
        }
    }

    return {
        init,
        switchTab,
        showToast,
        updateBadges,
        getSearchTerm: () => globalSearchTerm
    };
})();

// Document Ready Bootstrap
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
