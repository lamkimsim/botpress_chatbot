const ac = require('@antiadmin/anticaptchaofficial');
const fs = require('fs');

// Solve captcha with anti captcha service
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

/**
 * Attempts to solve the captcha up to a maximum number of attempts.
 * @param {object} page - The Puppeteer page instance.
 * @param {object} config - Configuration object containing selectors.
 * @param {number} [maxAttempts=5] - Maximum number of attempts.
 * @returns {object} - The captcha solution object.
 * @throws Will throw an error if unable to solve the captcha.
 */
async function solveCaptchaWithRetries(page, config, maxAttempts = 5) {
	let captchaSolution;
	let loggedIn = false;

	console.info('Starting captcha solving process...');

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		console.info(`Attempt ${attempt} of ${maxAttempts}`);

		// Get the captcha image element and take a screenshot
		const captchaImage = await page.$(config.selectors.captchaImage);
		if (!captchaImage) {
			console.error('Captcha image element not found');
			throw new Error('Captcha image element not found');
		}

		try {
			await captchaImage.screenshot({ path: 'captcha.png' });
		} catch (err) {
			console.error('Failed to capture captcha screenshot', err);
			throw err;
		}

		// Attempt to solve the captcha
		try {
			captchaSolution = await solveCaptcha();
		} catch (err) {
			console.error('Error while attempting to solve captcha', err);
			throw err;
		}

		if (captchaSolution && captchaSolution.success) {
			await page.type(
				config.selectors.captcha,
				captchaSolution.text.toUpperCase()
			);

			// Click the login button
			await page.click(config.selectors.loginButton);

			// Wait for navigation or the element that indicates login success.
			console.info('Waiting for login confirmation element...');

			try {
				await page.waitForSelector('//*[@id="logoutInMenu"]/div[2]', {
					timeout: 30000,
				});
				loggedIn = true;
				break;
			} catch (error) {
				console.error(error);
			}
		} else {
			console.warn(`Captcha solving failed on attempt ${attempt}. Retrying...`);
		}
	}

	if (!loggedIn) {
		console.error(`Captcha solving failed after ${maxAttempts} attempts`);
		throw new Error(`Captcha solving failed after ${maxAttempts} attempts`);
	}

	console.info('Captcha solving process completed successfully.');
}

module.exports = {
	solveCaptchaWithRetries,
};
