import { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function ImageSearch({ onSearchStart, onResults }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    searchFaces: true,
    searchSocial: true
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    onSearchStart();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('search_faces', options.searchFaces);
    formData.append('search_social', options.searchSocial);

    try {
      const response = await fetch('/api/search/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.message || errorMsg;
        } catch {
          // use default message
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      onResults(data);
    } catch (error) {
      console.error('Image search failed:', error);
      onResults({
        error: error.message || 'Failed to perform image search',
        standard_results: [],
        face_results: []
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="image-search-container">
      <div style={{ marginBottom: '14px' }}>
        <label className="image-upload-label">
          Upload image or screenshot
        </label>

        <label
          htmlFor="image-upload"
          className={`upload-area ${preview ? 'has-preview' : ''}`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="preview-image"
              onLoad={() => URL.revokeObjectURL(preview)}
            />
          ) : (
            <div className="upload-placeholder">
              <ArrowUpTrayIcon style={{ width: 32, height: 32 }} />
              <p style={{ fontWeight: 500 }}>Click to upload</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)' }}>PNG, JPG, or JPEG (max 5 MB)</p>
            </div>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="search-options">
        <h3>Search options</h3>

        <div className="option-item">
          <input
            type="checkbox"
            id="search-faces"
            checked={options.searchFaces}
            onChange={(e) => setOptions({ ...options, searchFaces: e.target.checked })}
          />
          <label htmlFor="search-faces">
            Detect and search faces
          </label>
        </div>

        <div className="option-item">
          <input
            type="checkbox"
            id="search-social"
            checked={options.searchSocial}
            onChange={(e) => setOptions({ ...options, searchSocial: e.target.checked })}
          />
          <label htmlFor="search-social">
            Include social media results (Instagram, Facebook)
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="redact-btn"
        disabled={!file}
      >
        Reverse image search
      </button>
    </form>
  );
}
