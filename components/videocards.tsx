import Link from "next/link";
import { VFC } from "react";
import { VideoInfo } from "library/getMusicData";

type Props = {
  musicId: string;
  scoreId: string;
  isFlexWrap: boolean;
  otherVideoInfos: VideoInfo[];
};

export const VideoCards: VFC<Props> = ({
  musicId,
  scoreId,
  isFlexWrap,
  otherVideoInfos,
}) => {
  return (
    <div
      className={`w-full flex items-start ${
        isFlexWrap ? "flex-wrap" : "flex-nowrap overflow-y-auto pl-2 pr-4"
      }`}
    >
      {otherVideoInfos.map((v) => {
        return (
          <Link
            key={v.videoId}
            href={{
              pathname: `/view/${musicId}`,
              query: {
                vid: `${v.videoId}`,
                sid: `${scoreId}`,
              },
            }}
          >
            <a className="w-min min-w-max p-2 ml-2 mt-4 rounded-lg bg-white cursor-pointer hover:shadow-xl">
              <img
                src={`http://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                alt="thumbnail"
                className={isFlexWrap ? "w-60" : "w-52"}
              ></img>
              {v.players.map((p) => {
                return (
                  <div
                    key={p.part + "_" + p.name}
                    className={isFlexWrap ? "w-60 pt-3" : "w-52 pt-3"}
                  >
                    <p className="px-1 text-sm text-warmGray-700 font-light">
                      {p.name_jp ?? p.name}
                    </p>
                    <p className="px-1 text-xs font-light italic text-warmGray-500">
                      {p.part_jp ?? p.part}
                    </p>
                  </div>
                );
              })}
            </a>
          </Link>
        );
      })}
    </div>
  );
};
