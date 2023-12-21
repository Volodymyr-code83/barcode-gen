const express = require("express");
const bwipjs = require("bwip-js");
const PDFDocument = require("pdfkit");
const SVGtoPDF = require("svg-to-pdfkit");
const cors = require("cors");

const app = express();
const port = 5000;

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // To serve static files

app.post("/generateBarcode", (req, res) => {
  const data = req.body.data;
  text = data[0].EANBarcode;
  let doc = new PDFDocument({ size: [54, 25] });
  const fontSize = 3;
  doc.fontSize(fontSize);
  //   let writeStream = fs.createWriteStream("barcode.pdf");
  //   doc.pipe(writeStream);

  data.forEach((item, index) => {
    let text = item.EANBarcode;
    let line1 = item.Name;
    let line2 = item.SKU;

    if (line1.length > 45) {
      line1 = line1.slice(0, 45) + "..."; // Truncate and add ellipsis
    }
    if (line2.length > 45) {
      line2 = line2.slice(0, 35) + "..."; // Truncate and add ellipsis
    }

    let svg = bwipjs.toSVG({
      bcid: "code128",
      text: text.toString(),
      height: 10,
      includetext: true,
      textalign: "center",
      textcolor: "000000",
    });
    if (svg) {
      try {
        if (index > 0) {
          doc.addPage();
        }
        let textWidth1 = doc.widthOfString(line1);
        let centerX1 = (doc.page.width - textWidth1) / 2;
        doc.text(line1, centerX1, 1);

        let textWidth2 = doc.widthOfString(line2);
        let centerX2 = (doc.page.width - textWidth2) / 2;
        doc.text(line2, centerX2, 5);

        SVGtoPDF(doc, svg, 0, 3);
      } catch (error) {
        console.error("SVGtoPDF error:", error.message);
      }
    } else {
      console.error("Failed to convert PNG to SVG");
    }
  });
  res.setHeader("Content-Disposition", "attachment; filename=barcode.pdf");
  doc.pipe(res);
  doc.end();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
