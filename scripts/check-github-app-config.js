const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
require('dotenv').config({ path: '.env.local' });

async function checkAppConfig() {
  try {
    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
      throw new Error('GitHub App credentials not configured');
    }

    const app = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
    
    // Get app information
    const { data: appInfo } = await app.rest.apps.getAuthenticated();
    
    console.log('GitHub App Configuration:');
    console.log('========================');
    console.log(`App Name: ${appInfo.name}`);
    console.log(`App ID: ${appInfo.id}`);
    console.log(`Webhook URL: ${appInfo.external_url || 'Not configured'}`);
    console.log(`Setup URL: ${appInfo.setup_url || 'Not configured'}`);
    console.log(`HTML URL: ${appInfo.html_url}`);
    console.log(`Callback URLs: ${appInfo.callback_urls?.join(', ') || 'Not configured'}`);
    
    console.log('\nRequired Callback URL for new flow:');
    console.log(`${process.env.NEXTAUTH_URL}/api/github/install/callback`);
    
    console.log('\nCurrent Environment:');
    console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
    console.log(`GITHUB_APP_NAME: ${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}`);
    
  } catch (error) {
    console.error('Error checking app config:', error.message);
    if (error.status === 401) {
      console.error('Authentication failed. Check your GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY');
    }
  }
}

checkAppConfig();