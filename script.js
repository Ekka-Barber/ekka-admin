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
            // Test categories access
            const categoriesSnap = await db.ref('categories').once('value');
            console.log('Categories data:', categoriesSnap.exists() ? '✅ Available' : '❌ No data');
            if (categoriesSnap.exists()) {
                console.log('Categories count:', Object.keys(categoriesSnap.val()).length);
            }

            // Test barbers access
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
        
        // Focus first input after modal is shown
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

const handleDatabaseError = (error, operation = 'database operation') => {
    console.error(`Error during ${operation}:`, error);
    showError(translations['error-occurred'][currentLanguage]);
};

// Data Validation
const validateData = (data, type) => {
    switch(type) {
        case 'category':
            return data.ar?.trim() && data.en?.trim();
        case 'service':
            return data.name_ar?.trim() && 
                   data.name_en?.trim() && 
                   data.duration?.trim() && 
                   !isNaN(data.price) && 
                   data.price > 0;
        case 'barber':
            return data.name_ar?.trim() && 
                   data.name_en?.trim() && 
                   data.working_hours?.start && 
                   data.working_hours?.end;
        default:
            return false;
    }
};
// Categories and Services Management
const initializeDataListeners = () => {
    showLoading();
    
    // Promise-based data fetching for better error handling
    Promise.all([
        db.ref('categories').once('value').catch(error => {
            console.error("Error fetching categories:", error);
            return { val: () => null };
        }),
        db.ref('barbers').once('value').catch(error => {
            console.error("Error fetching barbers:", error);
            return { val: () => null };
        })
    ]).then(([categoriesSnapshot, barbersSnapshot]) => {
        if (categoriesSnapshot.val()) {
            updateCategoriesUI(categoriesSnapshot.val());
        } else {
            updateCategoriesUI(null);
        }
        
        if (barbersSnapshot.val()) {
            updateBarbersUI(barbersSnapshot.val());
        } else {
            updateBarbersUI(null);
        }
    }).finally(() => {
        hideLoading();
    });

    // Set up real-time listeners
    setupRealtimeListeners();
};

