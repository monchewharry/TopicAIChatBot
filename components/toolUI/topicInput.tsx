'use client';
import { useChatContext } from '@/context/chatContext';
import { useState, useRef, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircleFillIcon, ChevronDownIcon } from '@/components/icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { type TopicInputProps, type TopicInputs, TopicIds } from '@/lib/definitions';
import { HexagramIcon } from '@/components/hexagramIcon';
import IconModal from '@/components/ui/iconModal';
import Divination from '@/components/toolUI/zhouyi/divination';
import { birthTimeOptions } from '../../lib/toolData/chineseTimeLabel';
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
export function TopicInput({
    onInputChange
}: TopicInputProps
) {
    const [open, setOpen] = useState(false);
    const [startQuestion, setStartQuestion] = useState<string>("NEWGUA");
    const [genderOpen, setGenderOpen] = useState(false);
    const { topicInputValues, setTopicInputValues, isTopicInputComplete } = useChatContext();

    const handleChange = (updatedValues: Partial<TopicInputs>) => {
        setTopicInputValues(prev => ({ ...prev, ...updatedValues } as TopicInputs));
        onInputChange();
    };
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight();
        }
    }, []);
    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
        }
    };
    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStartQuestion(event.target.value);
        adjustHeight();
    };
    const renderInputsForTopic = (): JSX.Element | null => {
        switch (topicInputValues.topicId) {
            case TopicIds.numerology: {
                return (
                    <>
                        {/* input part */}
                        <div className="flex flex-row sm:flex-col lg:flex-row w-full h-auto justify-start items-start">
                            <div className="flex flex-col">
                                <label htmlFor="date-picker" className="font-medium">Date:</label>
                                <DatePicker
                                    id="date-picker"
                                    selected={topicInputValues.solarDateStr ? new Date(`${topicInputValues.solarDateStr}T00:00:00`) : null} // Ensures local time
                                    onChange={(date) => date && handleChange({ solarDateStr: date.toLocaleDateString('en-CA') })}
                                    dateFormat="yyyy-MM-dd"
                                    className="border rounded p-2"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="time-picker" className="font-medium">Time:</label>
                                <DropdownMenu open={open} onOpenChange={setOpen}>
                                    <DropdownMenuTrigger
                                        asChild
                                        className={cn(
                                            'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
                                            "order-1 md:order-2",
                                        )}
                                    >
                                        <Button variant="outline" className="md:px-2 md:h-[34px]">
                                            {birthTimeOptions.find((option) => option.value === topicInputValues.timeIndex)?.label ?? 'Select Time'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="start" className="min-w-[200px]">
                                        {birthTimeOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onSelect={() => {
                                                    setOpen(false);
                                                    handleChange({ timeIndex: option.value });
                                                }}
                                                className="gap-4 group/item flex flex-row justify-between items-center"
                                                data-active={option.value === topicInputValues.timeIndex}
                                            >
                                                <div className="flex flex-col gap-1 items-start">
                                                    <div>{option.label}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {option.remark}
                                                    </div>
                                                </div>
                                                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                                                    {option.value === topicInputValues.timeIndex && <CheckCircleFillIcon />}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="gender-picker" className="font-medium">Gender:</label>
                                <DropdownMenu open={genderOpen} onOpenChange={setGenderOpen}>
                                    <DropdownMenuTrigger
                                        asChild
                                        className={cn(
                                            'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
                                            "order-1 md:order-2",
                                        )}
                                    >
                                        <Button variant="outline" className="md:px-2 md:h-[34px] flex justify-between items-center w-full">
                                            {topicInputValues.gender === 'male' ? 'Male 男' : 'Female 女'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="start" className="min-w-[200px]">
                                        {['male', 'female'].map((gender) => (
                                            <DropdownMenuItem
                                                key={gender}
                                                onSelect={() => {
                                                    setGenderOpen(false);
                                                    handleChange({ gender: gender as 'male' | 'female' });
                                                }}
                                                className="gap-4 group/item flex flex-row justify-between items-center"
                                                data-active={gender === topicInputValues.gender}
                                            >
                                                <div className="flex flex-col gap-1 items-start">
                                                    <div>{gender === 'male' ? 'Male 男' : 'Female 女'}</div>
                                                </div>
                                                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                                                    {gender === topicInputValues.gender && <CheckCircleFillIcon />}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* card footnote */}
                        <div className="w-full mt-2 text-left">
                            <span className="text-muted-foreground">
                                Select a date, time, and gender to get your numerology reading.
                            </span>
                        </div>
                    </>
                );
            }
            // Add more cases for other topics as needed
            case TopicIds.divination: {
                return (
                    <>
                        {/* input part */}
                        <div className="flex flex-row sm:flex-col lg:flex-row px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
                            <div className="relative w-full flex flex-col gap-4">
                                <Textarea
                                    ref={textareaRef}
                                    placeholder="先问问题"
                                    onChange={handleInput}
                                    className='min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700'
                                    rows={2}
                                    autoFocus
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault();
                                            // submitStartQuestion();
                                        }
                                    }}
                                    disabled={isTopicInputComplete}
                                />

                            </div>
                            <div className="grid sm:grid-cols-1 gap-2 w-auto mt-2 ml-2">
                                <IconModal
                                    icon={<HexagramIcon size={40} />}
                                    label={`${isTopicInputComplete ? '再卜一卦' : '卜一卦'}`}
                                >
                                    <Divination startQuestion={startQuestion} onTopicInputUpdate={handleChange} />
                                </IconModal>
                            </div>
                        </div>
                        {/* card footnote */}
                        <div className="w-full mt-2 text-left">
                            <span className="text-muted-foreground">
                                Ask a question and press the button.
                            </span>
                        </div>
                    </>
                );
            }
            case TopicIds.general: {
                return null;
            }
        }
    };
    const renderedInputPanel = renderInputsForTopic();
    if (renderedInputPanel) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 }}
                key={"topicinputspanel"}
                className={'block'}
            >
                {/* wrap a border */}
                <div className="flex flex-col text-left border rounded-xl px-4 py-3.5 text-sm mb-5 justify-center items-center">
                    {renderedInputPanel}
                </div>
            </motion.div>
        );
    }

}