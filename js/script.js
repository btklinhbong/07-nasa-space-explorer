// `const` creates a variable that will not be reassigned later.
// `document.getElementById(...)` finds one element by its `id` in HTML.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalVideo = document.getElementById('modalVideo');
const modalVideoFallback = document.getElementById('modalVideoFallback');
const spaceFact = document.getElementById('spaceFact');

// Array with 5 interesting facts about space.
const spaceFacts = [
	'One day on Venus is longer than one year on Venus.',
	'Neutron stars can spin at a rate of hundreds of times each second.',
	'Jupiter has the shortest day of all planets, about 10 hours.',
	'The footprints on the Moon can last for millions of years.',
	'The Sun contains about 99.8% of the total mass in our solar system.'
];

// Pick one random fact and display it in the space fact div.
function showRandomSpaceFact() {
	// Math.random() gives a decimal from 0 up to (but not including) 1.
	// Multiplying by array length and using Math.floor gives a valid index.
	const randomIndex = Math.floor(Math.random() * spaceFacts.length);
	const randomFact = spaceFacts[randomIndex];
	spaceFact.textContent = `🌌 Space Fact: ${randomFact}`;
}

// `document.querySelector(...)` finds the first element that matches a CSS selector.
const getImagesButton = document.querySelector('.filters button');

// We keep a copy of rendered image objects so each card can open the right modal data.
let currentImageItems = [];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Show one random space fact as soon as the app loads.
showRandomSpaceFact();

// Convert YouTube URLs to embeddable iframe format.
// NASA APOD provides URLs like: https://www.youtube.com/watch?v=xxxxx
// But iframes need: https://www.youtube.com/embed/xxxxx
function getEmbeddableVideoUrl(youtubeUrl) {
	// If URL contains "watch?v=", extract the video ID and convert it.
	const watchMatch = youtubeUrl.match(/watch\?v=([a-zA-Z0-9_-]+)/);
	if (watchMatch) {
		const videoId = watchMatch[1];
		return `https://www.youtube.com/embed/${videoId}`;
	}

	// If URL is already in embed format or another format, return as-is.
	return youtubeUrl;
}

// Show a loading message while we wait for the API response.
function renderLoadingMessage() {
	gallery.innerHTML = `
		<div class="placeholder">
			<p>🔄 Loading space photos...</p>
		</div>
	`;
}

// Show a message in the gallery if something goes wrong.
function renderErrorMessage(message) {
	gallery.innerHTML = `
		<div class="placeholder">
			<p>${message}</p>
		</div>
	`;
}

// Use `.map()` to turn each APOD object into an HTML card string.
function renderGalleryCards(apodData) {
	// Keep all APOD items (images + videos) so we can render either type.
	currentImageItems = apodData;

	if (apodData.length === 0) {
		renderErrorMessage('No results for this date range.');
		return;
	}

	// `.map(...)` transforms each object into an HTML string card.
	// `.join('')` combines all card strings into one big HTML string.
	const cardsHtml = apodData
		.map(
			(item, index) => `
				<article class="gallery-item" data-index="${index}">
					${
						// Ternary operator:
						// if media_type is "video", render an iframe with converted URL
						// else, render a normal image
						item.media_type === 'video'
							? `<iframe src="${getEmbeddableVideoUrl(item.url)}" title="${item.title}" loading="lazy" allowfullscreen></iframe>`
							: `<img src="${item.url}" alt="${item.title}" loading="lazy" />`
					}
					<p><strong>${item.title}</strong></p>
					<p><strong>Type:</strong> ${item.media_type}</p>
					<p>${item.date}</p>
				</article>
			`
		)
		.join('');

	// `innerHTML` inserts that final HTML string into the gallery container.
	gallery.innerHTML = cardsHtml;
}

