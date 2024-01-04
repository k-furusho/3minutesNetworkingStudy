// https://nodejs.org/dist/latest-v20.x/docs/api/net.html#class-netsocket
import * as net from 'net'
import * as fs from 'fs'
import * as path from 'path'

// リダイレクトルールの読み込み
const redirectRules = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'redirect.json'), 'utf8'),
)

const server = net.createServer()

// 新しい接続が確立されるたびに呼ばれる
server.on('connection', (socket) => {
  socket.on('data', (data) => {
    const requestData = data.toString()
    if (requestData.includes('\r\n\r\n')) {
      // リクエストヘッダとボディを分割
      const [header, body] = requestData.split('\r\n\r\n')
      const [method, requestedPath] = parseRequest(header)
      handleRequest(socket, method, requestedPath, body)
    }
  })
})

// リクエストヘッダからメソッドとパスを解析
function parseRequest(header: string): [string, string] {
  const requestLine = header.split('\n')[0]
  return requestLine.split(' ')
}

// リクエストヘッダからメソッドとパスを解析
function handleRequest(
  socket: net.Socket,
  method: string,
  path: string,
  body: string,
) {
  const redirectRule = redirectRules.find(rule => rule.from === path)
  if (redirectRule) {
    return handleRedirect(socket, redirectRule)
  }
  switch (method) {
    case 'GET':
    case 'HEAD':
      return handleGetOrHeadRequest(socket, method, path)
    case 'POST':
      return handlePostRequest(socket, body)
    default:
      return handleUnknownRequest(socket)
  }
}

// リダイレクト処理
function handleRedirect(
  socket: net.Socket,
  rule: { to: string, type: string },
) {
  const statusCode
    = rule.type === 'TEMPORARY' ? '302 Found' : '301 Moved Permanently'
  socket.write(`HTTP/1.1 ${statusCode}\r\nLocation: ${rule.to}\r\n\r\n`)
  socket.end()
}

// GET または HEAD リクエスト処理
function handleGetOrHeadRequest(
  socket: net.Socket,
  method: string,
  requestedPath: string,
) {
  const filePath = path.join(__dirname, 'public', requestedPath)
  fs.readFile(filePath, (err, content) => {
    if (err) {
      socket.write('HTTP/1.0 404 Not Found\n\n')
      socket.end()
      return
    }
    const contentType = getContentType(filePath)
    socket.write(`HTTP/1.0 200 OK\r\nContent-Type: ${contentType}\r\n\r\n`)
    if (method === 'GET') {
      socket.write(content)
    }
    socket.end()
  })
}

// POSTリクエスト処理
function handlePostRequest(socket: net.Socket, body: string) {
  socket.write('HTTP/1.1 200 OK\r\n\r\n')
  socket.write(body) // ボディをエコーバック
  socket.end()
}

// 未知のリクエストタイプ処理
function handleUnknownRequest(socket: net.Socket) {
  socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
  socket.end()
}

// Content-Typeの決定
function getContentType(filePath: string): string {
  const ext = path.extname(filePath)
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    default:
      return 'text/plain; charset=utf-8'
  }
}

export default server
