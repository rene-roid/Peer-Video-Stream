import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface File {
  _id: string;
  filename: string;
  path: string;
  size: number;
  uploadedAt: string;
}

interface FileListProps {
  onFileSelect: (filePath: string) => void;
}

const FileList: React.FC<FileListProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/mongo/files');
        setFiles(response.data);
      } catch (err) {
        setError('Failed to load files.');
        console.error(err);
      }
    };
    fetchFiles();
  }, []);

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="file-list-container">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div>
          <h2 className="file-select-title">Select a Video to Play:</h2>
          <ul className="file-list">
            {files.map(file => (
              <li key={file._id} className="file-item">
                {file.filename} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                <button className="select-button" onClick={() => onFileSelect(file._id)}>Select</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
};

export default FileList;