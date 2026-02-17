'use client'

import { useState, useEffect, useRef } from 'react'
import SearchBar from '@/components/SearchBar'
import UserProfile from '@/components/UserProfile'
import RepoCard from '@/components/RepoCard'
import LanguageStats from '@/components/LanguageStats'

export default function Home() {
  const [username, setUsername] = useState('')
  const [userData, setUserData] = useState(null)
  const [repos, setRepos] = useState([])
  const [displayedRepos, setDisplayedRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [reposPerPage] = useState(12)
  const [currentPage, setCurrentPage] = useState(1)
  const debounceTimer = useRef(null)

  const fetchSuggestions = async (searchTerm) => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([])
      return
    }
    try {
      const response = await fetch(`https://api.github.com/search/users?q=${searchTerm}&per_page=8`)
      const data = await response.json()
      setSuggestions(data.items || [])
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setSuggestions([])
    }
  }

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (username) {
        fetchSuggestions(username)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [username])

  const fetchUserData = async (user) => {
    setLoading(true)
    setError(null)
    setShowSuggestions(false)
    setSuggestions([])
    try {
      const userResponse = await fetch(`https://api.github.com/users/${user}`)
      if (!userResponse.ok) throw new Error('User not found')
      const userData = await userResponse.json()
      const totalRepos = userData.public_repos
      const perPage = 100
      const pages = Math.ceil(totalRepos / perPage)
      let allRepos = []
      for (let page = 1; page <= pages; page++) {
        const reposResponse = await fetch(
          `https://api.github.com/users/${user}/repos?sort=updated&per_page=${perPage}&page=${page}`
        )
        const reposData = await reposResponse.json()
        allRepos = [...allRepos, ...reposData]
      }
      setUserData(userData)
      setRepos(allRepos)
      setCurrentPage(1)
      setDisplayedRepos(allRepos.slice(0, reposPerPage))
    } catch (err) {
      setError(err.message)
      setUserData(null)
      setRepos([])
      setDisplayedRepos([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchUsername) => {
    if (searchUsername.trim()) {
      setUsername(searchUsername.trim())
      fetchUserData(searchUsername.trim())
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setUsername(suggestion.login)
    fetchUserData(suggestion.login)
  }

  const loadMoreRepos = () => {
    const nextPage = currentPage + 1
    const endIndex = nextPage * reposPerPage
    setDisplayedRepos(repos.slice(0, endIndex))
    setCurrentPage(nextPage)
  }

  // All languages used across repos (for recruiters – no limit)
  const getLanguageStats = () => {
    const languages = {}
    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })
    return Object.entries(languages).sort((a, b) => b[1] - a[1])
  }

  return (
    <div>
      <header className="header">
        <h1>Profile viewer</h1>
        <p>See what a developer has built — repos, languages, and activity at a glance</p>
      </header>

      <div className="container">
        <SearchBar
          username={username}
          setUsername={setUsername}
          onSearch={handleSearch}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          onSuggestionClick={handleSuggestionClick}
        />

        {loading && <div className="loading">Loading profile…</div>}
        {error && <div className="error">{error}</div>}

        {userData && !loading && (
          <div className="profile-container">
            <UserProfile user={userData} />

            <div className="profile-content">
              {displayedRepos.length > 0 && (
                <>
                  <h2 className="section-title">Repositories ({repos.length})</h2>
                  <div className="repos-grid">
                    {displayedRepos.map((repo) => (
                      <RepoCard key={repo.id} repo={repo} />
                    ))}
                  </div>
                  {displayedRepos.length < repos.length && (
                    <div className="load-more-container">
                      <button type="button" onClick={loadMoreRepos} className="load-more-button">
                        Load more ({repos.length - displayedRepos.length} remaining)
                      </button>
                    </div>
                  )}

                  <h2 className="section-title">All languages used</h2>
                  <p className="section-subtitle">
                    Every language across their public repos — useful for recruiters and hiring.
                  </p>
                  <LanguageStats languages={getLanguageStats()} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
