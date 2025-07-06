#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { exec } = require('child_process');
const axios = require('axios');

program
  .version('1.0.0')
  .description('Fortinet Load Testing Suite')
  .option('-t, --target <url>', 'Target URL', 'http://nginx')
  .option('-c, --concurrency <number>', 'Number of concurrent requests', '10')
  .option('-n, --requests <number>', 'Total number of requests', '1000')
  .option('-d, --duration <seconds>', 'Test duration in seconds', '60')
  .option('--api-only', 'Test API endpoints only')
  .option('--web-only', 'Test web application only')
  .option('--full', 'Run full stack tests')
  .parse();

const options = program.opts();

console.log(chalk.blue('🚀 Fortinet Load Testing Suite'));
console.log(chalk.gray('================================'));

async function healthCheck(url) {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

function runLoadTest(url, concurrency, requests, description) {
  return new Promise((resolve, reject) => {
    const command = `loadtest -c ${concurrency} -n ${requests} --rps 50 ${url}`;
    
    console.log(chalk.yellow(`\n📊 Running: ${description}`));
    console.log(chalk.gray(`Command: ${command}`));
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        reject(error);
        return;
      }
      
      console.log(chalk.green('✅ Test completed'));
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function testAPI(baseUrl, concurrency, requests) {
  console.log(chalk.blue('\n🔧 Testing API Endpoints'));
  
  const endpoints = [
    { path: '/api/health', name: 'Health Check' },
    { path: '/api/firewalls', name: 'Firewalls List' },
    { path: '/api/vdoms', name: 'VDOMs List' },
    { path: '/api/interfaces', name: 'Interfaces List' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      await runLoadTest(
        `${baseUrl}${endpoint.path}`,
        Math.ceil(concurrency / 2),
        Math.ceil(requests / endpoints.length),
        `API ${endpoint.name}`
      );
    } catch (error) {
      console.error(chalk.red(`Failed to test ${endpoint.name}: ${error.message}`));
    }
  }
}

async function testWeb(baseUrl, concurrency, requests) {
  console.log(chalk.blue('\n🌐 Testing Web Application'));
  
  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/firewalls', name: 'Firewalls Page' },
    { path: '/vdoms', name: 'VDOMs Page' },
    { path: '/interfaces', name: 'Interfaces Page' }
  ];
  
  for (const page of pages) {
    try {
      await runLoadTest(
        `${baseUrl}${page.path}`,
        Math.ceil(concurrency / 2),
        Math.ceil(requests / pages.length),
        `Web ${page.name}`
      );
    } catch (error) {
      console.error(chalk.red(`Failed to test ${page.name}: ${error.message}`));
    }
  }
}

async function main() {
  const { target, concurrency, requests } = options;
  
  console.log(chalk.cyan(`Target: ${target}`));
  console.log(chalk.cyan(`Concurrency: ${concurrency}`));
  console.log(chalk.cyan(`Requests: ${requests}`));
  
  // Health check
  console.log(chalk.yellow('\n🏥 Performing health check...'));
  const isHealthy = await healthCheck(target);
  
  if (!isHealthy) {
    console.error(chalk.red('❌ Health check failed. Target is not responding.'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Health check passed'));
  
  try {
    if (options.apiOnly) {
      await testAPI(target, parseInt(concurrency), parseInt(requests));
    } else if (options.webOnly) {
      await testWeb(target, parseInt(concurrency), parseInt(requests));
    } else if (options.full) {
      await testAPI(target, parseInt(concurrency), parseInt(requests));
      await testWeb(target, parseInt(concurrency), parseInt(requests));
    } else {
      // Default: run basic load test
      await runLoadTest(target, concurrency, requests, 'Basic Load Test');
    }
    
    console.log(chalk.green('\n🎉 All tests completed successfully!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Tests failed:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runLoadTest, testAPI, testWeb, healthCheck };