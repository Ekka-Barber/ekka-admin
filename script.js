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
        document.body.style.overflow = 'hidden';
        
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
        document.body.style.overflow = '';
        document.getElementById('modal-form').innerHTML = '';
    }
};

// Render Services
const renderServices = (categoryId, services) => {
    if (!services || Object.keys(services).length === 0) {
        return `<p class="no-data">${translations['no-services'][currentLanguage]}</p>`;
    }

    return Object.entries(services)
        .sort((a, b) => a[1].price - b[1].price)
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
    db.ref('categories').on('value', (snapshot) => {
        updateCategoriesUI(snapshot.val());
        hideLoading();
    }, (error) => {
        console.error("Error fetching categories:", error);
        showError(translations['error-occurred'][currentLanguage]);
        hideLoading();
    });

    db.ref('barbers').on('value', (snapshot) => {
        updateBarbersUI(snapshot.val());
    }, (error) => {
        console.error("Error fetching barbers:", error);
        showError(translations['error-occurred'][currentLanguage]);
    });
};

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    debugDatabase.checkConnection();
    initializeDataListeners();

    document.getElementById('add-category-btn')?.addEventListener('click', addCategory);
    document.getElementById('add-barber-btn')?.addEventListener('click', addBarber);

    // Language switcher
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            currentLanguage = option.dataset.lang;
            document.body.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
            document.querySelectorAll('.language-option').forEach(opt => opt.classList.toggle('active'));
            updateUI();
        });
    });

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            activeTab = button.dataset.tab;
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`${activeTab}-content`).classList.add('active');
        });
    });
});

// Add missing functions
const addCategory = async () => {
    const newCategory = {
        ar: translations['new-category'].ar,
        en: translations['new-category'].en
    };
    try {
        showLoading();
        await db.ref('categories').push(newCategory);
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'adding category');
    } finally {
        hideLoading();
    }
};

