import React from 'react';
import { saveAs } from 'file-saver';

const CodeDownloader = (prop) => {
  const handleDownload = () => {
    const file = new Blob([prop.data], { type: 'text/plain;charset=utf-8' });
    saveAs(file, prop.filename);
  };

  return (
    <button onClick={handleDownload}>
      Download
    </button>
  );
};

export default CodeDownloader;