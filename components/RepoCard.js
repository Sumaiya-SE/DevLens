function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Updated today'
  if (diffDays === 1) return 'Updated yesterday'
  if (diffDays < 30) return `Updated ${diffDays} days ago`
  if (diffDays < 365) return `Updated ${Math.floor(diffDays / 30)} months ago`
  return `Updated ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function RepoCard({ repo }) {
  const updated = repo.updated_at ? formatDate(repo.updated_at) : ''

  return (
    <div className="repo-card-wrapper">
      <div className="repo-card">
        <span className="repo-name">{repo.name}</span>

        {repo.description && (
          <p className="repo-description">
            {repo.description.length > 120
              ? repo.description.substring(0, 120) + '…'
              : repo.description}
          </p>
        )}

        <div className="repo-stats">
          {repo.language && <span className="language-badge">{repo.language}</span>}
          <span className="repo-stat">★ {repo.stargazers_count}</span>
          <span className="repo-stat">⎇ {repo.forks_count}</span>
        </div>
        {updated && <p className="repo-date">{updated}</p>}
      </div>
    </div>
  )
}
