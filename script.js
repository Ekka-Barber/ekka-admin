// Firebase configuration
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
const database = firebase.database();

// Check connection status
const connectedRef = firebase.database().ref(".info/connected");
connectedRef.on("value", (snap) => {
  if (snap.val() === true) {
      console.log("✅ Connected to Firebase");
  } else {
      console.log("❌ Not connected to Firebase");
  }
});

// Translations
const translations = {
  ar: {
      adminPanel: 'لوحة التحكم',
      categories: 'الفئات والخدمات',
      barbers: 'الحلاقين',
      settings: 'الإعدادات',
      addCategory: 'إضافة فئة جديدة',
      addBarber: 'إضافة حلاق جديد',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      categoryNameAr: 'اسم الفئة (عربي)',
      categoryNameEn: 'اسم الفئة (إنجليزي)',
      barberName: 'اسم الحلاق',
      barberStatus: 'حالة الحلاق',
      active: 'نشط',
      inactive: 'غير نشط',
      editCategory: 'تعديل الفئة',
      editBarber: 'تعديل الحلاق',
      confirmDelete: 'هل أنت متأكد أنك تريد الحذف؟',
      yes: 'نعم',
      no: 'لا',
      successMessage: 'تمت العملية بنجاح',
      errorMessage: 'حدث خطأ أثناء العملية',
      addService: 'إضافة خدمة جديدة',
      editService: 'تعديل الخدمة',
      serviceNameAr: 'اسم الخدمة (عربي)',
      serviceNameEn: 'اسم الخدمة (إنجليزي)',
      servicePrice: 'السعر',
      serviceDuration: 'المدة',
      minutes: 'دقيقة',
      currency: 'ر.س'
  },
  en: {
      adminPanel: 'Admin Panel',
      categories: 'Categories & Services',
      barbers: 'Barbers',
      settings: 'Settings',
      addCategory: 'Add New Category',
      addBarber: 'Add New Barber',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      categoryNameAr: 'Category Name (Arabic)',
      categoryNameEn: 'Category Name (English)',
      barberName: 'Barber Name',
      barberStatus: 'Barber Status',
      active: 'Active',
      inactive: 'Inactive',
      editCategory: 'Edit Category',
      editBarber: 'Edit Barber',
      confirmDelete: 'Are you sure you want to delete?',
      yes: 'Yes',
      no: 'No',
      successMessage: 'Operation completed successfully',
      errorMessage: 'An error occurred during the operation',
      addService: 'Add New Service',
      editService: 'Edit Service',
      serviceNameAr: 'Service Name (Arabic)',
      serviceNameEn: 'Service Name (English)',
      servicePrice: 'Price',
      serviceDuration: 'Duration',
      minutes: 'minutes',
      currency: 'SAR'
  }
};

let currentLanguage = 'ar';

// DOM Elements
const languageOptions = document.querySelectorAll('.language-option');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const addCategoryBtn = document.getElementById('add-category-btn');
const addBarberBtn = document.getElementById('add-barber-btn');
const modal = document.getElementById('edit-modal');
const closeModalBtn = document.querySelector('.close-button');
const loader = document.getElementById('loader');

// Event Listeners
languageOptions.forEach(option => {
  option.addEventListener('click', () => switchLanguage(option.dataset.lang));
});

tabButtons.forEach(button => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

addCategoryBtn.addEventListener('click', openAddCategoryModal);
addBarberBtn.addEventListener('click', openAddBarberModal);
closeModalBtn.addEventListener('click', closeModal);

// Initialize the app
function init() {
  switchLanguage(currentLanguage);
  loadCategories();
  loadBarbers();
}

// Switch language
function switchLanguage(lang) {
  currentLanguage = lang;
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  
  languageOptions.forEach(option => {
      option.classList.toggle('active', option.dataset.lang === lang);
  });

  document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.dataset.translate;
      if (translations[lang][key]) {
          element.textContent = translations[lang][key];
      }
  });

  updateCategoriesUI(window.categories || {});
  updateBarbersUI(window.barbers || {});
}

// Switch tab
function switchTab(tabId) {
  tabButtons.forEach(button => button.classList.toggle('active', button.dataset.tab === tabId));
  tabContents.forEach(content => content.classList.toggle('active', content.id === `${tabId}-content`));
}

// Show loader
function showLoader() {
  loader.style.display = 'flex';
}

// Hide loader
function hideLoader() {
  loader.style.display = 'none';
}

