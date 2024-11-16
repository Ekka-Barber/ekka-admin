// Firebase Configuration and Initialization
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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Global State Management
let currentLanguage = 'ar';
let activeTab = 'categories';
let isLoading = false;

// Debug Utilities
const debugDatabase = {
    checkConnection: () => {
        const connRef = db.ref('.info/connected');
        connRef.on('value', (snap) => {
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
            const categoriesSnap = await db.ref('categories').once('value');
            console.log('Categories data:', categoriesSnap.exists() ? '✅ Available' : '❌ No data');
            if (categoriesSnap.exists()) {
                console.log('Categories count:', Object.keys(categoriesSnap.val()).length);
            }

            const barbersSnap = await db.ref('barbers').once('value');
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
    'add': { ar: 'إضافة', en: 'Add' },
    'edit': { ar: 'تعديل', en: 'Edit' },
    'delete': { ar: 'حذف', en: 'Delete' },
    'save': { ar: 'حفظ', en: 'Save' },
    'cancel': { ar: 'إلغاء', en: 'Cancel' },
    'active': { ar: 'نشط', en: 'Active' },
    'inactive': { ar: 'غير نشط', en: 'Inactive' },
    'loading': { ar: 'جارٍ التحميل...', en: 'Loading...' },
    'admin-panel': { ar: 'لوحة التحكم', en: 'Admin Panel' },
    'categories-services': { ar: 'الفئات والخدمات', en: 'Categories & Services' },
    'barbers-management': { ar: 'إدارة الحلاقين', en: 'Barbers Management' },
    'settings': { ar: 'الإعدادات', en: 'Settings' },
    'new-category': { ar: 'فئة جديدة', en: 'New Category' },
    'category-name': { ar: 'اسم الفئة', en: 'Category Name' },
    'no-categories': { ar: 'لا توجد فئات', en: 'No categories found' },
    'new-service': { ar: 'خدمة جديدة', en: 'New Service' },
    'service-name': { ar: 'اسم الخدمة', en: 'Service Name' },
    'duration': { ar: 'المدة', en: 'Duration' },
    'price': { ar: 'السعر', en: 'Price' },
    'description': { ar: 'الوصف', en: 'Description' },
    'no-services': { ar: 'لا توجد خدمات', en: 'No services found' },
    'new-barber': { ar: 'حلاق جديد', en: 'New Barber' },
    'barber-name': { ar: 'اسم الحلاق', en: 'Barber Name' },
    'working-hours': { ar: 'ساعات العمل', en: 'Working Hours' },
    'start-time': { ar: 'وقت البدء', en: 'Start Time' },
    'end-time': { ar: 'وقت الانتهاء', en: 'End Time' },
    'no-barbers': { ar: 'لا يوجد حلاقين', en: 'No barbers found' },
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
    if (!document.querySelector('.loader-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'loader-overlay';
        const loader = document.createElement('div');
        loader.className = 'loader';
        overlay.appendChild(loader);
        document.body.appendChild(overlay);
    }
};

const hideLoading = () => {
    isLoading = false;
    const overlay = document.querySelector('.loader-overlay');
    if (overlay) {
        overlay.addEventListener('transitionend', () => overlay.remove());
        overlay.style.opacity = '0';
    }
};

const showModal = (title, content) => {
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    
    if (modal && modalTitle && modalForm) {
        modalTitle.textContent = title;
        modalForm.innerHTML = content;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        setTimeout(() => {
            const firstInput = modalForm.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    } else {
        console.error('Modal elements not found');
    }
};

const hideModal = () => {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        document.getElementById('modal-form').innerHTML = '';
    }
};

// Submit Category
window.submitNewCategory = async () => {
    const nameAr = document.getElementById('category-name-ar').value.trim();
    const nameEn = document.getElementById('category-name-en').value.trim();

    const categoryData = { ar: nameAr, en: nameEn, services: {} };

    if (!nameAr || !nameEn) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        const newCategoryRef = db.ref('categories').push();
        await newCategoryRef.set(categoryData);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        showError(translations['error-occurred'][currentLanguage]);
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Add Barber
window.submitNewBarber = async () => {
    const nameAr = document.getElementById('barber-name-ar').value.trim();
    const nameEn = document.getElementById('barber-name-en').value.trim();
    const workingHoursStart = document.getElementById('working-hours-start').value;
    const workingHoursEnd = document.getElementById('working-hours-end').value;
    const isActive = document.getElementById('barber-active').checked;

    const barberData = {
        name_ar: nameAr,
        name_en: nameEn,
        working_hours: {
            start: workingHoursStart,
            end: workingHoursEnd
        },
        active: isActive
    };

    if (!nameAr || !nameEn || !workingHoursStart || !workingHoursEnd) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        const newBarberRef = db.ref('barbers').push();
        await newBarberRef.set(barberData);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        showError(translations['error-occurred'][currentLanguage]);
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Initialize Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-category-btn')?.addEventListener('click', () => {
        const formHTML = `
            <div class="form-group">
                <label>${translations['category-name'][currentLanguage]} (عربي):</label>
                <input type="text" id="category-name-ar" required>
            </div>
            <div class="form-group">
                <label>${translations['category-name'][currentLanguage]} (English):</label>
                <input type="text" id="category-name-en" required>
            </div>
            <button onclick="submitNewCategory()" class="submit-button">
                ${translations['add'][currentLanguage]}
            </button>
        `;
        showModal(translations['new-category'][currentLanguage], formHTML);
    });

    document.getElementById('add-barber-btn')?.addEventListener('click', () => {
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
            <button onclick="submitNewBarber()" class="submit-button">
                ${translations['add'][currentLanguage]}
            </button>
        `;
        showModal(translations['new-barber'][currentLanguage], formHTML);
    });
});
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
            <input type="number" id="service-price" min="0" step="1" required>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (عربي):</label>
            <textarea id="service-description-ar"></textarea>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (English):</label>
            <textarea id="service-description-en"></textarea>
        </div>
        <button onclick="submitNewService('${categoryId}')" class="submit-button">
            ${translations['add'][currentLanguage]}
        </button>
    `;
    showModal(translations['new-service'][currentLanguage], formHTML);
};

// Submit Service
window.submitNewService = async (categoryId) => {
    const nameAr = document.getElementById('service-name-ar').value.trim();
    const nameEn = document.getElementById('service-name-en').value.trim();
    const duration = document.getElementById('service-duration').value.trim();
    const price = parseFloat(document.getElementById('service-price').value);
    const descriptionAr = document.getElementById('service-description-ar').value.trim();
    const descriptionEn = document.getElementById('service-description-en').value.trim();

    const serviceData = {
        name_ar: nameAr,
        name_en: nameEn,
        duration,
        price,
        description_ar: descriptionAr,
        description_en: descriptionEn
    };

    if (!nameAr || !nameEn || !duration || isNaN(price) || price <= 0) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        const newServiceRef = db.ref(`categories/${categoryId}/services`).push();
        await newServiceRef.set(serviceData);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        showError(translations['error-occurred'][currentLanguage]);
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Edit Category
window.editCategory = (categoryId) => {
    db.ref(`categories/${categoryId}`).once('value', (snapshot) => {
        const category = snapshot.val();
        if (!category) {
            showError(translations['error-occurred'][currentLanguage]);
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
            <button onclick="submitCategoryEdit('${categoryId}')" class="submit-button">
                ${translations['save'][currentLanguage]}
            </button>
        `;
        showModal(translations['edit'][currentLanguage], formHTML);
    });
};

// Submit Edited Category
window.submitCategoryEdit = async (categoryId) => {
    const nameAr = document.getElementById('edit-category-name-ar').value.trim();
    const nameEn = document.getElementById('edit-category-name-en').value.trim();

    if (!nameAr || !nameEn) {
        showError(translations['fill-required'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        await db.ref(`categories/${categoryId}`).update({ ar: nameAr, en: nameEn });
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        showError(translations['error-occurred'][currentLanguage]);
        console.error(error);
    } finally {
        hideLoading();
    }
};

// Delete Category
window.deleteCategory = async (categoryId) => {
    if (!confirm(translations['confirm-delete'][currentLanguage])) return;

    try {
        showLoading();
        await db.ref(`categories/${categoryId}`).remove();
        showSuccess(translations['success-delete'][currentLanguage]);
    } catch (error) {
        showError(translations['error-occurred'][currentLanguage]);
        console.error(error);
    } finally {
        hideLoading();
    }
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

    container.innerHTML = '';
    Object.entries(categories).forEach(([categoryId, category]) => {
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
};

// Initialize Data Listeners
const initializeDataListeners = () => {
    showLoading();
    Promise.all([
        db.ref('categories').once('value'),
        db.ref('barbers').once('value')
    ]).then(([categoriesSnapshot, barbersSnapshot]) => {
        updateCategoriesUI(categoriesSnapshot.val());
        updateBarbersUI(barbersSnapshot.val());
    }).catch((error) => {
        showError(translations['error-occurred'][currentLanguage]);
        console.error(error);
    }).finally(() => {
        hideLoading();
    });
};

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    debugDatabase.checkConnection();
    initializeDataListeners();

    document.getElementById('add-category-btn')?.addEventListener('click', () => addCategory());
    document.getElementById('add-barber-btn')?.addEventListener('click', () => addBarber());
});
