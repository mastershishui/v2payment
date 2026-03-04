// ========================================
// USIS Payment System - Main JavaScript
// ========================================

// Demo state (clears on refresh, keeps across navigation)
function getDemoState() {
    try {
        return JSON.parse(sessionStorage.getItem('demoState')) || {};
    } catch {
        return {};
    }
}

function setDemoState(state) {
    sessionStorage.setItem('demoState', JSON.stringify(state));
}

// On each load: if this was a reload, reset to default
document.addEventListener('DOMContentLoaded', function () {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'reload') {
        sessionStorage.removeItem('demoState');
    }
});

// ========================================
// SIDEBAR NAVIGATION
// ========================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('mobileOverlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            toggleSidebar();
        });
    }
});

// ========================================
// PAYMENT SUBMISSION
// ========================================

let selectedPaymentMethod = null;

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Remove selected class from all cards
    const cards = document.querySelectorAll('.payment-method-card');
    cards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    event.currentTarget.classList.add('selected');
    
    console.log('Selected payment method:', method);
}

function goToStaffView() {
    window.location.href = 'accounting_dashboard.html';
}

function goToStudentView() {
    window.location.href = 'assessment_of_fees.html';
}

// File upload handling
document.addEventListener('DOMContentLoaded', function() {
    const fileUploadBox = document.getElementById('fileUploadBox');
    const fileInput = document.getElementById('paymentProof');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    
    if (fileUploadBox && fileInput) {
        // Click to upload
        fileUploadBox.addEventListener('click', function() {
            fileInput.click();
        });
        
        // File selected
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB max)
                const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if (file.size > maxSize) {
                    alert('File size exceeds 5MB. Please choose a smaller file.');
                    fileInput.value = '';
                    return;
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Invalid file type. Please upload PNG, JPG, or PDF files only.');
                    fileInput.value = '';
                    return;
                }
                
                // Show file preview
                if (fileName && filePreview) {
                    fileName.textContent = file.name;
                    filePreview.style.display = 'block';
                }
            }
        });
        
        // Drag and drop
        fileUploadBox.addEventListener('dragover', function(e) {
            e.preventDefault();
            fileUploadBox.style.borderColor = 'var(--primary)';
            fileUploadBox.style.backgroundColor = 'var(--blue-50)';
        });
        
        fileUploadBox.addEventListener('dragleave', function(e) {
            e.preventDefault();
            fileUploadBox.style.borderColor = '';
            fileUploadBox.style.backgroundColor = '';
        });
        
        fileUploadBox.addEventListener('drop', function(e) {
            e.preventDefault();
            fileUploadBox.style.borderColor = '';
            fileUploadBox.style.backgroundColor = '';
            
            const file = e.dataTransfer.files[0];
            if (file) {
                // Create a new FileList with the dropped file
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                
                // Trigger change event
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        });
    }
});

function removeFile() {
    const fileInput = document.getElementById('paymentProof');
    const filePreview = document.getElementById('filePreview');
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (filePreview) {
        filePreview.style.display = 'none';
    }
}

function submitPayment(event) {
    event.preventDefault();
    
    // Get form values (only guaranteed fields)
    const paymentAmount = document.getElementById('paymentAmount').value;
    const referenceNumber = document.getElementById('referenceNumber').value;
    const paymentProof = document.getElementById('paymentProof').files[0];

    // Optional fields – may or may not exist
    const paymentDateEl = document.getElementById('paymentDate');
    const accountNameEl = document.getElementById('accountName');
    const paymentMethodDetailEl = document.getElementById('paymentMethodDetail');
    const remarksEl = document.getElementById('remarks');

    const paymentDate = paymentDateEl ? paymentDateEl.value : '';
    const accountName = accountNameEl ? accountNameEl.value : '';
    const paymentMethodDetail = paymentMethodDetailEl ? paymentMethodDetailEl.value : '';
    const remarks = remarksEl ? remarksEl.value : '';
    
    // Validate payment method selection
    if (!selectedPaymentMethod) {
        alert('Please select a payment method.');
        return;
    }
    
    // Validate payment amount is a valid positive number
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid payment amount.');
        return;
    }
    
    // Validate file upload
    if (!paymentProof) {
        alert('Please upload your payment proof.');
        return;
    }

    // Create form data (kept for future backend integration)
    const formData = new FormData();
    formData.append('payment_amount', paymentAmount);
    formData.append('payment_date', paymentDate);
    formData.append('reference_number', referenceNumber);
    formData.append('account_name', accountName);
    formData.append('payment_method', selectedPaymentMethod);
    formData.append('payment_method_detail', paymentMethodDetail);
    formData.append('remarks', remarks);
    formData.append('payment_proof', paymentProof);

    // DEMO STATE FOR STAFF DASHBOARD
    const state = getDemoState();

    // Initialize pendingPayments array if it doesn't exist
    if (!state.pendingPayments) {
        state.pendingPayments = [];
    }

    // Add new payment to the array
    state.pendingPayments.push({
        id: String(Date.now()) + '-' + Math.random().toString(16).slice(2), // Add unique ID
        amount: amount,
        method: selectedPaymentMethod,
        reference: referenceNumber,
        studentName: 'Juan Dela Cruz',
        date: new Date().toISOString().split('T')[0]
    });

    // ADD NOTIFICATION FOR STAFF about new payment
    if (!state.notifications) state.notifications = [];
    
    state.notifications.unshift({
        id: Date.now().toString() + '-newpayment',
        type: 'payment',
        title: 'New Payment Submitted',
        message: `A new payment of ₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} is pending approval.`,
        time: new Date().toISOString(),
        read: false,
        actionUrl: 'accounting_dashboard.html',
        forStaff: true
    });

    setDemoState(state);

    // Show success modal instead of alert
    showSuccessModal();
}

// Add these new functions
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}
// ADD THIS FUNCTION:
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Reset form for new submission
    document.getElementById('paymentForm').reset();
    selectedPaymentMethod = null;
    
    // Remove selected class from payment method cards
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Hide file preview
    const filePreview = document.getElementById('filePreview');
    if (filePreview) {
        filePreview.style.display = 'none';
    }
}
// Close success modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            // If the click is on the modal background (not the content), close it
            if (e.target === successModal) {
                closeSuccessModal();
            }
        });
    }
});