// Load categories
function loadCategories() {
  showLoader();
  const categoriesRef = database.ref('categories');
  categoriesRef.on('value', (snapshot) => {
      hideLoader();
      const categories = snapshot.val() || {};
      window.categories = categories;
      updateCategoriesUI(categories);
  }, (error) => {
      hideLoader();
      console.error("Error loading categories:", error);
      showNotification(translations[currentLanguage].errorMessage, 'error');
  });
}

// Load barbers
function loadBarbers() {
  showLoader();
  const barbersRef = database.ref('barbers');
  barbersRef.on('value', (snapshot) => {
      hideLoader();
      const barbers = snapshot.val() || {};
      window.barbers = barbers;
      updateBarbersUI(barbers);
  }, (error) => {
      hideLoader();
      console.error("Error loading barbers:", error);
      showNotification(translations[currentLanguage].errorMessage, 'error');
  });
}

// Update categories UI
function updateCategoriesUI(categories) {
  const categoriesList = document.getElementById('categories-list');
  categoriesList.innerHTML = '';
  Object.entries(categories).forEach(([categoryId, category]) => {
      const categoryElement = document.createElement('div');
      categoryElement.className = 'category-item';
      categoryElement.innerHTML = `
          <div class="category-header">
              <h3>${category[currentLanguage] || category.en || category.ar || 'Unnamed Category'}</h3>
              <div class="category-actions">
                  <button class="add-service-button" data-category-id="${categoryId}">${translations[currentLanguage].addService}</button>
                  <button class="edit-button">${translations[currentLanguage].edit}</button>
                  <button class="delete-button">${translations[currentLanguage].delete}</button>
              </div>
          </div>
          <div class="services-list" id="services-${categoryId}">
              <!-- Services will be loaded here -->
          </div>
      `;
      
      const editButton = categoryElement.querySelector('.edit-button');
      const deleteButton = categoryElement.querySelector('.delete-button');
      const addServiceButton = categoryElement.querySelector('.add-service-button');
      
      editButton.addEventListener('click', () => openEditCategoryModal(categoryId, category));
      deleteButton.addEventListener('click', () => deleteCategory(categoryId));
      addServiceButton.addEventListener('click', () => openAddServiceModal(categoryId));
      
      categoriesList.appendChild(categoryElement);
      
      // Load services for this category
      loadServices(categoryId);
  });
}

// Update barbers UI
function updateBarbersUI(barbers) {
  const barbersList = document.getElementById('barbers-list');
  barbersList.innerHTML = '';
  Object.entries(barbers).forEach(([id, barber]) => {
      const barberElement = document.createElement('div');
      barberElement.className = 'barber-item';
      barberElement.innerHTML = `
          <div class="barber-header">
              <h3>${barber[`name_${currentLanguage}`] || barber.name_en || 'Unnamed Barber'}</h3>
              <div class="barber-status">
                  <span class="status-indicator ${barber.active ? 'active' : 'inactive'}">
                      ${translations[currentLanguage][barber.active ? 'active' : 'inactive']}
                  </span>
              </div>
              <div class="barber-working-hours">
                  ${barber.working_hours ? `${barber.working_hours.start} - ${barber.working_hours.end}` : ''}
              </div>
          </div>
          <div class="barber-actions">
              <button class="edit-button" data-translate="edit">${translations[currentLanguage].edit}</button>
              <button class="delete-button" data-translate="delete">${translations[currentLanguage].delete}</button>
          </div>
      `;
      
      const editButton = barberElement.querySelector('.edit-button');
      const deleteButton = barberElement.querySelector('.delete-button');
      
      editButton.addEventListener('click', () => openEditBarberModal(id, barber));
      deleteButton.addEventListener('click', () => deleteBarber(id));
      
      barbersList.appendChild(barberElement);
  });
}

// Open add category modal
function openAddCategoryModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  modalTitle.textContent = translations[currentLanguage].addCategory;
  modalForm.innerHTML = `
      <div class="form-group">
          <label for="category-name-ar">${translations[currentLanguage].categoryNameAr}</label>
          <input type="text" id="category-name-ar">
      </div>
      <div class="form-group">
          <label for="category-name-en">${translations[currentLanguage].categoryNameEn}</label>
          <input type="text" id="category-name-en">
      </div>
      <button type="button" id="save-category">${translations[currentLanguage].save}</button>
  `;

  const saveButton = modalForm.querySelector('#save-category');
  saveButton.addEventListener('click', () => {
      const newCategory = {
          ar: document.getElementById('category-name-ar').value,
          en: document.getElementById('category-name-en').value
      };
      addCategory(newCategory);
      closeModal();
  });

  modal.style.display = 'block';
}

