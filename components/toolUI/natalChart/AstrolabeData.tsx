// import React from "react";
import getSelectedAstrolabeData from "@/lib/iztroData";
import type { BySolarProps } from "@/lib/definitions";
import type { HeavenlyStemAndEarthlyBranchDate } from "lunar-lite/lib/types";
import { TopicIds } from "@/lib/definitions";
import { useMemo } from "react";
interface AstroDataFCprops extends BySolarProps {
    title: string;
    property: keyof ReturnType<typeof getSelectedAstrolabeData>; // Ensures the property is valid
}

export const AstroData: React.FC<AstroDataFCprops> = ({
    topicId = TopicIds.numerology,
    solarDateStr,
    timeIndex,
    gender,
    fixLeap,
    language,
    title,
    property,
}) => {
    const result = useMemo(() => {
        return getSelectedAstrolabeData({ topicId, solarDateStr, timeIndex, gender, fixLeap, language })
    }, [topicId, solarDateStr, timeIndex, gender, fixLeap, language])
    const value = result[property];
    switch (property) {
        case "rawDates":
            return (
                <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
                    <BaziDisplay
                        type={"object"}
                        chineseDate={result.rawDates.chineseDate}
                    />
                </div>
            );
        default:
            return (
                <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
                    <p className="text-sm font-semibold text-gray-700">{title}</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">{JSON.stringify(value)}</p>
                </div>
            );
    }
};

interface BaziDisplayProps {
    type?: string;
    chineseDate: HeavenlyStemAndEarthlyBranchDate | string;
}

export const BaziDisplay: React.FC<BaziDisplayProps> = ({
    type,
    chineseDate
}) => {
    let pillars: {
        label: string;
        value: string;
    }[] = [];

    if (type === "object" && typeof chineseDate !== "string") {
        const thisChineseDate = chineseDate as HeavenlyStemAndEarthlyBranchDate;
        pillars = [
            { label: "Year Pillar", value: thisChineseDate.yearly.join("") },
            { label: "Month Pillar", value: thisChineseDate.monthly.join("") },
            { label: "Day Pillar", value: thisChineseDate.daily.join("") },
            { label: "Hour Pillar", value: thisChineseDate.hourly.join("") },
        ];
    } else if (type === "string" && typeof chineseDate === "string") {
        const parts = chineseDate.split(" ");
        if (parts.length === 4) {
            pillars = [
                { label: "Year Pillar", value: parts[0] },
                { label: "Month Pillar", value: parts[1] },
                { label: "Day Pillar", value: parts[2] },
                { label: "Hour Pillar", value: parts[3] },
            ];
        }
    }

    return (
        <div className="flex justify-center gap-4 mt-6">
            {pillars.length > 0 ? (
                pillars.map((pillar, index) => (
                    <div key={pillar.label} className="bg-white shadow-md rounded-lg p-6 text-center w-40">
                        <p className="text-gray-500 text-sm">{pillar.label}</p>
                        <p className="text-xl font-semibold text-[#b8860b]">{pillar.value}</p>
                    </div>
                ))
            ) : (
                <div className="text-red-500">Invalid data</div>
            )}
        </div>
    );
};