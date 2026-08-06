/* ==========================================================================
   Module 3: 팀 연차 캘린더 (Leave Calendar)
   ========================================================================== */

const LeaveCalendar = (function () {
    const defaultLeaves = [
        { id: "l-1", member: "조다솜 AE", type: "연차", date: "2026-08-14", memo: "여름휴가 (대행: 박아름 AE)" },
        { id: "l-2", member: "최민지 AE", type: "오후반차", date: "2026-08-14", memo: "병원 검진 (대행: 김예지 AE)" },
        { id: "l-3", member: "정완우 AE", type: "연차", date: "2026-08-21", memo: "개인 사유" },
        { id: "l-4", member: "강기민 AE", type: "오전반차", date: "2026-08-28", memo: "건강검진" }
    ];

    let leaves = [];
    let currentYear = 2026;
    let currentMonth = 7; // 0-indexed (7 = August)

    function init() {
        const stored = localStorage.getItem("emnet_leaves");
        if (stored) {
            try { leaves = JSON.parse(stored); }
            catch (e) { leaves = [...defaultLeaves]; }
        } else {
            leaves = [...defaultLeaves];
            saveStorage();
        }

        populateMemberDropdown();
        renderCalendar();
        renderUpcomingList();
        checkConflicts();
        bindEvents();
    }

    function saveStorage() {
        localStorage.setItem("emnet_leaves", JSON.stringify(leaves));
    }

    function populateMemberDropdown() {
        const select = document.getElementById("leave-member");
        if (!select) return;
        const teamMembers = [
            "박아름", "조다솜", "최민지", "김예지", "안지윤", "정완우", "강기민",
            "이수민", "임가희", "김서영", "최지혜", "이하림", "이원선", "이혜민",
            "김채은", "박소윤", "박수영", "최예원", "김혜진", "김예일", "박진혁",
            "문지영", "조아란", "고하람", "김은혜", "강서원", "정재현", "최지원", "원나연"
        ];
        select.innerHTML = teamMembers.map(m => `<option value="${m} AE">${m} AE</option>`).join("");
    }

    function renderCalendar() {
        const grid = document.getElementById("calendar-days-grid");
        const monthTitle = document.getElementById("cal-current-month");
        if (!grid || !monthTitle) return;

        monthTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;

        grid.innerHTML = "";

        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

        // Prev month padding
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayCell = document.createElement("div");
            dayCell.className = "cal-day-cell other-month";
            dayCell.innerHTML = `<span class="cal-day-num">${prevMonthTotalDays - i}</span>`;
            grid.appendChild(dayCell);
        }

        // Current Month Days
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayCell = document.createElement("div");
            dayCell.className = "cal-day-cell";
            if (dateStr === todayStr) dayCell.classList.add("today");

            let cellContent = `<span class="cal-day-num">${day}</span>`;

            // Filter leaves on this date
            const dayLeaves = leaves.filter(l => l.date === dateStr);
            dayLeaves.forEach(l => {
                let tagClass = "tag-full-day";
                if (l.type.includes("반차")) tagClass = "tag-half-day";
                else if (l.type === "공가") tagClass = "tag-official";

                cellContent += `<div class="cal-event-tag ${tagClass}" title="${l.member} (${l.type})">${l.member.split(" ")[0]} ${l.type}</div>`;
            });

            dayCell.innerHTML = cellContent;
            grid.appendChild(dayCell);
        }
    }

    function renderUpcomingList() {
        const container = document.getElementById("upcoming-leave-list");
        if (!container) return;

        const sorted = [...leaves].sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sorted.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">예정된 팀 연차가 없습니다.</p>`;
            return;
        }

        container.innerHTML = sorted.map(l => `
            <div class="leave-item-card">
                <div class="leave-item-info">
                    <span class="leave-item-name">${escapeHtml(l.member)} <span class="badge badge-team" style="margin-left: 6px;">${l.type}</span></span>
                    <span class="leave-item-date"><i class="fa-regular fa-calendar"></i> ${l.date} ${l.memo ? `(${escapeHtml(l.memo)})` : ''}</span>
                </div>
                <button class="btn-icon" onclick="LeaveCalendar.deleteLeave('${l.id}')" title="취소" style="color: var(--danger);"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `).join("");
    }

    function checkConflicts() {
        const alertBox = document.getElementById("leave-conflict-alert");
        const alertText = document.getElementById("conflict-date-text");
        if (!alertBox || !alertText) return;

        // Group by date
        const dateCounts = {};
        leaves.forEach(l => {
            dateCounts[l.date] = (dateCounts[l.date] || 0) + 1;
        });

        const conflictDates = Object.keys(dateCounts).filter(date => dateCounts[date] >= 2);

        if (conflictDates.length > 0) {
            alertBox.classList.remove("hidden");
            alertText.textContent = conflictDates.join(", ");
        } else {
            alertBox.classList.add("hidden");
        }
    }

    function bindEvents() {
        document.getElementById("cal-prev-month").addEventListener("click", () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar();
        });

        document.getElementById("cal-next-month").addEventListener("click", () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar();
        });

        const addBtn = document.getElementById("add-leave-btn");
        if (addBtn) addBtn.addEventListener("click", () => openLeaveModal());

        const form = document.getElementById("form-leave");
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                saveLeaveFromForm();
            });
        }
    }

    function openLeaveModal() {
        document.getElementById("form-leave").reset();
        document.getElementById("leave-date").value = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`;
        document.getElementById("modal-leave").classList.remove("hidden");
    }

    function saveLeaveFromForm() {
        const member = document.getElementById("leave-member").value;
        const type = document.getElementById("leave-type").value;
        const date = document.getElementById("leave-date").value;
        const memo = document.getElementById("leave-memo").value;

        leaves.push({
            id: "l-" + Date.now(),
            member, type, date, memo
        });

        saveStorage();
        renderCalendar();
        renderUpcomingList();
        checkConflicts();
        document.getElementById("modal-leave").classList.add("hidden");
        App.showToast("팀원 연차 일정이 추가되었습니다.", "success");
    }

    function deleteLeave(id) {
        if (confirm("해당 연차 일정을 취소/삭제하시겠습니까?")) {
            leaves = leaves.filter(l => l.id !== id);
            saveStorage();
            renderCalendar();
            renderUpcomingList();
            checkConflicts();
            App.showToast("연차 일정이 취소되었습니다.", "danger");
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    return {
        init,
        deleteLeave,
        getUpcomingCount: () => leaves.length,
        setLeaves: (data) => { leaves = data; saveStorage(); renderCalendar(); renderUpcomingList(); checkConflicts(); }
    };
})();
