# Glimmer - Dynamic Screen Viewer

A React-based full-screen application that cycles through dynamic content like news, weather, sports, and other interesting screens. Perfect for use as a digital signage solution or screensaver.

## 🚀 Live Demo

Visit the live application: [https://kfaubel.github.io/glimmer](https://kfaubel.github.io/glimmer)

## ✨ Features

- **Dynamic Content Loading**: Cycles through configurable screens with custom display durations
- **Automatic Refresh**: Screens refresh on configurable intervals (5 minutes to 24 hours)
- **Profile-based Configuration**: Support for different screen configurations via URL profiles
- **Auto-refresh Screen List**: Automatically fetches updated screen configurations every 6 hours
- **CORS-aware**: Enhanced error handling for cross-origin resource requests
- **Responsive Design**: Full-screen, responsive layout optimized for displays
- **Time Display**: Optional time bugs with customizable positioning and styling
- **Fade Transitions**: Smooth fade-in/fade-out animations between screens

## 🛠️ Built With

- **React 17** with TypeScript
- **Bootstrap 5.3.8** for styling
- **Axios** for HTTP requests
- **Create React App** for build tooling

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Git (for cloning and deployment)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kfaubel/glimmer.git
   cd glimmer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```bash
   REACT_APP_SCREEN_LIST_URL_BASE=https://your-server.com/config/
   REACT_APP_ENV=development
   REACT_APP_ENABLE_LOGGING=true
   ```

### Available Scripts

#### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### `npm run build`
Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm run deploy`
Deploys the built app to GitHub Pages (requires proper setup - see deployment section below).

#### `npm test`
Launches the test runner in the interactive watch mode.

## 🔧 Configuration

### Screen Configuration File

The application loads screen configurations from JSON files hosted at `REACT_APP_SCREEN_LIST_URL_BASE`. The filename format is `{profile}.json`.

**Example: `default.json`**
```json
{
  "screens": [
    {
      "enabled": true,
      "friendlyName": "Weather Image",
      "resource": "https://example.com/weather.png",
      "refreshMinutes": "60",
      "displaySecs": "10",
      "timeBug": "lower-right-light",
      "month": "1:12"
    },
    {
      "enabled": true,
      "friendlyName": "News Feed",
      "resource": "https://example.com/news.jpg",
      "refreshMinutes": "30",
      "displaySecs": "8",
      "timeBug": "upper-right-dark"
    }
  ]
}
```

### Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether this screen is active |
| `friendlyName` | string | Yes | Display name for the screen (max 50 chars) |
| `resource` | string | Yes | URL to the image resource (10-200 chars) |
| `refreshMinutes` | string | Yes | How often to refresh the image (5-1440 minutes) |
| `displaySecs` | string | Yes | How long to display the image (5-60 seconds) |
| `timeBug` | string | No | Time display position: `upper-right-light`, `lower-right-light`, `upper-right-dark`, `lower-right-dark` |
| `month` | string | No | Month filter (e.g., "1:5" for Jan-May, blank for all year) |

### Special Features

- **Batch Resources**: Use `[01:10]` in resource URLs to create 10 sequential screens (e.g., `image-[01:10].jpg` creates `image-01.jpg` through `image-10.jpg`)
- **Profile Support**: Access different configurations via URL: `https://yoursite.com/profile-name`

## 🚀 Deploying to GitHub Pages

### One-time Setup

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select branch: `gh-pages`
   - Click Save

2. **Configure package.json** (already configured in this project)
   ```json
   {
     "homepage": "https://yourusername.github.io/repository-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Install gh-pages** (already included in devDependencies)
   ```bash
   npm install --save-dev gh-pages
   ```

### Deployment Steps

1. **Build and deploy**
   ```bash
   npm run deploy
   ```

2. **Verify deployment**
   - Visit your GitHub Pages URL
   - Check the Actions tab for deployment status

### Automatic Deployment (Optional)

Set up GitHub Actions for automatic deployment on push to main:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## 🔒 CORS Considerations

Due to browser security restrictions, image resources must be served from domains that provide proper CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Supported Services:**
- ✅ Imgur (provides CORS headers)
- ✅ Azure Blob Storage (configurable)
- ✅ AWS S3 (configurable)
- ❌ Most social media direct image links
- ❌ Many news sites

## 🎯 Usage Examples

### Basic Usage
```
https://kfaubel.github.io/glimmer
```
Loads the default configuration.

### Profile-specific Usage
```
https://kfaubel.github.io/glimmer/weather
```
Loads the `weather.json` configuration.

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check browser console for CORS errors
   - Verify the image server provides CORS headers
   - Ensure image URLs are accessible

2. **Configuration not loading**
   - Verify `REACT_APP_SCREEN_LIST_URL_BASE` is set correctly
   - Check that the JSON file exists and is valid
   - Ensure the server provides CORS headers for JSON files

3. **GitHub Pages deployment fails**
   - Verify `homepage` URL in package.json
   - Check that `gh-pages` branch exists
   - Review GitHub Actions logs for errors

### Debug Mode

Set `REACT_APP_ENABLE_LOGGING=true` in your environment to enable detailed console logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [https://kfaubel.github.io/glimmer](https://kfaubel.github.io/glimmer)
- **Repository**: [https://github.com/kfaubel/glimmer](https://github.com/kfaubel/glimmer)
- **Issues**: [https://github.com/kfaubel/glimmer/issues](https://github.com/kfaubel/glimmer/issues)