// Scholarship success modal functions
function showScholarshipSuccessModal() {
    const modal = document.getElementById('scholarshipSuccessModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeScholarshipSuccessModal() {
    const modal = document.getElementById('scholarshipSuccessModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Reset form and switch back to "My Scholarships" tab
    resetScholarshipForm();
    switchScholarshipTab('my');
    // Reload my scholarships
    loadMyScholarships();
}

// Close scholarship success modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const scholarshipModal = document.getElementById('scholarshipSuccessModal');
    if (scholarshipModal) {
        scholarshipModal.addEventListener('click', function(e) {
            // If the click is on the modal background (not the content), close it
            if (e.target === scholarshipModal) {
                closeScholarshipSuccessModal();
            }
        });
    }
});

// Confirmation modal variables
let pendingAction = null;

function showConfirmModal(options) {
    const modal = document.getElementById('confirmModal');
    const icon = document.getElementById('confirmIcon');
    const title = document.getElementById('confirmTitle');
    const message = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    if (!modal) return;
    
    // Set icon based on action type
    if (options.type === 'approve') {
        icon.innerHTML = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-600)" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12l3 3 6-6"></path>
        </svg>`;
    } else if (options.type === 'reject') {
        icon.innerHTML = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--rose-600)" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`;
    }
    
    // Set title and message
    title.textContent = options.title || 'Confirm Action';
    message.textContent = options.message || 'Are you sure you want to proceed?';
    
    // Set confirm button text and action
    confirmBtn.textContent = options.confirmText || 'Confirm';
    
    // Store the action to perform
    pendingAction = options.action;
    
    // Show modal
    modal.style.display = 'flex';
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
    pendingAction = null;
}

// Add event listener for confirm button
document.addEventListener('DOMContentLoaded', function() {
    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (pendingAction) {
                pendingAction();
                closeConfirmModal();
            }
        });
    }
});

function resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        document.getElementById('paymentForm').reset();
        selectedPaymentMethod = null;
        
        // Remove selected class from all payment method cards
        const cards = document.querySelectorAll('.payment-method-card');
        cards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // Hide file preview
        const filePreview = document.getElementById('filePreview');
        if (filePreview) {
            filePreview.style.display = 'none';
        }
    }
}

// ========================================
// ASSESSMENT OF FEES - CALCULATIONS
// ========================================

function calculateAssessment() {
    const fees = [
        27000.00, // Tuition
        5500.00,  // Laboratory
        1200.00,  // Library
        2500.00,  // Registration
        1800.00,  // Student Activity
        1500.00,  // Athletic
        1250.00,  // Medical & Dental
        800.00,   // Insurance
        700.00,   // ID & Handbook
        2000.00,  // Internet & Technology
        1500.00   // Development
    ];
    
    const total = fees.reduce((sum, fee) => sum + fee, 0);
    return total.toFixed(2);
}

// ========================================
// PAYMENT HISTORY - VIEW RECEIPT
// ========================================

function viewReceipt(referenceNumber) {
    alert('Opening receipt for: ' + referenceNumber);
    // window.open('view_receipt.php?ref=' + referenceNumber, '_blank');
}

// ========================================
// SCHOLARSHIPS - APPLY
// ========================================

function applyScholarship() {
    // Backward-compatible handler (older buttons call this).
    // If the scholarships page has tabs, switch to the Apply tab.
    if (document.getElementById('scholarshipTabApply')) {
        switchScholarshipTab('apply');
        return;
    }
    alert('Scholarship application feature coming soon!\n\nPlease contact the Scholarship Office for more information.');
}

function switchScholarshipTab(tab) {
    const tabMy = document.getElementById('scholarshipTabMy');
    const tabApply = document.getElementById('scholarshipTabApply');
    const tabs = document.querySelectorAll('#scholarshipTabs .tab-link');
    if (!tabMy || !tabApply || !tabs.length) return;

    tabs.forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.classList.toggle('active', isActive);
    });

    if (tab === 'apply') {
        tabMy.style.display = 'none';
        tabApply.style.display = 'block';
        initScholarshipUpload();
        updateScholarshipEstimate();
    } else {
        tabApply.style.display = 'none';
        tabMy.style.display = 'block';
        // Load my scholarships (both active and pending)
        loadMyScholarships();
    }
}

function getScholarshipLabel(type) {
    if (type === 'academic_excellence') return 'Academic Excellence';
    if (type === 'financial_assistance') return 'Financial Assistance';
    if (type === 'athletic_grant') return 'Athletic Grant';
    if (type === 'leadership_grant') return 'Leadership Grant';
    return 'Scholarship';
}

function getScholarshipEstimateAmount(type) {
    // Demo values for prototype
    if (type === 'academic_excellence') return 15750;
    if (type === 'financial_assistance') return 10000;
    if (type === 'athletic_grant') return 8000;
    if (type === 'leadership_grant') return 6000;
    return 0;
}

function updateScholarshipEstimate() {
    const typeEl = document.getElementById('scholarshipType');
    const estEl = document.getElementById('scholarshipEstimate');
    if (!typeEl || !estEl) return;
    const amount = getScholarshipEstimateAmount(typeEl.value);
    estEl.value = '₱ ' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function initScholarshipUpload() {
    const uploadBox = document.getElementById('scholarshipUploadBox');
    const fileInput = document.getElementById('scholarshipDocs');
    if (!uploadBox || !fileInput) return;

    if (uploadBox.dataset.bound === '1') return;
    uploadBox.dataset.bound = '1';

    uploadBox.addEventListener('click', function () {
        fileInput.click();
    });

    uploadBox.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--primary)';
        uploadBox.style.backgroundColor = 'var(--blue-50)';
    });

    uploadBox.addEventListener('dragleave', function (e) {
        e.preventDefault();
        uploadBox.style.borderColor = '';
        uploadBox.style.backgroundColor = '';
    });

    uploadBox.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadBox.style.borderColor = '';
        uploadBox.style.backgroundColor = '';
        const files = Array.from(e.dataTransfer.files || []);
        if (!files.length) return;
        // We can't merge with existing FileList reliably without a DataTransfer.
        const dt = new DataTransfer();
        files.forEach(f => dt.items.add(f));
        fileInput.files = dt.files;
        renderScholarshipDocs();
    });

    fileInput.addEventListener('change', function () {
        renderScholarshipDocs();
    });
}

function validateScholarshipDocs(files) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    for (const f of files) {
        if (f.size > maxSize) {
            return `File "${f.name}" exceeds 5MB.`;
        }
        if (!allowedTypes.includes(f.type)) {
            return `File "${f.name}" is not a PDF, PNG, or JPG.`;
        }
    }
    return null;
}

