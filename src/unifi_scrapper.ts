import { chromium, Browser, BrowserContext, Page } from 'playwright';
import dotenv from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { Agent } from 'https';
import { solveCaptchaWithRetries } from './captcha.ts';

dotenv.config();

// Interface definitions
interface Selectors {
  username: string;
  password: string;
  captcha: string;
  captchaImage: string;
  loginButton: string;
}

interface Config {
  loginUrl: string;
  selectors: Selectors;
}

interface ProxyConfig {
  server: string;
  username: string;
  password: string;
}

interface BrowserSetup {
  browser: Browser;
  context: BrowserContext;
}

interface ProxyTestResult {
  success: boolean;
  ip?: string;
  error?: string;
}

// Configuration
const config: Config = {
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

// Common user agents for rotation
const userAgents: string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
];

async function getRandomUserAgent(): Promise<string> {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function setupBrowser(): Promise<BrowserSetup> {
  try {
    const proxyConfig: ProxyConfig = {
      server: 'http://p.webshare.io:80',
      username: 'tkaatgym-MY-rotate',
      password: 'mirpnpaajwwd',
    };

    const browser = await chromium.launch({
      proxy: proxyConfig,
      headless: false,
    });

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

async function getRotatingProxy(): Promise<ProxyTestResult> {
  const proxyString = 'http://tkaatgym-MY-rotate:mirpnpaajwwd@p.webshare.io:80';
  
  try {
    const response: AxiosResponse = await axios.get('http://ipv4.webshare.io/', {
      proxy: false,
      httpsAgent: new Agent({
        proxy: proxyString,
      }),
      timeout: 5000,
    });

    console.log('Proxy IP:', response.data);
    return { success: true, ip: response.data };
  } catch (error) {
    const err = error as Error;
    console.error('Proxy test failed:', err.message);
    return { success: false, error: err.message };
  }
}

interface ScrapeResult {
  success: boolean;
  error?: string;
  data?: any; // Define proper type based on what scrapeAddress returns
}

/**
 * Main scraping function that handles login and data collection
 * @param address - The address to scrape data for
 * @returns Promise resolving to scrape results
 */
async function scrapeUnifi(address: string): Promise<ScrapeResult> {
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;

  try {
    if (!process.env.UNIFI_USERNAME || !process.env.UNIFI_PASSWORD) {
      throw new Error('Missing required environment variables');
    }

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
    const result = await solveCaptchaWithRetries(page, config);

    if (result.loggedIn) {
      console.log('Successfully logged in');
      // Add proper type for scrapeAddress function and its return value
      const data = await scrapeAddress(page, config, address);
      return { success: true, data };
    } else {
      console.error('Failed to log in:', result.error);
      return { success: false, error: result.error || 'Login failed' };
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error during scraping:', err);
    return { success: false, error: err.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export { scrapeUnifi };