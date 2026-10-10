"use node";

import ee from "@google/earthengine";
import { v } from "convex/values";
import { action } from "./_generated/server";

const earthEngineProject =
  process.env.EARTHENGINE_PROJECT || "prefab-overview-485002-h0";
const dataset = "MODIS/061/MOD11A2";
const radiusMeters = 1000;
const lookbackDays = 365;
const scaleFactor = 0.02;
const ndviScaleFactor = 0.0001;

let earthEngineReady: Promise<void> | null = null;

function getServiceAccountKey(): Record<string, string> {
  const inlineKey = process.env.EE_SERVICE_ACCOUNT_KEY_JSON;
  if (!inlineKey) {
    throw new Error(
      "Earth Engine is not configured. Set EE_SERVICE_ACCOUNT_KEY_JSON in Convex."
    );
  }

  try {
    return JSON.parse(inlineKey) as Record<string, string>;
  } catch {
    throw new Error("EE_SERVICE_ACCOUNT_KEY_JSON is not valid JSON.");
  }
}

async function authenticateEarthEngine(): Promise<void> {
  if (earthEngineReady) return earthEngineReady;

  earthEngineReady = (async () => {
    const serviceAccountKey = getServiceAccountKey();

    await new Promise<void>((resolve, reject) => {
      ee.data.authenticateViaPrivateKey(
        serviceAccountKey,
        () => resolve(),
        (error: string) => reject(new Error(error))
      );
    });

    await new Promise<void>((resolve, reject) => {
      ee.initialize(
        null,
        null,
        () => resolve(),
        (error: string) => reject(new Error(error)),
        null,
        earthEngineProject
      );
    });
  })();

  return earthEngineReady;
}

function fetchSpatialIndicators(latitude: number, longitude: number): Promise<{
  ndvi: number | null;
  builtEnvironmentRatio: number | null;
  population: number | null;
  ndviObservationDate: string | null;
  builtObservationDate: string | null;
  populationObservationDate: string | null;
  sources: {
    ndvi: string;
    builtEnvironment: string;
    population: string;
  };
}> {
  const region = ee.Geometry.Point([longitude, latitude]).buffer(radiusMeters);
  const ndviImage = ee.Image(
    ee.ImageCollection("MODIS/061/MOD13Q1")
      .filterBounds(region)
      .sort("system:time_start", false)
      .first()
  );
  const ndviQuality = ndviImage.select("DetailedQA").bitwiseAnd(3).lte(1);
  const ndvi = ndviImage
    .select("NDVI")
    .updateMask(ndviQuality)
    .multiply(ndviScaleFactor);
  const builtImage = ee.Image(
    ee.ImageCollection("JRC/GHSL/P2023A/GHS_BUILT_S")
      .filterBounds(region)
      .filterDate("2020-01-01", "2021-01-01")
      .sort("system:time_start", false)
      .first()
  );
  const populationImage = ee.Image(
    ee.ImageCollection("JRC/GHSL/P2023A/GHS_POP")
      .filterBounds(region)
      .filterDate("2020-01-01", "2021-01-01")
      .sort("system:time_start", false)
      .first()
  );
  const values = ee.Dictionary({
    ndvi: ndvi.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 250,
      maxPixels: 100000,
    }).get("NDVI"),
    builtSurface: builtImage.select("built_surface").reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 100,
      maxPixels: 100000,
    }).get("built_surface"),
    population: populationImage.select("population_count").reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: region,
      scale: 100,
      maxPixels: 100000,
    }).get("population_count"),
    ndviObservationTime: ndviImage.get("system:time_start"),
    builtObservationTime: builtImage.get("system:time_start"),
    populationObservationTime: populationImage.get("system:time_start"),
  });

  return new Promise((resolve, reject) => {
    values.evaluate((result: Record<string, unknown> | null, error?: string) => {
      if (error) {
        reject(new Error(error));
        return;
      }
      const numeric = (value: unknown): number | null =>
        typeof value === "number" && Number.isFinite(value) ? value : null;
      const date = (value: unknown): string | null =>
        typeof value === "number" && Number.isFinite(value)
          ? new Date(value).toISOString().slice(0, 10)
          : null;
      const builtSurface = numeric(result?.builtSurface);
      resolve({
        ndvi: numeric(result?.ndvi),
        builtEnvironmentRatio:
          builtSurface === null
            ? null
            : Math.min(100, Math.max(0, (builtSurface / 10000) * 100)),
        population: numeric(result?.population),
        ndviObservationDate: date(result?.ndviObservationTime),
        builtObservationDate: date(result?.builtObservationTime),
        populationObservationDate: date(result?.populationObservationTime),
        sources: {
          ndvi: "MODIS/061/MOD13Q1 via Google Earth Engine",
          builtEnvironment:
            "JRC/GHSL/P2023A/GHS_BUILT_S via Google Earth Engine",
          population: "JRC/GHSL/P2023A/GHS_POP via Google Earth Engine",
        },
      });
    });
  });
}