// Put one APOD object into the modal fields and show the modal.
function openModal(apodItem) {
	modalTitle.textContent = apodItem.title;
	modalDate.textContent = apodItem.date;
	modalExplanation.textContent = apodItem.explanation;

	// Check if this item is a video or an image.
	// If media_type is 'video', show the iframe with converted URL and hide the image.
	// If media_type is 'image', show the image and hide the iframe.
	if (apodItem.media_type === 'video') {
		const embeddableUrl = getEmbeddableVideoUrl(apodItem.url);
		modalVideo.src = embeddableUrl;
		modalVideo.style.display = 'block';
		modalImage.style.display = 'none';

		// Provide a fallback link in case the iframe doesn't load.
		// This gives users a direct link to the video on YouTube.
		modalVideoFallback.innerHTML = `
			If the video doesn't load, <a href="${apodItem.url}" target="_blank">watch it on YouTube</a>.
		`;
		modalVideoFallback.style.display = 'block';
	} else {
		// Some APOD entries may not have hdurl, so we fall back to url.
		modalImage.src = apodItem.hdurl || apodItem.url;
		modalImage.alt = apodItem.title;
		modalImage.style.display = 'block';
		modalVideo.style.display = 'none';
		modalVideoFallback.style.display = 'none';
	}

	imageModal.classList.remove('hidden');
}

// Hide modal and clear image/video src so the browser can release memory.
function closeModal() {
	imageModal.classList.add('hidden');
	modalImage.src = '';
	modalVideo.src = '';
	modalVideoFallback.innerHTML = '';
}

// `async` means this function can use `await` for asynchronous code.
// Parameters (`startDate`, `endDate`) are values passed into the function.
async function getNasaData(startDate, endDate) {
	// `window.APP_CONFIG` comes from js/config.js.
	// `?.` is optional chaining: it safely checks NASA_API_KEY without crashing
	// if APP_CONFIG is missing.
	const apiKey = window.APP_CONFIG?.NASA_API_KEY;

	// If no key is set (or placeholder is still there), stop early.
	if (!apiKey || apiKey === 'PASTE_YOUR_NASA_API_KEY_HERE') {
		console.error('Add your NASA API key in js/config.js before fetching data.');
		return;
	}

	// Template literal uses backticks and `${...}` to insert variables into a string.
	const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

	// `try/catch` handles errors from network requests or JSON parsing.
	try {
		// Show loading state first so users know the app is working.
		renderLoadingMessage();

		// `await` pauses inside this async function until fetch finishes.
		const response = await fetch(apodUrl);

		// `response.ok` is true for HTTP status 200-299.
		if (!response.ok) {
			// `throw` creates a custom error so `catch` can handle it.
			throw new Error(`NASA request failed with status ${response.status}`);
		}

		// Convert response body from JSON text into a JavaScript object/array.
		const rawData = await response.json();

		// For consistency, always store the result as an array.
		const apodData = Array.isArray(rawData) ? rawData : [rawData];

		// For learning: show the final API data in the browser console.
		console.log('APOD API result array:', apodData);

		// Build and insert all cards into the gallery.
		renderGalleryCards(apodData);
	} catch (error) {
		// Runs if anything inside `try` fails.
		console.error('Could not fetch APOD data:', error);
		renderErrorMessage('Could not load space photos. Please try again.');
	}
}

// `addEventListener` runs this function every time the button is clicked.
// `() => { ... }` is an arrow function (short syntax for a function).
getImagesButton.addEventListener('click', () => {
	// `.value` reads the currently selected date text from each input.
	const startDate = startInput.value;
	const endDate = endInput.value;

	// `!value` means "value is empty".
	if (!startDate || !endDate) {
		console.error('Please select both a start date and an end date.');
		return;
	}

	// Call our async function and pass the selected dates into it.
	getNasaData(startDate, endDate);
});

// Event delegation: listen once on gallery, then detect which card was clicked.
gallery.addEventListener('click', (event) => {
	const clickedCard = event.target.closest('.gallery-item');

	if (!clickedCard) {
		return;
	}

	// dataset values are strings, so convert to number with Number(...).
	const itemIndex = Number(clickedCard.dataset.index);
	const selectedItem = currentImageItems[itemIndex];

	if (!selectedItem) {
		return;
	}

	openModal(selectedItem);
});

// Close button inside modal.
modalClose.addEventListener('click', closeModal);

// Close when user clicks the dark overlay outside modal content.
imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		closeModal();
	}
});

// Close when user presses Escape key.
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !imageModal.classList.contains('hidden')) {
		closeModal();
	}
});
