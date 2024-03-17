import db from '@astrojs/db';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: process.env.URL || 'https://hyperdrive-speedometer.netlify.app/',
	integrations: [db()],
});
