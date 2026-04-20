function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
}

let obbyList = [];

async function loadData() {
    const res = await fetch("data/obby_list.json");
    const data = await res.json();

    obbyList = Object.entries(data);
    renderList();
}

function getData(index, key = null) {
    const [name, data] = obbyList[index];

    if (!key) return { name, ...data };

    return key.split(".").reduce((obj, k) => obj?.[k], data);
}

function renderList() {
    const container = document.getElementById("list");
    container.innerHTML = "";

    obbyList.forEach((_, i) => {
        const level = getData(i);

        const div = document.createElement("div");
        div.className = "level";

        const encodedName = encodeURIComponent(level.name);

        div.innerHTML = `
            <img class="thumb" src="data/thumbnails/${level.name}.png" onerror="this.src='data/thumbnails/default.png'">

            <div class="rank">#${i + 1}</div>

            <div class="info">
                <div class="name">${level.name}</div>
                <div class="desc">${level.description}</div>

                <div class="meta">
                    <span><img src="data/icons/user.svg"> ${level.creators}</span>
                    <span><img src="data/icons/star.svg"> ${level.points}</span>
                    <span><img src="data/icons/clock.svg"> ${level.length}</span>
                </div>
            </div>

            <a href="${level.link}" target="_blank" class="play">Play</a>
        `;

        // click event -> might add animations and effects for this
        div.onclick = (e) => {
            if (!e.target.classList.contains("play")) {
                window.location.href = `level.html?level=${encodedName}`;
            }
        };

        container.appendChild(div);
    });
}

loadData();