function renderScholarshipDocs() {
    const fileInput = document.getElementById('scholarshipDocs');
    const preview = document.getElementById('scholarshipDocsPreview');
    const list = document.getElementById('scholarshipDocsList');
    if (!fileInput || !preview || !list) return;

    const files = Array.from(fileInput.files || []);
    if (!files.length) {
        preview.style.display = 'none';
        list.innerHTML = '';
        return;
    }

    const error = validateScholarshipDocs(files);
    if (error) {
        alert(error);
        fileInput.value = '';
        preview.style.display = 'none';
        list.innerHTML = '';
        return;
    }

    preview.style.display = 'block';
    list.innerHTML = files
        .map((f, idx) => {
            const sizeKb = Math.max(1, Math.round(f.size / 1024));
            const isPdf = f.type === 'application/pdf';
            const icon = isPdf
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>`;
            return `
            <div class="doc-item">
                <div class="doc-left">
                    <div class="doc-icon">${icon}</div>
                    <div class="doc-meta">
                        <div class="doc-name">${f.name}</div>
                        <div class="doc-sub">${sizeKb} KB</div>
                    </div>
                </div>
                <button class="doc-remove" type="button" onclick="removeScholarshipDoc(${idx})">Remove</button>
            </div>
        `;
        })
        .join('');
}

function removeScholarshipDoc(index) {
    const fileInput = document.getElementById('scholarshipDocs');
    if (!fileInput) return;
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;
    const dt = new DataTransfer();
    files.forEach((f, i) => {
        if (i !== index) dt.items.add(f);
    });
    fileInput.files = dt.files;
    renderScholarshipDocs();
}

function clearScholarshipDocs() {
    const fileInput = document.getElementById('scholarshipDocs');
    if (fileInput) fileInput.value = '';
    renderScholarshipDocs();
}

function resetScholarshipForm() {
    const form = document.getElementById('scholarshipForm');
    if (form) form.reset();
    clearScholarshipDocs();
    updateScholarshipEstimate();
}

function submitScholarshipApplication(event) {
    event.preventDefault();

    const typeEl = document.getElementById('scholarshipType');
    const termEl = document.getElementById('scholarshipTerm');
    const contactEl = document.getElementById('scholarshipContact');
    const reasonEl = document.getElementById('scholarshipReason');
    const docsEl = document.getElementById('scholarshipDocs');

    if (!typeEl || !termEl || !contactEl || !docsEl) return;
    const files = Array.from(docsEl.files || []);
    if (!files.length) {
        alert('Please upload your supporting documents.');
        return;
    }

    const error = validateScholarshipDocs(files);
    if (error) {
        alert(error);
        return;
    }

    const type = typeEl.value;
    const amount = getScholarshipEstimateAmount(type);

    const state = getDemoState();
    if (!state.scholarshipApplications) state.scholarshipApplications = [];

    state.scholarshipApplications.push({
        id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
        date: new Date().toISOString().split('T')[0],
        type,
        studentName: 'Juan Dela Cruz',
        amount,
        term: termEl.value,
        contact: contactEl.value,
        notes: reasonEl ? reasonEl.value : '',
        docs: files.map(f => ({ name: f.name, type: f.type, size: f.size }))
    });

    // ===== ADD THIS CODE HERE (before setDemoState) =====
    
    // Add notification for staff about new scholarship application
    if (!state.notifications) state.notifications = [];

    state.notifications.unshift({
        id: Date.now().toString() + '-new-scholar-' + Math.random().toString(16).slice(2),
        type: 'scholarship',
        title: 'New Scholarship Application',
        message: `A new ${getScholarshipLabel(type)} scholarship application has been submitted.`,
        time: new Date().toISOString(),
        read: false,
        actionUrl: 'accounting_dashboard.html',
        forStaff: true
    });
    
    // ===== END OF ADDED CODE =====

    setDemoState(state);

    // Show success modal instead of alert
    showScholarshipSuccessModal();
    
    // Don't reset form or switch tab yet - let user see the modal first
    // The modal's OK button will handle resetting and switching tabs
}

function approveScholarshipApplication(appId) {
    showConfirmModal({
        type: 'approve',
        title: 'Approve Scholarship',
        message: 'Are you sure you want to approve this scholarship application?',
        confirmText: 'Yes, Approve',
        action: function() {
            const state = getDemoState();
            const apps = state.scholarshipApplications || [];
            const idx = apps.findIndex(a => a.id === appId);
            if (idx === -1) return;

            const app = apps[idx];

            // Initialize arrays if they don't exist
            if (!state.activeScholarships) state.activeScholarships = [];
            if (!state.billingScholarships) state.billingScholarships = [];
            if (!state.scholarshipHistory) state.scholarshipHistory = [];

            // Add to active scholarships (for student view)
            state.activeScholarships.push({
                id: app.id,
                date: app.date,
                type: app.type,
                studentName: app.studentName,
                amount: app.amount,
                term: app.term,
                status: 'Active',
                appliedDate: app.date
            });

            // Apply as discount in billing statement
            state.billingScholarships.push({
                date: app.date,
                type: app.type,
                studentName: app.studentName,
                amount: app.amount,
                term: app.term
            });

            // Add to scholarship history
            state.scholarshipHistory.push({
                date: app.date,
                type: app.type,
                studentName: app.studentName,
                amount: app.amount,
                status: 'Approved'
            });

            // Remove from pending list
            apps.splice(idx, 1);
            state.scholarshipApplications = apps;
            
            // ===== NEW CODE - ALWAYS NOTIFY BOTH =====
// Initialize notifications array if it doesn't exist
if (!state.notifications) state.notifications = [];

// STUDENT NOTIFICATION (no forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-scholar-student-' + Math.random().toString(16).slice(2),
    type: 'scholarship',
    title: 'Scholarship Approved',
    message: `Congratulations! Your ${getScholarshipLabel(app.type)} scholarship application has been approved.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'scholarships.html'
    // NO forStaff flag = visible to students
});

// STAFF NOTIFICATION (with forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-scholar-staff-' + Math.random().toString(16).slice(2),
    type: 'scholarship',
    title: 'Scholarship Approved',
    message: `${getScholarshipLabel(app.type)} scholarship for ${app.studentName} has been approved.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'accounting_dashboard.html',
    forStaff: true
});
// ===== END OF NEW CODE =====
            
            // ===== END OF ADDED CODE =====
            
            setDemoState(state);

            window.location.href = 'accounting_dashboard.html';
        }
    });
}

function rejectScholarshipApplication(appId) {
    showConfirmModal({
        type: 'reject',
        title: 'Reject Scholarship',
        message: 'Are you sure you want to reject this scholarship application?',
        confirmText: 'Yes, Reject',
        action: function() {
            // Original reject scholarship logic
            const state = getDemoState();
            const apps = state.scholarshipApplications || [];
            const idx = apps.findIndex(a => a.id === appId);
            if (idx === -1) return;

            const app = apps[idx];
            if (!state.scholarshipHistory) state.scholarshipHistory = [];

            state.scholarshipHistory.push({
                date: app.date,
                type: app.type,
                studentName: app.studentName,
                amount: app.amount,
                status: 'Rejected'
            });

            apps.splice(idx, 1);
            state.scholarshipApplications = apps;
            
            // ===== NEW CODE - ALWAYS NOTIFY BOTH =====
// Initialize notifications array if it doesn't exist
if (!state.notifications) state.notifications = [];

// STUDENT NOTIFICATION (no forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-scholar-student-reject-' + Math.random().toString(16).slice(2),
    type: 'scholarship',
    title: 'Scholarship Update',
    message: `Your ${getScholarshipLabel(app.type)} scholarship application status has been updated. Please check for details.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'scholarships.html'
    // NO forStaff flag = visible to students
});

