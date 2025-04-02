const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const resetPasswordModal = document.getElementById('resetPasswordModal');

function openLoginModal() {
    loginModal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeLoginModal() {
    loginModal.style.display = "none";
    document.body.style.overflow = "auto";
}

function openRegisterModal() {
    registerModal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeRegisterModal() {
    registerModal.style.display = "none";
    document.body.style.overflow = "auto";
}

function openForgotPasswordModal() {
    forgotPasswordModal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeForgotPasswordModal() {
    forgotPasswordModal.style.display = "none";
    document.body.style.overflow = "auto";
}

function openResetPasswordModal() {
    resetPasswordModal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeResetPasswordModal() {
    resetPasswordModal.style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = function(event) {
    if (event.target == loginModal) {
        closeLoginModal();
    }
    if (event.target == registerModal) {
        closeRegisterModal();
    }
    if (event.target == forgotPasswordModal) {
        closeForgotPasswordModal();
    }
    if (event.target == resetPasswordModal) {
        closeResetPasswordModal();
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword.length > 0) {
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Mật khẩu xác nhận không khớp');
        } else {
            const formGroup = document.getElementById('confirmPassword').parentElement;
            formGroup.classList.remove('error');
            const errorDiv = formGroup.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.classList.remove('show');
            }
        }
    }
}

const registerInputs = document.querySelectorAll('#registerForm input');
registerInputs.forEach(input => {
    input.addEventListener('input', function() {
        const formGroup = this.parentElement;
        formGroup.classList.remove('error');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
        
        if (this.id === 'registerPassword' || this.id === 'confirmPassword') {
            checkPasswordMatch();
        }
    });
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!isValidEmail(email)) {
        showError('registerEmail', 'Email không hợp lệ');
        return;
    }
    
    if (password.length < 8) {
        const passwordGroup = document.getElementById('registerPassword').closest('.form-group');
        passwordGroup.classList.add('error');
        return;
    } else {
        const passwordGroup = document.getElementById('registerPassword').closest('.form-group');
        passwordGroup.classList.remove('error');
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword', 'Mật khẩu xác nhận không khớp');
        return;
    }
    
    console.log('Đăng ký với email:', email);
    
    this.reset();
    closeRegisterModal();
    alert('Đăng ký thành công!');
});

// Thêm sự kiện kiểm tra độ dài mật khẩu khi người dùng nhập
document.getElementById('registerPassword').addEventListener('input', function() {
    const passwordGroup = this.closest('.form-group');
    if (this.value.length < 8) {
        passwordGroup.classList.add('error');
    } else {
        passwordGroup.classList.remove('error');
    }
});

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const formGroup = input.parentElement;
    const errorDiv = formGroup.querySelector('.error-message') || createErrorDiv(formGroup);
    
    formGroup.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function createErrorDiv(formGroup) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    formGroup.appendChild(errorDiv);
    return errorDiv;
}

document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    if (!isValidEmail(email)) {
        showError('resetEmail', 'Email không hợp lệ');
        return;
    }
    
    console.log('Gửi email khôi phục mật khẩu đến:', email);
    
    showSuccess(this, 'Link đặt lại mật khẩu đã được gửi đến email của bạn');
    
    setTimeout(() => {
        this.reset();
        closeForgotPasswordModal();
    }, 3000);
});

document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword.length < 8) {
        showError('newPassword', 'Mật khẩu phải có ít nhất 8 ký tự');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showError('confirmNewPassword', 'Mật khẩu xác nhận không khớp');
        return;
    }
    
    console.log('Đặt lại mật khẩu thành công');
    
    showSuccess(this, 'Đặt lại mật khẩu thành công');
    
    setTimeout(() => {
        this.reset();
        closeResetPasswordModal();
        openLoginModal();
    }, 2000);
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSuccess(form, message) {
    let successDiv = form.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        form.appendChild(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.classList.add('show');
}

document.querySelector('.forgot-password').onclick = function(e) {
    e.preventDefault();
    closeLoginModal();
    openForgotPasswordModal();
};

let isLoggedIn = false;
let currentUser = null;

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!isValidEmail(email)) {
        showError('loginEmail', 'Email không hợp lệ');
        return;
    }
    
    handleLoginSuccess({
        email: email
    });
    
    this.reset();
    closeLoginModal();
});

function handleLoginSuccess(user) {
    isLoggedIn = true;
    currentUser = user;
    
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('userEmail').textContent = user.email;
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', user.email);
}

function handleLogout() {
    isLoggedIn = false;
    currentUser = null;
    
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('userEmail').textContent = '';
    
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
}

window.addEventListener('load', function() {
    const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUserEmail = localStorage.getItem('userEmail');
    
    if (savedIsLoggedIn === 'true' && savedUserEmail) {
        handleLoginSuccess({
            email: savedUserEmail
        });
    }
});

document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">');

const passwordToggles = document.querySelectorAll('.password-toggle');

passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

