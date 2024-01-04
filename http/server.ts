// https://nodejs.org/dist/latest-v20.x/docs/api/net.html#class-netsocket
import * as net from "net";
import * as fs from "fs";
import * as path from "path";

// リダイレクトルールの読み込み
const redirectRules = JSON.parse(
  fs.readFileSync(path.join(__dirname, "redirect.json"), "utf8")
);

const server = net.createServer();

server.on("connection", (socket) => {
  socket.on("data", (data) => {
    const requestData = data.toString();

    // リクエストヘッダとボディを分割
    if (requestData.includes("\r\n\r\n")) {
      const [header, body] = requestData.split("\r\n\r\n");

      // リクエストメソッドとパスの解析
      const requestLine = header.split("\n")[0];
      const [method, requestedPath] = requestLine.split(" ");

      // リダイレクトルールのチェック
      const redirectRule = redirectRules.find(
        (rule: { from: string }) => rule.from === requestedPath
      );
      if (redirectRule) {
        const statusCode =
          redirectRule.type === "TEMPORARY"
            ? "302 Found"
            : "301 Moved Permanently";
        socket.write(
          `HTTP/1.1 ${statusCode}\r\nLocation: ${redirectRule.to}\r\n\r\n`
        );
        socket.end();
        return;
      }

      if (method === "GET" || method === "HEAD") {
        // GET または HEAD リクエストの処理
        // .public/からファイルを読み込む
        const filePath = path.join(__dirname, "public", requestedPath);
        // ファイルの読み込みと送信
        fs.readFile(filePath, (err, content) => {
          if (err) {
            // ファイルが見つからない場合のエラー応答
            socket.write("HTTP/1.0 404 Not Found\n\n");
            socket.end();
          } else {
            // Content-Typeの決定
            const contentType = getContentType(filePath);
            // 成功した場合の応答
            socket.write(
              `HTTP/1.0 200 OK\r\nContent-Type: ${contentType}\r\n\r\n`
            );
            if (method === "GET") {
              socket.write(content);
            }
            socket.end();
          }
        });
      } else if (method === "POST") {
        // POSTリクエストの処理
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
        socket.write(body); // エコーバック
        socket.end();
      }
    }
  });
});

function getContentType(filePath: string): string {
  const ext = path.extname(filePath);
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    default:
      return "text/plain; charset=utf-8";
  }
}

export default server;
