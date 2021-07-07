import React, { useMemo, useCallback, useRef, VFC } from "react";
import { Sheet } from "components/sheet";
import scoreData from "data/music/A0008/score/405834.json";

const TestScore: VFC<{}> = () => {
  const scoreId = useMemo(() => scoreData.scoreId, []);
  const blocks = useRef<HTMLDivElement[]>(Array(9800));

  const onDivClick = useCallback((id: number): void => {
    console.log(id);
  }, []);

  return (
    <div className="w-full overflow-y-auto">
      {[...Array(scoreData.positions.length)].map((_, i) => {
        return (
          <>
            <p>page {scoreData.positions[i].page}</p>
            <Sheet
              key={`p_${scoreData.positions[i].page}`}
              srcdir={`https://storage.googleapis.com/treatedscorebucket/images/${scoreId}/`}
              page={scoreData.positions[i].page}
              rows={scoreData.positions[i].rows}
              current={9999}
              refs={blocks}
              onClick={onDivClick}
            />
          </>
        );
      })}
    </div>
  );
};

export default TestScore;