// Open edit category modal
function openEditCategoryModal(id, category) {
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  modalTitle.textContent = translations[currentLanguage].editCategory;
  modalForm.innerHTML = `
      <div class="form-group">
          <label for="category-name-ar">${translations[currentLanguage].categoryNameAr}</label>
          <input type="text" id="category-name-ar" value="${category.ar || ''}">
      </div>
      <div class="form-group">
          <label for="category-name-en">${translations[currentLanguage].categoryNameEn}</label>
          <input type="text" id="category-name-en" value="${category.en || ''}">
      </div>
      <button type="button" id="save-category">${translations[currentLanguage].save}</button>
  `;

  const saveButton = modalForm.querySelector('#save-category');
  saveButton.addEventListener('click', () => {
      const updatedCategory = {
          ar: document.getElementById('category-name-ar').value,
          en: document.getElementById('category-name-en').value
      };
      updateCategory(id, updatedCategory);
      closeModal();
  });

  modal.style.display = 'block';
}

// Open add barber modal
function openAddBarberModal() {
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  modalTitle.textContent = translations[currentLanguage].addBarber;
  modalForm.innerHTML = `
      <div class="form-group">
          <label for="barber-name-ar">${translations[currentLanguage].barberName} (عربي)</label>
          <input type="text" id="barber-name-ar">
      </div>
      <div class="form-group">
          <label for="barber-name-en">${translations[currentLanguage].barberName} (English)</label>
          <input type="text" id="barber-name-en">
      </div>
      <div class="form-group">
          <label for="barber-status">${translations[currentLanguage].barberStatus}</label>
          <select id="barber-status">
              <option value="true">${translations[currentLanguage].active}</option>
              <option value="false">${translations[currentLanguage].inactive}</option>
          </select>
      </div>
      <div class="form-group">
          <label>Working Hours</label>
          <div class="working-hours-inputs">
              <input type="time" id="working-hours-start" value="09:00">
              <span>to</span>
              <input type="time" id="working-hours-end" value="21:00">
          </div>
      </div>
      <button type="button" id="save-barber">${translations[currentLanguage].save}</button>
  `;

  const saveButton = modalForm.querySelector('#save-barber');
  saveButton.addEventListener('click', () => {
      const newBarber = {
          name_ar: document.getElementById('barber-name-ar').value,
          name_en: document.getElementById('barber-name-en').value,
          active: document.getElementById('barber-status').value === 'true',
          working_hours: {
              start: document.getElementById('working-hours-start').value,
              end: document.getElementById('working-hours-end').value
          }
      };
      addBarber(newBarber);
      closeModal();
  });

  modal.style.display = 'block';
}

// Open edit barber modal
function openEditBarberModal(id, barber) {
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  modalTitle.textContent = translations[currentLanguage].editBarber;
  modalForm.innerHTML = `
      <div class="form-group">
          <label for="barber-name-ar">${translations[currentLanguage].barberName} (عربي)</label>
          <input type="text" id="barber-name-ar" value="${barber.name_ar || ''}">
      </div>
      <div class="form-group">
          <label for="barber-name-en">${translations[currentLanguage].barberName} (English)</label>
          <input type="text" id="barber-name-en" value="${barber.name_en || ''}">
      </div>
      <div class="form-group">
          <label for="barber-status">${translations[currentLanguage].barberStatus}</label>
          <select id="barber-status">
              <option value="true" ${barber.active ? 'selected' : ''}>${translations[currentLanguage].active}</option>
              <option value="false" ${!barber.active ? 'selected' : ''}>${translations[currentLanguage].inactive}</option>
          </select>
      </div>
      <div class="form-group">
          <label>Working Hours</label>
          <div class="working-hours-inputs">
              <input type="time" id="working-hours-start" value="${barber.working_hours?.start || '09:00'}">
              <span>to</span>
              <input type="time" id="working-hours-end" value="${barber.working_hours?.end || '21:00'}">
          </div>
      </div>
      <button type="button" id="save-barber">${translations[currentLanguage].save}</button>
  `;

  const saveButton = modalForm.querySelector('#save-barber');
  saveButton.addEventListener('click', () => {
      const updatedBarber = {
          name_ar: document.getElementById('barber-name-ar').value,
          name_en: document.getElementById('barber-name-en').value,
          active: document.getElementById('barber-status').value === 'true',
          working_hours: {
              start: document.getElementById('working-hours-start').value,
              end: document.getElementById('working-hours-end').value
          }
      };
      updateBarber(id, updatedBarber);
      closeModal();
  });

  modal.style.display = 'block';
}

