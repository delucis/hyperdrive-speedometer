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
    ]);

    const fetch = (await import('node-fetch')).default;

    /** @type {string[]} */
    const urls = await fetch('https://astro.build/api/showcase.json')
      .then((res) => res.json())
      .then((json) =>
        json.map((site) => site.url).filter((url) => !blocklist.has(url))
      );

    return {
      name: 'Showcase',
      description: 'Sites from the Astro showcase',
      options: { frequency: 1380 },
      urls,
    };
  },
};
