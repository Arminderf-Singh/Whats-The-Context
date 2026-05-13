import { useState, useRef, useEffect } from 'react';
import {
  BookOpenIcon,
  FilmIcon,
  NewspaperIcon,
  AcademicCapIcon,
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

export default function TextSearch({ onSearchStart, onResults }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState({
    article: true,
    book: true,
    video: true,
    movie: true,
    study: true,
    social: true
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const sourceIcons = {
    article: <NewspaperIcon className="icon" />,
    book: <BookOpenIcon className="icon" />,
    video: <FilmIcon className="icon" />,
    movie: <FilmIcon className="icon" />,
    study: <AcademicCapIcon className="icon" />,
    social: <CameraIcon className="icon" />
  };

  const handleSourceToggle = (source) => {
    setSelectedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    onSearchStart();
    try {
      const response = await fetch('/api/search/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sources: Object.keys(selectedSources).filter(key => selectedSources[key])
        })
      });
      const data = await response.json();
      onResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      onResults({ results: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="textsearch-form">
      {/* textarea and controls */}
      <div className="input-wrapper">
        <label htmlFor="text-input">Search for Text Origins</label>
        <textarea
          id="text-input"
          ref={textareaRef}
          maxLength={500}
          className="text-input"
          placeholder="Paste text, quote, or phrase to find its original source..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* filter toggles */}
      <div className="source-filter">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="filter-toggle"
        >
          Filter by Source Type
          {isExpanded ? (
            <ChevronUpIcon className="icon-chevron" />
          ) : (
            <ChevronDownIcon className="icon-chevron" />
          )}
        </button>

        {isExpanded && (
          <div className="source-options">
            {Object.keys(selectedSources).map(source => (
              <button
                key={source}
                type="button"
                className={`source-button ${selectedSources[source] ? 'active' : ''}`}
                onClick={() => handleSourceToggle(source)}
              >
                <div>{sourceIcons[source]}</div>
                <span>{source}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* submit */}
      <button
        type="submit"
        className={`submit-button ${text.trim() && !isLoading ? 'enabled' : 'disabled'}`}
        disabled={!text.trim() || isLoading}
      >
        {isLoading ? 'Searching...' : text.trim() ? 'Find original source' : 'Enter text to search'}
      </button>
    </form>
  );
}