// Close modal
function closeModal() {
  modal.style.display = 'none';
}

// Add category
function addCategory(category) {
  showLoader();
  database.ref('categories').push(category)
      .then(() => {
          hideLoader();
          showNotification(translations[currentLanguage].successMessage, 'success');
      })
      .catch((error) => {
          hideLoader();
          console.error("Error adding category:", error);
          showNotification(translations[currentLanguage].errorMessage, 'error');
      });
}

// Update category
function updateCategory(id, updatedCategory) {
  showLoader();
  database.ref(`categories/${id}`).update(updatedCategory)
      .then(() => {
          hideLoader();
          showNotification(translations[currentLanguage].successMessage, 'success');
      })
      .catch((error) => {
          hideLoader();
          console.error("Error updating category:", error);
          showNotification(translations[currentLanguage].errorMessage, 'error');
      });
}

// Delete category
function deleteCategory(id) {
  if (confirm(translations[currentLanguage].confirmDelete)) {
      showLoader();
      database.ref(`categories/${id}`).remove()
          .then(() => {
              hideLoader();
              showNotification(translations[currentLanguage].successMessage, 'success');
          })
          .catch((error) => {
              hideLoader();
              console.error("Error deleting category:", error);
              showNotification(translations[currentLanguage].errorMessage, 'error');
          });
  }
}

// Add barber
function addBarber(barber) {
  showLoader();
  database.ref('barbers').push(barber)
      .then(() => {
          hideLoader();
          showNotification(translations[currentLanguage].successMessage, 'success');
      })
      .catch((error) => {
          hideLoader();
          console.error("Error adding barber:", error);
          showNotification(translations[currentLanguage].errorMessage, 'error');
      });
}

// Update barber
function updateBarber(id, updatedBarber) {
  showLoader();
  database.ref(`barbers/${id}`).update(updatedBarber)
      .then(() => {
          hideLoader();
          showNotification(translations[currentLanguage].successMessage, 'success');
      })
      .catch((error) => {
          hideLoader();
          console.error("Error updating barber:", error);
          showNotification(translations[currentLanguage].errorMessage, 'error');
      });
}

// Delete barber
function deleteBarber(id) {
  if (confirm(translations[currentLanguage].confirmDelete)) {
      showLoader();
      database.ref(`barbers/${id}`).remove()
          .then(() => {
              hideLoader();
              showNotification(translations[currentLanguage].successMessage, 'success');
          })
          .catch((error) => {
              hideLoader();
              console.error("Error deleting barber:", error);
              showNotification(translations[currentLanguage].errorMessage, 'error');
          });
  }
}

// Load services for a category
function loadServices(categoryId) {
  const servicesRef = database.ref(`services/${categoryId}`);
  servicesRef.on('value', (snapshot) => {
      const services = snapshot.val() || {};
      updateServicesUI(categoryId, services);
  }, (error) => {
      console.error("Error loading services:", error);
      showNotification(translations[currentLanguage].errorMessage, 'error');
  });
}

// Update services UI
function updateServicesUI(categoryId, services) {
  const servicesList = document.getElementById(`services-${categoryId}`);
  servicesList.innerHTML = '';
  
  Object.entries(services).forEach(([serviceId, service]) => {
      const serviceElement = document.createElement('div');
      serviceElement.className = 'service-item';
      serviceElement.innerHTML = `
          <div class="service-details">
              <h4>${service[`name_${currentLanguage}`] || service.name_en || service.name_ar}</h4>
              <p>${service.price} ${translations[currentLanguage].currency} - ${service.duration} ${translations[currentLanguage].minutes}</p>
          </div>
          <div class="service-actions">
              <button class="edit-button" onclick="openEditServiceModal('${categoryId}', '${serviceId}', ${JSON.stringify(service).replace(/"/g, '&quot;')})">
                  ${translations[currentLanguage].edit}
              </button>
              <button class="delete-button" onclick="deleteService('${categoryId}', '${serviceId}')">
                  ${translations[currentLanguage].delete}
              </button>
          </div>
      `;
      
      servicesList.appendChild(serviceElement);
  });
}

