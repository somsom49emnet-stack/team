/* ==========================================================================
   Module 4: 팀원 생일정보 & 축하 (Birthday Tracker)
   ========================================================================== */

const BirthdayTracker = (function () {
    const defaultBirthdays = [
        { id: "b-1", name: "조다솜", role: "AE", month: 8, day: 21 },
        { id: "b-2", name: "강기민", role: "AE", month: 8, day: 17 },
        { id: "b-3", name: "이원선", role: "AE", month: 9, day: 1 },
        { id: "b-4", name: "박소윤", role: "AE", month: 9, day: 1 },
        { id: "b-5", name: "임가희", role: "AE", month: 9, day: 16 },
        { id: "b-6", name: "이혜민", role: "AE", month: 9, day: 20 },
        { id: "b-7", name: "최민지", role: "AE", month: 10, day: 5 },
        { id: "b-8", name: "김은혜", role: "AE", month: 10, day: 26 },
        { id: "b-9", name: "김서영", role: "AE", month: 10, day: 29 },
        { id: "b-10", name: "이수민", role: "AE", month: 12, day: 29 },
        { id: "b-11", name: "박아름", role: "AE", month: 6, day: 21 },
        { id: "b-12", name: "정완우", role: "AE", month: 6, day: 1 }
    ];

    const defaultWishes = [
        { id: "w-1", sender: "박아름 AE", receiver: "조다솜 AE", message: "다솜님 생일 축하해요! 늘 팀 분위기 좋게 만들어주셔서 감사합니다 🎂🎉", time: "10분 전" },
        { id: "w-2", sender: "김예지 AE", receiver: "조다솜 AE", message: "생일 맛있는 거 많이 드시고 행복한 하루 되세요!!", time: "1시간 전" }
    ];

    let birthdays = [];
    let wishes = [];

    function init() {
        const storedBdays = localStorage.getItem("emnet_bdays");
        if (storedBdays) {
            try { birthdays = JSON.parse(storedBdays); }
            catch (e) { birthdays = [...defaultBirthdays]; }
        } else {
            birthdays = [...defaultBirthdays];
            saveStorage();
        }

        const storedWishes = localStorage.getItem("emnet_wishes");
        if (storedWishes) {
            try { wishes = JSON.parse(storedWishes); }
            catch (e) { wishes = [...defaultWishes]; }
        } else {
            wishes = [...defaultWishes];
            saveWishesStorage();
        }

        renderSpotlight();
        renderRoster();
        renderWishes();
        populateWishReceiverDropdown();
        bindEvents();
    }

    function saveStorage() {
        localStorage.setItem("emnet_bdays", JSON.stringify(birthdays));
    }

    function saveWishesStorage() {
        localStorage.setItem("emnet_wishes", JSON.stringify(wishes));
    }

    function calculateDDay(month, day) {
        const now = new Date();
        const currentYear = now.getFullYear();
        let target = new Date(currentYear, month - 1, day);

        if (target < now && (target.getDate() !== now.getDate() || target.getMonth() !== now.getMonth())) {
            target = new Date(currentYear + 1, month - 1, day);
        }

        const diffTime = target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { text: "Today! 🎉", ddayNum: 0 };
        return { text: `D-${diffDays}`, ddayNum: diffDays };
    }

    function renderSpotlight() {
        if (birthdays.length === 0) return;

        // Sort by upcoming D-Day
        const listWithDDay = birthdays.map(b => ({
            ...b,
            ddayInfo: calculateDDay(b.month, b.day)
        })).sort((a, b) => a.ddayInfo.ddayNum - b.ddayInfo.ddayNum);

        const nextBday = listWithDDay[0];

        const spotlightName = document.getElementById("spotlight-name");
        const spotlightDate = document.getElementById("spotlight-date");
        const badge = document.getElementById("birthday-dday-badge");

        if (spotlightName && spotlightDate) {
            spotlightName.textContent = `${nextBday.name} ${nextBday.role}`;
            spotlightDate.textContent = `${nextBday.month}월 ${nextBday.day}일 (${nextBday.ddayInfo.text})`;
        }

        if (badge) {
            badge.textContent = nextBday.ddayInfo.text;
        }

        // Quick alert pill text update
        const alertPillText = document.getElementById("quick-alert-text");
        if (alertPillText) {
            alertPillText.textContent = `다음 생일자: ${nextBday.name} AE (${nextBday.ddayInfo.text})`;
        }
    }

    function renderRoster() {
        const rosterContainer = document.getElementById("birthday-roster");
        if (!rosterContainer) return;

        const listWithDDay = birthdays.map(b => ({
            ...b,
            ddayInfo: calculateDDay(b.month, b.day)
        })).sort((a, b) => a.ddayInfo.ddayNum - b.ddayInfo.ddayNum);

        rosterContainer.innerHTML = listWithDDay.map(b => `
            <div class="bday-row">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-cake-candles" style="color: #ec4899;"></i>
                    <strong>${escapeHtml(b.name)} ${b.role}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">${b.month}월 ${b.day}일</span>
                    <span class="bday-dday">${b.ddayInfo.text}</span>
                </div>
            </div>
        `).join("");
    }

    function renderWishes() {
        const board = document.getElementById("wishes-board-container");
        if (!board) return;

        if (wishes.length === 0) {
            board.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">아직 남겨진 축하 메시지가 없습니다. 첫 축하를 남겨보세요!</p>`;
            return;
        }

        board.innerHTML = wishes.map(w => `
            <div class="wish-card">
                <div class="wish-header">
                    <span><strong>To. ${escapeHtml(w.receiver)}</strong> (From: ${escapeHtml(w.sender)})</span>
                    <span>${escapeHtml(w.time)}</span>
                </div>
                <div class="wish-msg">${escapeHtml(w.message)}</div>
            </div>
        `).join("");
    }

    function populateWishReceiverDropdown() {
        const select = document.getElementById("wish-receiver");
        if (!select) return;
        select.innerHTML = birthdays.map(b => `<option value="${b.name} ${b.role}">${b.name} ${b.role} (${b.month}/${b.day})</option>`).join("");
    }

    function bindEvents() {
        const addBtn = document.getElementById("add-wishes-btn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                document.getElementById("form-wishes").reset();
                document.getElementById("modal-wishes").classList.remove("hidden");
            });
        }

        const form = document.getElementById("form-wishes");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                saveWishFromForm();
            });
        }
    }

    function saveWishFromForm() {
        const sender = document.getElementById("wish-sender").value;
        const receiver = document.getElementById("wish-receiver").value;
        const message = document.getElementById("wish-message").value;

        wishes.unshift({
            id: "w-" + Date.now(),
            sender, receiver, message, time: "방금 전"
        });

        saveWishesStorage();
        renderWishes();
        document.getElementById("modal-wishes").classList.add("hidden");
        App.showToast("생일 축하 메시지가 성공적으로 등록되었습니다! 🎉", "success");
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    return {
        init,
        setBirthdays: (data) => { birthdays = data; saveStorage(); renderSpotlight(); renderRoster(); populateWishReceiverDropdown(); }
    };
})();
