import expressAsyncHandler from 'express-async-handler';
import { Router } from 'express';
import Company from '../models/company.js'
import Handlebars from 'handlebars';
import fs from 'fs'
import puppeteer, { executablePath } from 'puppeteer';
import path from 'path';


const letterheadRouter = Router()

//
letterheadRouter.get('/', expressAsyncHandler(async (req, res) => {
  let browser = null;

  try {
    console.log('Fetching sale and company data...');

    const company = await Company.findOne({}).lean()
    if (!company) return

    // Read and compile template
    const templatePath = path.join(process.cwd(), 'templates', 'Letterhead.hbs');

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const htmlContent = template(company);

    browser = await puppeteer.launch({
      headless: 'new',
      //executablePath: "/usr/bin/chromium-browser",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    console.log('Browser launched, creating page...');
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 1600 });

    console.log('Setting content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Generating PDF...');
    // Generate PDF without path option
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    browser = null;

    // Verify buffer is not empty
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="document.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer, 'binary');

  } catch (error) {
    console.error('PDF Generation Error:', error);
    console.error('Error stack:', error.stack);

    // Close browser if it's still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    // Send error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate PDF',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}))


export default letterheadRouter