// Setup Realtime Listeners
const setupRealtimeListeners = () => {
    // Categories listener
    db.ref('categories').on('value', 
        snapshot => updateCategoriesUI(snapshot.val()),
        error => handleDatabaseError(error, 'realtime categories update')
    );

    // Barbers listener
    db.ref('barbers').on('value',
        snapshot => updateBarbersUI(snapshot.val()),
        error => handleDatabaseError(error, 'realtime barbers update')
    );
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
            if (!category) return;
            
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

// Add Category
window.addCategory = () => {
    const formHTML = `
        <form id="category-form" onsubmit="submitNewCategory(event)">
            <div class="form-group">
                <label>${translations['category-name'][currentLanguage]} (عربي):</label>
                <input type="text" id="category-name-ar" required>
            </div>
            <div class="form-group">
                <label>${translations['category-name'][currentLanguage]} (English):</label>
                <input type="text" id="category-name-en" required>
            </div>
            <button type="submit" class="submit-button">
                ${translations['add'][currentLanguage]}
            </button>
        </form>
    `;
    showModal(translations['new-category'][currentLanguage], formHTML);
};

// Submit New Category
window.submitNewCategory = async (event) => {
    if (event) event.preventDefault();
    
    const nameAr = document.getElementById('category-name-ar').value.trim();
    const nameEn = document.getElementById('category-name-en').value.trim();

    const categoryData = { ar: nameAr, en: nameEn, services: {} };

    if (!validateData(categoryData, 'category')) {
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
        handleDatabaseError(error, 'adding category');
    } finally {
        hideLoading();
    }
};

// Add Service
window.addService = (categoryId) => {
    const formHTML = `
        <form id="service-form" onsubmit="submitNewService(event, '${categoryId}')">
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
                <input type="text" id="service-duration" 
                       placeholder="e.g., 30m or 1h 30m" required>
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
            <button type="submit" class="submit-button">
                ${translations['add'][currentLanguage]}
            </button>
        </form>
    `;
    showModal(translations['new-service'][currentLanguage], formHTML);
};

// Submit New Service
window.submitNewService = async (event, categoryId) => {
    if (event) event.preventDefault();
    
    const serviceData = {
        name_ar: document.getElementById('service-name-ar').value.trim(),
        name_en: document.getElementById('service-name-en').value.trim(),
        duration: document.getElementById('service-duration').value.trim(),
        price: parseInt(document.getElementById('service-price').value),
        description_ar: document.getElementById('service-description-ar').value.trim(),
        description_en: document.getElementById('service-description-en').value.trim()
    };

    if (!validateData(serviceData, 'service')) {
        showError(translations['required-fields'][currentLanguage]);
        return;
    }

    try {
        showLoading();
        const newServiceRef = db.ref(`categories/${categoryId}/services`).push();
        await newServiceRef.set(serviceData);
        hideModal();
        showSuccess(translations['success-add'][currentLanguage]);
    } catch (error) {
        handleDatabaseError(error, 'adding service');
    } finally {
        hideLoading();
    }
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
        Object.entries(barbers)
            .sort((a, b) => a[1][`name_${currentLanguage}`].localeCompare(b[1][`name_${currentLanguage}`]))
            .forEach(([barberId, barber]) => {
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
                                class="toggle-button ${barber.active ? 'active' : 'inactive'}">
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
window.addBarber = () => {
    const formHTML = `
        <form id="barber-form" onsubmit="submitNewBarber(event)">
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
            <button type="submit" class="submit-button">
                ${translations['add'][currentLanguage]}
            </button>
        </form>
    `;
    showModal(translations['new-barber'][currentLanguage], formHTML);
};

// Submit New Barber
window.submitNewBarber = async (event) => {
    if (event) event.preventDefault();
    
    const barberData = {
        name_ar: document.getElementById('barber-name-ar').value.trim(),
        name_en: document.getElementById('barber-name-en').value.trim(),
        working_hours: {
            start: document.getElementById('working-hours-start').value,
            end: document.getElementById('working-hours-end').value
        },
        active: document.getElementById('barber-active').checked
    };

    if (!validateData(barberData, 'barber')) {
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
        handleDatabaseError(error, 'adding barber');
    } finally {
        hideLoading();
    }
};

// Edit Barber
window.editBarber = async (barberId) => {
    try {
        showLoading();
        const snapshot = await db.ref(`barbers/${barberId}`).once('value');
        const barber = snapshot.val();

        if (!barber) {
            showError('Barber not found');
            return;
        }

        const formHTML = `
            <form id="edit-barber-form" onsubmit="submitBarberEdit(event, '${barberId}')">
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
                <button type="submit" class="submit-button">
                    ${translations['save'][currentLanguage]}
                </button>
            </form>
        `;
        showModal(translations['edit'][currentLanguage], formHTML);
    } catch (error) {
        handleDatabaseError(error, 'editing barber');
    } finally {
        hideLoading();
    }
};

// Submit Barber Edit
window.submitBarberEdit = async (event, barberId) => {
    if (event) event.preventDefault();
    
    const updatedData = {
        name_ar: document.getElementById('edit-barber-name-ar').value.trim(),
        name_en: document.getElementById('edit-barber-name-en').value.trim(),
        working_hours: {
            start: document.getElementById('edit-working-hours-start').value,
            end: document.getElementById('edit-working-hours-end').value
        },
        active: document.getElementById('edit-barber-active').checked
    };

    if (!validateData(updatedData, 'barber')) {
        showError(translations['fill-required'][currentLanguage]);
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

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Debug database connection
    debugDatabase.checkConnection();
    debugDatabase.testDataAccess();

    // Tab Navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const buttons = document.querySelectorAll('.tab-button');
            const contents = document.querySelectorAll('.tab-content');
            
            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            const tabName = e.target.dataset.tab;
            e.target.classList.add('active');
            const content = document.getElementById(`${tabName}-content`);
            if (content) {
                content.classList.add('active');
                activeTab = tabName;
            }
        });
    });

    // Language Switcher
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            document.querySelectorAll('.language-option').forEach(opt => 
                opt.classList.remove('active')
            );
            e.target.classList.add('active');
            currentLanguage = lang;
            document.documentElement.lang = lang;
            document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
            updateLanguage();
        });
    });

    // Initialize Add Buttons
    document.getElementById('add-category')?.addEventListener('click', addCategory);
    document.getElementById('add-barber')?.addEventListener('click', addBarber);

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

    // Initialize data listeners
    initializeDataListeners();
});
