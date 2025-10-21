/**
 * Waline OAuth Integration Module
 * Handles OAuth authentication with Twitter, Google, and GitHub
 */

class WalineOAuth {
  constructor(serverURL) {
    this.serverURL = serverURL || '';
    this.providers = {
      twitter: {
        name: 'Twitter',
        color: '#1da1f2',
      },
      google: {
        name: 'Google',
        color: '#4285f4',
      },
      github: {
        name: 'GitHub',
        color: '#24292e',
      },
    };

    this.init();
  }

  /**
   * Initialize OAuth handlers
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupOAuthButtons());
    } else {
      this.setupOAuthButtons();
    }

    // Handle OAuth callback
    this.handleOAuthCallback();
  }

  /**
   * Setup OAuth button event listeners
   */
  setupOAuthButtons() {
    const oauthButtons = document.querySelectorAll('.waline-oauth-button');

    oauthButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = button.getAttribute('data-provider');
        if (provider) {
          this.initiateOAuth(provider);
        }
      });
    });
  }

  /**
   * Initiate OAuth flow for a provider
   */
  async initiateOAuth(provider) {
    if (!this.providers[provider]) {
      console.error(`Unknown OAuth provider: ${provider}`);
      return;
    }

    try {
      // Get OAuth authorization URL from Waline server
      const authURL = await this.getOAuthURL(provider);

      if (authURL) {
        // Store current page URL for redirect after login
        const currentURL = window.location.href;
        sessionStorage.setItem('WALINE_OAUTH_REDIRECT', currentURL);

        // Store provider for callback handling
        sessionStorage.setItem('WALINE_OAUTH_PROVIDER', provider);

        // Redirect to OAuth provider
        window.location.href = authURL;
      } else {
        this.showOAuthError(`无法连接到 ${this.providers[provider].name} 认证服务`);
      }
    } catch (error) {
      console.error(`OAuth initiation error for ${provider}:`, error);
      this.showOAuthError(`${this.providers[provider].name} 登录失败,请稍后重试`);
    }
  }

  /**
   * Get OAuth authorization URL from Waline server
   */
  async getOAuthURL(provider) {
    try {
      // Construct callback URL
      const callbackURL = `${window.location.origin}/login?oauth_callback=1`;

      // Request OAuth URL from Waline server
      const response = await fetch(
        `${this.serverURL}/api/oauth/${provider}?redirect_uri=${encodeURIComponent(callbackURL)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Return authorization URL
      return data.url || data.authUrl || data.authorization_url;
    } catch (error) {
      console.error('Failed to get OAuth URL:', error);
      return null;
    }
  }

  /**
   * Handle OAuth callback after provider redirects back
   */
  async handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if this is an OAuth callback
    if (!urlParams.has('oauth_callback')) {
      return;
    }

    const provider = sessionStorage.getItem('WALINE_OAUTH_PROVIDER');
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    // Handle OAuth errors
    if (error) {
      this.showOAuthError(`认证失败: ${error}`);
      this.cleanupOAuthSession();
      return;
    }

    // Validate we have necessary parameters
    if (!code || !provider) {
      this.showOAuthError('认证参数缺失');
      this.cleanupOAuthSession();
      return;
    }

    // Show loading state
    this.showOAuthLoading(provider);

    try {
      // Exchange code for access token
      const authResult = await this.completeOAuth(provider, code, state);

      if (authResult.success) {
        // Store authentication token
        this.storeAuthToken(authResult.token);

        // Show success message
        this.showOAuthSuccess();

        // Redirect to original page or home
        const redirectURL = sessionStorage.getItem('WALINE_OAUTH_REDIRECT') || '/';
        this.cleanupOAuthSession();

        setTimeout(() => {
          // Remove OAuth callback parameters from URL
          const cleanURL = window.location.pathname;
          window.location.href = redirectURL === window.location.href ? cleanURL : redirectURL;
        }, 1500);
      } else {
        this.showOAuthError(authResult.message || '认证失败');
        this.cleanupOAuthSession();
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      this.showOAuthError('认证过程中发生错误');
      this.cleanupOAuthSession();
    }
  }

  /**
   * Complete OAuth flow by exchanging code for token
   */
  async completeOAuth(provider, code, state) {
    try {
      const callbackURL = `${window.location.origin}/login?oauth_callback=1`;

      const response = await fetch(`${this.serverURL}/api/oauth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          redirect_uri: callbackURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || '认证失败',
        };
      }

      const data = await response.json();

      return {
        success: true,
        token: data.token,
        user: data.userInfo || data.user,
      };
    } catch (error) {
      console.error('OAuth completion error:', error);
      throw error;
    }
  }

  /**
   * Store authentication token
   */
  storeAuthToken(token) {
    localStorage.setItem('WALINE_TOKEN', token);
    localStorage.setItem('WALINE_LOGIN_TIME', Date.now().toString());
  }

  /**
   * Clean up OAuth session data
   */
  cleanupOAuthSession() {
    sessionStorage.removeItem('WALINE_OAUTH_PROVIDER');
    sessionStorage.removeItem('WALINE_OAUTH_REDIRECT');
  }

  /**
   * Show OAuth loading state
   */
  showOAuthLoading(provider) {
    const providerName = this.providers[provider]?.name || provider;
    const container = document.querySelector('.waline-custom-login-card');

    if (container) {
      const loadingHTML = `
        <div class="waline-oauth-loading" style="text-align: center; padding: 3rem 2rem;">
          <svg class="waline-spinner" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin: 0 auto 1rem; color: var(--waline-theme-color);">
            <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="31.4 31.4"></circle>
          </svg>
          <p style="font-size: 1rem; color: var(--waline-text-color); margin: 0;">
            正在通过 ${providerName} 登录...
          </p>
        </div>
      `;
      container.innerHTML = loadingHTML;
    }
  }

  /**
   * Show OAuth success message
   */
  showOAuthSuccess() {
    const container = document.querySelector('.waline-custom-login-card');

    if (container) {
      const successHTML = `
        <div class="waline-oauth-success" style="text-align: center; padding: 3rem 2rem;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--waline-success-color)" style="margin: 0 auto 1rem;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2"></path>
            <polyline points="22 4 12 14.01 9 11.01" stroke-width="2"></polyline>
          </svg>
          <p style="font-size: 1.125rem; font-weight: 600; color: var(--waline-success-color); margin: 0;">
            登录成功!
          </p>
          <p style="font-size: 0.875rem; color: var(--waline-text-light); margin-top: 0.5rem;">
            正在跳转...
          </p>
        </div>
      `;
      container.innerHTML = successHTML;
    }
  }

  /**
   * Show OAuth error message
   */
  showOAuthError(message) {
    const errorAlert = document.getElementById('waline-login-error');

    if (errorAlert) {
      const errorText = document.getElementById('waline-login-error-text');
      if (errorText) {
        errorText.textContent = message;
      }
      errorAlert.style.display = 'flex';

      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorAlert.style.display = 'none';
      }, 5000);
    } else {
      // Fallback to alert if error element not found
      alert(message);
    }
  }

  /**
   * Get provider configuration
   */
  static getProviderConfig(provider) {
    const configs = {
      twitter: {
        name: 'Twitter',
        authEndpoint: 'https://twitter.com/i/oauth2/authorize',
        scope: 'tweet.read users.read',
      },
      google: {
        name: 'Google',
        authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        scope: 'openid email profile',
      },
      github: {
        name: 'GitHub',
        authEndpoint: 'https://github.com/login/oauth/authorize',
        scope: 'read:user user:email',
      },
    };

    return configs[provider] || null;
  }
}

// Initialize OAuth handler when page loads
let walineOAuth;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Get server URL from existing walineAuth instance or from page
    const serverURL = window.walineAuth?.serverURL ||
                     document.querySelector('[data-waline-server-url]')?.getAttribute('data-waline-server-url') ||
                     '';
    walineOAuth = new WalineOAuth(serverURL);
  });
} else {
  const serverURL = window.walineAuth?.serverURL || '';
  walineOAuth = new WalineOAuth(serverURL);
}
