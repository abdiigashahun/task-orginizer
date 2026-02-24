<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app : https://ai.studio/apps/b6b00e50-ebc8-4232-9f96-6ea7055a8a52

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   - Optional: set `VITE_GEMINI_MODEL=gemini-2.5-flash` if you hit quota on heavier models
3. Run the app:
   `npm run dev`
