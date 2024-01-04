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

  it("【GETリクエスト】/index.jsをリクエストしたとき /public/index.js が返されるべき", async () => {
    const response = await fetch(`http://localhost:${PORT}/index.js`);

    expect(response.ok).toBeTruthy();
    expect(await response.text()).toBe(
      fs.readFileSync(path.join(__dirname, "public", "index.js")).toString()
    );
    expect(response.headers.get("Content-Type")).toContain(
      "text/javascript; charset=utf-8"
    );
  });

  it("【GETリクエスト】/index.cssをリクエストしたとき /public/index.css が返されるべき", async () => {
    const response = await fetch(`http://localhost:${PORT}/index.css`);

    expect(response.ok).toBeTruthy();
    expect(await response.text()).toBe(
      fs.readFileSync(path.join(__dirname, "public", "index.css")).toString()
    );
    expect(response.headers.get("Content-Type")).toBe(
      "text/css; charset=utf-8"
    );
  });

  it("【GETリクエスト】存在しないファイルにリクエストしたとき404 Not Foundが返されるべき", async () => {
    const response = await fetch(`http://localhost:${PORT}/hogehoge.html`);

    expect(response.ok).toBeFalsy();
    expect(await response.status).toBe(404);
    expect(await response.statusText).toBe("Not Found");
  });

  it("【HEADリクエスト】HEADリクエストでヘッダーのみが返されるべき", async () => {
    const response = await fetch(`http://localhost:${PORT}/index.html`, {
      method: "HEAD",
    });
    expect(response.headers.get("Content-Type")).toContain(
      "text/html; charset=utf-8"
    );
    expect(response.bodyUsed).toBeFalsy(); // レスポンスボディは未使用であるべき
  });
  it("【リダイレクト】一時的リダイレクトが正しく機能する", async () => {
    const response = await fetch(
      `http://localhost:${PORT}/redirect-from.html`,
      { redirect: "manual" }
    );

    expect(response.status).toBe(302); // ステータスコードが 302 であること
    expect(response.headers.get("location")).toBe("/redirect-to.html"); // Location ヘッダーが正しいパスを指していること
  });

  it("【リダイレクト】永続的リダイレクトが正しく機能する", async () => {
    const response = await fetch(
      `http://localhost:${PORT}/permanent-redirect-from.html`,
      { redirect: "manual" }
    );

    expect(response.status).toBe(301); // ステータスコードが 301 であること
    expect(response.headers.get("location")).toBe(
      "/permanent-redirect-to.html"
    ); // Location ヘッダーが正しいパスを指していること
  });
});
