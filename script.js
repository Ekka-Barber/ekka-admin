// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, update, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyA0Syrv4XH88PTzQUaSg6vQaZlZMJ_85n8",
    authDomain: "ekka-barbershop.firebaseapp.com",
    databaseURL: "https://ekka-barbershop-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ekka-barbershop",
    storageBucket: "ekka-barbershop.firebasestorage.app",
    messagingSenderId: "726879506857",
    appId: "1:726879506857:web:5f0a85706259534a8d74b8",
    measurementId: "G-WTXDJPNPK5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global State Management
let currentLanguage = 'ar';
let activeTab = 'categories';

// Translations
const translations = {
    // Common
    'add': { ar: 'إضافة', en: 'Add' },
    'edit': { ar: 'تعديل', en: 'Edit' },
    'delete': { ar: 'حذف', en: 'Delete' },
    'save': { ar: 'حفظ', en: 'Save' },
    'cancel': { ar: 'إلغاء', en: 'Cancel' },
    'active': { ar: 'نشط', en: 'Active' },
    'inactive': { ar: 'غير نشط', en: 'Inactive' },
    'loading': { ar: 'جارٍ التحميل...', en: 'Loading...' },

    // Headers
    'admin-panel': { ar: 'لوحة التحكم', en: 'Admin Panel' },
    'categories-services': { ar: 'الفئات والخدمات', en: 'Categories & Services' },
    'barbers-management': { ar: 'إدارة الحلاقين', en: 'Barbers Management' },
    'settings': { ar: 'الإعدادات', en: 'Settings' },

    // Categories
    'new-category': { ar: 'فئة جديدة', en: 'New Category' },
    'category-name': { ar: 'اسم الفئة', en: 'Category Name' },
    'no-categories': { ar: 'لا توجد فئات', en: 'No categories found' },

    // Services
    'new-service': { ar: 'خدمة جديدة', en: 'New Service' },
    'service-name': { ar: 'اسم الخدمة', en: 'Service Name' },
    'duration': { ar: 'المدة', en: 'Duration' },
    'price': { ar: 'السعر', en: 'Price' },
    'description': { ar: 'الوصف', en: 'Description' },
    'no-services': { ar: 'لا توجد خدمات', en: 'No services found' },

    // Barbers
    'new-barber': { ar: 'حلاق جديد', en: 'New Barber' },
    'barber-name': { ar: 'اسم الحلاق', en: 'Barber Name' },
    'working-hours': { ar: 'ساعات العمل', en: 'Working Hours' },
    'start-time': { ar: 'وقت البدء', en: 'Start Time' },
    'end-time': { ar: 'وقت الانتهاء', en: 'End Time' },
    'no-barbers': { ar: 'لا يوجد حلاقين', en: 'No barbers found' },

    // Messages
    'confirm-delete': { ar: 'هل أنت متأكد من الحذف؟', en: 'Are you sure you want to delete?' },
    'saved-success': { ar: 'تم الحفظ بنجاح', en: 'Saved successfully' },
    'deleted-success': { ar: 'تم الحذف بنجاح', en: 'Deleted successfully' },
    'error-occurred': { ar: 'حدث خطأ', en: 'An error occurred' },
    'fill-required': { ar: 'يرجى ملء جميع الحقول المطلوبة', en: 'Please fill all required fields' },
    'success-add': { ar: 'تمت الإضافة بنجاح', en: 'Added successfully' },
    'success-update': { ar: 'تم التحديث بنجاح', en: 'Updated successfully' },
    'success-delete': { ar: 'تم الحذف بنجاح', en: 'Deleted successfully' },
    'required-fields': { ar: 'يرجى ملء الحقول المطلوبة', en: 'Please fill required fields' }
};

// Utility Functions
const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.admin-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
};

const showSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.admin-container').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
};

const showModal = (title, content) => {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-form').innerHTML = content;
    document.getElementById('edit-modal').style.display = 'block';
};

const hideModal = () => {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
    document.getElementById('modal-form').innerHTML = '';
};

const updateLanguage = () => {
    // Update page title
    document.getElementById('main-title').textContent = translations['admin-panel'][currentLanguage];

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        const key = button.dataset.tab;
        if (translations[key]) {
            button.textContent = translations[key][currentLanguage];
        }
    });

    // Update all static text elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[key]) {
            element.textContent = translations[key][currentLanguage];
        }
    });

    // Refresh current view based on active tab
    if (activeTab === 'categories') {
        initializeDataListeners(); // Refresh categories data
    } else if (activeTab === 'barbers') {
        initializeDataListeners(); // Refresh barbers data
    }
};

