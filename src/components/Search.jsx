import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
    return (
        <div className="search">
            <div>
                <img src="/search.svg" alt="Search" />
                <input
                    type="text"
                    placeholder="Busca entre miles de películas"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    />
            </div>
        </div>
    )
}
export default Search
