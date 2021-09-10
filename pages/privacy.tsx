import { VFC } from "react";

import { Header } from "components/header";
import { Footer } from "components/footer";

const Privacy: VFC = () => {
  return (
    <>
      <div className="w-screen h-screen bg-warmGray-100 overflow-auto">
        <Header />

        <div className="max-w-3xl mx-auto px-8 my-16 text-warmGray-800">
          <h1 className="font-bold text-4xl text-green-800">
            プライバシーポリシー
          </h1>
          <p className="pt-12">
            SimulScore運営者（以下「運営者」といいます。）は、SimulScore（以下「本サービス」といいます。）の運営において取り扱う利用者の個人情報について、個人情報保護法その他法令を遵守し、適切な個人情報の保護を実践するために、以下のとおりプライバシーポリシーを定めます。
          </p>
          <ul className="pt-16 space-y-16">
            <li className="space-y-4">
              <h2 className="font-bold text-xl">
                1. 運営者が取得する情報とその取得方法
              </h2>
              <p>
                本サービスはGoogle
                Analyticsを用いて利用状況を把握しています。そのため、本サービスにアクセスした際に以下の情報が自動的に取得されます。これらの情報には個人を特定できる情報を含みません。
              </p>
              <ul className="list-disc pl-12 space-y-4">
                <li>Cookie情報</li>
                <li>ユーザーエージェント情報</li>
                <li>IPアドレス</li>
              </ul>
              <p>
                また、ログイン時にGoogleアカウントと連携された際、運営者は以下の情報を取得します
              </p>
              <ul className="list-disc pl-12 space-y-4">
                <li>アカウントID</li>
                <li>メールアドレス</li>
              </ul>
              <p>
                なお、Google
                Analyticsによる情報の取得方法については、下記ページを参照してください。
              </p>
              <ul className="text-sm pl-8">
                <li>
                  Google社のプライバシーポリシー:{" "}
                  <a
                    href="https://policies.google.com/privacy?hl=ja"
                    rel="noreferrer"
                    target="_blank"
                    className="text-blue-700"
                  >
                    https://policies.google.com/privacy?hl=ja
                  </a>
                </li>
                <li>
                  Google Analyticsのデータ保護:{" "}
                  <a
                    href="https://support.google.com/analytics/answer/6004245?hl=ja"
                    rel="noreferrer"
                    target="_blank"
                    className="text-blue-700"
                  >
                    https://support.google.com/analytics/answer/6004245?hl=ja
                  </a>
                </li>
              </ul>
            </li>
            <li className="space-y-4">
              <h2 className="font-bold text-xl">2. 利用目的</h2>
              <p>
                運営者は、取得した利用者の情報を以下の目的のために利用します。
              </p>
              <ul className="pl-8 space-y-4">
                <li>(1) 利用者の本人確認および認証のため</li>
                <li>(2) 利用者からの問い合わせに対応するため</li>
                <li>
                  (3) 不正行為または違法となる可能性のある行為を防止するため
                </li>
                <li>(4) 本サービスの円滑な運営と利用規約の施行のため</li>
                <li>(5) システムメンテナンスやサービス不具合の対応のため</li>
                <li>
                  (6) 利用者を識別できない形式に加工した統計データを作成するため
                </li>
                <li>
                  (7)
                  本サービスに関する利用規約またはプライバシーポリシーの変更、本サービスの停止・終了・その他本サービスに関する重要なお知らせ等の通知のため
                </li>
              </ul>
            </li>
            <li className="space-y-4">
              <h2 className="font-bold text-xl">
                3. 運営者が取得する情報の第三者への提供
              </h2>
              <p>
                運営者は、以下の場合を除き、取得した個人情報を第三者に開示・提供・共有することはありません
              </p>
              <ul className="pl-8 space-y-4">
                <li>(1) 利用者本人の同意を得た場合</li>
                <li>
                  (2)
                  利用者を識別することができない状態で統計的なデータとして開示・提供するとき
                </li>
                <li>
                  (3) 法令に基づき公的機関または政府機関から開示を要求された場合
                </li>
              </ul>
            </li>
            <li className="space-y-4">
              <h2 className="font-bold text-xl">4. 個人情報の保護</h2>
              <p>
                運営者は、利用者の個人情報の紛失、盗用、悪用、不正アクセス、改ざんおよび破損を防ぐために、合理的範囲内で技術的および物理的措置を講じています。
              </p>
            </li>
            <li className="space-y-4">
              <h2 className="font-bold text-xl">
                5. プライバシーポリシーの改定
              </h2>
              <p>
                運営者は、事前の通知をすることなくプライバシーポリシーを随時改定することがあり、運営者のウェブサイトに掲載した時点から適用されるものとします。ただし、利用目的が大きく変更される場合は、改めて利用者から同意を得るものとします。
              </p>
            </li>
          </ul>

          <p className="pt-20 text-sm">2021年9月13日 制定</p>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Privacy;
