const titleInput = document.getElementById('artifact-title');
const categoryInput = document.getElementById('artifact-category');
const imageInput = document.getElementById('artifact-image');
const addBtn = document.getElementById('add-btn');
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const errorBanner = document.getElementById('error-banner');
const closeErrorBtn = document.getElementById('close-error');
const counter = document.getElementById('counter');
const themeBtn = document.getElementById('theme-btn');

// Массив для хранения артефактов
let artifacts = [];
let categories = [];

// Этап 2: Основные функции

// Добавление артефакта
addBtn.addEventListener('click', function() {
    // Получаем значения из полей
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const image = imageInput.value.trim();
    
    // Проверяем, все ли поля заполнены
    if (!title || !category || !image) {
        showError("Заполните все поля!");
        return;
    }
    
    // Проверяем URL
    if (!isValidUrl(image)) {
        showError("Введите корректный URL изображения!");
        return;
    }
    
    // Создаем объект артефакта
    const artifact = {
        id: Date.now(), // Уникальный ID
        title: title,
        category: category,
        image: image,
        isFavorite: false
    };
    
    // Добавляем в массив
    artifacts.push(artifact);
    
    // Обновляем категории
    updateCategories(category);
    
    // Очищаем форму
    titleInput.value = '';
    categoryInput.value = '';
    imageInput.value = '';
    
    // Обновляем галерею
    updateGallery();
});

// Функция проверки URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Функция создания карточки
function createCard(artifact) {
    // Создаем элемент карточки
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = artifact.id;
    card.dataset.category = artifact.category;
    
    // Если артефакт в избранном, добавляем класс
    if (artifact.isFavorite) {
        card.classList.add('favorite');
    }
    
    // Заполняем содержимое
    card.innerHTML = `
        <img class="card-image" src="${artifact.image}" alt="${artifact.title}" 
             onerror="this.onerror=null; this.src='https://via.placeholder.com/300x180/ecf0f1/7f8c8d?text=Ошибка+загрузки'">
        <h3>${artifact.title}</h3>
        <div class="category">${artifact.category}</div>
        <div class="actions">
            <button class="fav-btn">${artifact.isFavorite ? '★ Избранное' : '☆ В избранное'}</button>
            <button class="delete-btn">Удалить</button>
        </div>
    `;
    
    // Добавляем обработчики событий
    const deleteBtn = card.querySelector('.delete-btn');
    const favBtn = card.querySelector('.fav-btn');
    const img = card.querySelector('.card-image');
    
    // Удаление карточки
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        card.remove();
        // Удаляем из массива
        artifacts = artifacts.filter(a => a.id !== artifact.id);
        updateCounter();
        updateCategoriesList();
    });
    
    // Добавление в избранное
    favBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Находим артефакт в массиве
        const art = artifacts.find(a => a.id === artifact.id);
        if (art) {
            // Меняем состояние
            art.isFavorite = !art.isFavorite;
            
            // Обновляем карточку
            if (art.isFavorite) {
                card.classList.add('favorite');
                favBtn.textContent = '★ Избранное';
            } else {
                card.classList.remove('favorite');
                favBtn.textContent = '☆ В избранное';
            }
        }
    });
    
    // Проверяем загрузку изображения
    img.addEventListener('error', function() {
        console.log('Ошибка загрузки изображения:', artifact.image);
    });
    
    img.addEventListener('load', function() {
        console.log('Изображение загружено:', artifact.image);
    });
    
    // Подсветка при наведении
    card.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    });
    
    card.addEventListener('mouseout', function() {
        if (!this.classList.contains('favorite')) {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });
    
    return card;
}

// Фильтрация
searchInput.addEventListener('input', function() {
    const searchValue = this.value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const category = card.querySelector('.category').textContent.toLowerCase();
        
        if (title.includes(searchValue) || category.includes(searchValue)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Фильтр по категории
categorySelect.addEventListener('change', function() {
    const selectedCategory = this.value;
    filterByCategory(selectedCategory);
});

// Функция фильтрации по категории
function filterByCategory(category) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Этап 3: Дополнительные функции

// Обновление списка категорий
function updateCategories(newCategory) {
    // Проверяем, есть ли уже такая категория
    if (!categories.includes(newCategory)) {
        categories.push(newCategory);
        
        // Добавляем в select
        const option = document.createElement('option');
        option.value = newCategory;
        option.textContent = newCategory;
        categorySelect.appendChild(option);
    }
}

// Обновление списка категорий после удаления
function updateCategoriesList() {
    // Получаем все уникальные категории из оставшихся артефактов
    const newCategories = [...new Set(artifacts.map(a => a.category))];
    
    // Если категории изменились
    if (JSON.stringify(categories.sort()) !== JSON.stringify(newCategories.sort())) {
        categories = newCategories;
        
        // Обновляем select
        categorySelect.innerHTML = '<option value="all">Все категории</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

// Показать ошибку
function showError(message) {
    const errorText = errorBanner.querySelector('p');
    errorText.textContent = message;
    errorBanner.classList.add('show');
    
    setTimeout(() => {
        errorBanner.classList.remove('show');
    }, 3000);
}

// Закрыть ошибку
closeErrorBtn.addEventListener('click', function() {
    errorBanner.classList.remove('show');
});

// Обновить галерею
function updateGallery() {
    gallery.innerHTML = '';
    
    if (artifacts.length === 0) {
        gallery.innerHTML = '<p style="text-align: center; padding: 40px; color: #7f8c8d;">Нет артефактов. Добавьте первый!</p>';
        return;
    }
    
    artifacts.forEach(artifact => {
        const card = createCard(artifact);
        gallery.appendChild(card);
    });
    
    updateCounter();
}

// Обновить счетчик
function updateCounter() {
    counter.textContent = artifacts.length;
}

// Смена темы
themeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Загрузка темы из localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
}

// Инициализация при загрузке страницы
function init() {
    loadTheme();
    errorBanner.classList.remove('show');
    
    // Добавляем несколько примеров для начала
    const exampleArtifacts = [
        {
            id: 1,
            title: "Горный пейзаж",
            category: "Пейзаж",
            image: "https://picsum.photos/300/200?random=1",
            isFavorite: false
        },
        {
            id: 2,
            title: "Город ночью",
            category: "Город",
            image: "https://picsum.photos/300/200?random=2",
            isFavorite: false
        },
        {
            id: 3,
            title: "Лесная тропа",
            category: "Природа",
            image: "https://picsum.photos/300/200?random=3",
            isFavorite: false
        }
    ];
    
    artifacts = exampleArtifacts;
    exampleArtifacts.forEach(artifact => updateCategories(artifact.category));
    updateGallery();
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', init);