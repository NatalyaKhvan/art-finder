document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = 'https://api.artic.edu/api/v1/artworks';
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsDiv = document.querySelector('.artworks-container');
  
    if (!searchInput || !searchButton || !resultsDiv) {
      console.error("One or more required DOM elements are missing!");
      return;
    }
  
    async function fetchArtworks(query = '') {
      try {
        const response = await fetch(`${apiUrl}/search?q=${query}&fields=id,title,image_id,artist_title`);
        const data = await response.json();
        displayArtworks(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        resultsDiv.innerHTML = `<p>Something went wrong. Please try again.</p>`;
      }
    }
  
    function displayArtworks(artworks) {
      resultsDiv.innerHTML = '';
      if (artworks.length === 0) {
          resultsDiv.innerHTML = `<p>No results found.</p>`;
          return;
      }
  
      artworks.forEach(artwork => {
          const artCard = document.createElement('div');
          artCard.className = 'art-card';
  
          const imageUrl = artwork.image_id
              ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`
              : 'https://via.placeholder.com/200x200?text=No+Image';
  
          const altText = artwork.title 
              ? `${artwork.title} by ${artwork.artist_title || 'Unknown Artist'}`
              : 'Artwork with no title';
  
          artCard.innerHTML = `
              <img src="${imageUrl}" alt="${altText}">
              <h3>${artwork.title}</h3>
              <p>Artist: ${artwork.artist_title || 'Unknown'}</p>
          `;
          resultsDiv.appendChild(artCard);
      });
  }
  
  
    fetchArtworks(); // Initial fetch
  
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        fetchArtworks(query);
      }
    });
  });
  