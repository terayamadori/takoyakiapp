
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config(); // 環境変数の読み込み

const app = express();
const port = 3000;

// サーバーとSocket.IOの初期化
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://takoyakiapp.fly.dev'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// PostgreSQL接続設定
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// CORS設定
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://takoyakiapp.fly.dev'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json()); // JSONパース用ミドルウェア

// APIエンドポイント: 注文リストの取得
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, order_number, takoyaki_quantity, takoyaki_price, dessert_takoyaki_quantity, dessert_takoyaki_price, order_date, status, pass_date FROM orders'
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '注文データが見つかりませんでした' });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('注文データ取得エラー:', error);
    res.status(500).json({ error: '注文データの取得に失敗しました' });
  }
});

// 注文を追加するエンドポイント
app.post('/api/orders', async (req, res) => {
  const { order_number, takoyaki_quantity, dessert_takoyaki_quantity, order_date } = req.body;

  try {
    const priceResult = await pool.query('SELECT takoyaki_price, dessert_takoyaki_price FROM public.pricesettings');
    if (priceResult.rows.length === 0) {
      return res.status(500).json({ error: '価格設定が見つかりませんでした' });
    }

    const { takoyaki_price, dessert_takoyaki_price } = priceResult.rows[0];

    const newOrder = await pool.query(
      'INSERT INTO orders (order_number, takoyaki_quantity, takoyaki_price, dessert_takoyaki_quantity, dessert_takoyaki_price, order_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [order_number, takoyaki_quantity, takoyaki_price, dessert_takoyaki_quantity, dessert_takoyaki_price, order_date]
    );

    res.status(201).json(newOrder.rows[0]);
    io.emit('orderAdded', newOrder.rows[0]); // 注文追加イベントを送信
  } catch (error) {
    console.error("注文追加エラー:", error);
    res.status(500).json({ error: '注文の追加に失敗しました。' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: '注文が見つかりませんでした' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('注文取得エラー:', error);
    res.status(500).json({ error: '注文データの取得に失敗しました' });
  }
});


// 注文の状態を更新するエンドポイント
app.patch('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const { status, pass_date } = req.body;
  const updatedPassDate = pass_date || new Date().toISOString();

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1, pass_date = $2 WHERE id = $3 RETURNING *',
      [status, updatedPassDate, orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '注文が見つかりませんでした' });
    }

    res.status(200).json(result.rows[0]);
    io.emit('orderUpdated', result.rows[0]); // 注文更新イベントを送信
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: '注文の状態更新に失敗しました' });
  }
});


// 注文を削除するエンドポイント
app.delete('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: '注文が見つかりませんでした' });
    }
    res.status(200).json({ message: '注文を削除しました' });
    io.emit('orderDeleted', orderId); // 注文削除イベントを送信
  } catch (error) {
    console.error('注文削除エラー:', error);
    res.status(500).json({ error: '注文の削除に失敗しました' });
  }
});

// 価格設定データの取得API
app.get('/api/pricesettings', async (req, res) => {
  try {
    const result = await pool.query('SELECT takoyaki_price, dessert_takoyaki_price FROM public.pricesettings');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('価格設定取得エラー:', error);
    res.status(500).json({ error: '価格設定の取得に失敗しました' });
  }
});

// 価格設定を更新するエンドポイント
app.patch('/api/pricesettings', async (req, res) => {
  const { takoyaki_price, dessert_takoyaki_price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE public.pricesettings SET takoyaki_price = $1, dessert_takoyaki_price = $2 RETURNING *',
      [takoyaki_price, dessert_takoyaki_price]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '価格設定が見つかりませんでした' });
    }

    res.status(200).json(result.rows[0]);
    io.emit('priceUpdated', result.rows[0]); // 価格更新イベントを送信
  } catch (error) {
    console.error('価格更新エラー:', error);
    res.status(500).json({ error: '価格の更新に失敗しました' });
  }
});




// サーバーの起動
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

