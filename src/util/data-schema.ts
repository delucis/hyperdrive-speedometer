import z from 'astro/zod';

const TestError = z.object({
	error: z.string(),
});
export const TestResult = z.object({
	timestamp: z.number(),
	url: z.string().url(),
	requestedUrl: z.string().url().optional(),
	ranks: z.object({
		hundos: z.number(),
		performance: z.number(),
		accessibility: z.number(),
		cumulative: z.number(),
	}),
	lighthouse: z.object({
		version: z.string(),
		performance: z.number(),
		accessibility: z.number(),
		bestPractices: z.number(),
		seo: z.number(),
		total: z.number(),
		type: z.string().optional(),
	}),
	firstContentfulPaint: z.number(),
	firstMeaningfulPaint: z.number(),
	speedIndex: z.number(),
	largestContentfulPaint: z.number(),
	totalBlockingTime: z.number(),
	cumulativeLayoutShift: z.number(),
	timeToInteractive: z.number(),
	maxPotentialFirstInputDelay: z.number(),
	timeToFirstByte: z.number(),
	weight: z.object({
		summary: z.string(),
		total: z.number(),
		image: z.number(),
		imageCount: z.number(),
		script: z.number(),
		scriptCount: z.number(),
		document: z.number(),
		font: z.number(),
		fontCount: z.number(),
		stylesheet: z.number(),
		stylesheetCount: z.number(),
		thirdParty: z.number(),
		thirdPartyCount: z.number(),
	}),
	run: z.object({
		number: z.number(),
		total: z.number(),
	}),
	sidequests: z
		.object({
			'-weight.total': z.number(),
			'+weight.total': z.number(),
			'-weight.document': z.number(),
			'+weight.document': z.number(),
			'-weight.script': z.number(),
			'+weight.script': z.number(),
			'-weight.image': z.number(),
			'+weight.image': z.number(),
			'-weight.font': z.number(),
			'+weight.font': z.number(),
			'+weight.fontCount': z.number(),
			'-timeToFirstByte': z.number(),
			'-totalBlockingTime': z.number(),
			'-largestContentfulPaint': z.number(),
		})
		.optional(),
	axe: z.union([
		z.object({
			passes: z.number(),
			violations: z.number(),
		}),
		z.object({
			error: z.string(),
		}),
	]),
});

export const TestResultOrError = z.union([TestResult, TestError]);
export type TestData = z.infer<typeof TestResult>;
