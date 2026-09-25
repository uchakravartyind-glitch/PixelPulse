const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");

// Optional Enhancement: Result count message element
const statusMessage = document.createElement("p");
statusMessage.className = "status-message";
resultsContainer.parentNode.insertBefore(statusMessage, resultsContainer);

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();

  // 1. Ignore empty searches
  if (!query) return;

  // Clear previous results and status
  resultsContainer.innerHTML = "";
  statusMessage.textContent = "Loading...";

  // 2. Build URL and fetch data
  const apiUrl =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle empty or missing page results
    if (!data.query || !data.query.pages) {
      statusMessage.textContent = `No results found for "${query}".`;
      return;
    }

    const items = Object.values(data.query.pages);

    // Enhancement: Display result count
    statusMessage.textContent = `Showing ${items.length} results for "${query}"`;

    // 3. Render results
    renderCards(items);
  } catch (error) {
    console.error("Fetch error:", error);
    statusMessage.textContent = "Failed to fetch images. Please try again.";
  }
});

function renderCards(items) {
  items.forEach((item) => {
    // Ensure image info exists
    if (!item.imageinfo || !item.imageinfo[0]) return;

    const imgData = item.imageinfo[0];

    const card = document.createElement("article");
    card.className = "card";

    // Enhancement: Click card to open image in a new tab
    card.addEventListener("click", () => {
      if (imgData.descriptionurl) {
        window.open(imgData.descriptionurl, "_blank");
      }
    });

    const img = document.createElement("img");
    img.src = imgData.thumburl;
    img.alt = item.title;

    const caption = document.createElement("p");
    caption.textContent = item.title.replace(/^File:/, ""); // Clean up "File:" prefix

    card.appendChild(img);
    card.appendChild(caption);
    resultsContainer.appendChild(card);
  });
}