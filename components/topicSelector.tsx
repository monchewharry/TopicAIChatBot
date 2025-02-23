'use client';
import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatTopicAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatTopics } from '@/lib/ai/topics';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import type { TopicIds } from '@/lib/definitions';

export function TopicSelector({
    selectedTopicId,
    className,
}: {
    selectedTopicId: TopicIds;
} & React.ComponentProps<typeof Button>) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [optimisticTopicId, setOptimisticTopicId] =
        useOptimistic(selectedTopicId);

    const selectedTopic = useMemo(
        () => chatTopics.find((chatTopic) => chatTopic.id === optimisticTopicId),
        [optimisticTopicId],
    );

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                asChild
                className={cn(
                    'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
                    className,
                )}
            >
                <Button variant="outline" className="md:px-2 md:h-[34px]">
                    {selectedTopic?.name}
                    <ChevronDownIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[300px]">
                {chatTopics.map((chatTopic) => {
                    const { id } = chatTopic;

                    return (
                        <DropdownMenuItem
                            key={id}
                            onSelect={() => {
                                setOpen(false);

                                startTransition(() => {
                                    setOptimisticTopicId(id);
                                    saveChatTopicAsCookie(id);
                                });
                                router.push('/');
                                router.refresh();
                            }}
                            className="gap-4 group/item flex flex-row justify-between items-center"
                            data-active={id === optimisticTopicId}
                        >
                            <div className="flex flex-col gap-1 items-start">
                                <div>{chatTopic.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {chatTopic.description}
                                </div>
                            </div>

                            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                                <CheckCircleFillIcon />
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
