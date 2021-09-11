import { VFC, useEffect } from "react";

export type BlockData = {
  id: number;
  width: number;
  left: number;
};

type Props = {
  id: number;
  width: number;
  left: number;
  selected: boolean;
  refs: React.MutableRefObject<HTMLDivElement[]>;
  onClick: (id: number) => void;
};

export const Block: VFC<Props> = ({
  id,
  width,
  left,
  selected,
  refs,
  onClick,
}) => {
  useEffect(() => {
    refs.current[id].style.width = `${width / 5}%`;
    refs.current[id].style.marginLeft = `${left / 5}%`;
  }, [id, refs, width, left]);
  return (
    <div
      ref={(element) => {
        if (element) refs.current[id] = element;
      }}
      className={`h-full cursor-pointer ${
        selected
          ? "bg-red-600 bg-opacity-25 hover:bg-red-500 hover:bg-opacity-25"
          : "hover:bg-red-400 hover:bg-opacity-20"
      }`}
      onClick={() => onClick(id)}
    />
  );
};
