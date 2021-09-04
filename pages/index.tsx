import { GetStaticProps } from "next";
import { VFC, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

import { getHomeData, HomeData } from "library/getHomeData";
import { Avatar } from "components/avatar";

type Props = {
  homeData: HomeData;
};

const Home: VFC<Props> = ({ homeData }) => {
  // Twitter Script Element
  useEffect(() => {
    const s = document.createElement("script");
    s.setAttribute("src", "https://platform.twitter.com/widgets.js");
    s.setAttribute("async", "true");
    s.setAttribute("charset", "utf-8");
    document.head.appendChild(s);
  }, []);

  return (
    <>
      <Head>
        <title>SimulScore</title>
        <meta
          name="description"
          content="クラシック音楽のスコアリーディングを支援する動画・楽譜閲覧サイト"
        />
        <meta property="og:title" content="SimulScore" />
        <meta property="og:url" content="https://www.simulscore.app/" />
        <meta
          property="og:description"
          content="クラシック音楽のスコアリーディングを支援する動画・楽譜閲覧サイト"
        />
      </Head>

      <div className="w-screen flex flex-col overflow-auto">
        <header className="w-full text-warmGray-100 bg-green-800">
          <div className="flex pt-4">
            <div className="flex-grow"></div>
            <div className="flex-none pr-8">
              <Avatar />
            </div>
          </div>

          <div className="pb-8 text-center tracking-wide">
            <p className="text-xs sm:text-sm w-max mx-auto">
              クラシック音楽のスコアリーディングを支援する
              <br />
              動画・楽譜閲覧サイト
            </p>
            <h1 className="font-extrabold text-5xl sm:text-7xl pt-4 mx-auto">
              SimulScore
            </h1>
          </div>
        </header>

        <main className="px-4 py-10 bg-warmGray-100">
          <p className="text-2xl font-black text-center mb-8 text-green-800">
            対応楽曲一覧
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8">
            {homeData.composer.map((composer) => {
              return (
                <div key={composer.id} className="bg-white rounded">
                  <div className="bg-green-800 p-1 rounded-t">
                    <p className="mx-auto text-center text-white font-bold text-lg sm:text-xl">
                      {composer.name_jp ?? composer.name}
                    </p>
                  </div>
                  <ul className="px-2 py-1">
                    {composer.musics.map((music) => {
                      return (
                        <li key={music.id}>
                          <Link href={`/view/${music.id}`}>
                            <a className="text-sm sm:text-base text-left text-blue-700 hover:text-blue-500 hover:underline">
                              {music.title_jp ?? music.title}{" "}
                              <span className="text-xs sm:text-sm">
                                {music.opus}
                              </span>
                            </a>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="text-2xl font-black text-center mt-20 mb-8 text-green-800">
            更新情報
          </p>
          <div className="max-w-max mx-auto">
            <a
              className="twitter-timeline"
              data-lang="en"
              data-width="600"
              data-height="680"
              data-theme="light"
              href="https://twitter.com/simulscore?ref_src=twsrc%5Etfw"
            >
              Tweets by simulscore
            </a>
          </div>
        </main>

        <footer className="text-center bg-green-800 p-4">
          <small>
            <span className="text-warmGray-100 font-light text-xs">
              &copy; SimulScore 2021
            </span>
          </small>
        </footer>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const homeData: HomeData | null = await getHomeData();

  if (!homeData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      homeData,
    },
  };
};

export default Home;
