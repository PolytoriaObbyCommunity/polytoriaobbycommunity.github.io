/* TODOS

    -> Fix level.html to leaderboard (edit bscr in level.html)
    -> complete ethe database
    -> idk i forgot

*/

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

const tooltip = document.createElement("div");
tooltip.className = "player-tooltip";
document.body.appendChild(tooltip);

let obbyList = [];

async function loadData() {
    const res = await fetch("data/obby_list.json");
    const data = await res.json();

    obbyList = Object.entries(data);
    renderList();
}

function renderList() {
    const container = document.getElementById("list");
    container.innerHTML = "";

    obbyList.forEach((_, i) => {
        const [name, level] = obbyList[i];

        const div = document.createElement("div");
        div.className = "level";

        const encodedName = encodeURIComponent(name);

        div.innerHTML = `
            <img class="thumb" src="data/thumbnails/${name}.png"
            onerror="this.src='data/thumbnails/default.png'">

            <div class="rank">#${i + 1}</div>

            <div class="info">
                <div class="name">${name}</div>
                <div class="desc">${level.description}</div>

                <div class="meta">
                    <span><img src="data/icons/user.svg"> ${level.creators}</span>
                    <span><img src="data/icons/star.svg"> ${level.points}</span>
                    <span><img src="data/icons/clock.svg"> ${level.length}</span>
                </div>
            </div>

            <div class="play-wrapper">

                <img class="level-icon"
                    src="data/level_icons/${name}.png"
                    onerror="this.style.display='none'">

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

    playerList.sort((a, b) => b[1].points - a[1].points);

    renderPlayers();
}

function getFlagImage(code) {
    if (!code) return "";
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

// might change how the loop works, sometimes it doesnt renders the players
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

// i hate how the event listener works, also level.html sometime
window.addEventListener("DOMContentLoaded", () => {
    showTab("levels");
});

loadData();