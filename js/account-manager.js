/* ==========================================================================
   Module 1: 팀 계정 정보 관리 (Account Manager)
   ========================================================================== */

const AccountManager = (function () {
    // Default initial seed data (Active team members & shared accounts)
    const defaultAccounts = [
        // 사원 인트라넷 & G-Suite (재직 팀원)
        { id: "acc-2", category: "intranet", system: "G-suite / 인트라넷", owner: "조다솜", loginId: "somsom49@emnet.kr", loginPw: "rhkdrh*416**", url: "somsom49.emnet@gmail.com", memo: "Naver POS: somsom49 / Kakao: somsom49@emnet.kr" },
        { id: "acc-34", category: "intranet", system: "G-suite / 인트라넷", owner: "이하림", loginId: "harim.lee@emnet.kr", loginPw: "harimy3059", url: "harim.lee.emnet@gmail.com", memo: "팀원 G-Suite" },
        { id: "acc-35", category: "intranet", system: "G-suite / 인트라넷", owner: "이원선", loginId: "onesun@emnet.co.kr", loginPw: "Dnjstjsdl0730!!", url: "onesun.emnet@gmail.com", memo: "팀원 G-Suite" },
        { id: "acc-36", category: "intranet", system: "G-suite / 인트라넷", owner: "이혜민", loginId: "leehm@emnet.co.kr", loginPw: "Hyemin714^^", url: "leegm.emnet@gmail.com", memo: "팀원 G-Suite" },
        { id: "acc-37", category: "intranet", system: "G-suite / 인트라넷", owner: "김채은", loginId: "chaen96@emnet.kr", loginPw: "winwin42#", url: "chaen96.emnet@gmail.com", memo: "팀원 G-Suite" },
        { id: "acc-38", category: "intranet", system: "G-suite / 인트라넷", owner: "박소윤", loginId: "psoyoun@emnet.co.kr", loginPw: "054356zz~", url: "psoyoun2005.emnet@gmail.com", memo: "Naver POS: xiamin0813" },
        { id: "acc-39", category: "intranet", system: "G-suite / 인트라넷", owner: "박수영", loginId: "swim23@emnet.co.kr", loginPw: "qkrtndud92!", url: "swim2323.emnet@gmail.com", memo: "팀원 G-Suite" },
        { id: "acc-40", category: "intranet", system: "G-suite / 인트라넷", owner: "최예원", loginId: "ye1choi@emnet.co.kr", loginPw: "whdwjdtl37@", url: "ye1choi.emnet@gmail.com", memo: "팀원 G-Suite" },
        { id: "acc-43", category: "intranet", system: "G-suite / 인트라넷", owner: "박진혁", loginId: "hyuk595@emnet.co.kr", loginPw: "q1a2z33a@1", url: "hyuk95.emnet@gmail.com", memo: "팀원 G-Suite" },
        { id: "acc-44", category: "intranet", system: "G-suite / 인트라넷", owner: "문지영", loginId: "mjy@emnet.co.kr", loginPw: "@jiyoung123", url: "mjy.emnet.kr@gmail.com", memo: "Naver POS: mjyo116" },

        // 팀 공용 & 서드파티 솔루션
        { id: "acc-11", category: "team", system: "앱스플라이어 (AppsFlyer)", owner: "팀 공용", loginId: "yolo23@emnet.co.kr", loginPw: "eMnet@11", url: "https://hq.appsflyer.com", memo: "팀 마케팅 측정" },
        { id: "acc-12", category: "team", system: "에어브릿지 (Airbridge)", owner: "팀 공용", loginId: "yolo23@emnet.co.kr", loginPw: "emnet123!", url: "https://app.airbridge.io/app", memo: "MMP 대시보드" },
        { id: "acc-13", category: "team", system: "에어브릿지 아카데미", owner: "팀 공용", loginId: "emnet0101@gmail.com", loginPw: "dldpaspt@11", url: "https://academy.ab180.co", memo: "교육 사이트" },
        { id: "acc-14", category: "team", system: "GA4 팀 계정 (Google)", owner: "팀 공용", loginId: "emnet0101@gmail.com", loginPw: "dldpaspt@11", url: "https://analytics.google.com", memo: "구글 애널리틱스 공용" },
        { id: "acc-15", category: "team", system: "크리테오 (Criteo)", owner: "조다솜 AE", loginId: "somsom49@emnet.co.kr", loginPw: "Okwjcnrdmsgod*11", url: "https://marketing.criteo.com", memo: "리타게팅 광고" },
        { id: "acc-16", category: "team", system: "APS 시스템 1", owner: "팀 공용", loginId: "AS20725", loginPw: "emnet0420!!!", url: "", memo: "4/22 PW 변경완료" },
        { id: "acc-17", category: "team", system: "APS 시스템 2", owner: "팀 공용", loginId: "1021484", loginPw: "emnet0420!!!#", url: "", memo: "시스템2 전용" },
        { id: "acc-18", category: "team", system: "썸트렌드 (SomeTrend)", owner: "팀 공용", loginId: "emnet0101@gmail.com", loginPw: "dldpaspt@11", url: "https://some.co.kr", memo: "빅데이터 소셜 분석" },

        // 매체사 및 파트너
        { id: "acc-19", category: "media", system: "K-Ads (케이애즈)", owner: "팀 공용", loginId: "dldpaspt", loginPw: "emnet56053!@", url: "https://k-ads.kt.co.kr/kads/login", memo: "KT 통신사 광고" },
        { id: "acc-20", category: "media", system: "네이버 NOSP", owner: "팀 공용", loginId: "A01200", loginPw: "emnet0420^^!", url: "https://nosp.da.naver.com/", memo: "네이버 보장형 디스플레이" },
        { id: "acc-21", category: "media", system: "스니핏 (Snipit)", owner: "팀 공용", loginId: "emnet0420!!", loginPw: "emnet0420!!!", url: "https://reference.snipit.im/", memo: "레퍼런스 수집" },
        { id: "acc-22", category: "media", system: "쿠팡 애즈 (Coupang)", owner: "팀 공용", loginId: "yeji@emnet.co.kr", loginPw: "God06209!", url: "https://advertising.coupang.com", memo: "쿠팡 셀러 광고" },

        // 브랜드 및 협력사
        { id: "acc-23", category: "brand", system: "이니_토스애즈", owner: "이니스프리TF", loginId: "innisfreetf@emnet.co.kr", loginPw: "qjwmqlf12!@", url: "https://toss.im", memo: "토스페이/토스애즈" },
        { id: "acc-24", category: "brand", system: "이니_올리브영 협력", owner: "이니스프리TF", loginId: "innisfreetf@emnet.co.kr", loginPw: "emnet1234!!", url: "https://oliveyoung.co.kr", memo: "버즈빌 올영협력" },
        { id: "acc-25", category: "brand", system: "픽스폴리오 (Fixfolio)", owner: "팀 공용", loginId: "emnet_ad@emnet.co.kr", loginPw: "dldpaspt11!", url: "", memo: "픽스폴리오 대시보드" }
    ];

    let accounts = [];
    let currentCategory = "all";
    let currentOwner = "";

    function init() {
        const stored = localStorage.getItem("emnet_accounts");
        if (stored) {
            try { accounts = JSON.parse(stored); }
            catch (e) { accounts = [...defaultAccounts]; }
        } else {
            accounts = [...defaultAccounts];
            saveStorage();
        }

        populateOwnerFilter();
        renderTable();
        bindEvents();
    }

    function saveStorage() {
        localStorage.setItem("emnet_accounts", JSON.stringify(accounts));
        App.updateBadges();
    }

    function populateOwnerFilter() {
        const select = document.getElementById("account-owner-filter");
        if (!select) return;

        const owners = Array.from(new Set(accounts.map(a => a.owner).filter(Boolean)));
        select.innerHTML = '<option value="">전체 담당자 보기</option>';
        owners.forEach(owner => {
            const opt = document.createElement("option");
            opt.value = owner;
            opt.textContent = owner;
            select.appendChild(opt);
        });
    }

    function renderTable() {
        const tbody = document.getElementById("accounts-tbody");
        if (!tbody) return;

        let filtered = accounts.filter(acc => {
            const matchCategory = currentCategory === "all" || acc.category === currentCategory;
            const matchOwner = !currentOwner || acc.owner === currentOwner;
            const searchTerm = (App.getSearchTerm() || "").toLowerCase();
            const matchSearch = !searchTerm ||
                acc.system.toLowerCase().includes(searchTerm) ||
                acc.owner.toLowerCase().includes(searchTerm) ||
                acc.loginId.toLowerCase().includes(searchTerm) ||
                (acc.memo && acc.memo.toLowerCase().includes(searchTerm));
            return matchCategory && matchOwner && matchSearch;
        });

        // Update counts
        document.getElementById("cat-count-all").textContent = accounts.length;
        document.getElementById("cat-count-team").textContent = accounts.filter(a => a.category === "team").length;
        document.getElementById("cat-count-intranet").textContent = accounts.filter(a => a.category === "intranet").length;
        document.getElementById("cat-count-media").textContent = accounts.filter(a => a.category === "media").length;
        document.getElementById("cat-count-brand").textContent = accounts.filter(a => a.category === "brand").length;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px;"></i><br>
                검색 조건에 맞는 계정 정보가 없습니다.
            </td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(acc => {
            const catBadgeClass = getBadgeClass(acc.category);
            const catLabel = getCategoryLabel(acc.category);

            return `
                <tr data-id="${acc.id}">
                    <td>
                        <span class="badge ${catBadgeClass}">${catLabel}</span><br>
                        <strong style="font-size: 0.95rem; margin-top: 4px; display: inline-block;">${escapeHtml(acc.system)}</strong>
                    </td>
                    <td><strong>${escapeHtml(acc.owner || "팀 공용")}</strong></td>
                    <td>
                        <div class="copy-pill">
                            <span>${escapeHtml(acc.loginId)}</span>
                            <button class="copy-btn" onclick="AccountManager.copyText('${escapeHtml(acc.loginId)}', '아이디가')" title="ID 복사">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="copy-pill">
                            <span class="pw-text pw-mask" data-pw="${escapeHtml(acc.loginPw)}">••••••••</span>
                            <button class="pw-toggle-btn" onclick="AccountManager.togglePwVisibility(this)" title="비밀번호 표시/숨기기">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                            <button class="copy-btn" onclick="AccountManager.copyText('${escapeHtml(acc.loginPw)}', '비밀번호가')" title="비밀번호 복사">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        ${acc.url ? `<a href="${escapeHtml(acc.url)}" target="_blank" style="color: var(--brand-primary); font-size: 0.82rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> 접속 링크</a><br>` : ""}
                        <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(acc.memo || "")}</span>
                    </td>
                    <td class="text-center">
                        <button class="btn-icon" onclick="AccountManager.editAccount('${acc.id}')" title="수정"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon" onclick="AccountManager.deleteAccount('${acc.id}')" title="삭제" style="color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function getBadgeClass(cat) {
        switch (cat) {
            case "team": return "badge-team";
            case "intranet": return "badge-intranet";
            case "media": return "badge-media";
            case "brand": return "badge-brand";
            default: return "badge-team";
        }
    }

    function getCategoryLabel(cat) {
        switch (cat) {
            case "team": return "팀 공용";
            case "intranet": return "인트라넷/G-suite";
            case "media": return "매체사 계정";
            case "brand": return "브랜드/협력사";
            default: return "기타";
        }
    }

    function bindEvents() {
        // Category Tab Buttons
        document.querySelectorAll("#account-category-tabs .cat-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll("#account-category-tabs .cat-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                currentCategory = this.getAttribute("data-category");
                renderTable();
            });
        });

        // Owner Filter
        const ownerFilter = document.getElementById("account-owner-filter");
        if (ownerFilter) {
            ownerFilter.addEventListener("change", function () {
                currentOwner = this.value;
                renderTable();
            });
        }

        // Add Account Button Modal
        const addBtn = document.getElementById("add-account-btn");
        if (addBtn) {
            addBtn.addEventListener("click", () => openAccountModal());
        }

        // Form Submit
        const form = document.getElementById("form-account");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                saveAccountFromForm();
            });
        }
    }

    function togglePwVisibility(btn) {
        const container = btn.closest(".copy-pill");
        const pwSpan = container.querySelector(".pw-text");
        const icon = btn.querySelector("i");
        const realPw = pwSpan.getAttribute("data-pw");

        if (pwSpan.classList.contains("pw-mask")) {
            pwSpan.textContent = realPw;
            pwSpan.classList.remove("pw-mask");
            icon.className = "fa-regular fa-eye-slash";
        } else {
            pwSpan.textContent = "••••••••";
            pwSpan.classList.add("pw-mask");
            icon.className = "fa-regular fa-eye";
        }
    }

    function copyText(text, label) {
        if (!text) {
            App.showToast("복사할 정보가 없습니다.", "danger");
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            App.showToast(`${label} 클립보드에 복사되었습니다! 📋`, "success");
        }).catch(() => {
            App.showToast("복사에 실패했습니다.", "danger");
        });
    }

    function openAccountModal(acc = null) {
        const modal = document.getElementById("modal-account");
        const title = document.getElementById("modal-account-title");
        document.getElementById("form-account").reset();

        if (acc) {
            title.textContent = "계정 정보 수정";
            document.getElementById("acc-id").value = acc.id;
            document.getElementById("acc-category").value = acc.category;
            document.getElementById("acc-system").value = acc.system;
            document.getElementById("acc-owner").value = acc.owner;
            document.getElementById("acc-login-id").value = acc.loginId;
            document.getElementById("acc-login-pw").value = acc.loginPw;
            document.getElementById("acc-url").value = acc.url || "";
        } else {
            title.textContent = "신규 계정 정보 추가";
            document.getElementById("acc-id").value = "";
        }
        modal.classList.remove("hidden");
    }

    function saveAccountFromForm() {
        const id = document.getElementById("acc-id").value;
        const category = document.getElementById("acc-category").value;
        const system = document.getElementById("acc-system").value;
        const owner = document.getElementById("acc-owner").value || "팀 공용";
        const loginId = document.getElementById("acc-login-id").value;
        const loginPw = document.getElementById("acc-login-pw").value;
        const url = document.getElementById("acc-url").value;

        if (id) {
            const index = accounts.findIndex(a => a.id === id);
            if (index !== -1) {
                accounts[index] = { ...accounts[index], category, system, owner, loginId, loginPw, url };
            }
        } else {
            const newAcc = {
                id: "acc-" + Date.now(),
                category, system, owner, loginId, loginPw, url, memo: "사용자 추가 계정"
            };
            accounts.unshift(newAcc);
        }

        saveStorage();
        populateOwnerFilter();
        renderTable();
        document.getElementById("modal-account").classList.add("hidden");
        App.showToast("계정 정보가 성공적으로 저장되었습니다.", "success");
    }

    function editAccount(id) {
        const acc = accounts.find(a => a.id === id);
        if (acc) openAccountModal(acc);
    }

    function deleteAccount(id) {
        if (confirm("정말 이 계정 정보를 삭제하시겠습니까?")) {
            accounts = accounts.filter(a => a.id !== id);
            saveStorage();
            renderTable();
            App.showToast("계정 정보가 삭제되었습니다.", "danger");
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    return {
        init,
        renderTable,
        togglePwVisibility,
        copyText,
        editAccount,
        deleteAccount,
        getAccountsCount: () => accounts.length,
        getAllAccounts: () => accounts,
        setAccounts: (data) => { accounts = data; saveStorage(); renderTable(); }
    };
})();
