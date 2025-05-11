const allAccessories = {
    "accado": {
        // Приводы (KLY)
        "privod": {
            "420-530": { article: "10001.0270.0.2", count: 0 },
            "530-700": { article: "10001.0440.0.2", count: 0 },
            "700-1200": { article: "10001.0940.0.2", count: 0 },
            "900-1450": { article: "10001.1190.0.2", count: 0 },
            "1200-1700": { article: "10001.1440.0.2", count: 0 },
            "1700-2200": { article: "10001.1940.0.2", count: 0 }
        },
        // Ножницы (KLG)
        "nozhnicy": {
            "370-480": { article: "10008.0350.0.2", count: 0 },
            "400-650": { article: "10008.0520.0.2", count: 0 },
            "450-700": { article: "10008.0570.0.2", count: 0 },
            "700-950": { article: "10008.0820.0.2", count: 0 },
            "950-1150": { article: "10008.1020.0.2", count: 0 },
            "1150-1400": { article: "10008.1270.0.2", count: 0 },
        },
        // Клюшка (BOY)
        "klyushka": {
            "550": { article: "10009.0550.0.2", count: 0 },
            "750": { article: "10009.0750.0.2", count: 0 },
            "1100": { article: "10009.1100.0.2", count: 0 },
            "1450": { article: "10009.1450.0.2", count: 0 }
        },
        // Доп. комплектующие (по количеству приводов)
        "dop": {
            "верхняя_петля": { article: "10014.0013.0.2", count: 0 },
            "нижний_шпингалет": { article: "10003.0950.0.2", count: 0 },
            "угловая_передача": { article: "10004.0000.0.2", count: 0 }
        }
    },
    "roto": {},
    "macco": {},
    "upt": {}
};

let currentSystem = "accado";
let menuVisible = true;
const cardsContainer = document.querySelector('.cards-container');
const accResult = document.querySelector('.acc__result');

function toggleVisibility(element, show) {
    element.setAttribute('aria-hidden', !show);
}

function createCardsForSystem(system) {
    cardsContainer.innerHTML = '';
    const systemData = allAccessories[system];
    Object.entries(systemData).forEach(([category, items]) => {
        if (category === 'dop' || category === 'klyushka') return;
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = getCategoryName(category);
        cardsContainer.appendChild(categoryTitle);
        Object.entries(items).forEach(([key, item]) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card__info">
                    <span class="card__type">${getCategoryName(category)}</span>
                    <span class="card__size">${key} мм</span>
                </div>
                <div class="card__controls-row">
                    <button class="decrease-btn">-</button>
                    <span class="card__count">${item.count}</span>
                    <button class="increase-btn">+</button>
                    <button class="increase10-btn">*</button>
                </div>
            `;
            card.querySelector('.decrease-btn').addEventListener('click', () => {
                if (item.count > 0) {
                    item.count--;
                    card.querySelector('.card__count').textContent = item.count;
                }
            });
            card.querySelector('.increase-btn').addEventListener('click', () => {
                item.count++;
                card.querySelector('.card__count').textContent = item.count;
            });
            card.querySelector('.increase10-btn').addEventListener('click', () => {
                item.count += 10;
                card.querySelector('.card__count').textContent = item.count;
            });
            cardsContainer.appendChild(card);
        });
    });
}

function getCategoryName(category) {
    const categories = {
        'nozhnicy': 'Ножницы',
        'privod': 'Привод',
        'klyushka': 'Клюшка',
        'dop': 'Доп. комплектующие'
    };
    return categories[category] || category;
}

// Инициализация
createCardsForSystem(currentSystem);
toggleVisibility(cardsContainer, true);
toggleVisibility(accResult, false);

document.querySelectorAll('.system-btn').forEach(btn => {
    if (btn.dataset.system !== 'accado') btn.style.display = 'none';
    btn.addEventListener('click', () => {
        if (menuVisible) {
            toggleVisibility(cardsContainer, false);
            menuVisible = false;
        } else {
            document.querySelectorAll('.system-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSystem = btn.dataset.system;
            createCardsForSystem(currentSystem);
            toggleVisibility(cardsContainer, true);
            toggleVisibility(accResult, false);
            menuVisible = true;
        }
    });
});

document.getElementById('calculate-btn').addEventListener('click', () => {
    toggleVisibility(cardsContainer, false);
    toggleVisibility(accResult, true);
    accResult.innerHTML = '<h3>Итоговый расчёт фурнитуры</h3>';
    const system = allAccessories[currentSystem];
    
    // Считаем приводы и добавляем соответствующие клюшки
    let privodCount = 0;
    const privodToKlyushka = {
        "700-1200": "550",
        "900-1450": "750",
        "1200-1700": "1100",
        "1700-2200": "1450"
    };
    
    // Сбрасываем все клюшки
    Object.keys(system.klyushka).forEach(key => {
        system.klyushka[key].count = 0;
    });
    
    // Добавляем клюшки в зависимости от приводов
    Object.entries(system.privod).forEach(([key, item]) => {
        privodCount += item.count;
        if (privodToKlyushka[key] && item.count > 0) {
            system.klyushka[privodToKlyushka[key]].count = item.count;
        }
    });
    
    // Автоматически добавляем доп. комплектующие по количеству приводов
    system.dop["верхняя_петля"].count = privodCount;
    system.dop["нижний_шпингалет"].count = privodCount;
    system.dop["угловая_передача"].count = privodCount;
    
    // Формируем вывод
    ["privod", "nozhnicy", "klyushka", "dop"].forEach(category => {
        const items = system[category];
        let hasAny = Object.values(items).some(item => item.count > 0);
        if (hasAny) {
            const catTitle = document.createElement('h4');
            catTitle.textContent = getCategoryName(category);
            accResult.appendChild(catTitle);
            
            const ul = document.createElement('ul');
            ul.className = 'result-list';
            
            Object.entries(items).forEach(([key, item]) => {
                if (item.count > 0) {
                    const li = document.createElement('li');
                    li.className = 'result-item';
                    
                    const sizeSpan = document.createElement('span');
                    sizeSpan.className = 'result-size';
                    sizeSpan.textContent = key;
                    
                    const articleSpan = document.createElement('span');
                    articleSpan.className = 'result-article';
                    articleSpan.textContent = item.article;
                    
                    const countSpan = document.createElement('span');
                    countSpan.className = 'result-count';
                    countSpan.textContent = item.count;
                    
                    li.appendChild(sizeSpan);
                    li.appendChild(articleSpan);
                    li.appendChild(countSpan);
                    ul.appendChild(li);
                }
            });
            accResult.appendChild(ul);
        }
    });
});
