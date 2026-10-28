# Node.js and Vercel deployment

Use Node.js 24.x (`nvm use` reads `.nvmrc`). The `engines.node` setting in
`package.json` also selects Node.js 24 for Vercel builds.

In Vercel, select **Settings → Build and Deployment → Node.js Version → 24.x**,
then redeploy. Use this frontend directory as the project root, the Create React
App framework preset, `npm run build` as the build command, and `build` as the output
directory. Keep existing environment variables configured.

Use npm and commit `package-lock.json` when dependencies change. Install with
`npm ci`, matching GitHub Actions. Set Vercel's install command to `npm ci` as
well, so the legacy `yarn.lock` does not select a different package manager.

Verify locally with `CI=true npm test -- --watchAll=false --runInBand` and
`npm run build`. This frontend produces static browser assets; changing its Vercel
build Node.js version does not change the separately hosted API's runtime.

# Quality checks

Run `npm run format` to format files, and `npm run format:check` to verify them
without changing them. Generated assets, dependency locks, and environment files
are excluded through `.prettierignore`.

Run `npm run lint` to check source files or `npm run lint:fix` to apply ESLint's
available automatic fixes. Lint fails on any error or more than 271 warnings.
This is the existing warning baseline; reduce the limit as warnings are fixed.
A total-count baseline can allow one new warning to replace a removed one, so
review new warnings as well. The frontend keeps ESLint 8 for CRA compatibility.

GitHub Actions runs installation, lint, formatting checks, tests, and a production
build. Build warnings remain allowed by the build script's `CI=false`; the
separate lint step enforces the warning baseline.

# API connection

API selection is automatic:

- `npm start` connects to port 8800 on the browser's current host. For example,
  `http://localhost:3000` uses `http://localhost:8800/api`, and opening the app
  through a LAN IP uses that same IP for the API. The API must allow that frontend
  origin through its CORS configuration.
- `npm run build` uses `https://poststation-api-391b2ced2a59.herokuapp.com/api`,
  including Vercel production and preview deployments and locally served builds.
  Preview deployments use the production API unless explicitly overridden; the
  backend must also allow their frontend origins through CORS.

To use a different API, set `REACT_APP_API_URL` to its complete base URL including
`/api`. For local development, use `.env.development.local`. For Vercel, set it
in the desired deployment environment and redeploy. CRA embeds configuration at
build time, so restart the development server after local configuration changes.

`REACT_APP_IS_PRODUCTION` and `REACT_APP_NETWORK_ADDR` are no longer used to select
the API; existing values can be removed. Axios continues sending credentials and
the stored bearer token.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