function fetchModisLST(latitude: number, longitude: number): Promise<{
  temperatureCelsius: number;
  rawLSTDigitalNumber: number;
  scaleFactor: number;
  observationStart: string;
  observationEnd: string;
  source: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  diagnostics: {
    imageCount: number;
    selectedImageDate: string;
    validPixelCountBeforeQualityMask: number;
    validPixelCountAfterQualityMask: number;
    sampledPixelValue: number;
    sampledRawLSTValue: number;
    sampledQualityValue: number;
  };
}> {
  const end = new Date();
  const start = new Date(end.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
  const region = ee.Geometry.Point([longitude, latitude]).buffer(radiusMeters);
  const collection = ee.ImageCollection(dataset)
    .filterBounds(region)
    .filterDate(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10))
    .sort("system:time_start", false);
  const imageCount = collection.size();
  const diagnosedCollection = collection.map((candidate: any) => {
    const rawLST = candidate.select("LST_Day_1km");
    const quality = candidate.select("QC_Day");
    // MOD11A2 mandatory QA is bits 0-1: 00 = good, 01 = other quality.
    // Values 10 and 11 mean the LST was not produced.
    const goodQuality = quality.bitwiseAnd(3).lte(1);
    const maskedLST = rawLST.updateMask(goodQuality);
    const rawStats = rawLST.reduceRegion({
      reducer: ee.Reducer.count(),
      geometry: region,
      scale: 1000,
      maxPixels: 100000,
    });
    const maskedCountStats = maskedLST.reduceRegion({
      reducer: ee.Reducer.count(),
      geometry: region,
      scale: 1000,
      maxPixels: 100000,
    });
    const maskedMeanStats = maskedLST.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 1000,
      maxPixels: 100000,
    });
    const sampledPixelStats = maskedLST.reduceRegion({
      reducer: ee.Reducer.firstNonNull(),
      geometry: region,
      scale: 1000,
      maxPixels: 100000,
    });
    const sampledRawLSTStats = rawLST.reduceRegion({
      reducer: ee.Reducer.firstNonNull(),
      geometry: region,
      scale: 1000,
      maxPixels: 100000,
    });
    const sampledQualityStats = quality.reduceRegion({
      reducer: ee.Reducer.firstNonNull(),
      geometry: region,
      scale: 1000,
      maxPixels: 100000,
    });
    return candidate.set({
      validPixelCountBeforeQualityMask: rawStats.get("LST_Day_1km"),
      validPixelCountAfterQualityMask: maskedCountStats.get("LST_Day_1km"),
      maskedMean: maskedMeanStats.get("LST_Day_1km"),
      sampledPixelValue: sampledPixelStats.get("LST_Day_1km"),
      sampledRawLSTValue: sampledRawLSTStats.get("LST_Day_1km"),
      sampledQualityValue: sampledQualityStats.get("QC_Day"),
    });
  });
  const diagnosticList = diagnosedCollection.toList(imageCount).map((candidate: any) =>
    ee.Image(candidate).toDictionary([
      "system:time_start",
      "system:index",
      "validPixelCountBeforeQualityMask",
      "validPixelCountAfterQualityMask",
      "maskedMean",
      "sampledPixelValue",
      "sampledRawLSTValue",
      "sampledQualityValue",
    ])
  );

  return new Promise((resolve, reject) => {
    ee.List(diagnosticList).evaluate(
      (
        diagnostics: Array<Record<string, unknown>> | null,
        error?: string
      ) => {
        if (error) {
          reject(new Error(error));
          return;
        }

        const imageDiagnostics = diagnostics ?? [];
        const validScene = imageDiagnostics.find((candidate) => {
          const validCount = candidate.validPixelCountAfterQualityMask;
          const mean = candidate.maskedMean;
          return (
            typeof validCount === "number" &&
            validCount > 0 &&
            typeof mean === "number" &&
            Number.isFinite(mean) &&
            mean > 0
          );
        });
        if (!validScene) {
          const summary = imageDiagnostics.map((candidate) => ({
            date: candidate["system:time_start"],
            validPixelCountBeforeQualityMask:
              candidate.validPixelCountBeforeQualityMask ?? null,
            validPixelCountAfterQualityMask:
              candidate.validPixelCountAfterQualityMask ?? null,
            sampledPixelValue: candidate.sampledPixelValue ?? null,
            sampledRawLSTValue: candidate.sampledRawLSTValue ?? null,
            sampledQualityValue: candidate.sampledQualityValue ?? null,
          }));
          reject(
            new Error(
              JSON.stringify({
                message:
                  "No valid quality-masked MODIS daytime LST pixels were available for this area.",
                imageCount: imageDiagnostics.length,
                scenes: summary,
              })
            )
          );
          return;
        }
        const rawValue = validScene.maskedMean as number;
        const temperatureCelsius = rawValue * scaleFactor - 273.15;
        if (!Number.isFinite(temperatureCelsius)) {
          reject(new Error("MODIS LST conversion produced an invalid temperature."));
          return;
        }
        const observationTime = validScene["system:time_start"];
        if (typeof observationTime !== "number" || !Number.isFinite(observationTime)) {
          reject(new Error("MODIS observation date was unavailable."));
          return;
        }
        const observationStart = new Date(observationTime)
          .toISOString()
          .slice(0, 10);
        const observationEndDate = new Date(
          observationTime + 8 * 24 * 60 * 60 * 1000
        );
        resolve({
          temperatureCelsius,
          rawLSTDigitalNumber: rawValue,
          scaleFactor,
          observationStart,
          observationEnd: observationEndDate.toISOString().slice(0, 10),
          source: `${dataset} via Google Earth Engine`,
          latitude,
          longitude,
          radiusMeters,
          diagnostics: {
            imageCount: imageDiagnostics.length,
            selectedImageDate: observationStart,
            validPixelCountBeforeQualityMask:
              validScene.validPixelCountBeforeQualityMask as number,
            validPixelCountAfterQualityMask:
              validScene.validPixelCountAfterQualityMask as number,
            sampledPixelValue: validScene.sampledPixelValue as number,
            sampledRawLSTValue: validScene.sampledRawLSTValue as number,
            sampledQualityValue: validScene.sampledQualityValue as number,
          },
        });
      }
    );
  });
}

export const fetch = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (_ctx, args) => {
    if (
      !Number.isFinite(args.latitude) ||
      args.latitude < -90 ||
      args.latitude > 90
    ) {
      throw new Error("lat must be a finite number between -90 and 90.");
    }
    if (
      !Number.isFinite(args.longitude) ||
      args.longitude < -180 ||
      args.longitude > 180
    ) {
      throw new Error("lng must be a finite number between -180 and 180.");
    }

    await authenticateEarthEngine();
    const [lst, spatial] = await Promise.all([
      fetchModisLST(args.latitude, args.longitude),
      fetchSpatialIndicators(args.latitude, args.longitude),
    ]);
    return { ...lst, spatial };
  },
});
