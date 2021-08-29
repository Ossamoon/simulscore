import Link from "next/link";
import { VFC } from "react";
import { VideoInfo } from "library/getMusicData";

type Props = {
  musicId: string;
  scoreId: string;
  otherVideoInfos: VideoInfo[];
};

export const VideoCards: VFC<Props> = ({
  musicId,
  scoreId,
  otherVideoInfos,
}) => {
  return (
    <div className="w-full flex space-x-2 bg-warmGray-200 rounded-md shadow-inner flex-nowrap overflow-x-auto px-2 pt-2 pb-4">
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
            <a className="w-min min-w-max rounded-lg p-2 bg-white cursor-pointer hover:shadow-md">
              <img
                src={`http://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                alt=""
                className="w-52"
              ></img>
              {v.players.map((p) => {
                return (
                  <div key={p.part + "_" + p.name} className="w-52 pt-3">
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
