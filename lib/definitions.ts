import type { GenderName, PalaceName, StarName, FiveElementsClassName, EarthlyBranchName } from "iztro/lib/i18n";
import type { Language } from "iztro/lib/data/types/general";
import type { Message } from 'ai';

export enum TopicIds {
    general = 'topic-general',
    numerology = 'topic-numerology',
    divination = 'topic-divination',

}
export interface BaseTopicInputs {
    topicId: TopicIds.general; // Discriminator field
}

export interface NumerologyInputs {
    topicId: TopicIds.numerology; // Discriminated union
    solarDateStr: string;
    timeIndex: number;
    gender: GenderName;
}
export interface DivinationInputs {
    topicId: TopicIds.divination; // Discriminated union
    currentHex?: HexagramObj[];
    currentGua?: GuaObj;
    hexagram: string;
    method?: '六爻' | '梅花易数' | '奇门遁甲';
    startQuestion?: string;
}
export type TopicInputs = BaseTopicInputs | NumerologyInputs | DivinationInputs;


export interface BySolarProps extends NumerologyInputs {
    fixLeap?: boolean;
    language?: Language;
}

/**
 * The 6 row hexagram
 */
export interface HexagramObj {
    change: boolean | null;
    yang: boolean;
    separate: boolean;
    id: number;
}
export interface GuaObj {
    guaTitle: string; // 周易第59卦
    guaMark: string; // 26.山天大畜
    guaResult: string; // 乾卦(乾为天)_乾上乾下
    guaChange: string; // 变爻: 九四,九五
}

export interface TopicInputProps {
    onInputChange: (input?: TopicInputs) => void; // expose the input to the parent component
}


export enum NatalChartDataType {
    Original = '本命盘',
    Scope = '运限盘'
}
export interface NatalChartDataOriginal {
    palaceName: PalaceName;
    majorStars: { name: StarName; mutagen: string; }[];
    majorStarMutagens: string[];
    minorStars: StarName[];
    adjStars: StarName[];
    hasStars: boolean;
}

export interface NatalChartData {
    natalChartType: NatalChartDataType;
    gender: string;
    solarDate: string;
    lunarDate: string;
    bazi: string;
    sign: string;
    zodiac: string;
    earthlyBranchOfSoulPalace: EarthlyBranchName;
    soulPalace: PalaceName;
    earthlyBranchOfBodyPalace: EarthlyBranchName;
    bodyPalace: PalaceName;
    soul: StarName;
    body: StarName;
    fiveElementsClass: FiveElementsClassName;
    natalChartOriginalData: NatalChartDataOriginal[]
}


export type ClientToolCallResult = string | NatalChartData | undefined;

export interface RequestBodyItem {
    id: string;
    messages: Array<Message & { revisionId?: string }>;
    selectedChatModel: string;
    topicId: TopicIds;
    topicInputValues: TopicInputs;
}