// Loading State Functions
const showLoading = () => {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.textContent = translations['loading'][currentLanguage];
    document.body.appendChild(loader);
};

const hideLoading = () => {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            const tabName = e.target.dataset.tab;
            e.target.classList.add('active');
            document.getElementById(`${tabName}-content`).classList.add('active');
            activeTab = tabName;
        });
    });

    // Language Switcher
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            document.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
            currentLanguage = lang;
            document.documentElement.lang = lang;
            document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
            updateLanguage();
        });
    });

    // Modal Close Button
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', hideModal);

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('edit-modal');
        if (e.target === modal) hideModal();
    });

    // Initialize Data Listeners
    initializeDataListeners();

    // Update Language on Load
    updateLanguage();
});

// Initialize Data Listeners
const initializeDataListeners = () => {
    // Show loading
    showLoading();

    // Listen for categories changes
    onValue(ref(db, 'categories'), (snapshot) => {
        updateCategoriesUI(snapshot.val());
        hideLoading();
    }, {
        onlyOnce: true
    });

    // Listen for barbers changes
    onValue(ref(db, 'barbers'), (snapshot) => {
        updateBarbersUI(snapshot.val());
        hideLoading();
    }, {
        onlyOnce: true
    });
};

// Categories and Services Management
const categoriesRef = ref(db, 'categories');

// Add Category Button Event Listener
document.getElementById('add-category').addEventListener('click', () => {
    const formHTML = `
        <div class="form-group">
            <label>${translations['category-name'][currentLanguage]} (عربي):</label>
            <input type="text" id="category-name-ar" required>
        </div>
        <div class="form-group">
            <label>${translations['category-name'][currentLanguage]} (English):</label>
            <input type="text" id="category-name-en" required>
        </div>
        <button class="submit-button" onclick="submitNewCategory()">
            ${translations['add'][currentLanguage]}
        </button>
    `;
    showModal(currentLanguage === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category', formHTML);
});

// Submit New Category
window.submitNewCategory = async () => {
    const nameAr = document.getElementById('category-name-ar').value;
    const nameEn = document.getElementById('category-name-en').value;

    if (!nameAr || !nameEn) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        const newCategoryRef = push(categoriesRef);
        await set(newCategoryRef, { ar: nameAr, en: nameEn, services: {} });
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        showError(error.message);
    }
};

