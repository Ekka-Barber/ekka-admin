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
let isLoading = false;

// Debug Utilities
const debugDatabase = {
    checkConnection: () => {
        const connRef = ref(db, '.info/connected');
        onValue(connRef, (snap) => {
            if (snap.val() === true) {
                console.log('✅ Connected to Firebase');
            } else {
                console.log('❌ Not connected to Firebase');
            }
        });
    },

    testDataAccess: async () => {
        console.group('Firebase Data Access Test');
        try {
            // Test categories access
            const categoriesSnap = await get(ref(db, 'categories'));
            console.log('Categories data:', categoriesSnap.exists() ? '✅ Available' : '❌ No data');
            if (categoriesSnap.exists()) {
                console.log('Categories count:', Object.keys(categoriesSnap.val()).length);
            }

            // Test barbers access
            const barbersSnap = await get(ref(db, 'barbers'));
            console.log('Barbers data:', barbersSnap.exists() ? '✅ Available' : '❌ No data');
            if (barbersSnap.exists()) {
                console.log('Barbers count:', Object.keys(barbersSnap.val()).length);
            }
        } catch (error) {
            console.error('❌ Data access error:', error);
        }
        console.groupEnd();
    }
};

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

const showLoading = () => {
    if (isLoading) return;
    isLoading = true;
    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    const loader = document.createElement('div');
    loader.className = 'loader';
    overlay.appendChild(loader);
    document.body.appendChild(overlay);
};

