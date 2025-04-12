
# 3x-ui-sub-proxy

Lightweight proxy server that provides subscriptions from the **3x-ui**

---

## 📦 Description

This project implements a proxy server for aggregating and filtering subscriptions from the **3x-ui** system. It allows combining subscriptions from multiple sources, applying filtering, and returning the final subscription with customizable headers and statistics.

---

## 🔧 Features

- 🔗 Aggregation of subscriptions from multiple 3x-ui sources
- 🧹 Filtering subscription strings (e.g., `sub`) using regular expressions and length restrictions
- ⚙️ Flexible aggregation of statistics (`upload`, `download`, `total`, `expire`)
- 🧾 Support for custom HTTP headers (including base64 or string for titles)

---

## ⚙️ Configuration

The `config.example.json` file:

```json
{
  "port": 8080,
  "rules": {
    "minLength": 40,
    "maxLength": 40,
    "regex": "^[a-zA-Z0-9_]+$"
  },
  "upload": "sum",
  "download": "sum",
  "total": "sum",
  "expire": "max",
  "headers": {
    "support-url": "https://fb.com/",
    "profile-title": "base64:0JPQvtC7PyDQpdGD0LkhINCo0YLQsNC90LPQsCEg8J+agA==",
    "profile-update-interval": 4,
    "content-type": "text/plain; charset=utf-8"
  },
  "threexui": [
    {
      "uri": "http://localhost:2096/sub/"
    },
    {
      "uri": "https://fb.com/",
      "timeout": 250
    }
  ]
}
```

### Parameter Explanation:

- **`port`** – The port on which the proxy server will run.
- **`rules`** – Rules for filtering subscription strings (e.g., `sub`):
  - **`minLength`**, **`maxLength`**: Limits on the length of the subscription string.
  - **`regex`**: A regular expression to filter subscriptions.
- **`upload`, `download`, `total`, `expire`** – Methods for aggregating statistics:
  - **`sum`**: Sum of values from all sources.
  - **`max`**: Select the maximum value.
  - **`min`**: Select the minimum value.
  - **`value`**: Set a fixed numeric value (e.g., `"value": 1000`).
- **`headers`** – HTTP headers the proxy server will return:
  - **`support-url`**: A link to the support page.
  - **`profile-title`**: A string or base64-encoded profile title.
  - **`profile-update-interval`**: Profile update interval in hours.
  - **`content-type`**: MIME type of the response content.
- **`threexui`** – A list of subscription sources:
  - **`uri`**: The URL of the subscription source.
  - **`timeout`** (optional): Timeout for the request in milliseconds.

---

## 🚀 Running the Project

1. Clone the project from GitHub:

   ```bash
   git clone https://github.com/twocolors/3x-ui-sub-proxy.git
   ```

2. Navigate to the project directory:

   ```bash
   cd 3x-ui-sub-proxy
   ```

3. Install the dependencies using npm:

   ```bash
   npm install
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Start the project:

   ```bash
   npm run start config.example.json
   ```

---

## 🧪 Example Request

```
GET http://localhost:8080/40bd001563085fc35165329ea1ff5c5ecbdbbeef
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=utf-8
< support-url: https://fb.com/
< profile-title: base64:0JPQvtC7PyDQpdGD0LkhINCo0YLQsNC90LPQsCEg8J+agA==
< profile-update-interval: 4
< subscription-userinfo: upload=0; download=0; total=4294967296; expire=1746699658
< Content-Length: 220
< ETag: W/"dc-0g4TGBYj6ukl2R/8e1Q06Lha0+4"
< Date: Sat, 12 Apr 2025 21:07:09 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5

vless://607cd06a-f843-410a-****-d221e1a1f47e@localhost:24575?fp=chrome&pbk=l5kU7_kbLmODMyDlYPsBaMaan3cqWWYD3j1hqcEwm28&security=reality&sid=53b8&sni=yahoo.com&spx=%2FSxFj9vA48Y8mZ20&type=tcp#test%20/%20Sweden%20/%20vless

GET http://localhost:8080/40bd001563085fc35165329ea1ff5c5ecbdbbeef_1
< HTTP/1.1 404 Not Found
< Cache-Control: no-store
< Content-Type: application/json; charset=utf-8
< Content-Length: 22
< ETag: W/"16-c1DLRwOpbqfBQL0w2pptG8/zbrI"
< Date: Sat, 12 Apr 2025 21:08:39 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5

{"detail":"Not Found"}
```