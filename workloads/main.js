import { navigateHomepage } from "./tests/navigateHomepage.js";
import { addToCart } from "./tests/addToCart.js";
import { navigateToCart } from "./tests/navigateToCart.js";
import { navigateToCheckout } from "./tests/navigateToCheckout.js";
import { updateAddress } from "./tests/updateAddress.js";
import { submitCheckout } from "./tests/submitCheckout.js";
import { tagWithCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js';

export const options = {};

// used to store global variables
globalThis.vars = [];

// global min/max sleep durations (in seconds):
globalThis.pauseMin = 5;
globalThis.pauseMax = 15;

export default function main() {

  tagWithCurrentStageIndex();
 
  navigateHomepage();
  
  addToCart();
  navigateToCart();
  navigateToCheckout();
  updateAddress();
  submitCheckout();
}
