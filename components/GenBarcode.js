import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styles from "../styles/GenBarcode.module.css";
import Barcode from "react-barcode";
import Image from "next/image";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";

const GenBarcode = ({ data, dispatch }) => {
  const printRef = React.useRef();
  const pdfContainerRef = React.useRef();

  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
            lineColor="#000000"
            background="#FFFFFF"
            width={1.5}
            height={40}
          />
        </div>
      </>
    );
  };
  const generateBarcode = (e) => {
    dispatch({ type: "SET_GEN_BARCODE", isGenBarcode: true });
  };

  const handleDownloadImage = async () => {
    const pdfContainer = pdfContainerRef.current;
    const elements = pdfContainer.getElementsByClassName(styles.barCode);
    const promises = Array.from(elements).map(async (element, index) => {
      const canvas = await html2canvas(element);
      return canvas.toDataURL("image/jpg");
    });

    console.log("promises: ", promises);

    Promise.all(promises).then((barcodeImages) => {
      const pageWidth = 600;
      const pageHeight = 400;
      const imagesPerPage = 2;

      console.log("barcodeImages", barcodeImages);
      const pdfContent = (
        <Document>
          {barcodeImages.map((barcode, index) => (
            <Page key={index} size={{ width: pageWidth, height: pageHeight }}>
              <Image
                src={barcode.imageDataUrl}
                alt={`Barcode ${index + 1}`}
                width={barcode.width}
                height={barcode.height}
              />
              {index % imagesPerPage === imagesPerPage - 1 && <br />}{" "}
              {/* Add a line break after every 2 barcodes */}
            </Page>
          ))}
        </Document>
      );
      
      const link = document.createElement("a");
      link.download = "barcode.pdf";
      link.href = URL.createObjectURL(
        new Blob([pdfContent], { type: "application/pdf" })
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
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
            <Image src="print.svg" alt="Print" width="24" height="24" />
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
