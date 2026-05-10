/* TODOS

    -> Fix level.html to leaderboard (edit bscr in level.html) // done
    -> complete the database // NOT done

*/

let searchQuery = "";
let selectedTag = "all";

function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");

    const buttons = document.querySelectorAll(".nav-btn");
    const line = document.querySelector(".nav-line");

    buttons.forEach(btn => {
        btn.classList.remove("active");

        if (btn.dataset.tab === tabId) {
            btn.classList.add("active");

            const rect = btn.getBoundingClientRect();
            const parentRect = btn.parentElement.getBoundingClientRect();

            line.style.width = rect.width + "px";
            line.style.transform = `translateX(${rect.left - parentRect.left}px)`;
        }
    });

    window.location.hash = tabId;

    if (tabId === "leaderboard" && playerList.length === 0) {
        loadPlayers();
    }
}

function setSearch(value) {
    searchQuery = value.toLowerCase();
    renderList();
}

function setTag(value) {
    selectedTag = value;
    renderList();
}

const tooltip = document.createElement("div");
tooltip.className = "player-tooltip";
document.body.appendChild(tooltip);

let obbyList = [];

function calculatePointsByIndex(index, totalLevels) {
    const maxPoints = 1000;
    const minPoints = 100;

    if (totalLevels <= 1) return maxPoints;

    const points = maxPoints - (
        (index / (totalLevels - 1)) * (maxPoints - minPoints)
    );

    return Math.round(points);
}

function getLevelRank(levelName) {
    return obbyList.findIndex(([name]) => name === levelName) + 1;
}

function getLevelPoints(levelName) {
    const index = obbyList.findIndex(([name]) => name === levelName);

    if (index === -1) return 0;

    return calculatePointsByIndex(index, obbyList.length);
}

function calculatePlayerPoints(playerData) {
    let total = 0;

    playerData.verifications.forEach(level => {
        total += getLevelPoints(level);
    });

    playerData.wins.forEach(level => {
        total += Math.floor(getLevelPoints(level) * 0.25);
    });

    return total;
}

function getHardestLevel(playerData) {
    const allLevels = [
        ...playerData.verifications,
        ...playerData.wins
    ];

    let bestLevel = null;
    let bestRank = Infinity;

    allLevels.forEach(level => {
        const rank = getLevelRank(level);

        if (rank > 0 && rank < bestRank) {
            bestRank = rank;
            bestLevel = level;
        }
    });

    return {
        level: bestLevel || "None",
        place: bestRank === Infinity ? "-" : bestRank
    };
}

function populateTags() {
    const select = document.getElementById("tag-filter");
    const tags = new Set();

    obbyList.forEach(([_, level]) => {
        if (level.tags) {
            level.tags.forEach(tag => tags.add(tag));
        }
    });

    tags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
}

async function loadData() {
    const res = await fetch("data/obby_list.json");
    const data = await res.json();

    obbyList = Object.entries(data);
    populateTags();
    renderList();
}

function renderList() {
    const container = document.getElementById("list");
    container.innerHTML = "";

    const filtered = obbyList.filter(([name, level]) => {
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTag =
            selectedTag === "all" ||
            (level.tags && level.tags.includes(selectedTag));

        return matchesSearch && matchesTag;
    });

    filtered.forEach(([name, level], i) => {
        const realIndex = obbyList.findIndex(x => x[0] === name);
        const rank = realIndex + 1;
        const rankClass =
            rank === 1 ? "rank gold" :
            rank === 2 ? "rank silver" :
            rank === 3 ? "rank bronze" :
            "rank";

        const div = document.createElement("div");
        div.className = "level";

        const encodedName = encodeURIComponent(name);

        div.innerHTML = `
            <img class="thumb" src="data/thumbnails/${name}.png"
            onerror="this.src='data/thumbnails/default.png'">

            <div class="${rankClass}">#${rank}</div>

            <div class="info">
                <div class="name">${name}</div>
                <div class="desc">${level.description}</div>

                <div class="meta">
                    <span><img src="data/icons/user.svg"> ${level.creators}</span>
                    <span><img src="data/icons/star.svg"> ${getLevelPoints(name)}</span>
                    <span><img src="data/icons/clock.svg"> ${level.length}</span>
                </div>

                ${level.tags ? `
                    <div class="level-tags">
                        ${level.tags.map(tag => `<span class="level-tag">${tag}</span>`).join("")}
                    </div>
                ` : ""}
            </div>

            <div class="play-wrapper">
                <a href="${level.link}" target="_blank" class="play">
                    <img src="data/icons/link.svg" class="play-icon">
                    Play
                </a>
            </div>
        `;

        div.onclick = (e) => {
            if (!e.target.closest(".play")) {
                window.location.href = `level.html?level=${encodedName}`;
            }
        };

        container.appendChild(div);
    });
}

function loadFromHash() {
    const hash = window.location.hash.replace("#", "");

    if (hash === "leaderboard") {
        showTab("leaderboard");
    } else {
        showTab("levels");
    }
}

window.addEventListener("DOMContentLoaded", loadFromHash);
window.addEventListener("hashchange", loadFromHash);

let playerList = [];

async function loadPlayers() {
    const res = await fetch("data/player_list.json");
    const data = await res.json();

    playerList = Object.entries(data);

    playerList.forEach(([_, playerData]) => {
        playerData.points = calculatePlayerPoints(playerData);

        const hardest = getHardestLevel(playerData);

        playerData.hardest = hardest.level;
        playerData.hardest_place = hardest.place;
    });

    playerList.sort((a, b) => b[1].points - a[1].points);

    renderPlayers();
}

function getFlagImage(code) {
    if (!code) return "";
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

function renderPlayers() {
    const container = document.getElementById("player-list");
    container.innerHTML = "";

    playerList.forEach(([name, data], i) => {
        const div = document.createElement("div");
        div.className = "level";

        div.innerHTML = `
            <div class="rank">#${i + 1}</div>

            <div class="info">
                <div class="name">
                    ${data.flag ? `
                        <img class="flag-icon"
                             src="${getFlagImage(data.flag)}"
                             onerror="this.style.display='none'">
                    ` : ""} |
                    ${name}
                </div>

                <div class="desc">
                    Hardest: ${data.hardest} [#${data.hardest_place}]
                </div>

                <div class="meta">
                    <span><img src="data/icons/star.svg"> ${data.points} pts</span>
                    <span><img src="data/icons/verify.svg"> ${data.verifications.length} verifications</span>
                    <span><img src="data/icons/user.svg"> ${data.wins.length} wins</span>
                </div>
            </div>
        `;

        div.addEventListener("mousemove", (e) => {
            tooltip.style.display = "block";
            tooltip.style.left = e.pageX + 15 + "px";
            tooltip.style.top = e.pageY + 15 + "px";

            tooltip.innerHTML = `
                <b>${name}</b>
                <div><strong>Verifications:</strong><br>
                    ${data.verifications.join("<br>")}
                </div>
                <br>
                <div><strong>Wins:</strong><br>
                    ${data.wins.join("<br>")}
                </div>
            `;
        });

        div.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        container.appendChild(div);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    showTab("levels");
});

loadData();