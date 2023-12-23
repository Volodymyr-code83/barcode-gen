import React, { useState } from "react";
import Image from "next/image";
import FilePreview from "./FilePreview";
import styles from "../styles/DropZone.module.css";
import Papa from "papaparse";
import readXlsxFile from "read-excel-file";

const DropZone = ({ data, dispatch }) => {
  const [isGenBarcode, setIsGenBarcode] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: true });
  };

  // onDragLeave sets inDropZone to false
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: false });
  };

  // onDragOver sets inDropZone to true
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // set dropEffect to copy i.e copy of the source item
    e.dataTransfer.dropEffect = "copy";
    dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: true });
  };

  // onDrop sets inDropZone to false and adds files to fileList
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // get files from event on the dataTransfer object as an array
    let files = [...e.dataTransfer.files];

    // ensure a file or files are dropped
    if (files && files.length > 0) {
      // loop over existing files
      const existingFiles = data.fileList.map((f) => f.name);

      // Filter out flies with invalid extensions
      files = files.filter((file) => {
        const isNotDuplicate = !existingFiles.includes(file.name);
        const hasValidExtension = isValidFile(file);
        return isNotDuplicate && hasValidExtension;
      });

      // dispatch action to add droped file or files to fileList
      dispatch({ type: "ADD_FILE_TO_LIST", files });
      // reset inDropZone to false
      dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: false });
    }
  };

  // handle file selection via input element
  const handleFileSelect = (e) => {
    let files = [...e.target.files];

    if (files && files.length > 0) {
      const existingFiles = data.fileList.map((f) => f.name);
      files = files.filter((f) => !existingFiles.includes(f.name));
      dispatch({ type: "ADD_FILE_TO_LIST", files });
    }
  };

  // Function to handle CSV file parsing
  const parseCSV = (file) => {

    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const filteredData = result.data.filter((row) =>
            Object.values(row).every((value) => value !== null)
          );
          resolve(filteredData);
        },
      });
    });
  };

  // Function to handle XLSX file parsing
  const parseXLSX = (file) => {
    return new Promise((resolve) => {
      const data = [];
      readXlsxFile(file).then((rows) => {
        const headers = rows[0];

        rows.slice(1).map((row) => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          data.push(rowData);
        });
        resolve(data);
      });
    });
  };

  const uploadFiles = async () => {
    // get the files from the fileList as an array
    let files = data.fileList;

    const recordsArray = [];

    // Loop through each file and parse its content
    for (const file of files) {
      let parsedContent;

      if (file.name.endsWith(".csv")) {
        parsedContent = await parseCSV(file);
      } else if (file.name.endsWith(".xlsx")) {
        parsedContent = await parseXLSX(file);
      }

      // Add the parsed content to the recordsArray
      recordsArray.push(...parsedContent);

      dispatch({ type: "ADD_RECORDS_ARRAY", recordsArray });
    }

    dispatch({ type: "CLEAR_FILE_LIST" });
    window.scroll(0, window.scrollY + 1000);
  };

  // Valid file extensions
  const allowedExtensions = ["xlsx", "csv"];

  // Function to check if a file has a valid extension
  const isValidFile = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(extension);
  };

  return (
    <>
      <div
        className={styles.dropzone}
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragEnter={(e) => handleDragEnter(e)}
        onDragLeave={(e) => handleDragLeave(e)}
      >
        <Image src="/upload.svg" alt="upload" height={50} width={50} />

        <input
          id="fileSelect"
          type="file"
          multiple
          className={styles.files}
          onChange={(e) => handleFileSelect(e)}
        />
        <label htmlFor="fileSelect">You can select multiple Files</label>

        <h3 className={styles.uploadMessage}>
          or drag &amp; drop your files here ⚡️ less than 1MB
        </h3>
      </div>
      {/* Pass the selectect or dropped files as props */}
      <FilePreview fileData={data} />
      {/* Only show upload button after selecting atleast 1 file */}
      {data.fileList.length > 0 && (
        <button className={styles.uploadBtn} onClick={uploadFiles}>
          Upload
        </button>
      )}
    </>
  );
};

export default DropZone;
