'use client';
import { useChatContext } from '@/context/chatContext';
import { useState } from 'react';
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



export function TopicInput({
    onInputChange
}: TopicInputProps
) {
    const [open, setOpen] = useState(false);
    const [genderOpen, setGenderOpen] = useState(false);
    const { topicInputValues, setTopicInputValues } = useChatContext();

    const handleChange = (updatedValues: Partial<TopicInputs>) => {
        // const newTopicInput = { ...topicInputValues, ...updatedValues } as TopicInputs; // Overrides only the fields that are being updated
        setTopicInputValues(prev => ({ ...prev, ...updatedValues } as TopicInputs));
        onInputChange();
    };

    const renderInputsForTopic = () => {
        switch (topicInputValues.topicId) {
            case TopicIds.numerology: {
                return (
                    <div className="text-left border rounded-xl px-4 py-3.5 text-sm">
                        {/* input part */}
                        <div className="flex flex-col sm:flex-col lg:flex-row w-full h-auto justify-start items-start">
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
                    </div>
                );
            }
            // Add more cases for other topics as needed
            case TopicIds.divination: {
                return (
                    <div className="text-left border rounded-xl px-4 py-3.5 text-sm">
                        <div className="grid sm:grid-cols-4 gap-2 w-full">
                            <IconModal
                                icon={<HexagramIcon size={40} />}
                                label="卜一卦"
                            >
                                <Divination mode={"NEWGUA"} onUpdate={handleChange} />
                            </IconModal>
                        </div>

                        <div className="w-full mt-2 text-left">
                            <span className="text-muted-foreground">
                                卜筮
                            </span>
                        </div>
                    </div>
                );
            }
            default: {
                return null;
            }
        }
    };

    return (
        <div className="grid sm:grid-cols-2 lg:flex lg:flex-row gap-2 w-full">
            {renderInputsForTopic()}
        </div>
    );
}