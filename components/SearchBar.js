import Image from 'next/image'

export default function SearchBar({ username, setUsername, onSearch, suggestions, showSuggestions, onSuggestionClick }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(username)
  }

  return (
    <div className="search-wrapper">
      <form onSubmit={handleSubmit} className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Start typing a GitHub username... (e.g., torvalds, gaearon)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="suggestion-item"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <Image
                src={suggestion.avatar_url}
                alt={suggestion.login}
                width={50}
                height={50}
                className="suggestion-avatar"
              />
              <div className="suggestion-info">
                <div className="suggestion-name">{suggestion.login}</div>
                {suggestion.type && (
                  <div className="suggestion-username">{suggestion.type}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && username && suggestions.length === 0 && (
        <div className="suggestions-dropdown">
          <div className="no-suggestions">No users found</div>
        </div>
      )}
    </div>
  )
}
