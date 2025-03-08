const { info } = require('console');

/**
 * Scrape Address
 * @param {object} page - The Puppeteer page instance.
 * @param {object} config - Configuration object containing selectors.
 * @param {address} address - Address to scrape
 * @throws Will throw an error if unable to solve the captcha.
 */
async function scrapeAddress(page, config, address) {
	info('Scraping address:', address);
}

module.exports = {
	scrapeAddress,
};
