# Remove node_modules and package-lock.json
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue

# Clean install all dependencies
npm install

# Install specific Tailwind dependencies correctly
npm install -D @tailwindcss/postcss tailwindcss postcss autoprefixer

# Install other dependencies
npm install @heroicons/react react-router-dom axios date-fns clsx

# Recreate configuration files
@'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
'@ | Set-Content -Path postcss.config.js

# Start the development server
npm start
