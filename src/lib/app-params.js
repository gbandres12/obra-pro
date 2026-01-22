
// Simplified app params for standalone SaaS version
// This replaces the complex URL/localStorage logic used in the base44 iframe integration

export const appParams = {
	appId: import.meta.env.VITE_APP_ID || 'local-dev-app',
	token: localStorage.getItem('auth_token'), // Standard way to get token
	functionsVersion: 'v1',
	appBaseUrl: window.location.origin
};
