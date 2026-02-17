import Image from 'next/image'

export default function UserProfile({ user }) {
  return (
    <div>
      <div className="profile-header">
        <Image
          src={user.avatar_url}
          alt={user.name || user.login}
          width={150}
          height={150}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h2>{user.name || user.login}</h2>
          <p className="profile-username">@{user.login}</p>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          {user.location && <p className="profile-bio">📍 {user.location}</p>}
          {user.blog && (
            <p className="profile-bio">
              🔗 <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                   target="_blank"
                   rel="noopener noreferrer">
                {user.blog}
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-number">{user.public_repos}</div>
          <div className="stat-label">Repositories</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{user.followers}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{user.following}</div>
          <div className="stat-label">Following</div>
        </div>
      </div>
    </div>
  )
}
