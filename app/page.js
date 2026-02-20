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
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const debounceTimer = useRef(null)

  // Helper function to create authenticated API headers
  const getAuthHeaders = () => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN
    const headers = {}
    if (token && token !== 'your_github_token_here') {
      headers['Authorization'] = `token ${token}`
    }
    return headers
  }

  const fetchSuggestions = async (searchTerm) => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([])
      return
    }
    try {
      const response = await fetch(
        `https://api.github.com/search/users?q=${searchTerm}&per_page=8`,
        { headers: getAuthHeaders() }
      )
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

  // Fetch all languages for a single repository
  const fetchRepoLanguages = async (owner, repoName) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/languages`,
        { headers: getAuthHeaders() }
      )
      if (!response.ok) return []
      const languagesData = await response.json()
      // Return array of language names (sorted by usage, most used first)
      return Object.keys(languagesData).sort((a, b) => languagesData[b] - languagesData[a])
    } catch (err) {
      console.error(`Error fetching languages for ${owner}/${repoName}:`, err)
      return []
    }
  }

  const fetchUserData = async (user) => {
    setLoading(true)
    setError(null)
    setShowSuggestions(false)
    setSuggestions([])
    try {
      const userResponse = await fetch(
        `https://api.github.com/users/${user}`,
        { headers: getAuthHeaders() }
      )
      console.log('API Response Status:', userResponse.status, 'for user:', user)
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        console.log('API Error Response:', errorData)
        throw new Error(errorData.message || `User not found (Status: ${userResponse.status})`)
      }
      
      const userData = await userResponse.json()
      const totalRepos = userData.public_repos
      const perPage = 100
      const pages = Math.ceil(totalRepos / perPage)
      let allRepos = []
      
      // First, fetch all repositories
      for (let page = 1; page <= pages; page++) {
        const reposResponse = await fetch(
          `https://api.github.com/users/${user}/repos?sort=updated&per_page=${perPage}&page=${page}`,
          { headers: getAuthHeaders() }
        )
        if (!reposResponse.ok) {
          console.warn(`Failed to fetch repos page ${page}:`, reposResponse.status)
          continue
        }
        const reposData = await reposResponse.json()
        allRepos = [...allRepos, ...reposData]
      }
      
      // Then, fetch languages for each repository (in batches to avoid rate limits)
      const batchSize = 10
      const reposCount = allRepos.length
      const reposWithLanguages = []
      
      for (let i = 0; i < reposCount; i += batchSize) {
        const batch = allRepos.slice(i, i + batchSize)
        const languagesPromises = batch.map(async (repo) => {
          const languages = await fetchRepoLanguages(user, repo.name)
          return {
            ...repo,
            languages: languages.length > 0 ? languages : (repo.language ? [repo.language] : [])
          }
        })
        const batchResults = await Promise.all(languagesPromises)
        reposWithLanguages.push(...batchResults)
        
        // Small delay between batches to be respectful of rate limits
        if (i + batchSize < reposCount) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      setUserData(userData)
      setRepos(reposWithLanguages)
      setSelectedLanguage('all')
      setCurrentPage(1)
      setDisplayedRepos(reposWithLanguages.slice(0, reposPerPage))
    } catch (err) {
      console.error('Error fetching user data:', err)
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
    const filteredRepos = getFilteredRepos()
    const nextPage = currentPage + 1
    const endIndex = nextPage * reposPerPage
    setDisplayedRepos(filteredRepos.slice(0, endIndex))
    setCurrentPage(nextPage)
  }

  // Get unique languages from repos (including all languages from each repo)
  const getUniqueLanguages = () => {
    const languages = new Set()
    repos.forEach((repo) => {
      if (repo.languages && repo.languages.length > 0) {
        repo.languages.forEach(lang => languages.add(lang))
      } else if (repo.language) {
        // Fallback to primary language if languages array doesn't exist
        languages.add(repo.language)
      }
    })
    return Array.from(languages).sort()
  }

  // Filter repos based on selected language (check if repo has the language)
  const getFilteredRepos = () => {
    if (selectedLanguage === 'all') {
      return repos
    }
    return repos.filter((repo) => {
      if (repo.languages && repo.languages.length > 0) {
        return repo.languages.includes(selectedLanguage)
      }
      // Fallback to primary language if languages array doesn't exist
      return repo.language === selectedLanguage
    })
  }

  // Handle language filter change
  const handleLanguageFilterChange = (language) => {
    setSelectedLanguage(language)
    setCurrentPage(1)
  }

  // Update displayed repos when language filter or repos change
  useEffect(() => {
    if (repos.length > 0) {
      const filteredRepos = selectedLanguage === 'all' 
        ? repos 
        : repos.filter((repo) => {
            if (repo.languages && repo.languages.length > 0) {
              return repo.languages.includes(selectedLanguage)
            }
            return repo.language === selectedLanguage
          })
      setDisplayedRepos(filteredRepos.slice(0, reposPerPage))
      setCurrentPage(1)
    }
  }, [selectedLanguage, repos, reposPerPage])

  // All languages used across repos (for recruiters – no limit)
  const getLanguageStats = () => {
    const languages = {}
    repos.forEach((repo) => {
      if (repo.languages && repo.languages.length > 0) {
        repo.languages.forEach(lang => {
          languages[lang] = (languages[lang] || 0) + 1
        })
      } else if (repo.language) {
        // Fallback to primary language if languages array doesn't exist
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })
    return Object.entries(languages).sort((a, b) => b[1] - a[1])
  }

  return (
    <div>
      <header className="header">
        <h1>DevLens 🔍</h1>
        <p>See what a developer has built - repos, languages, and activity at a glance</p>
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
              {repos.length > 0 && (
                <>
                  <div className="repos-header">
                    <h2 className="section-title">
                      Repositories ({selectedLanguage === 'all' ? repos.length : getFilteredRepos().length}
                      {selectedLanguage !== 'all' && ` of ${repos.length}`})
                    </h2>
                    {getUniqueLanguages().length > 0 && (
                      <div className="language-filter">
                        <label htmlFor="language-filter" className="filter-label">Filter by language:</label>
                        <select
                          id="language-filter"
                          value={selectedLanguage}
                          onChange={(e) => handleLanguageFilterChange(e.target.value)}
                          className="language-filter-select"
                        >
                          <option value="all">All languages</option>
                          {getUniqueLanguages().map((language) => (
                            <option key={language} value={language}>
                              {language}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {displayedRepos.length > 0 ? (
                    <>
                      <div className="repos-grid">
                        {displayedRepos.map((repo) => (
                          <RepoCard key={repo.id} repo={repo} />
                        ))}
                      </div>
                      {(() => {
                        const filteredRepos = getFilteredRepos()
                        return displayedRepos.length < filteredRepos.length && (
                          <div className="load-more-container">
                            <button type="button" onClick={loadMoreRepos} className="load-more-button">
                              Load more ({filteredRepos.length - displayedRepos.length} remaining)
                            </button>
                          </div>
                        )
                      })()}
                    </>
                  ) : (
                    <div className="no-repos-message">
                      <p>No repositories found for the selected language filter.</p>
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
