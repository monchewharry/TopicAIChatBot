"use client";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Coin from "@/components/toolUI/zhouyi/coin";
import type { HexagramObj, GuaObj, DivinationInputs } from '@/lib/definitions'
import Hexagram from "@/components/toolUI/zhouyi/hexagram";
import Result from "@/components/toolUI/zhouyi/result";
import Question from "@/components/toolUI/zhouyi/question";
import { animateChildren } from "@/lib/animate";
import guaIndexData from "@/lib/toolData/gua-index.json";
import { guaListEnum, guaBaseArray, guaElementEnum, changeYangEnum, changeYinEnum } from "@/lib/toolData/toolTypes";

const AUTO_DELAY = 600;
function getRandomBoolean(): boolean {
    return Math.random() >= 0.5;
}
interface DivinationProps {
    startQuestion: string; // the question that start the divination for
    onTopicInputUpdate: (updatedValues: Partial<DivinationInputs>) => void; //expose guaobj to parent
}

export default function Divination({
    startQuestion,
    onTopicInputUpdate
}: DivinationProps) {
    const guaIndexDataMemo = useMemo(() => guaIndexData, []);
    const guaListDataMemo = useMemo(() => Object.values(guaListEnum), []);
    const [frontList, setFrontList] = useState([true, true, true]);
    const [rotation, setRotation] = useState(false);
    const [hexagramList, setHexagramList] = useState<HexagramObj[]>([]);
    const [resultObj, setResultObj] = useState<GuaObj | null>(null);
    const [question, setQuestion] = useState(startQuestion);

    const flexRef = useRef<HTMLDivElement>(null);

    const [count, setCount] = useState(0);
    const startClick = useCallback(() => {
        if (rotation) {
            return;
        }
        if (hexagramList.length >= 6) {
            setHexagramList([]);
        }
        setFrontList([getRandomBoolean(), getRandomBoolean(), getRandomBoolean()]);
        setRotation(true);
        setCount(count + 1);
    }, [count, rotation, hexagramList.length])

    // 自动卜筮
    useEffect(() => {
        if (rotation || resultObj || count >= 6) {
            return;
        }
        setTimeout(startClick, AUTO_DELAY);
    }, [rotation, count, resultObj, startClick]);

    useEffect(() => {
        if (!flexRef.current) {
            return;
        }
        const observer = animateChildren(flexRef.current);
        return () => observer.disconnect();
    }, []);

    // store the last update and only call onUpdate when values actually change:
    const lastUpdateRef = useRef<{ currentHex: HexagramObj[], currentGua: GuaObj | null }>({
        currentHex: [],
        currentGua: null
    });

    useEffect(() => {
        if (resultObj && hexagramList.length === 6) {
            // Only update if values changed
            if (
                JSON.stringify(lastUpdateRef.current.currentHex) !== JSON.stringify(hexagramList) ||
                JSON.stringify(lastUpdateRef.current.currentGua) !== JSON.stringify(resultObj)
            ) {
                onTopicInputUpdate({
                    currentHex: hexagramList,
                    currentGua: resultObj,
                    startQuestion: startQuestion
                });
                lastUpdateRef.current = { currentHex: hexagramList, currentGua: resultObj };
            }
        }
    }, [resultObj, hexagramList, startQuestion, onTopicInputUpdate]);

    function onTransitionEnd() {
        setRotation(false);
        const frontCount = frontList.reduce((acc, val) => (val ? acc + 1 : acc), 0);
        setHexagramList((list) => {
            const newList = [
                ...list,
                {
                    change: frontCount === 0 || frontCount === 3 || null,
                    yang: frontCount >= 2,
                    separate: list.length === 3,
                },
            ];
            const newListWithId: Array<HexagramObj> = newList.map((item, index) => ({
                ...item,
                id: index + 1
            }));
            setResult(newListWithId);
            return newListWithId;
        });

    }

    function restartClick() {
        setResultObj(null);
        setHexagramList([]);
        // setQuestion("");
        setCount(0);
        stop();
    }

    function setResult(list: HexagramObj[]) {
        if (list.length !== 6) {
            return;
        }
        const guaElement = Object.values(guaElementEnum);

        const changeYang = Object.values(changeYangEnum);
        const changeYin = Object.values(changeYinEnum);

        const changeList: string[] = [];
        list.forEach((value, index) => {
            if (!value.change) {
                return;
            }
            changeList.push(value.yang ? changeYang[index] : changeYin[index]);
        });

        // 卦的结果： 第X卦 X卦 XX卦 X上X下
        // 计算卦的索引，111对应乾卦，000对应坤卦，索引转为10进制。
        const upIndex =
            (list[5].yang ? 4 : 0) + (list[4].yang ? 2 : 0) + (list[3].yang ? 1 : 0);
        const downIndex =
            (list[2].yang ? 4 : 0) + (list[1].yang ? 2 : 0) + (list[0].yang ? 1 : 0);

        const guaIndex = guaIndexDataMemo[upIndex][downIndex] - 1;
        const guaName1 = guaListDataMemo[guaIndex]; // 乾

        let guaName2: string; // 乾为天\风火家人
        if (upIndex === downIndex) {
            // 上下卦相同，格式为X为X
            guaName2 = `${guaBaseArray[upIndex]}为${guaElement[upIndex]}`;
        } else {
            guaName2 = guaElement[upIndex] + guaElement[downIndex] + guaName1;
        }

        const guaDesc = `${guaBaseArray[upIndex]}上${guaBaseArray[downIndex]}下`; // 乾上乾下
        const thisResutObj: GuaObj = {
            guaMark: `${(guaIndex + 1).toString().padStart(2, "0")}.${guaName2}`,
            guaTitle: `周易第${guaIndex + 1}卦`,
            guaResult: `${guaName1}卦(${guaName2})_${guaDesc}`,
            guaChange:
                changeList.length === 0 ? "无变爻" : `变爻: ${changeList.toString()}`,
        }
        // ✅ First, update the local state
        setResultObj(thisResutObj);

    }

    const showResult = resultObj !== null;
    const inputQuestion = false;
    return (
        <div
            ref={flexRef}
            className="gap mx-auto flex h-full w-[90%] flex-1 flex-col flex-nowrap items-center"
        >
            <Question question={question} setQuestion={setQuestion} />
            <span>{startQuestion}</span>
            {!inputQuestion && (
                <Coin
                    onTransitionEnd={onTransitionEnd}
                    frontList={frontList}
                    rotation={rotation}
                />
            )}

            {!inputQuestion && !showResult && (
                <div className="relative">
                    <span className="pl-2 text-lg font-medium">
                        🎲 第{" "}
                        <span className="font-mono text-xl font-bold text-orange-500">
                            {count === 0 ? "-/-" : `${count}/6`}
                        </span>{" "}
                        次卜筮
                    </span>
                </div>
            )}

            {!inputQuestion && hexagramList.length !== 0 && (
                <div className="flex max-w-md gap-2">
                    <Hexagram list={hexagramList} />
                    {showResult && (
                        <div className="flex flex-col justify-around">
                            <Result {...resultObj} />
                            {/* <div className="flex flex-col gap-2 sm:px-6">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={restartClick}
                                    disabled={rotation}
                                >
                                    <ListRestart size={18} className="mr-1" />
                                    重来
                                </Button>

                            </div> */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
