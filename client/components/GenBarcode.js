import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/GenBarcode.module.css";
import Barcode from "react-barcode";
import axios from "axios";

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
    console.log("generateBarcode!!!");
    axios
      .post(
        "http://localhost:5000/generateBarcode",
        {
          data: data.recordsArray,
        },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const blob = response.data;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "barcode.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => console.error("Error:", error));

    dispatch({ type: "SET_GEN_BARCODE", isGenBarcode: true });
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
