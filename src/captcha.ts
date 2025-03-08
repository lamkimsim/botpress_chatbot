import { Page } from 'puppeteer';
import { AntiCaptcha } from '@antiadmin/anticaptchaofficial';
import { readFileSync } from 'fs';

// Define interfaces for type safety
interface CaptchaSolution {
  success: boolean;
  text?: string;
  error?: string;
}

interface Selectors {
  captchaImage: string;
  captcha: string;
  loginButton: string;
}

interface Config {
  selectors: Selectors;
}

interface LoginResult {
  loggedIn: boolean;
  error: string | null;
}

// Solve captcha with anti captcha service
async function solveCaptcha(): Promise<CaptchaSolution> {
  try {
    const captcha = readFileSync('captcha.png', { encoding: 'base64' });
    const ac = new AntiCaptcha(process.env.ANTICAPTCHA_API_KEY);
    ac.settings.numeric = 2;
    const text = await ac.solveImage(captcha, true);
    return { success: true, text };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Attempts to solve the captcha up to a maximum number of attempts.
 * @param page - The Puppeteer page instance.
 * @param config - Configuration object containing selectors.
 * @param maxAttempts - Maximum number of attempts.
 * @returns The login result object.
 * @throws Will throw an error if unable to solve the captcha.
 */
async function solveCaptchaWithRetries(
  page: Page,
  config: Config,
  maxAttempts: number = 5
): Promise<LoginResult> {
  let captchaSolution: CaptchaSolution;
  
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

    if (captchaSolution && captchaSolution.success && captchaSolution.text) {
      await page.type(
        config.selectors.captcha,
        captchaSolution.text.toUpperCase()
      );

      // Click the login button
      await page.click(config.selectors.loginButton);

      // Check if invalid username or password
      try {
        await page.waitForSelector(
          '//*[@id="portal.form"]/table/tbody/tr[1]/td/font',
          { timeout: 5000 }
        );
        // Error text found, invalid username/password
        console.warn('Invalid username or password detected');
        attempt = maxAttempts; // Break out from for loop
        return { loggedIn: false, error: 'Invalid username or password' };
      } catch (error) {
        // No error element found, correct username/password, continue
        // Wait for navigation or the element that indicates login success.
        console.info('Waiting for login confirmation element...');
        try {
          await page.waitForSelector('//*[@id="logoutInMenu"]/div[2]', {
            timeout: 30000,
          });
          return { loggedIn: true, error: null };
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      // Anti captcha error
      console.warn(`Captcha solving failed on attempt ${attempt}. Retrying...`);
    }
  }

  return { loggedIn: false, error: 'Failed to solve captcha after maximum attempts' };
}

export { solveCaptchaWithRetries };