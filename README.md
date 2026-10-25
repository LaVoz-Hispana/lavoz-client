
# Node.js and Vercel deployment

Use Node.js 24.x (`nvm use` reads `.nvmrc`). The `engines.node` setting in
`package.json` also selects Node.js 24 for Vercel builds.

In Vercel, select **Settings → Build and Deployment → Node.js Version → 24.x**,
then redeploy. Use this frontend directory as the project root, the Create React
App framework preset, `yarn build` as the build command, and `build` as the output
directory. Keep existing environment variables configured.

The current dependency lock is `yarn.lock` (Yarn Classic). Install with
`yarn install --frozen-lockfile`; the older `package-lock.json` does not include
all current dependencies. If Vercel has an npm install-command override, change
it to `yarn install --frozen-lockfile` to use the tested dependency versions.

Verify locally with `CI=true yarn test --watchAll=false --runInBand` and
`yarn build`. This frontend produces static browser assets; changing its Vercel
build Node.js version does not change the separately hosted API's runtime.

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
