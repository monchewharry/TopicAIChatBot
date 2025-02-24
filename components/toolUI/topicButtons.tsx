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
import { ZhouyiMarkdownRenderer } from './zhouyi/markdownRender';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
export function TopicButtons() {
    const { topicInputValues } = useChatContext();
    const [hexagramMd, setHexagramMd] = useState('');
    // State to track whether the menu is expanded
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);

    // Function to toggle the menu
    const toggleMenu = () => {
        setIsMenuExpanded(!isMenuExpanded);
    };
    useEffect(() => {
        if (topicInputValues.topicId !== TopicIds.divination) {
            return;
        }
        fetch(`/zhouyi/${topicInputValues.currentGua?.guaMark}/index.md`)
            .then((res) => res.text())
            .then((text) => {
                const lines = text.split("\n").slice(4).join("\n"); // Skip first 4 lines
                setHexagramMd(lines);
            });
    }, [topicInputValues]);
    const renderInputsForTopic = () => {
        switch (topicInputValues.topicId) {
            case TopicIds.numerology: {
                return (
                    <>
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
                    </>

                );
            }
            case TopicIds.divination: {

                return (
                    <>
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

                        <IconModal
                            icon={<HexagramIcon size={32} />}
                            label="卦象文档"
                        >
                            <div className="flex flex-col max-w-md mx-auto gap-2 text-left">
                                <ZhouyiMarkdownRenderer content={hexagramMd} markdownDir={`/zhouyi/${topicInputValues.currentGua?.guaMark}`} />;
                            </div>
                        </IconModal>
                    </>
                );
            }
            // Add more cases for other topics as needed
            case TopicIds.general:
                return null;
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 }}
            key={"topicinputspanel"}
            className={'block'}
        >
            <div className="flex flex-row justify-center items-center  mb-5">
                <div className="grid sm:grid-cols-4 gap-2 w-full">
                    {renderInputsForTopic()}
                </div>
            </div>
        </motion.div>
    );


};