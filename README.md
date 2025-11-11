# Setup Instructions
## Environment & API keys

This project requires several API keys and credentials. Copy `.env.local.example` to `.env.local` and fill in the values before running the app locally or deploying.

cp .env.local.example .env.local

Below are short instructions for obtaining each key and how to set them:

- **NEXTAUTH_SECRET**
	- Used by NextAuth to sign session cookies. Generate a random 32-byte base64 string:
		- macOS / Linux / WSL / Git Bash:
			```bash
			openssl rand -base64 32
			```
		- PowerShell (Windows):
			```powershell
			[Convert]::ToBase64String((1..32|%{Get-Random -Maximum 256}) -as [byte[]])
			```

- **Google OAuth (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET)**
	- Go to Google Cloud Console -> APIs & Services -> Credentials -> Create Credentials -> OAuth client ID.
	- Choose "Web application" and set the authorized redirect URI to `http://localhost:3000/api/auth/callback/google` (and your production URL when deploying).
	- Copy the Client ID and Client Secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

- **GitHub OAuth (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET)**
	- Go to GitHub -> Settings -> Developer settings -> OAuth Apps -> New OAuth App.
	- Set the Authorization callback URL to `http://localhost:3000/api/auth/callback/github` (and add your production URL later).
	- Copy the Client ID and Client Secret into `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.

- **Firebase client config (NEXT_PUBLIC_FIREBASE_*)**
	- In the Firebase Console, open your project -> Project settings -> Your apps -> Add web app (if not present).
	- Copy the config values (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) into the matching `NEXT_PUBLIC_FIREBASE_...` variables.
	- These are public values used by the client SDK.

- **Firebase Admin SDK (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID)**
	- In Firebase Console -> Project settings -> Service accounts -> Generate new private key. This downloads a JSON file containing the private key and client email.
	- For local development, set `FIREBASE_PROJECT_ID` and `FIREBASE_CLIENT_EMAIL` from the JSON and paste the private key into `FIREBASE_PRIVATE_KEY` as a single string with newline escapes (or set it in your host provider's secret manager as a multi-line secret). Example format:
		```env
		FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
		```
	- Keep these values secret. Do NOT commit them to source control.

- **NEXT_PUBLIC_ANALYTICS_ID**
	- Add your Google Analytics / Measurement ID (if used) to track usage.

- **CRON_SECRET**
	- A random string used to protect cron endpoints. Generate one with OpenSSL or PowerShell as shown above and add it to `CRON_SECRET`.

- **OPENROUTER_API_KEY**
	- Sign up at OpenRouter (or your chosen LLM gateway) and create an API key. Paste it into `OPENROUTER_API_KEY`.
