import { bySolar } from "iztro/lib/astro/astro";
import type { BySolarProps } from "@/lib/definitions";
import type FunctionalAstrolabe from "iztro/lib/astro/FunctionalAstrolabe";

export default function getSelectedAstrolabeData(props: BySolarProps): FunctionalAstrolabe {
    const { solarDateStr, timeIndex, gender, fixLeap, language } = props;

    return bySolar(solarDateStr, timeIndex, gender, fixLeap, language);
}