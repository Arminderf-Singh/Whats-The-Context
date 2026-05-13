import { useState, useEffect } from 'react';
import { ArrowUpTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import TextSearch from './components/TextSearch';
import ImageSearch from './components/ImageSearch';
import SearchResults from './components/SearchResults';

function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState('url');
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  // Animate: scroll-reveal for below-fold sections
  useEffect(() => {
    const targets = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  const handleResults = (data) => {
    setResults(data);
    setLoading(false);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults({
        video: {
          title: "Full video context found",
          source: "YouTube",
          url: "https://youtube.com/full-video",
          matches: [
            { time: "2:15", context: "Introduction to the main topic" },
            { time: "5:42", context: "Detailed explanation of concept" }
          ]
        }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <main>
      {/* Navigation */}
      <nav aria-label="Main navigation">
        <a href="/" className="logo">
          <div className="logo-mark">
            <MagnifyingGlassIcon style={{ width: 15, height: 15, color: 'white', strokeWidth: 2.5 }} />
          </div>
          <span>WhatsTheContext</span>
        </a>

        <div className="nav-links">
          <a href="#search">How it works</a>
          <a href="#">API</a>
          <a href="#">Pricing</a>
        </div>

        <div className="nav-right">
          <a href="#" className="btn btn-login">Sign in</a>
          <a href="#search" className="btn btn-download">Try it free</a>
        </div>
      </nav>

      {/* Hero — CSS entrance animations, no observer needed (above fold) */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">Media provenance tool</span>
          <h1>Find where it <em>came from.</em></h1>
          <p>Paste a quote, upload an image, or link a video clip. We trace it back to the original source so you have the full picture.</p>
          <div className="hero-actions">
            <a href="#search" className="btn btn-download">Start searching</a>
            <a href="#" className="btn btn-login">Read the docs</a>
          </div>
        </div>
      </section>

      {/* Features — scroll-revealed with staggered delays */}
      <section className="features">
        <div className="features-inner">
          <div className="section-header" data-reveal>
            <span className="section-eyebrow">Capabilities</span>
            <h2>Three ways to trace it</h2>
            <p>Whether you encountered a suspicious quote, an image circulating without context, or a viral clip: we find where it came from.</p>
          </div>

          <div className="features-list">
            <div className="feature-item" data-reveal>
              <span className="feature-num">01</span>
              <h3>Quote origins</h3>
              <p>Paste any quote to find where it was first said, by whom, and in what context.</p>
            </div>

            <div className="feature-item" data-reveal data-delay="1">
              <span className="feature-num">02</span>
              <h3>Video provenance</h3>
              <p>Upload or link a clip to find the full video it came from and the original broadcast.</p>
            </div>

            <div className="feature-item" data-reveal data-delay="2">
              <span className="feature-num">03</span>
              <h3>Reverse image lookup</h3>
              <p>Find every place an image has appeared and trace it to the earliest known upload.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search — scroll-revealed */}
      <section id="search" className="search-section">
        <div className="section-header" data-reveal>
          <span className="section-eyebrow">Search</span>
          <h2>Find the context</h2>
          <p>Search for the original source in seconds.</p>
        </div>

        <div className="search-container" data-reveal data-delay="1">
          <div className="search-tabs" role="tablist" aria-label="Search type">
            <div
              role="tab"
              aria-selected={activeTab === 'text'}
              tabIndex={activeTab === 'text' ? 0 : -1}
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('text')}
            >
              Text search
            </div>
            <div
              role="tab"
              aria-selected={activeTab === 'image'}
              tabIndex={activeTab === 'image' ? 0 : -1}
              className={`tab ${activeTab === 'image' ? 'active' : ''}`}
              onClick={() => setActiveTab('image')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('image')}
            >
              Reverse image
            </div>
            <div
              role="tab"
              aria-selected={activeTab === 'video'}
              tabIndex={activeTab === 'video' ? 0 : -1}
              className={`tab ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('video')}
            >
              Video context
            </div>
          </div>

          <div className="tab-content" role="tabpanel" aria-live="polite">
            {/* Animate: key forces re-mount on tab switch, triggering the revealUp animation */}
            <div className="tab-content-inner" key={activeTab}>
              {activeTab === 'text' ? (
                <TextSearch
                  onSearchStart={() => setLoading(true)}
                  onResults={handleResults}
                />
              ) : activeTab === 'image' ? (
                <ImageSearch
                  onSearchStart={() => setLoading(true)}
                  onResults={handleResults}
                />
              ) : (
                <div className="video-tab-content">
                  <h3>Video clip context</h3>
                  <p>Find the original source of a video clip by URL or upload.</p>

                  <div className="method-tabs">
                    <button
                      className={`method-tab ${activeMethod === 'url' ? 'active' : ''}`}
                      onClick={() => setActiveMethod('url')}
                    >
                      Paste URL
                    </button>
                    <button
                      className={`method-tab ${activeMethod === 'upload' ? 'active' : ''}`}
                      onClick={() => setActiveMethod('upload')}
                    >
                      Upload video
                    </button>
                  </div>

                  <form onSubmit={handleVideoSubmit}>
                    {activeMethod === 'url' ? (
                      <div className="video-search-form">
                        <input
                          type="text"
                          className="search-input"
                          placeholder="Paste a video URL (YouTube, TikTok, etc.)"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="search-btn"
                          disabled={!videoUrl.trim()}
                        >
                          {loading ? 'Searching...' : 'Find full video'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="video-upload" className="video-upload-area">
                          {videoPreview ? (
                            <video src={videoPreview} className="video-preview" controls />
                          ) : (
                            <div className="video-upload-placeholder">
                              <ArrowUpTrayIcon style={{ width: 32, height: 32 }} />
                              <p style={{ fontWeight: 500 }}>Click to upload video</p>
                              <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>MP4 or MOV (max 50 MB)</p>
                            </div>
                          )}
                          <input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="submit"
                          className="search-btn"
                          disabled={!videoFile}
                        >
                          {loading ? 'Searching...' : 'Find full video'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {results && (
        <section className="results-section">
          <div className="section-header">
            <h2>Results</h2>
          </div>
          <div className="results-container">
            <SearchResults results={results} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer>
        <div className="footer-links">
          <a href="#">Privacy policy</a>
          <a href="#">Terms of service</a>
          <a href="#">Contact</a>
          <a href="#">API docs</a>
        </div>
        <p>© 2025 WhatsTheContext</p>
      </footer>
    </main>
  );
}

export default App;
