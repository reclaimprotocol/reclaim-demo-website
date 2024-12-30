// * There isn't a uniform/universal way to detect if the user is browsing a webpage from a mobile device, but this seems to work most of the time and might be enough for our case.
export const userAgentIsMobile =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLocaleLowerCase()
  ) || (window.orientation ?? -1) > -1;

export const userAgentIsAndroid =
  navigator.userAgent.toLocaleLowerCase().includes("android") || undefined;

export const userAgentIsIOS =
  /mac|iphone|ipad|ipod/i.test(navigator.userAgent.toLocaleLowerCase()) ||
  undefined;
