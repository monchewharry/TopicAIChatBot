// import React from "react";
import clsx from "clsx";
import type { HexagramObj } from '@/lib/definitions'
import { memo } from "react";
function PureHexagram(props: { list: HexagramObj[] }) {
  return (
    <div className="flex h-52 w-56 shrink-0 flex-col-reverse gap-1.5 overflow-hidden rounded-md border bg-secondary py-3 shadow-inner dark:border-0 dark:shadow-none sm:h-60 sm:w-72">
      {props.list.map((value, _) => {
        return (
          <div key={value.id} className="flex flex-col-reverse gap-1.5">
            {value.separate && <div className="h-0.5 sm:h-1" />}
            <Line change={value.change} yang={value.yang} hexid={value.id} />
          </div>
        );
      })}
    </div>
  );
}

const Hexagram = memo(PureHexagram);


function Line(props: { change: boolean | null; yang: boolean; hexid: number }) {
  const changeYang = props.change && props.yang;
  const color = props.change ? "bg-red-400" : "bg-stone-400";
  return (
    <div className="flex h-[24px] w-full animate-[transform-x_0.3s_ease-out] items-center justify-center sm:h-[29px]">
      <HexId hexid={props.hexid} />
      {props.yang ? (
        <div className={clsx("h-full w-4/5 sm:w-[83%]", color)} />
      ) : (
        <div className="flex h-full w-4/5 justify-between sm:w-[83%]">
          <div className={clsx("h-full w-[46%]", color)} />
          <div className={clsx("h-full w-[46%]", color)} />
        </div>
      )}
      {props.change ? <Change changeYang={changeYang} /> : null}
    </div>
  );
}
function HexId(props: { hexid: number }) {
  return (
    <div className="h-0 w-0">
      <div className="relative -left-2 -top-3">
        <span className="text-sm text-muted-foreground">{props.hexid}</span>
      </div>
    </div>
  );
}
function Change(props: { changeYang: boolean | null }) {
  return (
    <div className="h-0 w-0">
      <div className="relative -right-1 -top-3">
        {props.changeYang ? (
          <span className="text-sm text-muted-foreground">○</span>
        ) : (
          <span className="relative -right-0.5 text-sm text-muted-foreground">
            ✕
          </span>
        )}
      </div>
    </div>
  );
}
export default Hexagram;
