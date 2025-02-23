'use client';
import { useChatContext } from '@/context/chatContext';
import IconModal from '@/components/ui/iconModal';
import AstrolabeChart from '@/components/toolUI/natalChart/AstrolabeChart';
import { AstroData } from './natalChart/AstrolabeData';
import Hexagram from "@/components/toolUI/zhouyi/hexagram";
import Result from "@/components/toolUI/zhouyi/result";
import { Squares2X2Icon, Bars4Icon } from '@heroicons/react/24/outline';
import { HexagramIcon } from '@/components/hexagramIcon';
import { TopicIds } from '@/lib/definitions';

export function TopicButtons() {
    const { topicInputValues } = useChatContext();
    switch (topicInputValues.topicId) {
        case TopicIds.numerology: {

            return (
                <div className="grid sm:grid-cols-4 gap-2 w-full">
                    <IconModal
                        icon={<Bars4Icon className="w-6 h-6 text-primary-foreground" />}
                        label="生辰八字"
                    >
                        <AstroData
                            topicId={TopicIds.numerology}
                            solarDateStr={topicInputValues.solarDateStr}
                            gender={topicInputValues.gender}
                            timeIndex={topicInputValues.timeIndex}
                            property="rawDates"
                            title="生辰八字"
                        />
                    </IconModal>
                    <IconModal
                        icon={<Squares2X2Icon className="w-6 h-6 text-primary-foreground" />}
                        label="紫微斗数排盘"
                    >
                        <AstrolabeChart
                            birthday={topicInputValues.solarDateStr}
                            birthTime={topicInputValues.timeIndex}
                            birthdayType="solar"
                            gender={topicInputValues.gender}
                            horoscopeDate={new Date()}
                            horoscopeHour={topicInputValues.timeIndex}
                        />
                    </IconModal>
                </div>

            );
        }
        case TopicIds.divination: {

            return (
                <div className="grid sm:grid-cols-4 gap-2 w-full">
                    <IconModal
                        icon={<HexagramIcon size={32} />}
                        label="当前卦象"
                    >
                        <div className="flex justify-center items-center max-w-md mx-auto gap-2">
                            {topicInputValues.currentHex && (
                                <Hexagram list={topicInputValues.currentHex} />
                            )}
                            {topicInputValues.currentGua && (
                                <div className="flex flex-col justify-around">
                                    <Result {...topicInputValues.currentGua} />
                                </div>
                            )}
                        </div>
                    </IconModal>
                </div>
            );
        }
        // Add more cases for other topics as needed
        default:
            return null;
    }
};