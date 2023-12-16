import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/GenBarcode.module.css";
import Barcode from "react-barcode";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const GenBarcode = ({ data, dispatch }) => {
  const printRef = React.useRef();
  const pdfContainerRef = React.useRef();

  const textStyle = {
    textAlign: "center",
  };
  const BarcodeWithText = ({ text1, text2, barcodeValue }) => {
    return (
      <>
        <div>{text1}</div>
        <div>{text2}</div>
        <div style={textStyle}>
          <Barcode
            value={barcodeValue}
            fontSize={12}
            lineColor="#000000"
            background="#FFFFFF"
            width={1}
            height={28}
            margin={4}
          />
        </div>
      </>
    );
  };
  const generateBarcode = (e) => {
    dispatch({ type: "SET_GEN_BARCODE", isGenBarcode: true });
  };

  const handleDownloadImage = async () => {
    const pdf = new jsPDF({
      unit: "mm",
      format: [25, 54],
    });

    // Get the container element for rendering
    const pdfContainer = pdfContainerRef.current;

    const elements = pdfContainer.getElementsByClassName(styles.barCode);

    console.log("elements: ", elements);

    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      const canvas = await html2canvas(element);

      // Rotate the canvas by -90 degrees
      const rotatedCanvas = document.createElement("canvas");
      rotatedCanvas.width = canvas.height;
      rotatedCanvas.height = canvas.width;
      const rotatedContext = rotatedCanvas.getContext("2d");
      rotatedContext.translate(0, rotatedCanvas.height + 8);
      rotatedContext.rotate(-Math.PI / 2);
      rotatedContext.drawImage(canvas, 4, 4);

      // Convert the canvas to a data URL
      const imgData = rotatedCanvas.toDataURL("image/png");
      // Add the image to the PDF
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "PNG", 0, 0);
    }
    // Save or download the PDF
    pdf.save("barcode_document.pdf");
  };

  return (
    <>
      <div className={styles.gen_form}>
        <label htmlFor="barcode" className={styles.gen_label}>
          Type
        </label>
        <select className={styles.gen_input} id="barcode" name="barcode">
          <option value="code128">Code 128</option>
        </select>
        <label htmlFor="size" className={styles.gen_label}>
          Size
        </label>
        <select className={styles.gen_input} id="size" name="size">
          <option value="1">Single</option>
          {/* <option value="2">Couple</option>
          <option value="3">Triple</option>
          <option value="4">Quadruple</option> */}
        </select>
        <button
          className={styles.button}
          id="submit"
          type="submit"
          onClick={generateBarcode}
        >
          Generate Barcode
        </button>
      </div>

      {data.isGenBarcode && (
        <div className="bar-code-container" ref={pdfContainerRef}>
          <button className={styles.printButton} onClick={handleDownloadImage}>
            <img src="print.svg" alt="Print" width="24" height="24" />
          </button>
          {data.recordsArray.map((item, index) => (
            <div key={index} className={styles.barCode} ref={printRef}>
              <BarcodeWithText
                text1={item.Name.toString()}
                text2={item.SKU.toString()}
                barcodeValue={item.EANBarcode.toString()}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default GenBarcode;
