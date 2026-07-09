import http from "k6/http";

export  function testtonto () {

    
  const res = http.get("https://test-api.k6.io/public/crocodiles/");
  
  return { data: res };
}