// Update Categories UI
const updateCategoriesUI = (categories) => {
    const container = document.getElementById('categories-list');
    if (!categories) {
        container.innerHTML = `<p class="no-data">${translations['no-categories'][currentLanguage]}</p>`;
        return;
    }

    container.innerHTML = '';
    Object.entries(categories).forEach(([categoryId, category]) => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <div class="category-header">
                <h3>${category[currentLanguage]}</h3>
                <div class="category-actions">
                    <button onclick="editCategory('${categoryId}')" class="edit-button">
                        ${translations['edit'][currentLanguage]}
                    </button>
                    <button onclick="addService('${categoryId}')" class="add-button">
                        ${currentLanguage === 'ar' ? 'إضافة خدمة' : 'Add Service'}
                    </button>
                    <button onclick="deleteCategory('${categoryId}')" class="delete-button">
                        ${translations['delete'][currentLanguage]}
                    </button>
                </div>
            </div>
            <div class="services-list" id="services-${categoryId}">
                ${renderServices(categoryId, category.services || {})}
            </div>
        `;
        container.appendChild(categoryElement);
    });
};

// Render Services
const renderServices = (categoryId, services) => {
    if (!services || Object.keys(services).length === 0) {
        return `<p class="no-data">${translations['no-services'][currentLanguage]}</p>`;
    }

    return Object.entries(services).map(([serviceId, service]) => `
        <div class="service-item" id="service-${serviceId}">
            <div class="service-details">
                <h4>${service[`name_${currentLanguage}`]}</h4>
                <p>${service.duration} | ${service.price} SAR</p>
                <p>${service[`description_${currentLanguage}`] || ''}</p>
            </div>
            <div class="service-actions">
                <button onclick="editService('${categoryId}', '${serviceId}')" class="edit-button">
                    ${translations['edit'][currentLanguage]}
                </button>
                <button onclick="deleteService('${categoryId}', '${serviceId}')" class="delete-button">
                    ${translations['delete'][currentLanguage]}
                </button>
            </div>
        </div>
    `).join('');
};

// Add Service
window.addService = (categoryId) => {
    const formHTML = `
        <div class="form-group">
            <label>${translations['service-name'][currentLanguage]} (عربي):</label>
            <input type="text" id="service-name-ar" required>
        </div>
        <div class="form-group">
            <label>${translations['service-name'][currentLanguage]} (English):</label>
            <input type="text" id="service-name-en" required>
        </div>
        <div class="form-group">
            <label>${translations['duration'][currentLanguage]}:</label>
            <input type="text" id="service-duration" placeholder="e.g., 30m or 1h 30m" required>
        </div>
        <div class="form-group">
            <label>${translations['price'][currentLanguage]}:</label>
            <input type="number" id="service-price" required>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (عربي):</label>
            <textarea id="service-description-ar"></textarea>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (English):</label>
            <textarea id="service-description-en"></textarea>
        </div>
        <button class="submit-button" onclick="submitNewService('${categoryId}')">
            ${translations['add'][currentLanguage]}
        </button>
    `;
    showModal(currentLanguage === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service', formHTML);
};

// Submit New Service
window.submitNewService = async (categoryId) => {
    const serviceData = {
        name_ar: document.getElementById('service-name-ar').value,
        name_en: document.getElementById('service-name-en').value,
        duration: document.getElementById('service-duration').value,
        price: parseInt(document.getElementById('service-price').value),
        description_ar: document.getElementById('service-description-ar').value,
        description_en: document.getElementById('service-description-en').value
    };

    if (!serviceData.name_ar || !serviceData.name_en || !serviceData.duration || !serviceData.price) {
        showError(translations['required-fields'][currentLanguage]);
        return;
    }

    try {
        const servicesRef = ref(db, `categories/${categoryId}/services`);
        const newServiceRef = push(servicesRef);
        await set(newServiceRef, serviceData);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        showError(error.message);
    }
};

// Edit Service
window.editService = async (categoryId, serviceId) => {
    const serviceSnapshot = await get(ref(db, `categories/${categoryId}/services/${serviceId}`));
    const service = serviceSnapshot.val();

    const formHTML = `
        <div class="form-group">
            <label>${translations['service-name'][currentLanguage]} (عربي):</label>
            <input type="text" id="edit-service-name-ar" value="${service.name_ar}" required>
        </div>
        <div class="form-group">
            <label>${translations['service-name'][currentLanguage]} (English):</label>
            <input type="text" id="edit-service-name-en" value="${service.name_en}" required>
        </div>
        <div class="form-group">
            <label>${translations['duration'][currentLanguage]}:</label>
            <input type="text" id="edit-service-duration" value="${service.duration}" required>
        </div>
        <div class="form-group">
            <label>${translations['price'][currentLanguage]}:</label>
            <input type="number" id="edit-service-price" value="${service.price}" required>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (عربي):</label>
            <textarea id="edit-service-description-ar">${service.description_ar}</textarea>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (English):</label>
            <textarea id="edit-service-description-en">${service.description_en}</textarea>
        </div>
        <button class="submit-button" onclick="submitServiceEdit('${categoryId}', '${serviceId}')">
            ${translations['save'][currentLanguage]}
        </button>
    `;
    showModal(currentLanguage === 'ar' ? 'تعديل الخدمة' : 'Edit Service', formHTML);
};

// Submit Service Edit
window.submitServiceEdit = async (categoryId, serviceId) => {
    const updatedData = {
        name_ar: document.getElementById('edit-service-name-ar').value,
        name_en: document.getElementById('edit-service-name-en').value,
        duration: document.getElementById('edit-service-duration').value,
        price: parseInt(document.getElementById('edit-service-price').value),
        description_ar: document.getElementById('edit-service-description-ar').value,
        description_en: document.getElementById('edit-service-description-en').value
    };

    if (!updatedData.name_ar || !updatedData.name_en || !updatedData.duration || !updatedData.price) {
        showError(translations['required-fields'][currentLanguage]);
        return;
    }

    try {
        await update(ref(db, `categories/${categoryId}/services/${serviceId}`), updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        showError(error.message);
    }
};

// Edit Category
window.editCategory = async (categoryId) => {
    const categorySnapshot = await get(ref(db, `categories/${categoryId}`));
    const category = categorySnapshot.val();

    const formHTML = `
        <div class="form-group">
            <label>${translations['category-name'][currentLanguage]} (عربي):</label>
            <input type="text" id="edit-category-name-ar" value="${category.ar}" required>
        </div>
        <div class="form-group">
            <label>${translations['category-name'][currentLanguage]} (English):</label>
            <input type="text" id="edit-category-name-en" value="${category.en}" required>
        </div>
        <button class="submit-button" onclick="submitCategoryEdit('${categoryId}')">
            ${translations['save'][currentLanguage]}
        </button>
    `;
    showModal(currentLanguage === 'ar' ? 'تعديل الفئة' : 'Edit Category', formHTML);
};

// Submit Category Edit
window.submitCategoryEdit = async (categoryId) => {
    const updatedData = {
        ar: document.getElementById('edit-category-name-ar').value,
        en: document.getElementById('edit-category-name-en').value
    };

    if (!updatedData.ar || !updatedData.en) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        await update(ref(db, `categories/${categoryId}`), updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        showError(error.message);
    }
};

// Delete Category
window.deleteCategory = async (categoryId) => {
    if (confirm(translations['confirm-delete'][currentLanguage])) {
        try {
            await remove(ref(db, `categories/${categoryId}`));
            showSuccess(translations['success-delete'][currentLanguage]);
        } catch (error) {
            showError(error.message);
        }
    }
};

// Delete Service
window.deleteService = async (categoryId, serviceId) => {
    if (confirm(translations['confirm-delete'][currentLanguage])) {
        try {
            await remove(ref(db, `categories/${categoryId}/services/${serviceId}`));
            showSuccess(translations['success-delete'][currentLanguage]);
        } catch (error) {
            showError(error.message);
        }
    }
};

// Barbers Management
const barbersRef = ref(db, 'barbers');

// Add Barber Button Handler
document.getElementById('add-barber').addEventListener('click', () => {
    const formHTML = `
        <div class="form-group">
            <label>${translations['barber-name'][currentLanguage]} (عربي):</label>
            <input type="text" id="barber-name-ar" required>
        </div>
        <div class="form-group">
            <label>${translations['barber-name'][currentLanguage]} (English):</label>
            <input type="text" id="barber-name-en" required>
        </div>
        <div class="form-group">
            <label>${translations['start-time'][currentLanguage]}:</label>
            <input type="time" id="working-hours-start" required>
        </div>
        <div class="form-group">
            <label>${translations['end-time'][currentLanguage]}:</label>
            <input type="time" id="working-hours-end" required>
        </div>
        <div class="form-group">
            <label>
                <input type="checkbox" id="barber-active" checked>
                ${translations['active'][currentLanguage]}
            </label>
        </div>
        <button class="submit-button" onclick="submitNewBarber()">
            ${translations['add'][currentLanguage]}
        </button>
    `;
    showModal(currentLanguage === 'ar' ? 'إضافة حلاق جديد' : 'Add New Barber', formHTML);
});

// Submit New Barber
window.submitNewBarber = async () => {
    const barberData = {
        name_ar: document.getElementById('barber-name-ar').value,
        name_en: document.getElementById('barber-name-en').value,
        working_hours: {
            start: document.getElementById('working-hours-start').value,
            end: document.getElementById('working-hours-end').value
        },
        active: document.getElementById('barber-active').checked
    };

    if (!barberData.name_ar || !barberData.name_en || 
        !barberData.working_hours.start || !barberData.working_hours.end) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        const newBarberRef = push(barbersRef);
        await set(newBarberRef, barberData);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        showError(error.message);
    }
};

// Update Barbers UI
const updateBarbersUI = (barbers) => {
    const container = document.getElementById('barbers-list');
    if (!barbers) {
        container.innerHTML = `<p class="no-data">${translations['no-barbers'][currentLanguage]}</p>`;
        return;
    }

    container.innerHTML = '';
    Object.entries(barbers).forEach(([barberId, barber]) => {
        const barberElement = document.createElement('div');
        barberElement.className = `barber-item ${barber.active ? 'active' : 'inactive'}`;
        barberElement.innerHTML = `
            <div class="barber-header">
                <h3>${barber[`name_${currentLanguage}`]}</h3>
                <div class="barber-status">
                    <span class="status-indicator ${barber.active ? 'active' : 'inactive'}">
                        ${barber.active ? 
                            translations['active'][currentLanguage] : 
                            translations['inactive'][currentLanguage]}
                    </span>
                </div>
            </div>
            <div class="barber-details">
                <p>${translations['working-hours'][currentLanguage]}: 
                   ${barber.working_hours.start} - ${barber.working_hours.end}</p>
            </div>
            <div class="barber-actions">
                <button onclick="editBarber('${barberId}')" class="edit-button">
                    ${translations['edit'][currentLanguage]}
                </button>
                <button onclick="toggleBarberStatus('${barberId}', ${!barber.active})" 
                        class="toggle-button">
                    ${barber.active ? 
                        (currentLanguage === 'ar' ? 'إيقاف' : 'Deactivate') : 
                        (currentLanguage === 'ar' ? 'تفعيل' : 'Activate')}
                </button>
                <button onclick="deleteBarber('${barberId}')" class="delete-button">
                    ${translations['delete'][currentLanguage]}
                </button>
            </div>
        `;
        container.appendChild(barberElement);
    });
};

// Edit Barber
window.editBarber = async (barberId) => {
    const barberSnapshot = await get(ref(db, `barbers/${barberId}`));
    const barber = barberSnapshot.val();

    const formHTML = `
        <div class="form-group">
            <label>${translations['barber-name'][currentLanguage]} (عربي):</label>
            <input type="text" id="edit-barber-name-ar" value="${barber.name_ar}" required>
        </div>
        <div class="form-group">
            <label>${translations['barber-name'][currentLanguage]} (English):</label>
            <input type="text" id="edit-barber-name-en" value="${barber.name_en}" required>
        </div>
        <div class="form-group">
            <label>${translations['start-time'][currentLanguage]}:</label>
            <input type="time" id="edit-working-hours-start" 
                   value="${barber.working_hours.start}" required>
        </div>
        <div class="form-group">
            <label>${translations['end-time'][currentLanguage]}:</label>
            <input type="time" id="edit-working-hours-end" 
                   value="${barber.working_hours.end}" required>
        </div>
        <div class="form-group">
            <label>
                <input type="checkbox" id="edit-barber-active" 
                       ${barber.active ? 'checked' : ''}>
                ${translations['active'][currentLanguage]}
            </label>
        </div>
        <button class="submit-button" onclick="submitBarberEdit('${barberId}')">
            ${translations['save'][currentLanguage]}
        </button>
    `;
    showModal(currentLanguage === 'ar' ? 'تعديل بيانات الحلاق' : 'Edit Barber', formHTML);
};

// Submit Barber Edit
window.submitBarberEdit = async (barberId) => {
    const updatedData = {
        name_ar: document.getElementById('edit-barber-name-ar').value,
        name_en: document.getElementById('edit-barber-name-en').value,
        working_hours: {
            start: document.getElementById('edit-working-hours-start').value,
            end: document.getElementById('edit-working-hours-end').value
        },
        active: document.getElementById('edit-barber-active').checked
    };

    if (!updatedData.name_ar || !updatedData.name_en || 
        !updatedData.working_hours.start || !updatedData.working_hours.end) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        await update(ref(db, `barbers/${barberId}`), updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        showError(error.message);
    }
};

// Toggle Barber Status
window.toggleBarberStatus = async (barberId, newStatus) => {
    try {
        await update(ref(db, `barbers/${barberId}`), { active: newStatus });
        showSuccess(
            currentLanguage === 'ar' 
                ? `تم ${newStatus ? 'تفعيل' : 'إيقاف'} الحلاق بنجاح` 
                : `Barber ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
    } catch (error) {
        showError(error.message);
    }
};

// Delete Barber
window.deleteBarber = async (barberId) => {
    if (confirm(translations['confirm-delete'][currentLanguage])) {
        try {
            await remove(ref(db, `barbers/${barberId}`));
            showSuccess(translations['success-delete'][currentLanguage]);
        } catch (error) {
            showError(error.message);
        }
    }
};
