// Ensures the script executes only after the DOM (HTML structure) is fully loaded.
// Prevents errors caused by trying to access DOM elements before they're available.
document.addEventListener("DOMContentLoaded", () => {
  // Base URL for the Art Institute of Chicago API.
  const apiUrl = 'https://api.artic.edu/api/v1/artworks';

  // Input field where users enter their search terms.
  const searchInput = document.getElementById('search-input');

  // Button to trigger a search when clicked.
  const searchButton = document.getElementById('search-button');

  // Container where search results will be displayed.
  const resultsDiv = document.querySelector('.artworks-container');

  // Validates that the required DOM elements are present.
  // If any element is missing, logs an error and stops further execution to prevent runtime errors.
  if (!searchInput || !searchButton || !resultsDiv) {
    console.error("One or more required DOM elements are missing!");
    return;
  }

  // Asynchronous function to fetch data from the API based on the search query.
  async function fetchArtworks(query = '') {
    const limit = 10; // Specifies the number of results to retrieve.

    // Constructs the API request URL:
    // - `q=${encodeURIComponent(query)}`: Encodes the search query to ensure it's safely included in the URL.
    // - `query[term][is_public_domain]=true`: Filters results to include only public domain artworks.
    // - `fields=id,title,image_id,artist_title`: Specifies the fields to retrieve in the response.
    // - `limit=${limit}`: Restricts the number of results returned.
    try {
      const response = await fetch(
        `${apiUrl}/search?q=${encodeURIComponent(query)}&query[term][is_public_domain]=true&fields=id,title,image_id,artist_title&limit=${limit}`
      );

      const data = await response.json();

      // If valid results are returned, display them; otherwise, show a "no results" message.
      if (data.data && data.data.length > 0) {
        displayArtworks(data.data);
      } else {
        resultsDiv.innerHTML = `<p>No results found. Try a different query.</p>`;
      }
    } catch (error) {
      // Handles errors during the fetch request and provides feedback to the user.
      console.error("Error fetching data:", error);
      resultsDiv.innerHTML = `<p>Something went wrong. Please try again.</p>`;
    }
  }

  // Function to display artwork information as HTML elements.
  function displayArtworks(artworks) {
    resultsDiv.innerHTML = ''; // Clears previous search results.

    // If no artworks are returned, displays a "no results" message.
    if (artworks.length === 0) {
      resultsDiv.innerHTML = `<p>No results found.</p>`;
      return;
    }

    // Loops through each artwork and creates a card for it.
    artworks.forEach(artwork => {
      const artCard = document.createElement('div');
      artCard.className = 'art-card';

      // Generates a valid image URL if `image_id` exists; otherwise, uses a placeholder image.
      const imageUrl = artwork.image_id
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`
        : 'https://via.placeholder.com/200x200?text=No+Image';

      // Provides alt text for accessibility:
      // - Includes the title and artist name if available.
      // - Defaults to "Artwork with no title" or "Unknown Artist" if data is missing.
      const altText = artwork.title
        ? `${artwork.title} by ${artwork.artist_title || 'Unknown Artist'}`
        : 'Artwork with no title';

      // Populates the artwork card with an image, title, and artist information.
      artCard.innerHTML = `
        <img src="${imageUrl}" alt="${altText}">
        <h3>${artwork.title || 'Untitled'}</h3>
        <p>Artist: ${artwork.artist_title || 'Unknown'}</p>
      `;

      // Add click event to fetch and display detailed info
      artCard.addEventListener('click', () => {
        fetchArtworkDetails(artwork.id);
      });

      resultsDiv.appendChild(artCard); // Adds the card to the results container.
    });
  }

  // Fetch and display detailed artwork information in a modal
  async function fetchArtworkDetails(artworkId) {
    try {
      const response = await fetch(`${apiUrl}/${artworkId}`);
      const data = await response.json();
      const artwork = data.data;

      const modalContent = `
        <h2>${artwork.title || 'Untitled'}</h2>
        <p><strong>Artist:</strong> ${artwork.artist_title || 'Unknown Artist'}</p>
        <p><strong>Date:</strong> ${artwork.date_display || 'Unknown Date'}</p>
        <p><strong>Medium:</strong> ${artwork.medium_display || 'Unknown Medium'}</p>
        <p><strong>Credit Line:</strong> ${artwork.credit_line || 'N/A'}</p>
        <p><strong>Place of Origin:</strong> ${artwork.place_of_origin || 'Unknown'}</p>
        <p><strong>Gallery:</strong> ${artwork.gallery_title || 'N/A'}</p>
        <img src="https://www.artic.edu/iiif/2/${artwork.image_id}/full/800,/0/default.jpg" alt="${artwork.title}">
      `;

      showModal(modalContent);
    } catch (error) {
      console.error("Error fetching artwork details:", error);
    }
  }

  // Display a modal with the provided content
  function showModal(content) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        ${content}
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  }


  // Initial fetch to display public domain artworks on page load.
  fetchArtworks();

  // Captures the search term entered by the user and triggers a fetch.
  // If the input is empty, displays a prompt for the user to enter a search term.
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      fetchArtworks(query);
    } else {
      resultsDiv.innerHTML = `<p>Please enter a search term.</p>`;
    }
  });
});