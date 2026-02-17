export default function LanguageStats({ languages }) {
  if (languages.length === 0) {
    return <p className="language-empty">No language data in public repos.</p>
  }

  return (
    <div className="language-stats">
      {languages.map(([language, count]) => (
        <div key={language} className="language-item">
          {language}<strong>{count} {count === 1 ? 'repo' : 'repos'}</strong>
        </div>
      ))}
    </div>
  )
}
