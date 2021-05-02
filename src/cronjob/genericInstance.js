import axios from "axios";

let cookie;

let baseURL = "https://www.nseindia.com/option-chain";

let headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "accept-language": "en,gu;q=0.9,hi;q=0.8",
  "accept-encoding": "gzip, deflate, br",
};

const instance = axios.create({
  baseURL: baseURL,
  headers: headers,
  cookie: cookie ? cookie : "",
});

// nsit=kSzZRbdPje8hL7ynmIbrTXFp;nseappid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcGkubnNlIiwiYXVkIjoiYXBpLm5zZSIsImlhdCI6MTYxNzQ3ODI5MSwiZXhwIjoxNjE3NDgxODkxfQ.gbgjsyPIhh2XykVX6W5y-5t0YiJotZAJHc2eQxsgtAM;
const getCookies = async () => {
  try {
    const response = await instance.get(baseURL);
    cookie = response.headers["set-cookie"];
    let nsit = cookie[0].split(";")[0];
    let nseappid = cookie[1].split(";")[0];
    cookie = `${nsit};${nseappid}`
    console.log("getCookies =========> cookie updated successfully", cookie);

  } catch (error) {
    if (error.response.status === 403) {
      console.log("getCookies =========> error.status === 403");
    //   await getCookies();
    } else {
      console.log("getCookies =========> error");
    }
  }
};

export { instance, cookie, getCookies };
