/**
 * Waline Custom Login Authentication Module
 * Handles email/password login and integrates with Waline server
 */

class WalineAuth {
  constructor(config) {
    this.serverURL = config.serverURL || '';
    this.redirectURL = config.redirectURL || '/';
    this.form = null;
    this.submitButton = null;
    this.passwordToggle = null;

    this.init();
  }

  /**
   * Initialize the authentication module
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    this.form = document.getElementById('waline-email-login-form');
    this.submitButton = document.getElementById('waline-login-submit');
    this.passwordToggle = document.querySelector('.waline-password-toggle');

    if (!this.form) {
      console.error('Waline login form not found');
      return;
    }

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Password toggle
    if (this.passwordToggle) {
      this.passwordToggle.addEventListener('click', () => this.togglePassword());
    }

    // Input validation on blur
    const emailInput = document.getElementById('waline-email');
    const passwordInput = document.getElementById('waline-password');

    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
    }

    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput));
    }

    // Clear errors on input
    [emailInput, passwordInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          this.clearFieldError(input);
          this.hideAlert('waline-login-error');
        });
      }
    });
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(this.form);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';

    // Validate inputs
    const emailInput = document.getElementById('waline-email');
    const passwordInput = document.getElementById('waline-password');

    let isValid = true;

    if (!this.validateEmail(emailInput)) {
      isValid = false;
    }

    if (!this.validatePassword(passwordInput)) {
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Show loading state
    this.setLoadingState(true);
    this.hideAlert('waline-login-error');

    try {
      // Attempt login with Waline server
      const response = await this.login(email, password, remember);

      if (response.success) {
        // Show success message
        this.showAlert('waline-login-success');

        // Store authentication token and user data
        this.storeAuthToken(response.token, response.user, remember);

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = this.getRedirectURL();
        }, 1000);
      } else {
        // Show error message
        this.showAlert('waline-login-error', response.message || '登录失败,请检查邮箱和密码');
        this.setLoadingState(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showAlert('waline-login-error', '登录过程中发生错误,请稍后重试');
      this.setLoadingState(false);
    }
  }

  /**
   * Perform login request to Waline server
   */
  async login(email, password, remember) {
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
      // errno: 0 = success, non-zero = error
      if (data.errno !== 0) {
        return {
          success: false,
          message: data.errmsg || '邮箱或密码错误',
        };
      }

      // Check if we got a valid token
      if (!data.data || !data.data.token) {
        return {
          success: false,
          message: '登录失败,未获取到有效凭证',
        };
      }

      return {
        success: true,
        token: data.data.token,
        user: data.data.userInfo || data.data,
      };
    } catch (error) {
      console.error('Login request error:', error);
      throw error;
    }
  }

  /**
   * Validate email input
   */
  validateEmail(input) {
    if (!input) return false;

    const email = input.value.trim();
    const errorElement = document.getElementById('email-error');

    if (!email) {
      this.showFieldError(input, errorElement, '请输入邮箱地址');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showFieldError(input, errorElement, '请输入有效的邮箱地址');
      return false;
    }

    this.clearFieldError(input, errorElement);
    return true;
  }

  /**
   * Validate password input
   */
  validatePassword(input) {
    if (!input) return false;

    const password = input.value;
    const errorElement = document.getElementById('password-error');

    if (!password) {
      this.showFieldError(input, errorElement, '请输入密码');
      return false;
    }

    if (password.length < 6) {
      this.showFieldError(input, errorElement, '密码长度至少为6个字符');
      return false;
    }

    this.clearFieldError(input, errorElement);
    return true;
  }

  /**
   * Show field-specific error
   */
  showFieldError(input, errorElement, message) {
    if (input) {
      input.classList.add('waline-input-error');
      input.setAttribute('aria-invalid', 'true');
    }
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Clear field-specific error
   */
  clearFieldError(input, errorElement) {
    if (input) {
      input.classList.remove('waline-input-error');
      input.removeAttribute('aria-invalid');
    }
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  /**
   * Toggle password visibility
   */
  togglePassword() {
    const passwordInput = document.getElementById('waline-password');
    const hideIcon = this.passwordToggle.querySelector('.waline-icon-hide');
    const showIcon = this.passwordToggle.querySelector('.waline-icon-show');

    if (!passwordInput) return;

    const isPassword = passwordInput.type === 'password';

    passwordInput.type = isPassword ? 'text' : 'password';

    if (hideIcon && showIcon) {
      hideIcon.style.display = isPassword ? 'none' : 'block';
      showIcon.style.display = isPassword ? 'block' : 'none';
    }

    this.passwordToggle.setAttribute(
      'aria-label',
      isPassword ? '隐藏密码' : '显示密码'
    );
  }

  /**
   * Set loading state on submit button
   */
  setLoadingState(isLoading) {
    if (!this.submitButton) return;

    const buttonText = this.submitButton.querySelector('.waline-button-text');
    const buttonLoading = this.submitButton.querySelector('.waline-button-loading');

    this.submitButton.disabled = isLoading;

    if (buttonText) {
      buttonText.style.display = isLoading ? 'none' : 'inline';
    }

    if (buttonLoading) {
      buttonLoading.style.display = isLoading ? 'flex' : 'none';
    }
  }

  /**
   * Show alert message
   */
  showAlert(alertId, message) {
    const alert = document.getElementById(alertId);
    if (!alert) return;

    if (message && alertId === 'waline-login-error') {
      const messageElement = document.getElementById('waline-login-error-text');
      if (messageElement) {
        messageElement.textContent = message;
      }
    }

    alert.style.display = 'flex';
  }

  /**
   * Hide alert message
   */
  hideAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
      alert.style.display = 'none';
    }
  }

  /**
   * Store authentication token and user data
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

  /**
   * Get redirect URL from query parameter or use default
   */
  getRedirectURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');

    if (redirect) {
      // Validate redirect URL to prevent open redirect vulnerability
      try {
        const redirectUrl = new URL(redirect, window.location.origin);
        if (redirectUrl.origin === window.location.origin) {
          return redirect;
        }
      } catch (e) {
        // Invalid URL, use default
      }
    }

    return this.redirectURL;
  }

  /**
   * Check if user is already authenticated
   */
  static isAuthenticated() {
    const token = localStorage.getItem('WALINE_TOKEN') ||
                  sessionStorage.getItem('WALINE_TOKEN');
    return !!token;
  }

  /**
   * Get stored authentication token
   */
  static getAuthToken() {
    return localStorage.getItem('WALINE_TOKEN') ||
           sessionStorage.getItem('WALINE_TOKEN');
  }

  /**
   * Logout user
   */
  static logout() {
    localStorage.removeItem('WALINE_TOKEN');
    localStorage.removeItem('WALINE_LOGIN_TIME');
    sessionStorage.removeItem('WALINE_TOKEN');
    sessionStorage.removeItem('WALINE_LOGIN_TIME');
  }
}

// Add CSS for error state
const style = document.createElement('style');
style.textContent = `
  .waline-input-error {
    border-color: var(--waline-error-color, #ef4444) !important;
  }

  .waline-input-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }
`;
document.head.appendChild(style);