// Open add service modal
function openAddServiceModal(categoryId) {
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  modalTitle.textContent = translations[currentLanguage].addService;
  modalForm.innerHTML = `
      <div class="form-group">
          <label for="service-name-ar">${translations[currentLanguage].serviceNameAr}</label>
          <input type="text" id="service-name-ar">
      </div>
      <div class="form-group">
          <label for="service-name-en">${translations[currentLanguage].serviceNameEn}</label>
          <input type="text" id="service-name-en">
      </div>
      <div class="form-group">
          <label for="service-price">${translations[currentLanguage].servicePrice}</label>
          <input type="number" id="service-price" min="0" step="1">
      </div>
      <div class="form-group">
          <label for="service-duration">${translations[currentLanguage].serviceDuration}</label>
          <input type="number" id="service-duration" min="0" step="5">
      </div>
      <button type="button" id="save-service">${translations[currentLanguage].save}</button>
  `;

  const saveButton = modalForm.querySelector('#save-service');
  saveButton.addEventListener('click', () => {
      const newService = {
          name_ar: document.getElementById('service-name-ar').value,
          name_en: document.getElementById('service-name-en').value,
          price: parseInt(document.getElementById('service-price').value) || 0,
          duration: parseInt(document.getElementById('service-duration').value) || 30
      };
      addService(categoryId, newService);
      closeModal();
  });

  modal.style.display = 'block';
}

// Open edit service modal
function openEditServiceModal(categoryId, serviceId, service) {
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');

  modalTitle.textContent = translations[currentLanguage].editService;
  modalForm.innerHTML = `
      <div class="form-group">
          <label for="service-name-ar">${translations[currentLanguage].serviceNameAr}</label>
          <input type="text" id="service-name-ar" value="${service.name_ar || ''}">
      </div>
      <div class="form-group">
          <label for="service-name-en">${translations[currentLanguage].serviceNameEn}</label>
          <input type="text" id="service-name-en" value="${service.name_en || ''}">
      </div>
      <div class="form-group">
          <label for="service-price">${translations[currentLanguage].servicePrice}</label>
          <input type="number" id="service-price" min="0" step="1" value="${service.price || 0}">
      </div>
      <div class="form-group">
          <label for="service-duration">${translations[currentLanguage].serviceDuration}</label>
          <input type="number" id="service-duration" min="0" step="5" value="${service.duration || 30}">
      </div>
      <button type="button" id="save-service">${translations[currentLanguage].save}</button>
  `;

  const saveButton = modalForm.querySelector('#save-service');
  saveButton.addEventListener('click', () => {
      const updatedService = {
          name_ar: document.getElementById('service-name-ar').value,
          name_en: document.getElementById('service-name-en').value,
          price: parseInt(document.getElementById('service-price').value) || 0,
          duration: parseInt(document.getElementById('service-duration').value) || 30
      };
      updateService(categoryId, serviceId, updatedService);
      closeModal();
  });

  modal.style.display = 'block';
}

// Add service
function addService(categoryId, service) {
  showLoader();
  database.ref(`services/${categoryId}`).push(service)
      .then(() => {
          hideLoader();
          showNotification(translations[currentLanguage].successMessage, 'success');
      })
      .catch((error) => {
          hideLoader();
          console.error("Error adding service:", error);
          showNotification(translations[currentLanguage].errorMessage, 'error');
      });
}

// Update service
function updateService(categoryId, serviceId, updatedService) {
  showLoader();
  database.ref(`services/${categoryId}/${serviceId}`).update(updatedService)
      .then(() => {
          hideLoader();
          showNotification(translations[currentLanguage].successMessage, 'success');
      })
      .catch((error) => {
          hideLoader();
          console.error("Error updating service:", error);
          showNotification(translations[currentLanguage].errorMessage, 'error');
      });
}

// Delete service
function deleteService(categoryId, serviceId) {
  if (confirm(translations[currentLanguage].confirmDelete)) {
      showLoader();
      database.ref(`services/${categoryId}/${serviceId}`).remove()
          .then(() => {
              hideLoader();
              showNotification(translations[currentLanguage].successMessage, 'success');
          })
          .catch((error) => {
              hideLoader();
              console.error("Error deleting service:", error);
              showNotification(translations[currentLanguage].errorMessage, 'error');
          });
  }
}

// Show notification
function showNotification(message, type) {
  const notificationContainer = document.getElementById('notification-container');
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notificationContainer.appendChild(notification);
  
  // Trigger reflow
  notification.offsetHeight;
  
  notification.classList.add('show');
  
  setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
          notification.remove();
      }, 300);
  }, 3000);
}

// Initialize the app
init();
