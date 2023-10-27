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
    console.log('matched', matched, urn);
    return {
      urnType: URNType.DAT,
      identifier: matched[1],
      pathType: matched[3],
      path: matched[2] ? matched[2] : undefined,
    };
  }
  if (matched = urn.match(/atom\:btc\:id\:([0-9a-f]{64}i\d+)((\/|\$)?.*$)/)) {
    console.log('matched', matched, urn);
    return {
      urnType: URNType.ATOMICAL_ID,
      identifier: matched[1],
      pathType: matched[3],
      path: matched[2] ? matched[2] : undefined,
    };
  }
  if (matched = urn.match(/atom\:btc\:realm\:(.+)((\/|\$)?.*$)/)) {
    console.log('matched', matched, urn);
    return {
      urnType: URNType.REALM,
      identifier: matched[1],
      pathType: matched[3],
      path: matched[2] ? matched[2] : undefined,
    };
  }
  if (matched = urn.match(/atom\:btc\:container\:(.+)((\/|\$)?.*$)/)) {
    console.log('matched', matched, urn);
    return {
      urnType: URNType.CONTAINER,
      identifier: matched[1],
      pathType: matched[3],
      path: matched[2] ? matched[2] : undefined,
    };
  }
  if (matched = urn.match(/atom\:btc\:arc\:(.+)((\/|\$)?.*$)/)) {
    console.log('matched', matched, urn);
    return {
      urnType: URNType.ARC,
      identifier: matched[1],
      pathType: matched[3],
      path: matched[2] ? matched[2] : undefined,
    };
  }
  console.log('matched', matched);
  throw new Error('Invalid URN: ' + urn);
};