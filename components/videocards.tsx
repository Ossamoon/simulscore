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
    <div className="w-full flex flex-wrap items-start p-2">
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
            <a className="w-min min-w-max my-2 ml-3 p-3 rounded-md bg-white cursor-pointer hover:shadow-xl">
              <img
                src={`http://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                alt="thumbnail"
                className="w-60 shadow-sm"
              ></img>
              {v.players.map((p) => {
                return (
                  <div key={p.part + "_" + p.name} className="pt-4">
                    <p className="w-60 text-sm font-light">
                      {p.name_jp ?? p.name}
                    </p>
                    <p className="w-60 text-xs font-light italic text-gray-500">
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
