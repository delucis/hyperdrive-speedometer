module.exports = {
	showcase: async () => {
		const blocklist = new Set([
			'https://dendauw.tech/',
			'https://replicant.band/',
			'https://stephen.solka.dev/',
			'https://www.mostlywhat.cf/',
			'https://flamrdevs.vercel.app/',
			'https://legrostonneau-festival.fr/',
			'https://cantoo.app/',
			'https://www.articoliesocial.it/',
			// Sites blocked 5 July 2023:
			'https://angeldollface.art/',
			'https://anasweb.site',
			'https://www.codef.site/',
			'https://blog.lanceross.xyz/',
			'https://lanceross.xyz/',
			'https://serendipitytheme.com/',
			'https://t-red.love/',
			'https://weboreviews.com/',
			// Sites blocked 6 July 2023:
			'https://akinkunmi.dev/',
			'https://www.alexstreza.dev/',
			'https://anasweb.site/',
			'https://beradiostereo.com/',
			'https://juniorjobs.pages.dev/',
			'https://michaels.studio/',
			'https://www.notionpaper.cc/',
			'https://sequoiatheme.com/',
			'https://www.stardew.cc/',
			'https://synco.re/',
			'https://unwrapped.design/',
			'https://unwrapped.studio/',
			'https://uzzieltech.co.ke/',
			'https://zkrew.red/rescaler/',
			// Sites blocked 7 July 2023:
			'https://ilyasslidingdoormobil.com',
			'https://nikolovlazar.com',
			// Sites blocked 1 August 2023:
			'https://www.cityflo.com/',
			'https://riclinic.com.mx/',
			'https://myworkshops.live/',
			// Sites blocked 1 September 2023:
			'https://meetslides.com/',
			'https://lays.kz/',
			'https://hexarolls.com/',
			'https://www.crossriver.com/',
			'https://publication2023.bits-und-baeume.org/',
			'https://www.herisdia.me/',
			'https://lukreativ360.pl/',
			// Sites blocked 15 December 2023:
			'https://ai.cloudflare.com/',
			'https://www.design-tokens.dev/',
			'https://offerstreet.in/',
			'https://softhardsystem.com/',
			'https://bfloow.com/',
			// Sites blocked 19 January 2024
			'https://ark-ui.com',
			// Sites blocked 15 February 2024
			'https://www.netlify.com/',
			'https://www.snowfox.art',
			// Sites blocked 12 March 2024 (Should we wildcard ban Netlify?)
			'https://developers.netlify.com/',
			// Sites blocked 18 March 2024 (these sites failed for each of the past 3 months)
			'https://championsheineken.co/',
			'https://limpbizkit.com/',
			'https://trtcontracting.ca/',
			'https://balbas.io/',
			'https://www.cypress.io/',
			'https://up12.vercel.app/',
			'https://top3nftmarketplaces.org/',
			'https://hamza127.vercel.app/',
			'https://pizzabillionaire.com/',
			'https://indatech.my.id/',
			'https://sentralbisnisdigital.co.id/',
			'https://ayanavakarmakar.software/',
			'https://astro.rishi.app/',
			'https://windbasics.com/',
			'https://www.undefinedtea.dev/',
			'https://victoria.mossaway.ca/',
			'https://blazorspark.com/',
			'https://brunoalves.me/',
			'https://www.levelshuddersfield.co.uk/',
			'https://mocked-api.dev/',
			// Sites blocked 18 March 2024 (these sites are broken)
			'https://jaycedotbin.me/',
			'https://www.joingamedev.com/blog',
			// Sites blocked 5 May 2024
			'https://joshuastuebner.com/',
			'https://sapegin.me/',
			'https://idea-arca.vercel.app/',
			// Sites blocked 23 May 2024
			'https://tacohuaco.co',
			'https://jblaha.art/',
			'https://akashrajpurohit.com/?ref=astro-showcase',
			// Sites blocked 25 May 2024
			'https://www.carvimage.com/',
			'https://monomod.studio/',
			'https://mutanuq.trueberryless.org/',
			'https://elemkits.com/',
			'https://csusb.dev/',
			'https://ask.foolishdev.com/',
			'https://www.atd2023.com/',
			'https://www.unlace.net/',
			// Sites blocked 29 June 2024
			'https://okikio.dev/',
			'https://pooya.blog/',
			'https://adrianub.dev/',
			// Sites blocked 1 July 2024
			'https://academic-project-astro-template.vercel.app/',
			'https://as-next.web.app/',
			'https://bobalazek.com/',
			'https://dracarys.robertborghesi.is/',
			'https://wishwork.org/',
			'https://www.blackspike.com/',
			'https://happyplates.com/',
			'https://www.porsche.com/',
			'https://www.futuresuper.com.au/',
			'https://fitwomensweekly.com/',
			'https://evos.com.au/',
			'https://www.ada.cx/',
			'https://design-buddy.netlify.app/',
			'https://www.dadsworksheets.com/',
		]);

		const fetch = (await import('node-fetch')).default;

		/** @type {string[]} */
		const urls = await fetch('https://astro.build/api/showcase.json')
			.then((res) => res.json())
			.then((json) => json.map((site) => site.url).filter((url) => !blocklist.has(url)));

		return {
			name: 'Showcase',
			description: 'Sites from the Astro showcase',
			options: { frequency: 1380 },
			urls,
		};
	},
};
