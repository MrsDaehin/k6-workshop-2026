const FALLBACK_ENV = 'qa';

const environmentBaserUrls = {
  dev: 'https://loyaltymvplt.phoenix.loc',
  qa: 'https://loyaltymvplt.phoenix.loc',
  uat: 'https://loyaltymvplt.phoenix.loc',
};


// Get URL from environment variable (required, no defaults)
function getUrlFromEnv(envVar) {
  if (typeof __ENV === 'undefined' || !__ENV || !__ENV[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}. ` +
      `Please define it in your .env file or pass it via --env ${envVar}=<value>`
    );
  }
  return __ENV[envVar];
}

// Get internal URLs for the selected environment
function getInternalUrls() {
    return {
      dev: getUrlFromEnv('INTERNAL_DEV_URL'),
      qa: getUrlFromEnv('INTERNAL_QA_URL'),
      uat: getUrlFromEnv('INTERNAL_UAT_URL'),
  };
}

function normalizeEnv(env) {
  if (!env) {
    return FALLBACK_ENV;
  }
  return String(env).toLowerCase();
}

/**
 * Normalize a URL by removing trailing slashes
 * This ensures consistent URL construction when concatenating base URL with paths
 */
function normalizeUrl(url) {
  if (!url) {
    return url;
  }
  // Remove trailing slashes
  return String(url).replace(/\/+$/, '');
}


export function getBaseUrl(env) {
  return environmentBaserUrls[env] || environmentBaserUrls['dev'];
}


// Always use internal endpoints
export function resolveEndpointMode() {
  return 'internal';
}