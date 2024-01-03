import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as net from "net";
import * as fs from "fs";
import * as path from "path";
import fetch from "node-fetch";
import server from "./server";

const PORT = process.env.PORT ?? 8080;

describe("TCPサーバーテスト", () => {
  beforeAll(() => {
    return new Promise((resolve, reject) => {
      server.listen(8080, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  it("TCP接続が正常に確立されるべき", (done) => {
    const client = new net.Socket();

    client.connect({ port: 8080 }, () => {
      expect(client).toBeTruthy(); // TCP接続が確立されたことを確認
      client.end();
    });
  });

  it("TCP経由でデータを送受信するべき", (done) => {
    const client = new net.Socket();
    const testData = "GET / HTTP/1.1\r\n\r\n";

    client.connect({ port: 8080 }, () => {
      client.write(testData);
    });

    client.on("data", (data) => {
      expect(data.toString()).toContain("HTTP/1.0"); // HTTPレスポンスが含まれていることを確認
      client.destroy(); // ソケットを閉じる
    });
  });
});

describe("HTTPサーバーテスト", () => {
  beforeAll(() => {
    return new Promise((resolve, reject) => {
      server.listen(PORT, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  it("【GETリクエスト】/index.htmlをリクエストしたとき /public/index.html が返されるべき", async () => {
    const response = await fetch(`http://localhost:${PORT}/index.html`);

    expect(response.ok).toBeTruthy();
    expect(await response.text()).toBe(
      fs.readFileSync(path.join(__dirname, "public", "index.html")).toString()
    );
    expect(response.headers.get("Content-Type")).toContain(
      "text/html; charset=utf-8"
    );
  });

  it("存在しないファイルにリクエストしたとき404 Not Foundが返されるべき", (done) => {
    const client = new net.Socket();

    client.connect({ port: PORT }, () => {
      client.write("GET /nonexistent.html HTTP/1.1\r\n\r\n");
    });

    client.on("data", (data) => {
      expect(data.toString()).toContain("HTTP/1.0 404 Not Found");
      client.destroy(); // ソケットを閉じる
    });
  });
});
