/**
 * Environment consent definitions used by the authentication helpers.
 *
 * Each environment can define consent types (health, marketing, privacy) with their
 * corresponding IDs and versions. These values are static configuration and not secrets.
 */

const environmentConsents = {
  dev: [
    {
      consentsId: "b1e6a5d8-7a4b-4b8e-b0c9-93269a5b5fd1",
      type: "health",
      version: 1
    },
    {
      consentsId: "a3f2c9d4-8c0a-4b22-a492-239a392e3d5a",
      type: "marketing",
      version: 2
    },
    {
      consentsId: "4d8c30d9-e857-442a-a779-9a2a1225e44b",
      type: "privacy",
      version: 2
    }
  ],
  uat: [
    {
      consentsId: "b1e6a5d8-7a4b-4b8e-b0c9-93269a5b5fd1",
      type: "health",
      version: 1
    },
    {
      consentsId: "a3f2c9d4-8c0a-4b22-a492-239a392e3d5a",
      type: "marketing",
      version: 2
    },
    {
      consentsId: "4d8c30d9-e857-442a-a779-9a2a1225e44b",
      type: "privacy",
      version: 2
    }
  ],
  qa: [
    {
      consentsId: "b1e6a5d8-7a4b-4b8e-b0c9-93269a5b5fd1",
      type: "health",
      version: 1
    },
    {
      consentsId: "a3f2c9d4-8c0a-4b22-a492-239a392e3d5a",
      type: "marketing",
      version: 2
    },
    {
      consentsId: "4d8c30d9-e857-442a-a779-9a2a1225e44b",
      type: "privacy",
      version: 2
    }
  ]
};

/**
 * Gets consent definitions for a specific environment
 * @param {string} env - Environment name ('dev', 'uat', 'qa')
 * @returns {Array} Array of consent objects with consentsId, type, and version
 */
export function getConsents(env) {
  const normalizedEnv = env ? String(env).toLowerCase() : 'dev';
  return environmentConsents[normalizedEnv] || environmentConsents['dev'];
}
