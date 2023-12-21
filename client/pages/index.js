import React, { useReducer } from "react";
import Head from "next/head";
import DropZone from "../components/DropZone";
import GenBarcode from "../components/GenBarcode";
import styles from "../styles/Home.module.css";

export default function Home() {
  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_IN_DROP_ZONE":
        return { ...state, inDropZone: action.inDropZone };
      case "ADD_FILE_TO_LIST":
        return { ...state, fileList: state.fileList.concat(action.files) };
      case "SET_GEN_BARCODE":
        return { ...state, isGenBarcode: action.isGenBarcode };
      case "CLEAR_FILE_LIST":
        return { ...state, fileList: [] };
      case "ADD_RECORDS_ARRAY":
        return { ...state, recordsArray: state.recordsArray.concat(action.recordsArray) };
      default:
        return state;
    }
  };

  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    isGenBarcode: false,
    fileList: [],
    recordsArray: [],
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Generate Barcode</title>
        <meta name="description" content="Generate Barcode" />
        <link rel="icon" href="/icon.png" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Generate Barcode</h1>
        {/* Pass state data and dispatch to the DropZone component */}
        <h2>Upload CSV &amp; xlsx</h2>
        <DropZone data={data} dispatch={dispatch} />
        <h2>The Barcode Generator</h2>
        <GenBarcode data={data} dispatch={dispatch} />
      </main>
    </div>
  );
}
