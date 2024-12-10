const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
  const dataBuffer = fs.readFileSync('2244-Sidonnaisuuksien-ilmoittaminen-kunnassa-2023 (1).pdf');
  try {
    const data = await pdfParse(dataBuffer);
    console.log('PDF Text:', data.text.substring(0, 500)); // First 500 chars for preview
    console.log('\nTotal length:', data.text.length);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
