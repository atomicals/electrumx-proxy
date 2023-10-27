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
  if (matched = urn.match(/atom\:btc\:dat\:([0-9a-f]{64}i\d+)((\/|\$)?.*$)/)) {
    console.log('matched', matched);
    return {
      urnType: URNType.DAT,
      identifier: matched[1],
      pathType: matched[3],
      path: matched[2] ? matched[2] : undefined,
    };
  }
  console.log('matched', matched);
  throw new Error('Invalid URN: ' + urn);
};