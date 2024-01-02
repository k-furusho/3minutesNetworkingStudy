// https://nodejs.org/dist/latest-v20.x/docs/api/net.html#class-netsocket
import * as net from "net";
import * as fs from "fs";

const server = net.createServer();
server.on("connection", (socket) => {
  socket.on("data", (data) => {
    console.log(data.toString());

    // リクエストラインの取得（例：GET /index.html HTTP/1.1）
    const requestLine = data.toString().split("\n")[0];
    const requestParts = requestLine.split(" ");
    const requestedFile = requestParts[1];

    // ルートパスへのリクエストをindex.htmlにマッピング
    const filePath =
      requestedFile === "/" ? "./index.html" : `.${requestedFile}`;

    // ファイルの読み込みと送信
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // ファイルが見つからない場合のエラー応答
        socket.write("HTTP/1.0 404 Not Found\n\n");
        socket.end();
      } else {
        // 成功した場合の応答
        socket.write("HTTP/1.0 200 OK\n\n");
        socket.write(content);
        socket.end();
      }
    });
  });
});

export default server;