// STAFF NOTIFICATION (with forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-scholar-staff-reject-' + Math.random().toString(16).slice(2),
    type: 'scholarship',
    title: 'Scholarship Rejected',
    message: `${getScholarshipLabel(app.type)} scholarship for ${app.studentName} has been rejected.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'accounting_dashboard.html',
    forStaff: true
});
// ===== END OF NEW CODE =====
            
            // ===== END OF ADDED CODE =====
            
            setDemoState(state);

            window.location.href = 'accounting_dashboard.html';
        }
    });
}

// ========================================
// BILLING STATEMENT - DOWNLOAD PDF
// ========================================

function downloadPDF() {
    alert('Downloading billing statement as PDF...');
    // window.location.href = 'generate_pdf.php?type=billing';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-PH', options);
}

// Set today's date as default for date inputs
document.addEventListener('DOMContentLoaded', function() {
    const paymentDateInput = document.getElementById('paymentDate');
    if (paymentDateInput) {
        const today = new Date().toISOString().split('T')[0];
        paymentDateInput.value = today;
    }
});

// ========================================
// PRINT FUNCTIONALITY
// ========================================

const printStyles = `
@media print {
    .sidebar,
    .top-bar,
    .header-actions,
    .mobile-overlay,
    .btn,
    .icon-btn,
    button {
        display: none !important;
    }
    
    .main-content {
        margin-left: 0 !important;
        width: 100% !important;
    }
    
    .page-container {
        padding: 0 !important;
        max-width: none !important;
    }
    
    body {
        background: white !important;
    }
    
    .stat-card,
    .content-card {
        break-inside: avoid;
        box-shadow: none !important;
        border: 1px solid #ddd !important;
    }
    
    @page {
        margin: 1cm;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = printStyles;
document.head.appendChild(styleSheet);

// ========================================
// FORM VALIDATION (live feedback)
// ========================================



// ========================================
// ANIMATION ON SCROLL
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.content-card, .stat-card');
    animatedElements.forEach(el => observer.observe(el));
});

// ========================================
// NOTIFICATION BADGE
// ========================================

