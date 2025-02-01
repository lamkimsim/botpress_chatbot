const { chromium } = require('playwright');
const ac = require('@antiadmin/anticaptchaofficial');
const fs = require('fs');
require('dotenv').config();
const axios = require('axios');

// Configuration
const config = {
	loginUrl:
		'https://partners.unifi.my/HSBBPartnerPortal/HSBBPartnerPortal.portal?_nfpb=true&_pageLabel=login_portal&_nfls=false',
	selectors: {
		username: '#portal\\.actionForm_username',
		password: '#portal\\.actionForm_password',
		captcha: '#portal\\.actionForm_captchaCode',
		captchaImage: 'img[src="jcaptchaCustom.jpg"]',
		loginButton: 'xpath=//*[@id="portal.form"]/table/tbody/tr[8]/td[2]/input',
	},
};

// Solve captcha
async function solveCaptcha() {
	try {
		const captcha = fs.readFileSync('captcha.png', { encoding: 'base64' });
		ac.setAPIKey(process.env.ANTICAPTCHA_API_KEY);
		ac.settings.numeric = 2;
		const text = await ac.solveImage(captcha, true);
		return { success: true, text };
	} catch (error) {
		return { success: false, error: error.message };
	}
}

// Common user agents for rotation
const userAgents = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
	// Add more user agents as needed
];

async function getRandomUserAgent() {
	return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function setupBrowser() {
	try {
		// Configure proxy settings
		const proxyUrl = 'http://tkaatgym-MY-rotate:mirpnpaajwwd@p.webshare.io:80';

		// Launch browser with proxy configuration
		const browser = await chromium.launch({
			proxy: {
				server: proxyUrl,
				username: 'tkaatgym-MY-rotate',
				password: 'mirpnpaajwwd',
			},
			headless: false,
		});

		// Create new context with custom headers
		const context = await browser.newContext({
			userAgent: await getRandomUserAgent(),
			extraHTTPHeaders: {
				Accept:
					'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.5',
				'Accept-Encoding': 'gzip, deflate, br',
				Connection: 'keep-alive',
				'Cache-Control': 'max-age=0',
				'Sec-Ch-Ua': '"Chromium";v="91", " Not;A Brand";v="99"',
				'Sec-Ch-Ua-Mobile': '?0',
				'Sec-Fetch-Dest': 'document',
				'Sec-Fetch-Mode': 'navigate',
				'Sec-Fetch-Site': 'none',
				'Sec-Fetch-User': '?1',
				'Upgrade-Insecure-Requests': '1',
			},
		});

		return { browser, context };
	} catch (error) {
		console.error('Error setting up browser:', error);
		throw error;
	}
}

// Update getRotatingProxy function
async function getRotatingProxy() {
	try {
		const response = await axios.get('http://ipv4.webshare.io/', {
			proxy: false, // Disable axios proxy handling
			httpsAgent: new (require('https').Agent)({
				proxy: proxyString,
			}),
			timeout: 5000,
		});

		console.log('Proxy IP:', response.data);
		return { success: true, ip: response.data };
	} catch (error) {
		console.error('Proxy test failed:', error.message);
		return { success: false, error: error.message };
	}
}

// Main scraping function
async function scrapeUnifi() {
	let browser, context;

	try {
		// Set up browser and context
		({ browser, context } = await setupBrowser());

		// Create new page
		const page = await browser.newPage();
		await page.goto(config.loginUrl, {
			waitUntil: 'networkidle',
			timeout: 60000,
		});

		// Wait for the username input to be available
		await page.waitForSelector(config.selectors.username);

		// Type the username and password
		await page.type(config.selectors.username, process.env.UNIFI_USERNAME);
		await page.type(config.selectors.password, process.env.UNIFI_PASSWORD);

		// Solve captcha
		const captchaImage = await page.$(config.selectors.captchaImage);
		await captchaImage.screenshot({ path: 'captcha.png' });
		const captchaSolution = await solveCaptcha();
		if (!captchaSolution.success) {
			throw new Error('Captcha solving failed');
		}
		await page.type(config.selectors.captcha, captchaSolution.text);

		// Click the login button
		await page.click(config.selectors.loginButton);

		console.log('Logged in successfully');
	} catch (error) {
		console.error('Error during scraping:', error);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

// Run the scraping function
scrapeUnifi();
