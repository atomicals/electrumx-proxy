// Returns the subdomain part, ignoring the root domain of the site deployment
// Uses process.env.REACT_APP_ROOT_HOSTNAME
export const getSubdomainString = (): string => {
  if (process.env.REACT_APP_ROOT_HOSTNAME) {
    let indexRootStart: any = window.location.hostname.indexOf(process.env.REACT_APP_ROOT_HOSTNAME);
    if (indexRootStart <= 0) {
      indexRootStart = undefined;
      return window.location.hostname;
    }
    return window.location.hostname.substring(0, indexRootStart - 1);
  }
  console.log(
    'REACT_APP_ROOT_HOSTNAME was not set, using the entire domain hostname: ' +
      window.location.hostname
  );
  return window.location.hostname;
};
