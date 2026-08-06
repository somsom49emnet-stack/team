/* ==========================================================================
   Module 3: 팀 연차 & 일정(교육/미팅) 캘린더 (Leave & Event Calendar)
   ========================================================================== */

const LeaveCalendar = (function () {
    const defaultLeaves = [
        { id: "l-1", member: "조다솜 AE", type: "연차", date: "2026-08-14", title: "여름휴가", memo: "대행: 이하림 AE", summary: "" },
        { id: "l-2", member: "이하림 AE", type: "교육", date: "2026-08-18", title: "Meta 최신 시그널 및 Conversions API 세미나", memo: "온라인 라이브 교육", summary: "Meta Conversions API(CAPI) 도입 시 타게팅 정확도 및 ROAS 개선 방안 학습. 이니스프리 및 에뛰드 브랜드 캠페인 적용 검토 필요." },
        { id: "l-3", member: "이원선 AE", type: "광고주미팅", date: "2026-08-20", title: "올리브영 MD 전략 미팅", memo: "올리브영 본사", summary: "" },
        { id: "l-4", member: "박소윤 AE", type: "오후반차", date: "2026-08-25", title: "개인 일정", memo: "대행: 박수영 AE", summary: "" }
    ];

    let leaves = [];
    let currentYear = 2026;
    let currentMonth = 7; // 0-indexed (7 = August)

    function init() {
        const stored = localStorage.getItem("emnet_leaves_v2");
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
        renderTrainingBoard();
        checkConflicts();
        bindEvents();
    }

    function saveStorage() {
        localStorage.setItem("emnet_leaves_v2", JSON.stringify(leaves));
    }

    function populateMemberDropdown() {
        const select = document.getElementById("leave-member");
        if (!select) return;
        const activeMembers = [
            "조다솜", "이하림", "이원선", "이혜민", "김채은", "박소윤", "박수영",
            "최예원", "김혜진", "김예일", "박진혁", "문지영", "조아란", "고하람",
            "김은혜", "강서원", "정재현", "최지원", "원나연"
        ];
        select.innerHTML = activeMembers.map(m => `<option value="${m} AE">${m} AE</option>`).join("");
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
                else if (l.type === "교육") tagClass = "tag-education";
                else if (l.type === "광고주미팅") tagClass = "tag-meeting";
                else if (l.type === "공가") tagClass = "tag-official";

                cellContent += `<div class="cal-event-tag ${tagClass}" title="${l.member} (${l.type}: ${escapeHtml(l.title || '')})">${l.member.split(" ")[0]} ${l.type}</div>`;
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
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">예정된 일정(연차/교육/미팅)이 없습니다.</p>`;
            return;
        }

        container.innerHTML = sorted.map(l => {
            let badgeStyle = "badge-team";
            if (l.type === "교육") badgeStyle = "badge-education";
            if (l.type === "광고주미팅") badgeStyle = "badge-media";

            return `
                <div class="leave-item-card">
                    <div class="leave-item-info">
                        <span class="leave-item-name">${escapeHtml(l.member)} <span class="badge ${badgeStyle}" style="margin-left: 6px;">${l.type}</span></span>
                        <strong style="font-size: 0.82rem; margin-top: 2px;">${escapeHtml(l.title || '')}</strong>
                        <span class="leave-item-date"><i class="fa-regular fa-calendar"></i> ${l.date} ${l.memo ? `(${escapeHtml(l.memo)})` : ''}</span>
                    </div>
                    <button class="btn-icon" onclick="LeaveCalendar.deleteLeave('${l.id}')" title="취소" style="color: var(--danger);"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        }).join("");
    }

    function renderTrainingBoard() {
        const board = document.getElementById("training-board-container");
        if (!board) return;

        const trainingItems = leaves.filter(l => l.type === "교육" && l.summary);

        if (trainingItems.length === 0) {
            board.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; padding: 12px;">등록된 교육 요약 정리 내용이 없습니다. 교육 일정 등록 시 요약 내용을 정리해보세요!</p>`;
            return;
        }

        board.innerHTML = trainingItems.map(t => `
            <div class="training-card">
                <div class="training-card-header">
                    <span class="badge badge-education"><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(t.title)}</span>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">${t.date} | 작성자: ${escapeHtml(t.member)}</span>
                </div>
                <div class="training-card-body">
                    <p style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.6;">${escapeHtml(t.summary)}</p>
                </div>
            </div>
        `).join("");
    }

    function checkConflicts() {
        const alertBox = document.getElementById("leave-conflict-alert");
        const alertText = document.getElementById("conflict-date-text");
        if (!alertBox || !alertText) return;

        const dateCounts = {};
        leaves.filter(l => l.type.includes("연차") || l.type.includes("반차")).forEach(l => {
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
        const title = document.getElementById("leave-title").value;
        const memo = document.getElementById("leave-memo").value;
        const summary = document.getElementById("leave-summary").value;

        leaves.push({
            id: "l-" + Date.now(),
            member, type, date, title, memo, summary
        });

        saveStorage();
        renderCalendar();
        renderUpcomingList();
        renderTrainingBoard();
        checkConflicts();
        document.getElementById("modal-leave").classList.add("hidden");
        App.showToast("팀원 일정(연차/교육/미팅)이 등록되었습니다.", "success");
    }

    function deleteLeave(id) {
        if (confirm("해당 일정을 삭제하시겠습니까?")) {
            leaves = leaves.filter(l => l.id !== id);
            saveStorage();
            renderCalendar();
            renderUpcomingList();
            renderTrainingBoard();
            checkConflicts();
            App.showToast("일정이 삭제되었습니다.", "danger");
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    return {
        init,
        deleteLeave,
        setLeaves: (data) => { leaves = data; saveStorage(); renderCalendar(); renderUpcomingList(); renderTrainingBoard(); checkConflicts(); }
    };
})();
