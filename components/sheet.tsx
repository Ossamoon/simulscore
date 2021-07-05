import { VFC } from "react";
import { Row, RowData } from "./row";

type Props = {
  page: number;
  srcdir: string;
  rows: RowData[];
  current: number;
  refs: React.MutableRefObject<HTMLDivElement[]>;
  onClick: (id: number) => void;
};

export const Sheet: VFC<Props> = ({
  page,
  srcdir,
  rows,
  current,
  refs,
  onClick,
}) => {
  return (
    <div className="relative w-full mb-px">
      <img
        src={srcdir + `${page}.png`}
        alt={`page${page}`}
        className="w-full select-none pointer-events-none"
      />
      {[...Array(rows.length)].map((_, i) => {
        return (
          <Row
            key={`r_${rows[i].id}`}
            id={rows[i].id}
            top={rows[i].top}
            height={rows[i].height}
            blocks={rows[i].blocks}
            current={current}
            refs={refs}
            onClick={onClick}
          />
        );
      })}
    </div>
  );
};
