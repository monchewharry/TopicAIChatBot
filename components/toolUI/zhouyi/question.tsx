import React from "react";
import clsx from "clsx";
import todayJson from "@/lib/toolData/today.json";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import Image from "next/image";

const todayData: string[] = todayJson;

function Question(props: { question: string; setQuestion: any }) {
  // const inputRef = createRef<HTMLTextAreaElement>();

  // function startClick() {
  //   const value = inputRef.current?.value;
  //   if (value === "") {
  //     return;
  //   }
  //   props.setQuestion(value);
  // }

  function todayClick(index: number) {
    props.setQuestion(todayData[index]);
  }

  return (
    <div
      className={clsx(
        "ignore-animate flex w-full max-w-md flex-col gap-4",
        props.question || "pt-6",
      )}
    >
      {props.question === "" ? (
        <>
          <div className="flex flex-wrap gap-3">
            {todayData.map((value, index) => (
              <button
                type='button'
                key={value}
                onClick={() => {
                  todayClick(index);
                }}
                className="rounded-md border bg-secondary p-2 text-sm text-muted-foreground shadow transition hover:scale-[1.03] dark:border-0 dark:text-foreground/80 dark:shadow-none"
              >
                {value}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Question;
