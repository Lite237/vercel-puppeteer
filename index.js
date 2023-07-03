const express = require("express");
const app = express();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
} else {
    puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
    let options = {};

    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
            args: [
                ...chrome.args,
                "--hide-scrollbars",
                "--disable-web-security",
            ],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        };
    }
    try {
        let browser = await puppeteer.launch(options);

        let page = await browser.newPage();
        await page.goto("https://www.google.com");
        res.send(await page.title());
    } catch (err) {
        console.error(err);
        return null;
    }
});

app.get("/screenshot", async (req, res) => {
    let options = {};

    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
            args: [
                ...chrome.args,
                "--hide-scrollbars",
                "--disable-web-security",
            ],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        };
    }
    try {
        const url = new URL(req.url);

        const browser = await puppeteer.launch(options);

        const page = await browser.newPage();
        await page.goto("https://www.google.com");

        await page.screenchot({
            path: "./file.png",
            fullPage: true,
        });

        res.sendFile("./file.png");
    } catch (error) {
        res.status(400).json({
            message: JSON.stringify(error),
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});

module.exports = app;
