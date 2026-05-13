export default function SearchResults({ results }) {
  if (results.error) {
    return (
      <div className="results-error-banner">
        Search failed: {results.error}
      </div>
    );
  }

  // Video results (mock for now)
  if (results.video) {
    const { title, source, url, matches } = results.video;
    return (
      <div className="results-video">
        <div className="results-video-meta">
          {source && <span className="engine-badge">{source}</span>}
          <h3 className="results-video-title">{title}</h3>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="result-link">
              View full video
            </a>
          )}
        </div>
        {matches?.length > 0 && (
          <ul className="video-match-list">
            {matches.map((match, i) => (
              <li key={i} className="video-match-item">
                <span className="video-match-time">{match.time}</span>
                <span className="video-match-context">{match.context}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Text search results
  if (Array.isArray(results.results)) {
    if (results.results.length === 0) {
      return <div className="results-empty">No sources found for that text.</div>;
    }
    return (
      <div className="results-body">
        <div className="results-group">
          <h3 className="results-group-heading">Sources found</h3>
          <ul className="text-result-list">
            {results.results.map((result, i) => (
              <li key={i} className="text-result-item">
                {result.source && (
                  <span className="text-result-source">{result.source}</span>
                )}
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-result-title result-link"
                >
                  {result.title || result.url}
                </a>
                {result.snippet && (
                  <p className="text-result-snippet">{result.snippet}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Image search results
  const hasFaceResults = results.face_results?.length > 0;
  const hasStandardResults =
    results.standard_results && Object.keys(results.standard_results).length > 0;

  if (!hasFaceResults && !hasStandardResults) {
    return <div className="results-empty">No matches found.</div>;
  }

  return (
    <div className="results-body">
      {hasFaceResults && (
        <div className="results-group">
          <h3 className="results-group-heading">Face matches</h3>
          {results.face_results.map((faceResult, index) => (
            <div key={index} className="results-face-group">
              <div className="results-face-label">
                <span className="face-index">{index + 1}</span>
                Face {index + 1}
              </div>
              <div className="engine-grid">
                {Object.entries(faceResult.results).map(([engine, engineResults]) => (
                  <EngineSection key={engine} engine={engine} results={engineResults} maxItems={3} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasStandardResults && (
        <div className="results-group">
          <h3 className="results-group-heading">Image matches</h3>
          <div className="engine-grid">
            {Object.entries(results.standard_results).map(([engine, engineResults]) => (
              <EngineSection key={engine} engine={engine} results={engineResults} maxItems={5} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EngineSection({ engine, results, maxItems }) {
  const firstError = Array.isArray(results) && results.length === 1 && results[0]?.error;

  return (
    <div className="result-engine-section">
      <span className="engine-badge">{engine}</span>
      {firstError ? (
        <p className="result-error">{firstError}</p>
      ) : !Array.isArray(results) || results.length === 0 ? (
        <p className="result-error">No results found.</p>
      ) : (
        <ul className="result-list">
          {results.slice(0, maxItems).map((result, idx) => (
            <li key={idx} className="result-item">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="result-link"
              >
                {result.title || result.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
