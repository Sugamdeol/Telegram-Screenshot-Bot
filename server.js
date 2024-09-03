const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const sharp = require('sharp'); // For image processing
const validUrl = require('valid-url'); // For URL validation

const token = '7440102190:AAFmKfc1mIB4x1XFaMhvvPXHNQ6Q5V3y_rs';
const bot = new TelegramBot(token, { polling: true });

// Start command with custom keyboard
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const startMessage = 'Welcome to the Screenshot Bot! Choose an option:';
    const options = {
        reply_markup: {
            keyboard: [
                [{ text: 'Take Screenshot' }],
                [{ text: 'Help' }, { text: 'About' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    bot.sendMessage(chatId, startMessage, options);
});

// Handle text messages for custom commands
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (text === 'take screenshot') {
        bot.sendMessage(chatId, 'Please send the URL you want to capture.');
    } else if (text === 'help') {
        bot.sendMessage(chatId, 'Send a URL with the "/screenshot" command to capture a screenshot.\n\nOptions:\n/screenshot [URL]\n/fullpage [URL]\n/grayscale [URL]');
    } else if (text === 'about') {
        bot.sendMessage(chatId, 'This bot captures screenshots of websites. Created with love ❤️.');
    }
});

// Screenshot command with URL validation and effects
bot.onText(/\/screenshot (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    if (!validUrl.isUri(url)) {
        return bot.sendMessage(chatId, 'Please send a valid URL.');
    }

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'load', timeout: 0 });
        const screenshotBuffer = await page.screenshot();
        await browser.close();

        const editedScreenshot = await sharp(screenshotBuffer)
            .resize({ width: 1024 })
            .toBuffer();

        await bot.sendPhoto(chatId, editedScreenshot, { caption: 'Here is your screenshot!' });

    } catch (error) {
        bot.sendMessage(chatId, `Sorry, an error occurred: ${error.message}`);
    }
});

// Fullpage screenshot command
bot.onText(/\/fullpage (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    if (!validUrl.isUri(url)) {
        return bot.sendMessage(chatId, 'Please send a valid URL.');
    }

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'load', timeout: 0 });
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        await browser.close();

        await bot.sendPhoto(chatId, screenshotBuffer, { caption: 'Full-page screenshot taken!' });

    } catch (error) {
        bot.sendMessage(chatId, `Sorry, an error occurred: ${error.message}`);
    }
});

// Grayscale screenshot command
bot.onText(/\/grayscale (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    if (!validUrl.isUri(url)) {
        return bot.sendMessage(chatId, 'Please send a valid URL.');
    }

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'load', timeout: 0 });
        const screenshotBuffer = await page.screenshot();
        await browser.close();

        const grayscaleScreenshot = await sharp(screenshotBuffer)
            .grayscale()
            .toBuffer();

        await bot.sendPhoto(chatId, grayscaleScreenshot, { caption: 'Grayscale screenshot taken!' });

    } catch (error) {
        bot.sendMessage(chatId, `Sorry, an error occurred: ${error.message}`);
    }
});