const editCategory = async (categoryId) => {
    try {
        showLoading();
        const snapshot = await db.ref(`categories/${categoryId}`).once('value');
        const category = snapshot.val();

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
            <button onclick="submitCategoryEdit('${categoryId}')" class="submit-button">
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

const submitCategoryEdit = async (categoryId) => {
    const updatedData = {
        ar: document.getElementById('edit-category-name-ar').value.trim(),
        en: document.getElementById('edit-category-name-en').value.trim()
    };

    if (!updatedData.ar || !updatedData.en) {
        showError(translations['required-fields'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        await db.ref(`categories/${categoryId}`).update(updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'updating category');
    } finally {
        hideLoading();
    }
};

const deleteCategory = async (categoryId) => {
    if (!confirm(translations['confirm-delete'][currentLanguage])) return;

    try {
        showLoading();
        await db.ref(`categories/${categoryId}`).remove();
        showSuccess(translations['success-delete'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'deleting category');
    } finally {
        hideLoading();
    }
};

const addService = (categoryId) => {
    const formHTML = `
        <div class="form-group">
            <label>${translations['service-name'][currentLanguage]} (عربي):</label>
            <input type="text" id="add-service-name-ar" required>
        </div>
        <div class="form-group">
            <label>${translations['service-name'][currentLanguage]} (English):</label>
            <input type="text" id="add-service-name-en" required>
        </div>
        <div class="form-group">
            <label>${translations['duration'][currentLanguage]}:</label>
            <input type="text" id="add-service-duration" required>
        </div>
        <div class="form-group">
            <label>${translations['price'][currentLanguage]}:</label>
            <input type="number" id="add-service-price" min="0" step="1" required>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (عربي):</label>
            <textarea id="add-service-description-ar"></textarea>
        </div>
        <div class="form-group">
            <label>${translations['description'][currentLanguage]} (English):</label>
            <textarea id="add-service-description-en"></textarea>
        </div>
        <button onclick="submitAddService('${categoryId}')" class="submit-button">
            ${translations['add'][currentLanguage]}
        </button>
    `;
    showModal(translations['new-service'][currentLanguage], formHTML);
};

const submitAddService = async (categoryId) => {
    const newService = {
        name_ar: document.getElementById('add-service-name-ar').value.trim(),
        name_en: document.getElementById('add-service-name-en').value.trim(),
        duration: document.getElementById('add-service-duration').value.trim(),
        price: parseInt(document.getElementById('add-service-price').value),
        description_ar: document.getElementById('add-service-description-ar').value.trim(),
        description_en: document.getElementById('add-service-description-en').value.trim()
    };

    if (!newService.name_ar || !newService.name_en || !newService.duration || isNaN(newService.price)) {
        showError(translations['required-fields'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        await db.ref(`categories/${categoryId}/services`).push(newService);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'adding service');
    } finally {
        hideLoading();
    }
};

const addBarber = async () => {
    const newBarber = {
        name: translations['new-barber'][currentLanguage],
        status: 'active'
    };
    try {
        showLoading();
        await db.ref('barbers').push(newBarber);
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'adding barber');
    } finally {
        hideLoading();
    }
};

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

    container.innerHTML = '';
    Object.entries(barbers).forEach(([barberId, barber]) => {
        const barberElement = document.createElement('div');
        barberElement.className = 'barber-item';
        barberElement.innerHTML = `
            <div class="barber-header">
                <h3>${barber.name}</h3>
                <div class="barber-status">
                    <span class="status-indicator ${barber.status}">${translations[barber.status][currentLanguage]}</span>
                </div>
            </div>
            <div class="barber-actions">
                <button onclick="editBarber('${barberId}')" class="edit-button">
                    ${translations['edit'][currentLanguage]}
                </button>
                <button onclick="toggleBarberStatus('${barberId}', '${barber.status}')" class="toggle-button">
                    ${translations[barber.status === 'active' ? 'inactive' : 'active'][currentLanguage]}
                </button>
                <button onclick="deleteBarber('${barberId}')" class="delete-button">
                    ${translations['delete'][currentLanguage]}
                </button>
            </div>
        `;
        container.appendChild(barberElement);
    });
};

const editBarber = async (barberId) => {
    try {
        showLoading();
        const snapshot = await db.ref(`barbers/${barberId}`).once('value');
        const barber = snapshot.val();

        if (!barber) {
            showError('Barber not found');
            return;
        }

        const formHTML = `
            <div class="form-group">
                <label>${translations['barber-name'][currentLanguage]}:</label>
                <input type="text" id="edit-barber-name" value="${barber.name}" required>
            </div>
            <button onclick="submitBarberEdit('${barberId}')" class="submit-button">
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

const submitBarberEdit = async (barberId) => {
    const updatedData = {
        name: document.getElementById('edit-barber-name').value.trim()
    };

    if (!updatedData.name) {
        showError(translations['required-fields'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        await db.ref(`barbers/${barberId}`).update(updatedData);
        hideModal();
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'updating barber');
    } finally {
        hideLoading();
    }
};

const toggleBarberStatus = async (barberId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
        showLoading();
        await db.ref(`barbers/${barberId}`).update({ status: newStatus });
        showSuccess(translations['success-update'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'toggling barber status');
    } finally {
        hideLoading();
    }
};

const deleteBarber = async (barberId) => {
    if (!confirm(translations['confirm-delete'][currentLanguage])) return;

    try {
        showLoading();
        await db.ref(`barbers/${barberId}`).remove();
        showSuccess(translations['success-delete'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'deleting barber');
    } finally {
        hideLoading();
    }
};

const handleDatabaseError = (error, action) => {
    console.error(`Error ${action}:`, error);
    showError(translations['error-occurred'][currentLanguage]);
};

const updateUI = () => {
    document.getElementById('main-title').textContent = translations['admin-panel'][currentLanguage];
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[key]) {
            element.textContent = translations[key][currentLanguage];
        }
    });
    updateCategoriesUI(db.ref('categories'));
    updateBarbersUI(db.ref('barbers'));
};
