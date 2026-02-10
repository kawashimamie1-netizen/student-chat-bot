
import { BuildingInfo } from './types';

export const CAMPUS_DATA: BuildingInfo[] = [
  {
    id: '1',
    name: '1号館',
    details: ['2F：大学事務局', '4F：教職支援室']
  },
  {
    id: '2',
    name: '2号館',
    details: ['地域計画研究所']
  },
  {
    id: '3',
    name: '3号館',
    details: ['（詳細情報なし）']
  },
  {
    id: '5',
    name: '5号館',
    details: ['1F：金沢工業大学内簡易郵便局']
  },
  {
    id: '6-north',
    name: '6号館（北側）：ライブラリーセンター',
    details: [
      '2F：総合フロア／Digital Contents Factory／AVコーナー',
      '3F：PMC',
      '4F：閲覧室',
      '5~10F：分野別フロア',
      '11F：女性専用フロア'
    ]
  },
  {
    id: '6-south',
    name: '6号館（南側）',
    details: ['情報処理サービスセンター', '多目的ホール']
  },
  {
    id: '7',
    name: '7号館',
    details: ['1F：自習室']
  },
  {
    id: '8',
    name: '8号館',
    details: ['2F：自己開発センター', '3F：パソコンセンター']
  },
  {
    id: '9',
    name: '9号館',
    details: ['放送大学石川学習センター']
  },
  {
    id: '10',
    name: '10号館',
    details: ['2F：進路開発センター']
  }
];

export const SYSTEM_INSTRUCTION = `
あなたは大学の受付窓口係です。
以下の資料（Campus Data）にある情報のみに基づいて、丁寧かつ正確に回答してください。
資料に記載がない事項については、誠に恐縮ながら「分かりかねます」と丁寧にお答えし、勝手な推測で答えないでください。

資料：
${CAMPUS_DATA.map(b => `${b.name}\n${b.details.join('\n')}`).join('\n\n')}
`;
