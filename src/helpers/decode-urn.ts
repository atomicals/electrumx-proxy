export enum URNType {
  ATOMICAL_ID = 0,
  REALM = 1,
  CONTAINER = 2,
  DAT = 3,
  ARC = 4,
}
export interface URNInfo {
  urnType: URNType;
  identifier: string;
  pathType?: '$' | '/';
  path?: string;
}

export const decodeURN = (urn: string): URNInfo => {
  let matched;
  // /urn/atom:btc:dat:0d4d83cfb24b6d740031fb937daed09dc77fa4d0a1e46e3b0aa57c992f4863dei0/some/path/image.png
  if (matched = urn.match(/atom\:btc\:dat\:([0-9a-f]{64}i\d+)((\/|\$)?.*$)/)) {
    console.log('matched', matched)
    return {
      urnType: URNType.DAT,
      identifier: matched[0],
      path: matched[2] ? matched[2] : undefined,
    };
  }
  console.log('matched', matched);
  throw new Error('Invalid URN: ' + urn);
};