import { VFC, useEffect, useRef } from "react";
import { Block, BlockData } from "./block";

export type RowData = {
  id: number;
  top: number;
  height: number;
  blocks: BlockData[];
};

type Props = {
  id: number;
  top: number;
  height: number;
  blocks: BlockData[];
  current: number;
  refs: React.MutableRefObject<HTMLDivElement[]>;
  onClick: (id: number) => void;
};

export const Row: VFC<Props> = ({
  top,
  height,
  blocks,
  current,
  refs,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.top = `${top / 5}%`;
      ref.current.style.height = `${height / 5}%`;
    }
  }, [top, height]);
  return (
    <div ref={ref} className={"absolute flex w-full z-20"}>
      {[...Array(blocks.length)].map((_, i) => {
        return (
          <Block
            key={`b_${blocks[i].id}`}
            id={blocks[i].id}
            width={blocks[i].width}
            left={blocks[i].left}
            selected={blocks[i].id === current}
            refs={refs}
            onClick={onClick}
          />
        );
      })}
    </div>
  );
};
