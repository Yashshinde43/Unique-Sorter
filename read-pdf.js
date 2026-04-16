const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function readPDFFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    console.log(`Reading PDF file: ${absolutePath}`);
    
    const dataBuffer = fs.readFileSync(absolutePath);
    const pdfParser = new PDFParse();
    
    const data = await pdfParser.parseBuffer(dataBuffer);
    
    console.log('\n=== PDF Content ===\n');
    console.log(data.text);
    console.log('\n=== End of PDF Content ===\n');
    
    console.log(`Pages: ${data.numpages}`);
    console.log(`Info: ${JSON.stringify(data.info, null, 2)}`);
    
    return data;
  } catch (error) {
    console.error('Error reading PDF:', error.message);
    process.exit(1);
  }
}

const pdfFilePath = process.argv[2] || './public/1 PAGE FORMAT.pdf';
readPDFFile(pdfFilePath);