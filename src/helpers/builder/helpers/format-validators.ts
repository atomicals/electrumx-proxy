
export const isValidNameBase = (name: string, isTLR = false) => {
  if (!name) {
    throw new Error('Null name');
  }
  if (name.length > 64 || name.length === 0) {
    throw new Error('Name cannot be longer than 64 characters and must be at least 1 character');
  }

  if (name[0] === '-') {
    throw new Error('Name cannot begin with a hyphen');
  }
  if (name[name.length - 1] === '-') {
    throw new Error('Name cannot end with a hyphen');
  }
  if (isTLR) {
    if (name[0] >= '0' && name[0] <= '9') {
      throw new Error('Top level realm name cannot start with a number');
    }
  }
  return true;
}

export const isValidContainerName = (name: string) => {
  isValidNameBase(name);
  if (!/^[a-z0-9][a-z0-9\-]{0,63}$/.test(name)) {
    throw new Error('Invalid container name');
  }
  return true;
}

export const isValidRealmName = (name: string) => {
  const isTLR = true;
  isValidNameBase(name, isTLR);
  if (!/^[a-z][a-z0-9\-]{0,63}$/.test(name)) {
    throw new Error('Invalid realm name');
  }
  return true;
}

export const isValidSubRealmName = (name: string) => {
  isValidNameBase(name);
  if (!/^[a-z0-9][a-z0-9\-]{0,63}$/.test(name)) {
    throw new Error('Invalid subrealm name');
  }
  return true;
}

export const isValidTickerName = (name: string) => {
  isValidNameBase(name);
  if (!/^[a-z0-9]{1,21}$/.test(name)) {
    throw new Error('Invalid ticker name');
  }
  return true;
}
