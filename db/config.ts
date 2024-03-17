import { column, defineDb, defineTable } from 'astro:db';

// https://astro.build/db/config
export default defineDb({
	tables: {
		Result: defineTable({
			columns: {
				siteHash: column.text(),
				runTime: column.date(),
				data: column.json(),
			},
		}),
	},
});
