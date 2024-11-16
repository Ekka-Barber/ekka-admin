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

// Render Services
const renderServices = (categoryId, services) => {
    if (!services || Object.keys(services).length === 0) {
        return `<p class="no-data">${translations['no-services'][currentLanguage]}</p>`;
    }

    return Object.entries(services)
        .sort((a, b) => a[1].price - b[1].price) // Sort by price
        .map(([serviceId, service]) => `
            <div class="service-item" id="service-${serviceId}">
                <div class="service-details">
                    <h4>${service[`name_${currentLanguage}`]}</h4>
                    <p class="service-info">
                        <span class="duration">${service.duration}</span> | 
                        <span class="price">${service.price} SAR</span>
                    </p>
                    ${service[`description_${currentLanguage}`] ? 
                        `<p class="service-description">${service[`description_${currentLanguage}`]}</p>` : 
                        ''}
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

// Service Functions
window.editService = async (categoryId, serviceId) => {
    try {
        showLoading();
        const snapshot = await db.ref(`categories/${categoryId}/services/${serviceId}`).once('value');
        const service = snapshot.val();

        if (!service) {
            showError('Service not found');
            return;
        }

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
                <input type="number" id="edit-service-price" value="${service.price}" min="0" step="1" required>
            </div>
            <div class="form-group">
                <label>${translations['description'][currentLanguage]} (عربي):</label>
                <textarea id="edit-service-description-ar">${service.description_ar || ''}</textarea>
            </div>
            <div class="form-group">
                <label>${translations['description'][currentLanguage]} (English):</label>
                <textarea id="edit-service-description-en">${service.description_en || ''}</textarea>
            </div>
            <button onclick="submitServiceEdit('${categoryId}', '${serviceId}')" class="submit-button">
                ${translations['save'][currentLanguage]}
            </button>
        `;
        showModal(translations['edit'][currentLanguage], formHTML);
    } catch (error) {
        handleDatabaseError(error, 'editing service');
    } finally {
        hideLoading();
    }
};

window.submitServiceEdit = async (categoryId, serviceId) => {
    const updatedData = {
        name_ar: document.getElementById('edit-service-name-ar').value.trim(),
        name_en: document.getElementById('edit-service-name-en').value.trim(),
        duration: document.getElementById('edit-service-duration').value.trim(),
        price: parseInt(document.getElementById('edit-service-price').value),
        description_ar: document.getElementById('edit-service-description-ar').value.trim(),
        description_en: document.getElementById('edit-service-description-en').value.trim()
    };

    if (!updatedData.name_ar || !updatedData.name_en || !updatedData.duration || isNaN(updatedData.price)) {
        showError(translations['required-fields'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        await db.ref(`categories/${categoryId}/services/${serviceId}`).update(updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'updating service');
    } finally {
        hideLoading();
    }
};

window.deleteService = async (categoryId, serviceId) => {
    if (!confirm(translations['confirm-delete'][currentLanguage])) return;

    try {
        showLoading();
        await db.ref(`categories/${categoryId}/services/${serviceId}`).remove();
        showSuccess(translations['success-delete'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'deleting service');
    } finally {
        hideLoading();
    }
};

// Categories and UI Functions
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