function updateNotificationBadge(count) {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        if (count > 0) {
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Initialize notification badge
document.addEventListener('DOMContentLoaded', function() {
    const notificationCount = 1; // Example: 1 pending payment
    updateNotificationBadge(notificationCount);
});

// ========================================
// CONSOLE INFO
// ========================================

console.log('%cUSIS Payment System', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cVersion 1.0.0', 'color: #6b7280; font-size: 12px;');
console.log('%cDeveloped for University Student Information System', 'color: #6b7280; font-size: 12px;');

// ========================================
// ACCOUNTING DASHBOARD DEMO STATE
// ========================================

function initAccountingDashboard() {
    const state = getDemoState();
    const pendingPayments = state.pendingPayments || []; // Now using array
    const hasPendingPayments = pendingPayments.length > 0;
    const scholarshipApps = state.scholarshipApplications || [];

    // 1) Update stat cards
    const values = document.querySelectorAll('.stats-grid .stat-value');
    if (values.length >= 3) {
        // Update Pending Approvals count
        values[0].textContent = pendingPayments.length; // Show count
        
        // Calculate total pending amount
        const totalPendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
        values[2].textContent = '₱ ' + totalPendingAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // 2) Payment Approvals table
    const tables = document.querySelectorAll('.content-card .data-table');
    const approvalsTable = tables[0];
    if (approvalsTable) {
        const tbody = approvalsTable.querySelector('tbody');
        if (tbody) {
            if (!hasPendingPayments) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            <span class="sub-text">No pending payments.</span>
                        </td>
                    </tr>
                `;
            } else {
                // Show all pending payments
                tbody.innerHTML = pendingPayments
                    .map(payment => `
                    <tr data-payment-id="${payment.id}">
                        <td>${payment.date}</td>
                        <td>${payment.studentName}</td>
                        <td>${payment.method === 'gcash' ? 'GCash / E‑Wallet' :
                                payment.method === 'bank' ? 'Bank Transfer' : 'Over‑the‑Counter'}</td>
                        <td class="font-mono">${payment.reference}</td>
                        <td class="font-mono">₱ ${payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</td>
                        <td>
                            <button class="btn-outline" style="padding:0.2rem 0.6rem; border-radius:9999px; font-size:0.75rem;"
                                    onclick="approvePendingPayment('${payment.id}')">Approve</button>
                            <button class="btn-outline" style="padding:0.2rem 0.6rem; border-radius:9999px; font-size:0.75rem; margin-left:0.25rem;"
                                    onclick="rejectPendingPayment('${payment.id}')">Reject</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    }

    // 3) Scholarship Applications table
    const scholarshipTable = tables[1];
    if (scholarshipTable) {
        const tbody = scholarshipTable.querySelector('tbody');
        if (!tbody) return;

        if (!scholarshipApps.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <span class="sub-text">No pending scholarship applications.</span>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = scholarshipApps
            .slice()
            .reverse()
            .map((app) => {
                const label = getScholarshipLabel(app.type);
                const amountText = '₱ ' + (app.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                return `
                    <tr>
                        <td>${app.date}</td>
                        <td>${label}</td>
                        <td>${app.studentName || '—'}</td>
                        <td class="font-mono">${amountText}</td>
                        <td>
                            <button class="btn-outline" style="padding:0.2rem 0.6rem; border-radius:9999px; font-size:0.75rem;"
                                    onclick="approveScholarshipApplication('${app.id}')">Approve</button>
                            <button class="btn-outline" style="padding:0.2rem 0.6rem; border-radius:9999px; font-size:0.75rem; margin-left:0.25rem;"
                                    onclick="rejectScholarshipApplication('${app.id}')">Reject</button>
                        </td>
                    </tr>
                `;
            })
            .join('');
    }
}

function approvePendingPayment(paymentId) {
    showConfirmModal({
        type: 'approve',
        title: 'Approve Payment',
        message: 'Are you sure you want to approve this payment? This will update the student\'s balance.',
        confirmText: 'Yes, Approve',
        action: function() {
            const state = getDemoState();
            if (!state.pendingPayments) return;

            // Find the specific payment
            const paymentIndex = state.pendingPayments.findIndex(p => p.id === paymentId);
            if (paymentIndex === -1) return;

            const payment = state.pendingPayments[paymentIndex];

            // Ensure history & billing arrays exist
            if (!state.history) state.history = [];
            if (!state.billingPayments) state.billingPayments = [];

            // Add to payment history as Approved
            state.history.push({
                date: payment.date,
                method: payment.method,
                reference: payment.reference,
                amount: payment.amount,
                status: 'Approved'
            });

            // Add to billing statement adjustments
            state.billingPayments.push({
                date: payment.date,
                method: payment.method,
                reference: payment.reference,
                amount: payment.amount
            });

            // Remove the approved payment from pending array
            state.pendingPayments.splice(paymentIndex, 1);
            
            // ===== NEW CODE - ALWAYS NOTIFY BOTH =====
// Initialize notifications array if it doesn't exist
if (!state.notifications) state.notifications = [];

// STUDENT NOTIFICATION (no forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-student-approve-' + Math.random().toString(16).slice(2),
    type: 'payment',
    title: 'Payment Approved',
    message: `Your payment of ₱${payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} has been approved.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'payment_history.html'
    // NO forStaff flag = visible to students
});

// STAFF NOTIFICATION (with forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-staff-approve-' + Math.random().toString(16).slice(2),
    type: 'payment',
    title: 'Payment Processed',
    message: `Payment of ₱${payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} from ${payment.studentName} has been approved.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'accounting_dashboard.html',
    forStaff: true
});
// ===== END OF NEW CODE =====
            setDemoState(state);

            // Navigate to refresh dashboard
            window.location.href = 'accounting_dashboard.html';
        }
    });
}

function rejectPendingPayment(paymentId) {
    showConfirmModal({
        type: 'reject',
        title: 'Reject Payment',
        message: 'Are you sure you want to reject this payment? This action cannot be undone.',
        confirmText: 'Yes, Reject',
        action: function() {
            const state = getDemoState();
            if (!state.pendingPayments) return;

            // Find the specific payment
            const paymentIndex = state.pendingPayments.findIndex(p => p.id === paymentId);
            if (paymentIndex === -1) return;

            const payment = state.pendingPayments[paymentIndex];

            if (!state.history) state.history = [];

            // Add to payment history as Rejected
            state.history.push({
                date: payment.date,
                method: payment.method,
                reference: payment.reference,
                amount: payment.amount,
                status: 'Rejected'
            });

            // Remove the rejected payment from pending array
            state.pendingPayments.splice(paymentIndex, 1);
            
            // ===== NEW CODE - ALWAYS NOTIFY BOTH =====
// Initialize notifications array if it doesn't exist
if (!state.notifications) state.notifications = [];

// STUDENT NOTIFICATION (no forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-student-reject-' + Math.random().toString(16).slice(2),
    type: 'payment',
    title: 'Payment Rejected',
    message: `Your payment of ₱${payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} has been rejected. Please contact the accounting office.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'payment_history.html'
    // NO forStaff flag = visible to students
});

// STAFF NOTIFICATION (with forStaff flag)
state.notifications.unshift({
    id: Date.now().toString() + '-staff-reject-' + Math.random().toString(16).slice(2),
    type: 'payment',
    title: 'Payment Rejected',
    message: `Payment of ₱${payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} from ${payment.studentName} has been rejected.`,
    time: new Date().toISOString(),
    read: false,
    actionUrl: 'accounting_dashboard.html',
    forStaff: true
});
// ===== END OF NEW CODE =====
            // ===== END OF REPLACEMENT =====
            
            setDemoState(state);

            // Navigate to refresh dashboard
            window.location.href = 'accounting_dashboard.html';
        }
    });
}
// Auto‑run only on accounting dashboard page
document.addEventListener('DOMContentLoaded', function () {
    if (document.title.indexOf('Accounting Dashboard') !== -1) {
        initAccountingDashboard();
    }
});
// Map method code to label
function getMethodLabel(method) {
    if (method === 'gcash') return 'GCash / E‑Wallet';
    if (method === 'bank') return 'Bank Transfer';
    return 'Over‑the‑Counter';
}

// Apply approved payments to Billing Statement
function initBillingStatementFromState() {
    const state = getDemoState();
    const payments = state.billingPayments || [];
    const scholarships = state.billingScholarships || [];
    
    // If no new payments or scholarships, don't modify the table
    if (!payments.length && !scholarships.length) return;

    const tables = document.querySelectorAll('.content-card .data-table');
    if (!tables.length) return;
    const soTable = tables[0]; // Statement of Account table
    const tbody = soTable.querySelector('tbody');
    if (!tbody) return;

    // Find the total row
    const totalRow = tbody.querySelector('.row-total');
    
    // Find the default scholarship row (Academic Excellence)
    // We want to keep it, not remove it
    const defaultScholarshipRow = Array.from(tbody.querySelectorAll('tr')).find(tr => 
        tr.textContent.includes('Scholarship: Academic Excellence')
    );

    // Remove only dynamically added rows, NOT the default one
    tbody.querySelectorAll('tr[data-demo="billing-payment"]').forEach(tr => tr.remove());
    tbody.querySelectorAll('tr[data-demo="billing-scholarship"]').forEach(tr => tr.remove());

    // Find total row & base balance
    const balanceCell = totalRow ? totalRow.querySelector('.value-total') : null;

    let baseBalance = 0;
    if (balanceCell) {
        if (balanceCell.dataset.baseBalance) {
            baseBalance = parseFloat(balanceCell.dataset.baseBalance);
        } else {
            baseBalance = parseFloat(balanceCell.textContent.replace(/[^\d.]/g, '')) || 0;
            balanceCell.dataset.baseBalance = baseBalance;
        }
    }

    // Calculate totals
    let totalAdjustNow = 0;
    let totalScholarshipAmount = 0;

    // First, add the default scholarship amount to total
    if (defaultScholarshipRow) {
        const defaultAmountCell = defaultScholarshipRow.querySelector('.scholarship-amount');
        if (defaultAmountCell) {
            const defaultAmount = parseFloat(defaultAmountCell.textContent.replace(/[^\d.]/g, '')) || 0;
            totalScholarshipAmount += defaultAmount;
            totalAdjustNow += defaultAmount;
        }
    }

    // Add new scholarships to CREDIT column
    scholarships.forEach(s => {
        totalAdjustNow += s.amount;
        totalScholarshipAmount += s.amount;
        
        const tr = document.createElement('tr');
        tr.setAttribute('data-demo', 'billing-scholarship');
        tr.className = 'row-bg-emerald'; // Green background for scholarships

        tr.innerHTML = `
            <td>
                <div class="cell-group">
                    <span class="font-medium">Scholarship: ${getScholarshipLabel(s.type)}</span>
                </div>
            </td>
            <td>
                <span class="sub-text">${s.term || 'Applied Discount'}</span>
            </td>
            <td class="text-right font-mono debit-amount">—</td>
            <td class="text-right font-mono scholarship-amount">₱ ${Number(s.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        `;

        if (totalRow) {
            tbody.insertBefore(tr, totalRow);
        } else {
            tbody.appendChild(tr);
        }
    });

    // Add payments to CREDIT column
    payments.forEach(p => {
        totalAdjustNow += p.amount;

        const tr = document.createElement('tr');
        tr.setAttribute('data-demo', 'billing-payment');
        tr.className = 'row-bg-blue'; // Blue background for payments

        tr.innerHTML = `
            <td>
                <div class="cell-group">
                    <span class="font-medium">Payment: ${getMethodLabel(p.method)}</span>
                </div>
            </td>
            <td>
                <span class="sub-text">Ref: ${p.reference}</span>
            </td>
            <td class="text-right font-mono debit-amount">—</td>
            <td class="text-right font-mono payment-amount">₱ ${p.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        `;

        if (totalRow) {
            tbody.insertBefore(tr, totalRow);
        } else {
            tbody.appendChild(tr);
        }
    });

    // Update outstanding balance
    const newBalance = Math.max(baseBalance - totalAdjustNow, 0);

    if (balanceCell) {
        balanceCell.textContent = '₱ ' + newBalance.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Update the summary cards
    const statValues = document.querySelectorAll('.stats-grid .stat-card .stat-value');
    if (statValues.length >= 4) {
        // Update Current Balance card (4th card)
        statValues[3].textContent = '₱ ' + newBalance.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        // Update Scholarship Discount card (3rd card) with TOTAL of all scholarships
        statValues[2].textContent = '₱ ' + totalScholarshipAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

/// Apply approved/rejected payments to Payment History
function initPaymentHistoryFromState() {
    const state = getDemoState();
    const history = state.history || [];
    const pendingPayments = state.pendingPayments || [];
    
    // Default static transactions (from your HTML)
    const defaultTransactions = [
        {
            date: '2026-02-10',
            method: 'gcash',
            reference: 'GC-928712190',
            amount: 5000.00,
            status: 'Approved'
        },
        {
            date: '2026-01-25',
            method: 'bank',
            reference: 'BDO-827361',
            amount: 10000.00,
            status: 'Approved'
        },
        {
            date: '2026-01-15',
            method: 'overcounter',
            reference: 'OTC-112233',
            amount: 2500.00,
            status: 'Rejected'
        }
    ];
    
    // Combine default transactions, history, and pending payments
    const allTransactions = [
        // Add default transactions
        ...defaultTransactions.map(t => ({
            date: t.date,
            method: t.method,
            reference: t.reference,
            amount: t.amount,
            status: t.status,
            isPending: false
        })),
        // Add pending payments with status 'Pending'
        ...pendingPayments.map(p => ({
            date: p.date,
            method: p.method,
            reference: p.reference,
            amount: p.amount,
            status: 'Pending',
            isPending: true
        })),
        // Add history items (approved/rejected from approvals)
        ...history.map(h => ({
            date: h.date,
            method: h.method,
            reference: h.reference,
            amount: h.amount,
            status: h.status,
            isPending: false
        }))
    ];

    // Remove duplicates based on reference number (keep the first occurrence)
    const uniqueTransactions = [];
    const seenReferences = new Set();
    
    allTransactions.forEach(tx => {
        if (!seenReferences.has(tx.reference)) {
            seenReferences.add(tx.reference);
            uniqueTransactions.push(tx);
        }
    });

    // Sort by date (newest first)
    uniqueTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const table = document.querySelector('.content-card .data-table');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Clear the table
    tbody.innerHTML = '';

    if (uniqueTransactions.length === 0) {
        // Show empty state
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <span class="sub-text">No payment transactions found.</span>
                </td>
            </tr>
        `;
        return;
    }

    // Add all transactions to the table
    uniqueTransactions.forEach(tx => {
        const tr = document.createElement('tr');

        let statusBadge = '';
        if (tx.status === 'Approved') {
            statusBadge = '<span class="badge-success">Approved</span>';
        } else if (tx.status === 'Rejected') {
            statusBadge = '<span class="badge-failed">Rejected</span>';
        } else if (tx.status === 'Pending') {
            statusBadge = '<span class="badge-pending">Pending</span>';
        }

        // Format date nicely
        const formattedDate = formatDate(tx.date);

        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td>${getMethodLabel(tx.method)}</td>
            <td class="font-mono">${tx.reference}</td>
            <td class="font-mono">₱ ${tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${statusBadge}</td>
        `;

        tbody.appendChild(tr);
    });
}
document.addEventListener('DOMContentLoaded', function () {
    const title = document.title;

    if (title.indexOf('Accounting Dashboard') !== -1) {
        initAccountingDashboard();
    }

    if (title.indexOf('Billing Statement') !== -1) {
        initBillingStatementFromState();
    }

    if (title.indexOf('Payment History') !== -1) {
        initPaymentHistoryFromState();
    }

    if (title.indexOf('Scholarships') !== -1) {
        // Ensure upload is bound even if user lands directly on Apply tab later
        initScholarshipUpload();
        updateScholarshipEstimate();
        loadMyScholarships();
        loadNotifications();
    }
});
// Load my scholarships (both active and pending)
function loadMyScholarships() {
    const state = getDemoState();
    const pendingApps = state.scholarshipApplications || [];
    const activeApps = state.activeScholarships || [];
    
    // Load pending scholarships
    const pendingContainer = document.getElementById('pendingScholarshipsContainer');
    const pendingSection = document.getElementById('pendingApplicationsSection');
    
    if (pendingContainer) {
    pendingContainer.innerHTML = '';
    
    if (pendingApps.length === 0) {
        if (pendingSection) {
            pendingSection.style.display = 'none';
        }
    } else {
        if (pendingSection) {
            pendingSection.style.display = 'block';
        }
        
        pendingApps.forEach(app => {
            const card = document.createElement('div');
            card.className = 'scholarship-main-card';
            card.style.position = 'relative';
            card.style.opacity = '0.9';
            
            const label = getScholarshipLabel(app.type);
            const amount = '₱ ' + (app.amount || 0).toLocaleString('en-PH');
            const date = formatDate(app.date);
            
            card.innerHTML = `
                <div class="scholarship-main-header">
                    <div class="scholarship-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"></path>
                        </svg>
                    </div>
                    <span class="badge-pill" style="background: var(--amber-100); color: var(--amber-700); border: 1px solid var(--amber-200);">Pending</span>
                </div>
                <div class="scholarship-main-body">
                    <div>
                        <div class="scholarship-title">${label}</div>
                        <div class="scholarship-subtitle">Applied on ${date}</div>
                        <div class="scholarship-meta" style="color: var(--amber-600);">Application is under review.</div>
                    </div>
                    <div class="scholarship-amount" style="color: var(--amber-600);">${amount}</div>
                </div>
            `;
            
            pendingContainer.appendChild(card);
        });
    }
    }
    
    // Load active scholarships
    const activeContainer = document.getElementById('activeScholarshipsContainer');
    
    if (activeContainer) {
        // Clear container but keep the default active scholarship if no others
        if (activeApps.length === 0) {
            // Show default active scholarship
            activeContainer.innerHTML = `
                <div class="scholarship-main-card">
                    <div class="scholarship-main-header">
                        <div class="scholarship-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 7L12 3 2 7l10 4 10-4z"></path>
                                <path d="M6 10v6l6 3 6-3v-6"></path>
                            </svg>
                        </div>
                        <span class="badge-pill badge-success-soft">Active</span>
                    </div>
                    <div class="scholarship-main-body">
                        <div>
                            <div class="scholarship-title">Academic Excellence</div>
                            <div class="scholarship-subtitle">Merit Based</div>
                            <div class="scholarship-meta">Discount Applied</div>
                        </div>
                        <div class="scholarship-amount">₱ 15,750</div>
                    </div>
                </div>
            `;
        } else {
            // Show all active scholarships including the default
            activeContainer.innerHTML = '';
            
            // Add default active scholarship first
            const defaultCard = document.createElement('div');
            defaultCard.className = 'scholarship-main-card';
            defaultCard.innerHTML = `
                <div class="scholarship-main-header">
                    <div class="scholarship-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 7L12 3 2 7l10 4 10-4z"></path>
                            <path d="M6 10v6l6 3 6-3v-6"></path>
                        </svg>
                    </div>
                    <span class="badge-pill badge-success-soft">Active</span>
                </div>
                <div class="scholarship-main-body">
                    <div>
                        <div class="scholarship-title">Academic Excellence</div>
                        <div class="scholarship-subtitle">Merit Based</div>
                        <div class="scholarship-meta">Discount Applied</div>
                    </div>
                    <div class="scholarship-amount">₱ 15,750</div>
                </div>
            `;
            activeContainer.appendChild(defaultCard);
            
            // Add approved scholarships
            activeApps.forEach(app => {
                const card = document.createElement('div');
                card.className = 'scholarship-main-card';
                
                const label = getScholarshipLabel(app.type);
                const amount = '₱ ' + (app.amount || 0).toLocaleString('en-PH');
                const approvedDate = formatDate(app.date);
                
                card.innerHTML = `
                    <div class="scholarship-main-header">
                        <div class="scholarship-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 7L12 3 2 7l10 4 10-4z"></path>
                                <path d="M6 10v6l6 3 6-3v-6"></path>
                            </svg>
                        </div>
                        <span class="badge-pill badge-success-soft">Active</span>
                    </div>
                    <div class="scholarship-main-body">
                        <div>
                            <div class="scholarship-title">${label}</div>
                            <div class="scholarship-subtitle">Approved on ${approvedDate}</div>
                            <div class="scholarship-meta">Discount Applied</div>
                        </div>
                        <div class="scholarship-amount">${amount}</div>
                    </div>
                `;
                
                activeContainer.appendChild(card);
            });
        }
    }
}
// ========================================
// NOTIFICATION SYSTEM
// ========================================

let notifications = [];

// Initialize notifications from demo state
// Initialize notifications from demo state
function loadNotifications() {
    const state = getDemoState();
    let allNotifications = state.notifications || [];
    
    // Determine if current user is staff or student based on page
    const isStaffPage = document.title.indexOf('Accounting Dashboard') !== -1 || 
                        window.location.pathname.includes('accounting_dashboard');
    
    // Filter notifications based on user role
    if (isStaffPage) {
        // Staff sees ONLY notifications with forStaff: true
        notifications = allNotifications.filter(n => n.forStaff === true);
    } else {
        // Student sees ONLY notifications without forStaff flag OR forStaff: false
        notifications = allNotifications.filter(n => !n.forStaff);
    }
    
    state.filteredNotifications = notifications;
    setDemoState(state);
    
    updateNotificationBadge();
    return notifications;
}

// Add a new notification
function addNotification(notification) {
    const state = getDemoState();
    notifications = state.notifications || [];
    
    const newNotification = {
        id: Date.now().toString(),
        time: new Date().toISOString(),
        read: false,
        ...notification
    };
    
    notifications.unshift(newNotification); // Add to beginning
    state.notifications = notifications;
    setDemoState(state);
    
    updateNotificationBadge();
    return newNotification;
}

// Mark notification as read
function markAsRead(notificationId) {
    const state = getDemoState();
    notifications = state.notifications || [];
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        state.notifications = notifications;
        setDemoState(state);
        updateNotificationBadge();
    }
}

// Mark all as read
function markAllAsRead() {
    const state = getDemoState();
    notifications = state.notifications || [];
    
    notifications.forEach(n => n.read = true);
    state.notifications = notifications;
    setDemoState(state);
    
    updateNotificationBadge();
    renderNotifications();
}

// Update notification badge count
function updateNotificationBadge() {
    const state = getDemoState();
    const allNotifications = state.notifications || [];
    
    // Determine if current user is staff or student
    const isStaffPage = document.title.indexOf('Accounting Dashboard') !== -1 || 
                        window.location.pathname.includes('accounting_dashboard');
    
    // Filter notifications based on user role
    let relevantNotifications;
    if (isStaffPage) {
        relevantNotifications = allNotifications.filter(n => n.forStaff !== false);
    } else {
        relevantNotifications = allNotifications.filter(n => !n.forStaff);
    }
    
    const unreadCount = relevantNotifications.filter(n => !n.read).length;
    
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        if (unreadCount > 0) {
            badge.style.display = 'flex';
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.width = 'auto';
            badge.style.height = 'auto';
            badge.style.padding = '2px 6px';
            badge.style.fontSize = '10px';
            badge.style.fontWeight = 'bold';
            badge.style.minWidth = '18px';
            badge.style.borderRadius = '10px';
            badge.style.backgroundColor = '#ef4444';
            badge.style.color = 'white';
            badge.style.top = '-5px';
            badge.style.right = '-5px';
            badge.style.position = 'absolute';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Toggle notifications panel
function toggleNotifications() {
    let panel = document.getElementById('notificationPanel');
    
    if (!panel) {
        // Create panel if it doesn't exist
        panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.className = 'notification-panel';
        document.body.appendChild(panel);
        
        // Add click outside to close
        document.addEventListener('click', function(e) {
            if (!panel.contains(e.target) && !e.target.closest('.icon-btn')) {
                panel.classList.remove('active');
            }
        });
    }
    
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        renderNotifications();
    }
}

// Render notifications in panel
function renderNotifications() {
    const panel = document.getElementById('notificationPanel');
    if (!panel) return;
    
    const state = getDemoState();
    const allNotifications = state.notifications || [];
    
    // Determine if current user is staff or student
    const isStaffPage = document.title.indexOf('Accounting Dashboard') !== -1 || 
                        window.location.pathname.includes('accounting_dashboard');
    
    // Filter notifications based on user role
    let displayNotifications;
    if (isStaffPage) {
        // Staff sees notifications with forStaff=true OR no forStaff flag (for backward compatibility)
        displayNotifications = allNotifications.filter(n => n.forStaff !== false);
    } else {
        // Student sees only notifications without forStaff flag or forStaff=false
        displayNotifications = allNotifications.filter(n => !n.forStaff);
    }
    
    // Sort by time (newest first)
    displayNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    if (displayNotifications.length === 0) {
        panel.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
            </div>
            <div class="notification-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }
    
    const unreadCount = displayNotifications.filter(n => !n.read).length;
    
    panel.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            ${unreadCount > 0 ? `
                <button class="mark-read-btn" onclick="markAllAsRead()">
                    Mark all as read
                </button>
            ` : ''}
        </div>
        <div class="notification-list">
            ${displayNotifications.map(notification => `
                <div class="notification-item ${notification.read ? '' : 'unread'}" 
                     onclick="handleNotificationClick('${notification.id}', '${notification.actionUrl || '#'}')">
                    <div class="notification-icon ${notification.type}">
                        ${getNotificationIcon(notification.type)}
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${formatNotificationTime(notification.time)}</div>
                    </div>
                    ${!notification.read ? '<div class="unread-dot"></div>' : ''}
                </div>
            `).join('')}
        </div>
        <div class="notification-footer">
            <button class="btn-outline btn-sm" onclick="clearAllNotifications()">
                Clear all
            </button>
        </div>
    `;
}
// Handle notification click
function handleNotificationClick(notificationId, actionUrl) {
    markAsRead(notificationId);
    if (actionUrl && actionUrl !== '#') {
        window.location.href = actionUrl;
    }
    document.getElementById('notificationPanel')?.classList.remove('active');
}

// Get icon based on notification type
function getNotificationIcon(type) {
    if (type === 'payment') {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>`;
    } else if (type === 'scholarship') {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;
    } else {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>`;
    }
}

// Format notification time
function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Clear all notifications
function clearAllNotifications() {
    const state = getDemoState();
    state.notifications = [];
    setDemoState(state);
    updateNotificationBadge();
    renderNotifications();
}

// Auto-add notifications for demo purposes
function addDemoNotification(type) {
    let notification;
    
    if (type === 'payment_approved') {
        notification = {
            type: 'payment',
            title: 'Payment Approved',
            message: 'Your payment of ₱5,000.00 has been approved.',
            actionUrl: 'payment_history.html'
        };
    } else if (type === 'payment_pending') {
        notification = {
            type: 'payment',
            title: 'Payment Received',
            message: 'Your payment of ₱3,500.00 is pending approval.',
            actionUrl: 'payment_history.html'
        };
    } else if (type === 'scholarship_approved') {
        notification = {
            type: 'scholarship',
            title: 'Scholarship Approved',
            message: 'Congratulations! Your scholarship application has been approved.',
            actionUrl: 'scholarships.html'
        };
    } else if (type === 'scholarship_applied') {
        notification = {
            type: 'scholarship',
            title: 'Application Submitted',
            message: 'Your scholarship application has been submitted successfully.',
            actionUrl: 'scholarships.html'
        };
    }
    
    if (notification) {
        addNotification(notification);
    }
}

// Modify existing approve/reject functions to add notifications
// Add this to approvePendingPayment function:
function approvePendingPaymentWithNotification(paymentId) {
    // ... existing approve logic ...
    
    // Add notification
    addNotification({
        type: 'payment',
        title: 'Payment Approved',
        message: 'Payment has been approved successfully.',
        actionUrl: 'accounting_dashboard.html'
    });
}

// Add this to submitScholarshipApplication function (inside success part):
function submitScholarshipApplicationWithNotification(event) {
    event.preventDefault();
    // ... existing submit logic ...
    
    // Add notification
    addNotification({
        type: 'scholarship',
        title: 'Application Submitted',
        message: 'Your scholarship application has been submitted successfully.',
        actionUrl: 'scholarships.html'
    });
}