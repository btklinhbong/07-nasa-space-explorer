# Project 7: NASA API - Space Explorer App
NASA releases a new "Astronomy Picture of the Day" (APOD) every day—spotlighting breathtaking images of galaxies, stars, planets, and more.

Your task is to build an interactive web app that fetches and displays these photos using [NASA's API](https://api.nasa.gov/). Users will pick a date range and instantly view stunning photos from across the cosmos, along with titles and descriptions.

You'll get to use your skills to build something that's actually connected to real-world data from one of the most iconic organizations in the world.

## Starter Files
- The provided files include a NASA logo, date inputs, a button, a placeholder for your gallery, and basic layout and styling to help you get started.
- It also includes built-in logic (in `dateRange.js`) to handle the valid APOD date range—from June 16, 1995 to today. No need to modify it.
- All your custom JavaScript should go in `script.js`. That's where you'll write the code that fetches data and displays your gallery.

## API Key Setup (Grader Friendly)
- Your private key should stay in `js/config.js`.
- `js/config.js` is ignored by Git in `.gitignore`, so it is not pushed.
- A safe template file is provided in `js/config.example.js`.

To run with your own key:
1. Copy `js/config.example.js` to `js/config.js`.
2. Replace `PASTE_YOUR_NASA_API_KEY_HERE` with your NASA API key.

If `js/config.js` is missing (or still has placeholder text), the app automatically uses NASA's `DEMO_KEY` so graders can still run the project. `DEMO_KEY` may have lower rate limits.