const hideLoading = () => {
    isLoading = false;
    const overlay = document.querySelector('.loader-overlay');
    if (overlay) overlay.remove();
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

const handleDatabaseError = (error, operation = 'database operation') => {
    const errorMessage = `Error during ${operation}: ${error.message}`;
    console.error(errorMessage, error);
    showError(translations['error-occurred'][currentLanguage]);
    console.group('Error Details');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('Operation:', operation);
    console.log('Current Language:', currentLanguage);
    console.groupEnd();
};
// Categories and Services Management
const initializeDataListeners = () => {
    showLoading();
    
    // Create a promise for each data fetch
    const fetchCategories = get(ref(db, 'categories'))
        .then(snapshot => {
            if (snapshot.exists()) {
                updateCategoriesUI(snapshot.val());
            } else {
                console.log("No categories data available");
                updateCategoriesUI(null);
            }
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
            handleDatabaseError(error, 'fetching categories');
        });

    const fetchBarbers = get(ref(db, 'barbers'))
        .then(snapshot => {
            if (snapshot.exists()) {
                updateBarbersUI(snapshot.val());
            } else {
                console.log("No barbers data available");
                updateBarbersUI(null);
            }
        })
        .catch(error => {
            console.error("Error fetching barbers:", error);
            handleDatabaseError(error, 'fetching barbers');
        });

    // Wait for all data to be fetched
    Promise.all([fetchCategories, fetchBarbers])
        .finally(() => {
            hideLoading();
        });
};

// Update Categories UI
const updateCategoriesUI = (categories) => {
    const container = document.getElementById('categories-list');
    if (!container) {
        console.error("Categories container not found");
        return;
    }

    if (!categories) {
        container.innerHTML = `<p class="no-data">${translations['no-categories'][currentLanguage]}</p>`;
        return;
    }

    try {
        container.innerHTML = '';
        Object.entries(categories).forEach(([categoryId, category]) => {
            if (!category) return; // Skip if category is null or undefined
            
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.innerHTML = `
                <div class="category-header">
                    <h3>${category[currentLanguage] || 'Unnamed Category'}</h3>
                    <div class="category-actions">
                        <button onclick="editCategory('${categoryId}')" class="edit-button">
                            ${translations['edit'][currentLanguage]}
                        </button>
                        <button onclick="addService('${categoryId}')" class="add-button">
                            ${translations['new-service'][currentLanguage]}
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
    } catch (error) {
        console.error("Error updating categories UI:", error);
        container.innerHTML = `<p class="error-message">${translations['error-occurred'][currentLanguage]}</p>`;
    }
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
                <p class="service-info">${service.duration} | ${service.price} SAR</p>
                <p class="service-description">${service[`description_${currentLanguage}`] || ''}</p>
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

// Add Category
window.submitNewCategory = async () => {
    const nameAr = document.getElementById('category-name-ar').value.trim();
    const nameEn = document.getElementById('category-name-en').value.trim();

    if (!nameAr || !nameEn) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        const newCategoryRef = push(ref(db, 'categories'));
        await set(newCategoryRef, { 
            ar: nameAr, 
            en: nameEn, 
            services: {} 
        });
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'adding category');
    } finally {
        hideLoading();
    }
};

// Edit Category
window.editCategory = async (categoryId) => {
    try {
        showLoading();
        const categorySnapshot = await get(ref(db, `categories/${categoryId}`));
        const category = categorySnapshot.val();

        if (!category) {
            showError('Category not found');
            return;
        }

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
        showModal(translations['edit'][currentLanguage], formHTML);
    } catch (error) {
        handleDatabaseError(error, 'editing category');
    } finally {
        hideLoading();
    }
};

// Submit Category Edit
window.submitCategoryEdit = async (categoryId) => {
    const updatedData = {
        ar: document.getElementById('edit-category-name-ar').value.trim(),
        en: document.getElementById('edit-category-name-en').value.trim()
    };

    if (!updatedData.ar || !updatedData.en) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        await update(ref(db, `categories/${categoryId}`), updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'updating category');
    } finally {
        hideLoading();
    }
};

// Delete Category
window.deleteCategory = async (categoryId) => {
    if (!confirm(translations['confirm-delete'][currentLanguage])) {
        return;
    }

    try {
        showLoading();
        await remove(ref(db, `categories/${categoryId}`));
        showSuccess(translations['success-delete'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'deleting category');
    } finally {
        hideLoading();
    }
};

// Add Service to Category
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
    showModal(translations['new-service'][currentLanguage], formHTML);
};
// Barbers Management
const updateBarbersUI = (barbers) => {
    const container = document.getElementById('barbers-list');
    if (!container) {
        console.error("Barbers container not found");
        return;
    }

    if (!barbers) {
        container.innerHTML = `<p class="no-data">${translations['no-barbers'][currentLanguage]}</p>`;
        return;
    }

    try {
        container.innerHTML = '';
        Object.entries(barbers).forEach(([barberId, barber]) => {
            if (!barber) return;

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
    } catch (error) {
        console.error("Error updating barbers UI:", error);
        container.innerHTML = `<p class="error-message">${translations['error-occurred'][currentLanguage]}</p>`;
    }
};

// Add New Barber
window.submitNewBarber = async () => {
    const barberData = {
        name_ar: document.getElementById('barber-name-ar').value.trim(),
        name_en: document.getElementById('barber-name-en').value.trim(),
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
        showLoading();
        const newBarberRef = push(ref(db, 'barbers'));
        await set(newBarberRef, barberData);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'adding barber');
    } finally {
        hideLoading();
    }
};

// Edit Barber
window.editBarber = async (barberId) => {
    try {
        showLoading();
        const barberSnapshot = await get(ref(db, `barbers/${barberId}`));
        const barber = barberSnapshot.val();

        if (!barber) {
            showError('Barber not found');
            return;
        }

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
        showModal(translations['edit'][currentLanguage], formHTML);
    } catch (error) {
        handleDatabaseError(error, 'editing barber');
    } finally {
        hideLoading();
    }
};

// Submit Barber Edit
window.submitBarberEdit = async (barberId) => {
    const updatedData = {
        name_ar: document.getElementById('edit-barber-name-ar').value.trim(),
        name_en: document.getElementById('edit-barber-name-en').value.trim(),
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
        showLoading();
        await update(ref(db, `barbers/${barberId}`), updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'updating barber');
    } finally {
        hideLoading();
    }
};

// Toggle Barber Status
window.toggleBarberStatus = async (barberId, newStatus) => {
    try {
        showLoading();
        await update(ref(db, `barbers/${barberId}`), { active: newStatus });
        showSuccess(
            currentLanguage === 'ar' 
                ? `تم ${newStatus ? 'تفعيل' : 'إيقاف'} الحلاق بنجاح` 
                : `Barber ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
    } catch (error) {
        handleDatabaseError(error, 'toggling barber status');
    } finally {
        hideLoading();
    }
};

// Delete Barber
window.deleteBarber = async (barberId) => {
    if (!confirm(translations['confirm-delete'][currentLanguage])) {
        return;
    }

    try {
        showLoading();
        await remove(ref(db, `barbers/${barberId}`));
        showSuccess(translations['success-delete'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'deleting barber');
    } finally {
        hideLoading();
    }
};

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Debug database connection
    debugDatabase.checkConnection();
    debugDatabase.testDataAccess();

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
    if (closeButton) {
        closeButton.addEventListener('click', hideModal);
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('edit-modal');
        if (e.target === modal) hideModal();
    });

    // Add Category Button
    const addCategoryButton = document.getElementById('add-category');
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', () => {
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
            showModal(translations['new-category'][currentLanguage], formHTML);
        });
    }

    // Add Barber Button
    const addBarberButton = document.getElementById('add-barber');
    if (addBarberButton) {
        addBarberButton.addEventListener('click', () => {
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
            showModal(translations['new-barber'][currentLanguage], formHTML);
        });
    }

    // Initialize data listeners
    initializeDataListeners();
});
