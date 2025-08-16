#!/usr/bin/env node

// Test script to verify GitHub App configuration
require('dotenv').config({ path: '.env.local' });

const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

async function testGitHubApp() {
  console.log('Testing GitHub App Configuration...\n');

  // Check environment variables
  console.log('1. Checking environment variables:');
  console.log(`   - GITHUB_APP_ID: ${process.env.GITHUB_APP_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`   - GITHUB_APP_PRIVATE_KEY: ${process.env.GITHUB_APP_PRIVATE_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`   - GITHUB_WEBHOOK_SECRET: ${process.env.GITHUB_WEBHOOK_SECRET ? '✓ Set' : '✗ Missing'}`);
  
  if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
    console.error('\n❌ Missing required environment variables. Please check your .env.local file.');
    process.exit(1);
  }

  console.log('\n2. Testing GitHub App authentication:');
  
  try {
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    // Get app info
    const { data: appInfo } = await octokit.rest.apps.getAuthenticated();
    console.log(`   ✓ Successfully authenticated as: ${appInfo.name}`);
    console.log(`   - App ID: ${appInfo.id}`);
    console.log(`   - App Slug: ${appInfo.slug}`);
    console.log(`   - Owner: ${appInfo.owner.login}`);
    console.log(`   - Created: ${appInfo.created_at}`);
    console.log(`   - Installation URL: https://github.com/apps/${appInfo.slug}/installations/new`);
    
    // Check if the App ID matches what we expect
    if (appInfo.id.toString() !== process.env.GITHUB_APP_ID) {
      console.warn(`\n⚠️  Warning: App ID mismatch!`);
      console.warn(`   Expected: ${process.env.GITHUB_APP_ID}`);
      console.warn(`   Actual: ${appInfo.id}`);
    }

    console.log('\n3. Checking installations:');
    const { data: installations } = await octokit.rest.apps.listInstallations();
    
    if (installations.length === 0) {
      console.log('   ⚠️  No installations found. The GitHub App needs to be installed on at least one account.');
      console.log(`   Install URL: https://github.com/apps/${appInfo.slug}/installations/new`);
    } else {
      console.log(`   ✓ Found ${installations.length} installation(s):`);
      
      for (const installation of installations) {
        console.log(`\n   Installation #${installation.id}:`);
        console.log(`   - Account: ${installation.account.login} (${installation.account.type})`);
        console.log(`   - Repository Selection: ${installation.repository_selection}`);
        console.log(`   - Created: ${installation.created_at}`);
        
        // Try to get repositories for this installation
        try {
          const installationOctokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
              appId: process.env.GITHUB_APP_ID,
              privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
              installationId: installation.id,
            },
          });
          
          const { data: repoData } = await installationOctokit.rest.apps.listReposAccessibleToInstallation();
          console.log(`   - Accessible repositories: ${repoData.total_count}`);
          
          if (repoData.repositories.length > 0) {
            console.log('     Sample repositories:');
            repoData.repositories.slice(0, 3).forEach(repo => {
              console.log(`     • ${repo.full_name}${repo.private ? ' (private)' : ''}`);
            });
          }
        } catch (error) {
          console.error(`   ✗ Failed to access installation: ${error.message}`);
        }
      }
    }

    console.log('\n✅ GitHub App configuration appears to be working correctly!');
    
  } catch (error) {
    console.error('\n❌ GitHub App authentication failed:');
    console.error(`   ${error.message}`);
    
    if (error.status === 401) {
      console.error('\n   This usually means:');
      console.error('   1. The private key is incorrect or malformed');
      console.error('   2. The App ID doesn\'t match the private key');
      console.error('   3. The private key format is incorrect (check line breaks)');
    }
    
    process.exit(1);
  }
}

// Run the test
testGitHubApp().catch(console.error);