/**
 * Waline Registration Module
 * Handles user registration with email and password
 */

class WalineRegister {
  constructor(config) {
    this.serverURL = config.serverURL || '';
    this.redirectURL = config.redirectURL || '/login';
    this.init();
  }

  /**
   * Initialize registration form
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupForm());
    } else {
      this.setupForm();
    }
  }

  /**
   * Setup form handlers
   */
  setupForm() {
    this.form = document.getElementById('waline-email-register-form');
    if (!this.form) {
      console.warn('Registration form not found');
      return;
    }

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Password toggle buttons - handle all of them
    const toggleButtons = document.querySelectorAll('.waline-password-toggle');
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Get the input field - either from data-target or find the previous sibling input
        const targetId = button.getAttribute('data-target');
        const inputField = targetId
          ? document.getElementById(targetId)
          : button.parentElement.querySelector('input[type="password"], input[type="text"]');

        if (inputField) {
          this.togglePassword(inputField.id, button);
        }
      });
    });

    // Real-time validation
    const emailInput = document.getElementById('waline-register-email');
    const passwordInput = document.getElementById('waline-register-password');
    const passwordConfirmInput = document.getElementById('waline-register-password-confirm');

    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
    }

    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput));
    }

    if (passwordConfirmInput) {
      passwordConfirmInput.addEventListener('blur', () => this.validatePasswordMatch());
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(this.form);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const passwordConfirm = formData.get('password_confirm');

    // Validate all fields
    const nameInput = document.getElementById('waline-register-name');
    const emailInput = document.getElementById('waline-register-email');
    const passwordInput = document.getElementById('waline-register-password');

    let isValid = true;

    if (!this.validateName(nameInput)) isValid = false;
    if (!this.validateEmail(emailInput)) isValid = false;
    if (!this.validatePassword(passwordInput)) isValid = false;
    if (!this.validatePasswordMatch()) isValid = false;

    if (!isValid) {
      return;
    }

    this.setLoadingState(true);

    try {
      const response = await this.register(name, email, password);

      if (response.success) {
        // Registration successful, now auto-login
        try {
          const loginResponse = await this.autoLogin(email, password);

          if (loginResponse.success) {
            // Store token and user data
            this.storeAuthToken(loginResponse.token, loginResponse.user, false);

            // Show success message
            this.showAlert('waline-register-success');

            // Get redirect URL from session storage (from comment page)
            const returnURL = sessionStorage.getItem('WALINE_COMMENT_RETURN_URL') || '/';
            sessionStorage.removeItem('WALINE_COMMENT_RETURN_URL');

            // Redirect to original page after 1.5 seconds
            setTimeout(() => {
              window.location.href = returnURL;
            }, 1500);
          } else {
            // Auto-login failed, redirect to login page
            this.showAlert('waline-register-success');
            setTimeout(() => {
              window.location.href = this.redirectURL;
            }, 2000);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          // Redirect to login page on error
          setTimeout(() => {
            window.location.href = this.redirectURL;
          }, 2000);
        }
      } else {
        this.showAlert('waline-register-error', response.message || '注册失败,请稍后重试');
        this.setLoadingState(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showAlert('waline-register-error', '注册过程中发生错误,请稍后重试');
      this.setLoadingState(false);
    }
  }

  /**
   * Register user via Waline API
   */
  async register(name, email, password) {
    try {
      const response = await fetch(`${this.serverURL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: name,
          email: email,
          password: password,
          type: 'guest', // Register as guest user
        }),
      });

      const data = await response.json();

      // Waline API uses errno to indicate success/failure
      // errno: 0 = success, non-zero = error
      if (data.errno !== 0) {
        let message = data.errmsg || '注册失败';

        // Provide more specific error messages
        if (message.includes('duplicate') || message.includes('exist')) {
          message = '该邮箱已被注册';
        }

        return {
          success: false,
          message: message,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  /**
   * Validate name
   */
  validateName(input) {
    const errorElement = document.getElementById('name-error');
    const name = input.value.trim();

    if (name.length < 2) {
      this.showFieldError(input, errorElement, '昵称至少需要2个字符');
      return false;
    }

    this.clearFieldError(input, errorElement);
    return true;
  }

  /**
   * Validate email format
   */
  validateEmail(input) {
    const errorElement = document.getElementById('email-error');
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      this.showFieldError(input, errorElement, '请输入有效的邮箱地址');
      return false;
    }

    this.clearFieldError(input, errorElement);
    return true;
  }

  /**
   * Validate password
   */
  validatePassword(input) {
    const errorElement = document.getElementById('password-error');
    const password = input.value;

    if (password.length < 6) {
      this.showFieldError(input, errorElement, '密码至少需要6位');
      return false;
    }

    this.clearFieldError(input, errorElement);
    return true;
  }

  /**
   * Validate password match
   */
  validatePasswordMatch() {
    const passwordInput = document.getElementById('waline-register-password');
    const confirmInput = document.getElementById('waline-register-password-confirm');
    const errorElement = document.getElementById('password-confirm-error');

    if (passwordInput.value !== confirmInput.value) {
      this.showFieldError(confirmInput, errorElement, '两次输入的密码不一致');
      return false;
    }

    this.clearFieldError(confirmInput, errorElement);
    return true;
  }

  /**
   * Show field error
   */
  showFieldError(input, errorElement, message) {
    input.classList.add('waline-input-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Clear field error
   */
  clearFieldError(input, errorElement) {
    input.classList.remove('waline-input-error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  /**
   * Toggle password visibility
   */
  togglePassword(inputId, button) {
    const passwordInput = document.getElementById(inputId);
    const hideIcon = button.querySelector('.waline-icon-hide');
    const showIcon = button.querySelector('.waline-icon-show');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      hideIcon.style.display = 'none';
      showIcon.style.display = 'block';
      button.setAttribute('aria-label', '隐藏密码');
    } else {
      passwordInput.type = 'password';
      hideIcon.style.display = 'block';
      showIcon.style.display = 'none';
      button.setAttribute('aria-label', '显示密码');
    }
  }

  /**
   * Show alert message
   */
  showAlert(alertId, message) {
    const alert = document.getElementById(alertId);
    if (!alert) return;

    if (message) {
      const textElement = document.getElementById(alertId + '-text');
      if (textElement) {
        textElement.textContent = message;
      }
    }

    alert.style.display = 'flex';

    // Auto-hide error after 5 seconds
    if (alertId.includes('error')) {
      setTimeout(() => {
        alert.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Set loading state
   */
  setLoadingState(loading) {
    const submitButton = document.getElementById('waline-register-submit');
    const buttonText = submitButton.querySelector('.waline-button-text');
    const buttonLoading = submitButton.querySelector('.waline-button-loading');

    if (loading) {
      submitButton.disabled = true;
      buttonText.style.display = 'none';
      buttonLoading.style.display = 'flex';
    } else {
      submitButton.disabled = false;
      buttonText.style.display = 'block';
      buttonLoading.style.display = 'none';
    }
  }

  /**
   * Auto-login after registration
   */
  async autoLogin(email, password) {
    try {
      const response = await fetch(`${this.serverURL}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      // Waline API uses errno to indicate success/failure
      if (data.errno !== 0) {
        return {
          success: false,
          message: data.errmsg || '自动登录失败',
        };
      }

      // Check if we got a valid token
      if (!data.data || !data.data.token) {
        return {
          success: false,
          message: '未获取到登录凭证',
        };
      }

      return {
        success: true,
        token: data.data.token,
        user: data.data.userInfo || data.data,
      };
    } catch (error) {
      console.error('Auto-login error:', error);
      throw error;
    }
  }

  /**
   * Store authentication token
   */
  storeAuthToken(token, userInfo, remember) {
    const storage = remember ? localStorage : sessionStorage;

    // Store token
    storage.setItem('WALINE_TOKEN', token);
    storage.setItem('WALINE_LOGIN_TIME', Date.now().toString());

    // Store complete user data for Waline widget to read
    // This includes email, display name, avatar, etc.
    localStorage.setItem('WALINE_USER', JSON.stringify({
      ...userInfo,
      token: token,
      remember: remember,
    }));
  }
}

// Auto-initialize if on register page
if (document.getElementById('waline-email-register-form')) {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Waline Register module loaded');
  });
}
