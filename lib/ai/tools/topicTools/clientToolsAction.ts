import type FunctionalAstrolabe from "iztro/lib/astro/FunctionalAstrolabe";
import { type NatalChartData, NatalChartDataType } from "@/lib/definitions";

/**
 * Arrange tool result for getNatalChart
 */
export function getAllOriginalPalacesStarsData(astrolabeData: FunctionalAstrolabe): NatalChartData {
    const palaceResult = astrolabeData.palaces.map(palace => {
        const majorStars = palace.majorStars
            .filter(star => star.type === 'major') // it could be "major" or "lucun" or "tianma"
            .map(star => ({
                name: star.name,
                mutagen: star.mutagen || "none"
            }));

        const minorStars = [
            ...palace.minorStars.filter(star => star.type === 'soft'),
            ...palace.minorStars.filter(star => star.type === 'tough'),
            ...palace.majorStars.filter(star =>
                star.type === 'lucun' || star.type === 'tianma'
            )
        ].map(star => star.name);

        const adjStars = palace.adjectiveStars.map(star => star.name);

        return {
            palaceName: palace.name,
            majorStars,
            majorStarMutagens: majorStars
                .filter(star => star.mutagen !== "none")
                .map(star => star.mutagen),
            minorStars,
            adjStars,
            hasStars: majorStars.length + minorStars.length + adjStars.length > 0
        };
    });
    return {
        natalChartType: NatalChartDataType.Original,
        gender: astrolabeData.gender,
        solarDate: astrolabeData.solarDate,
        lunarDate: astrolabeData.lunarDate,
        bazi: astrolabeData.chineseDate,
        sign: astrolabeData.sign,
        zodiac: astrolabeData.zodiac,
        earthlyBranchOfSoulPalace: astrolabeData.earthlyBranchOfSoulPalace,
        soulPalace: astrolabeData.palaces.filter(p => p.earthlyBranch === astrolabeData.earthlyBranchOfSoulPalace)[0].name,
        earthlyBranchOfBodyPalace: astrolabeData.earthlyBranchOfBodyPalace,
        bodyPalace: astrolabeData.palaces.filter(p => p.earthlyBranch === astrolabeData.earthlyBranchOfBodyPalace)[0].name,
        soul: astrolabeData.soul,
        body: astrolabeData.body,
        fiveElementsClass: astrolabeData.fiveElementsClass,
        natalChartOriginalData: palaceResult
    };
}