import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		warningFilter: (warning) => {
			// Ignore a11y warnings for labels in dynamic forms
			if (warning.code === 'a11y_label_has_associated_control') return false;
			if (warning.code === 'a11y_invalid_attribute') return false;
			return true;
		}
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		})
	}
};

export default config;
