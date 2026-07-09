import { sleep, group } from "k6";
import http from "k6/http";
import { checkStatus } from "../shared/utils.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import {
  describe,
  expect,
} from "https://jslib.k6.io/k6chaijs/4.3.4.2/index.js";

export function addToCart() {
  group("Add to Cart", function () {
    describe("should add an item to Cart", () => {
      const response = http.post(
        "http://ecommerce.test.k6.io/?wc-ajax=add_to_cart",
        {
          product_sku: globalThis.vars["selectedProduct"].sku,
          product_id: globalThis.vars["selectedProduct"].id,
          quantity: "1",
        },
        {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US,en;q=0.9",
            connection: "keep-alive",
            "content-type":
              "application/x-www-form-urlencoded;type=content-type;mimeType=application/x-www-form-urlencoded",
            host: "ecommerce.test.k6.io",
            origin: "http://ecommerce.test.k6.io",
            "x-requested-with": "XMLHttpRequest",
          },
        }
      );
      expect(response.status, "response status").to.equal(500);
      expect(response).to.have.validJsonBody();
      
      return response;

    });
  });

  sleep(randomIntBetween(pauseMin, pauseMax));
}
