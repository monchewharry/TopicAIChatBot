import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";

const rotationDuration = 3800;
const bezier = "cubic-bezier(0.645,0.045,0.355,1)";

function Coin(props: {
  frontList: boolean[];
  rotation: boolean;
  onTransitionEnd: any;
}) {
  const [lastFront, setLastFront] = useState(props.frontList);
  const frontListWithId = props.frontList.map((item, index) => ({
    id: index,
    value: item,
  }));
  useEffect(() => {
    if (!props.rotation) {
      return;
    }

    const id = setTimeout(() => {
      setLastFront(props.frontList);
      props.onTransitionEnd();
    }, rotationDuration);
    return () => clearTimeout(id);
  });

  return (
    <div className="flex w-full max-w-md justify-around rounded-md border bg-secondary p-4 shadow dark:border-0 dark:shadow-none sm:p-6">
      {frontListWithId.map((value, index) => (
        <CoinItem
          key={`${value.id}}`} // Unique enough for stable rendering
          front={value.value}
          lastFront={lastFront[index]}
          rotation={props.rotation}
        />
      ))}
    </div>
  );
}

function CoinItem(props: {
  front: boolean;
  lastFront: boolean;
  rotation: boolean;
  onTransitionEnd?: any;
}) {
  let animate = "";
  if (props.rotation) {
    // animate-[coin-front-front_3.8s_cubic-bezier(0.645,0.045,0.355,1)]
    // animate-[coin-front-back_3.8s_cubic-bezier(0.645,0.045,0.355,1)]
    // animate-[coin-back-front_3.8s_cubic-bezier(0.645,0.045,0.355,1)]
    // animate-[coin-back-back_3.8s_cubic-bezier(0.645,0.045,0.355,1)]
    animate = `animate-[coin-${getFront(props.lastFront)}-${getFront(
      props.front,
    )}_${rotationDuration / 1000}s_${bezier}]`;
  }
  return (
    <div
      style={{
        transform: `rotateY(${props.front ? 0 : 180}deg)`,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50% -0.5px",
      }}
      className={clsx("h-16 w-16 sm:h-20 sm:w-20", animate)}
    >
      <Image
        width={0}
        height={0}
        sizes="100vw"
        draggable={false}
        className="absolute w-full"
        src="/images/head.webp"
        alt="coin"
      />
      <Image
        width={0}
        height={0}
        sizes="100vw"
        draggable={false}
        className="absolute h-full w-full"
        style={{ transform: "translateZ(-1px)" }}
        src="/images/tail.webp"
        alt="coin"
      />
    </div>
  );
}

function getFront(front: boolean): string {
  return front ? "front" : "back";
}

export default Coin;
