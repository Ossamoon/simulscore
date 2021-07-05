import { VFC } from "react";
import { MovementInfo } from "library/getMusicData";

type Props = {
  currentMeasure: number;
  movementsData: MovementInfo[];
  onClick: (id: number) => void;
};

export const MovList: VFC<Props> = ({
  currentMeasure,
  movementsData,
  onClick,
}) => {
  return (
    <div className="border-l-2 border-gray-300 ml-5">
      <ul className="list-none pl-px pt-4 pb-2">
        {movementsData.map((mov) => {
          return (
            <li key={mov.movement} className="flex items-center">
              <div
                className={`rounded-full w-3 h-3 flex-shrink-0 cursor-pointer transform -translate-x-2 ${
                  currentMeasure === mov.movement
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
                onClick={() => onClick(9800 + mov.movement)}
              ></div>
              <div
                className={`ml-2 m-3 text-sm tracking-wide cursor-pointer truncate hover:text-gray-400 ${
                  currentMeasure === mov.movement ? "font-bold" : "font-light"
                }`}
                onClick={() => onClick(9800 + mov.movement)}
              >
                {mov.title_jp ?? mov.title}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
