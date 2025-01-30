const { log } = require('console');
const { chromium } = require('playwright');
require('dotenv').config();

const ac = require('@antiadmin/anticaptchaofficial');
const fs = require('fs');

//set API key
ac.setAPIKey(process.env.ANTICAPTCHA_API_KEY);

//Specify softId to earn 10% commission with your app.
//Get your softId here: https://anti-captcha.com/clients/tools/devcenter
// ac.setSoftId(0);

//set optional custom parameter which Google made for their search page Recaptcha v2
// //ac.settings.recaptchaDataSValue = '"data-s" token from Google Search results "protection"'

// ac.solveRecaptchaV2Proxyless('https://partners.unifi.my', 'WEBSITE_KEY')
// 	.then((gresponse) => {
// 		console.log('g-response: ' + gresponse);
// 		console.log('google cookies:');
// 		console.log(ac.getCookies());
// 	})
// 	.catch((error) => console.log('test received error ' + error));

const config = {
	loginUrl:
		'https://partners.unifi.my/HSBBPartnerPortal/HSBBPartnerPortal.portal?_nfpb=true&_pageLabel=login_portal&_nfls=false',
};

// Solve the captcha
const solveCaptcha = async () => {
	try {
		const captcha = fs.readFileSync('captcha.png', { encoding: 'base64' });

		// Keep your settings
		ac.settings.numeric = 2;

		// Await the result
		const text = await ac.solveImage(captcha, true);
		return { success: true, text };
	} catch (error) {
		return { success: false, error: error.message };
	}
};

async function scrapeUnifiPortal() {
	const browser = await chromium.launch({
		headless: false, // Set to true in production
	});

	try {
		const context = await browser.newContext();
		const page = await context.newPage();

		// Navigate to the login page
		await page.goto(config.loginUrl);

		// Wait for the username input to be available
		await page.waitForSelector(
			'#portal\\.actionForm_username',
			(timeout = 10000)
		);

		// Type the username and password
		await page.fill(
			'#portal\\.actionForm_username',
			process.env.UNIFI_USERNAME
		);
		await page.fill(
			'#portal\\.actionForm_password',
			process.env.UNIFI_PASSWORD
		);

		// Wait for the image element to be available
		await page.waitForSelector('img[src="jcaptchaCustom.jpg"]', {
			timeout: 10000,
		});

		// Take screenshot of captcha image
		const element = await page.$('img[src="jcaptchaCustom.jpg"]');
		if (element) {
			await element.screenshot({ path: 'captcha.png' });
			console.log('captcha.png');
		} else {
			console.error('Captcha image element not found');
		}

		// Usage:
		const result = await solveCaptcha();
		if (result.success) {
			console.log('Captcha solved:', result.text);
		} else {
			console.log('Error:', result.error);
		}

		await page.fill(
			'#portal\\.actionForm_captchaCode',
			result.text.toUpperCase()
		);

		// login
		const loginButton = await page.$(
			`xpath=//*[@id="portal.form"]/table/tbody/tr[8]/td[2]/input`
		);
		await loginButton.click();

		console.log('Successfully logged in');

		return content;
	} catch (error) {
		console.error('Error during scraping:', error);
		throw error;
	} finally {
		await browser.close();
	}
}

// Example usage
scrapeUnifiPortal('CPRV134', 'Ace874$')
	.then((content) => console.log('Scraping completed'))
	.catch((error) => console.error('Scraping failed:', error));

module.exports = scrapeUnifiPortal;
