const { useState, useEffect, useMemo } = React;

const CART_KEY = "sokubai.cart.v1";
const API = "/api";

const CATEGORIES = ["すべて", "新刊", "既刊", "グッズ", "無料"];

/* ---------- API / ストレージ ---------- */
function load(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return structuredClone(fallback);
  try {
    return JSON.parse(raw);
  } catch (e) {
    return structuredClone(fallback);
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) {
    let msg = "エラーが発生しました";
    try {
      const body = await res.json();
      if (body.message) msg = body.message;
    } catch (e) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

/* ---------- ユーティリティ ---------- */
const yen = (v) => "¥" + Number(v || 0).toLocaleString("ja-JP");
const priceLabel = (v) => (Number(v) === 0 ? "無料" : yen(v));
const nextId = (rows) => rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
const cartCount = (cart) => cart.reduce((s, r) => s + Number(r.qty || 0), 0);
const cartTotal = (cart) => cart.reduce((s, r) => s + r.price * r.qty, 0);

function useHashRoute() {
  const [hash, setHash] = useState(location.hash || "#/");
  useEffect(() => {
    const onChange = () => setHash(location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash.replace(/^#/, "");
}

function go(path) {
  location.hash = path;
}

/* ---------- 共通パーツ ---------- */
function Tags({ item }) {
  return (
    <div>
      {item.category === "新刊" && <span className="tag new">新刊</span>}
      {item.stock <= 0
        ? <span className="tag sold">完売</span>
        : item.stock <= 3 && <span className="tag low">残りわずか</span>}
    </div>
  );
}

function StockBadge({ item }) {
  if (item.stock <= 0) return <span className="badge sold">完売</span>;
  if (item.stock <= 3) return <span className="badge low">残{item.stock}</span>;
  return <span className="badge">残{item.stock}</span>;
}

function Topbar({ title, small, back, cart, onCart }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => go(back || "/")}>
        {title}{small && <small>{small}</small>}
      </button>
      {cart && (
        <button className="cart-chip" onClick={onCart}>
          カート<span className="count">{cartCount(cart)}</span>
        </button>
      )}
    </header>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

/* ---------- キオスク画面 ---------- */
function Welcome() {
  return (
    <div className="kiosk view">
      <Topbar title="即売キオスク" small="ほしのあとりえ / B-12" />
      <main className="welcome">
        <section className="welcome-card">
          <div className="hero-icon">📖</div>
          <h1>タッチして頒布物を見る</h1>
          <p>
            第12回 星屑即売会　スペース B-12<br />
            新刊『夜行列車の図鑑』入荷しています。<br />
            画面で選んで、ブースでお支払い・お受け取りください。
          </p>
          <button className="start-btn" onClick={() => go("/menu")}>頒布物を見る</button>
          <div>
            <button className="staff-link" onClick={() => go("/admin")}>サークル管理</button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Menu({ items, cart, onToast }) {
  const [cat, setCat] = useState("すべて");
  const rows = useMemo(
    () => items.filter((i) => i.selling && (cat === "すべて" || i.category === cat)),
    [items, cat]
  );
  return (
    <div className="kiosk view">
      <Topbar title="即売キオスク" small="ほしのあとりえ" cart={cart} onCart={() => go("/cart")} />
      <div className="layout">
        <nav className="cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={"cat-btn" + (c === cat ? " active" : "")}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </nav>
        <main className="menu-wrap">
          {rows.length === 0 ? (
            <div className="empty">このカテゴリの頒布物はありません</div>
          ) : (
            <div className="menu-grid">
              {rows.map((item, i) => (
                <button
                  key={item.id}
                  className={"food-card" + (item.stock <= 0 ? " sold" : "")}
                  style={{ animationDelay: i * 0.04 + "s" }}
                  onClick={() => (item.stock > 0 ? go("/item/" + item.id) : onToast("完売しました"))}
                >
                  <span className="emoji">{item.emoji}</span>
                  <Tags item={item} />
                  <h2>{item.name}</h2>
                  <div className="price">{priceLabel(item.price)}</div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
      <footer className="dock">
        <div>合計 <strong>{yen(cartTotal(cart))}</strong></div>
        <button className="primary-btn" onClick={() => go("/cart")}>カートを見る</button>
      </footer>
    </div>
  );
}

function ItemDetail({ items, cart, addToCart }) {
  const id = Number((location.hash.split("/")[2] || "0"));
  const item = items.find((i) => i.id === id);
  const inCart = cart.find((r) => r.itemId === id)?.qty || 0;
  const left = item ? Math.max(0, item.stock - inCart) : 0;
  const [qty, setQty] = useState(1);

  if (!item) {
    return (
      <div className="kiosk view">
        <Topbar title="← 一覧に戻る" back="/menu" />
        <main className="page"><div className="panel empty">頒布物が見つかりません</div></main>
      </div>
    );
  }

  return (
    <div className="kiosk view">
      <Topbar title="← 一覧に戻る" back="/menu" cart={cart} onCart={() => go("/cart")} />
      <main className="page">
        <section className="panel">
          <div className="item-hero">
            <div className="emoji">{item.emoji}</div>
            <div>
              <Tags item={item} />
              <h1>{item.name}</h1>
              <p>{item.description}</p>
              <div className="price">{priceLabel(item.price)}</div>
              <p>{left <= 0 ? "完売です" : "残り " + left + " 部"}</p>
            </div>
          </div>
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={left <= 0}>−</button>
            <span>{left <= 0 ? 0 : qty}</span>
            <button onClick={() => setQty(Math.min(left, qty + 1))} disabled={left <= 0 || qty >= left}>＋</button>
          </div>
          <button
            className="primary-btn"
            disabled={left <= 0}
            onClick={() => { addToCart(item, Math.min(qty, left)); go("/menu"); }}
          >
            {left <= 0 ? "完売" : "カートに入れる"}
          </button>
        </section>
      </main>
    </div>
  );
}

function Cart({ cart, removeFromCart, checkout }) {
  return (
    <div className="kiosk view">
      <Topbar title="← 一覧に戻る" back="/menu" />
      <main className="page">
        <section className="panel">
          <h1>お会計内容</h1>
          <p>番号を受け取ったあと、ブースでお支払いください。</p>
          {cart.length === 0 ? (
            <div className="empty">カートは空です。頒布物を選んでください。</div>
          ) : (
            cart.map((row, i) => (
              <div className="cart-row" key={row.itemId}>
                <div>
                  {row.emoji} {row.name}<br />
                  <small>{priceLabel(row.price)} × {row.qty}</small>
                </div>
                <strong>{yen(row.price * row.qty)}</strong>
                <button className="danger-btn" onClick={() => removeFromCart(i)}>削除</button>
              </div>
            ))
          )}
          <p>合計 <strong>{yen(cartTotal(cart))}</strong></p>
          <button className="primary-btn" disabled={cart.length === 0} onClick={checkout}>
            番号を発行する
          </button>
        </section>
      </main>
    </div>
  );
}

function Complete() {
  const no = location.hash.split("?no=")[1] || "-";
  useEffect(() => {
    const t = setTimeout(() => go("/"), 8000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="kiosk view">
      <Topbar title="即売キオスク" />
      <main className="complete">
        <p>受け取り番号</p>
        <div className="num">{no}</div>
        <p>
          この番号をブースでお見せください。<br />
          お支払いのうえ、頒布物をお渡しします。<br />
          8秒後にトップへ戻ります。
        </p>
        <p><button className="ghost-btn" onClick={() => go("/")}>すぐに戻る</button></p>
      </main>
    </div>
  );
}

/* ---------- 管理画面 ---------- */
function Admin({ items, orders, deleteItem }) {
  const sales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const waiting = orders.filter((o) => o.status === "受け渡し待ち").length;
  const low = items.filter((i) => i.stock > 0 && i.stock <= 3).length;
  return (
    <div className="kiosk view">
      <Topbar title="即売キオスク" small="管理" />
      <main className="page wide">
        <div className="stats-row">
          <article className="stat-card"><span>売上合計</span><strong>{yen(sales)}</strong></article>
          <article className="stat-card">
            <span>注文数</span><strong>{orders.length}件</strong>
            <small>{waiting ? "うち未渡し " + waiting + "件" : "未渡しなし"}</small>
          </article>
          <article className="stat-card"><span>残りわずか</span><strong>{low}点</strong></article>
        </div>
        <section className="panel">
          <div className="admin-nav">
            <button className="primary-btn" style={{ minWidth: 0 }} onClick={() => go("/admin/form")}>＋ 頒布物を追加</button>
            <button className="ghost-btn" onClick={() => go("/orders")}>受け渡し一覧</button>
            <button className="ghost-btn" onClick={() => go("/")}>キオスク画面へ</button>
          </div>
          <h1>頒布物の在庫</h1>
          <table className="admin-table">
            <thead>
              <tr><th>頒布物</th><th>区分</th><th>価格</th><th>在庫</th><th>掲載</th><th>操作</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.emoji} {item.name}</td>
                  <td>{item.category}</td>
                  <td>{priceLabel(item.price)}</td>
                  <td><StockBadge item={item} /></td>
                  <td><span className={"badge" + (item.selling ? "" : " off")}>{item.selling ? "掲載中" : "非掲載"}</span></td>
                  <td className="row-actions">
                    <button className="ghost-btn" onClick={() => go("/admin/form/" + item.id)}>編集</button>
                    <button className="danger-btn" onClick={() => deleteItem(item.id)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function AdminForm({ items, saveItem }) {
  const parts = location.hash.split("/");
  const id = Number(parts[3] || 0);
  const current = items.find((i) => i.id === id);
  const [form, setForm] = useState(
    current || { name: "", category: "新刊", price: 500, stock: 10, emoji: "📖", description: "", selling: true }
  );
  const set = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await saveItem(
        { ...form, price: Number(form.price) || 0, stock: Number(form.stock) || 0 },
        current?.id
      );
      go("/admin");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="kiosk view">
      <Topbar title="← 管理に戻る" back="/admin" />
      <main className="page">
        <section className="panel">
          <h1>{current ? "頒布物を編集" : "頒布物を追加"}</h1>
          <form onSubmit={submit}>
            <div className="mb">
              <label className="form-label">頒布物名</label>
              <input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="例）新刊『夜行列車の図鑑』" />
            </div>
            <div className="mb">
              <label className="form-label">区分</label>
              <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.filter((c) => c !== "すべて").map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb">
              <label className="form-label">価格（円）※無料は0</label>
              <input className="form-control" type="number" min="0" step="50" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div className="mb">
              <label className="form-label">在庫（部数）</label>
              <input className="form-control" type="number" min="0" step="1" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
            <div className="mb">
              <label className="form-label">アイコン（絵文字）</label>
              <input className="form-control" value={form.emoji} onChange={(e) => set("emoji", e.target.value)} />
            </div>
            <div className="mb">
              <label className="form-label">説明</label>
              <textarea className="form-control" rows="4" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="サイズ、ページ数、セット内容など" />
            </div>
            <div className="mb">
              <label>
                <input type="checkbox" checked={form.selling} onChange={(e) => set("selling", e.target.checked)} /> キオスクに掲載する
              </label>
            </div>
            <button className="primary-btn" type="submit">保存する</button>
          </form>
        </section>
      </main>
    </div>
  );
}

function Orders({ orders, toggleOrder }) {
  const rows = orders.slice().reverse();
  return (
    <div className="kiosk view">
      <Topbar title="← 管理に戻る" back="/admin" />
      <main className="page">
        <section className="panel">
          <h1>受け渡し一覧</h1>
          <p>番号を言われた頒布物を渡したら「渡した」を押します。</p>
          {rows.length === 0 ? (
            <div className="empty">まだ注文はありません</div>
          ) : (
            rows.map((order) => (
              <div className="cart-row" key={order.id}>
                <div>
                  <strong>番号 {order.orderNo}</strong><br />
                  <small>{order.items.map((i) => i.name + "×" + i.qty).join(" / ")}</small>
                </div>
                <div>{yen(order.total)}<br /><small>{order.status}</small></div>
                <button className="ghost-btn" onClick={() => toggleOrder(order.id)}>
                  {order.status === "渡し済み" ? "戻す" : "渡した"}
                </button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------- アプリ本体 ---------- */
function App() {
  const route = useHashRoute();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState(() => load(CART_KEY, []));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => save(CART_KEY, cart), [cart]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const reload = async () => {
    const [itemRows, orderRows] = await Promise.all([
      fetchJson(API + "/items"),
      fetchJson(API + "/orders"),
    ]);
    setItems(itemRows);
    setOrders(orderRows);
  };

  useEffect(() => {
    reload()
      .catch((e) => showToast(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (item, qty) => {
    setCart((prev) => {
      const existing = prev.find((r) => r.itemId === item.id);
      if (existing) {
        return prev.map((r) =>
          r.itemId === item.id ? { ...r, qty: Math.min(item.stock, r.qty + qty) } : r
        );
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, emoji: item.emoji, qty }];
    });
    showToast(item.name + " をカートに入れました");
  };

  const removeFromCart = (index) => setCart((prev) => prev.filter((_, i) => i !== index));

  const checkout = async () => {
    try {
      const order = await fetchJson(API + "/orders", {
        method: "POST",
        body: JSON.stringify({
          lines: cart.map((r) => ({ itemId: r.itemId, qty: r.qty })),
        }),
      });
      setCart([]);
      await reload();
      go("/complete?no=" + order.orderNo);
    } catch (e) {
      showToast(e.message);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("この頒布物を削除しますか？")) return;
    try {
      await fetchJson(API + "/items/" + id, { method: "DELETE" });
      await reload();
      showToast("削除しました");
    } catch (e) {
      showToast(e.message);
    }
  };

  const saveItem = async (form, id) => {
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      emoji: (form.emoji || "📦").trim(),
      description: (form.description || "").trim(),
      selling: !!form.selling,
    };
    if (id) {
      await fetchJson(API + "/items/" + id, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await fetchJson(API + "/items", { method: "POST", body: JSON.stringify(payload) });
    }
    await reload();
  };

  const toggleOrder = async (id) => {
    try {
      await fetchJson(API + "/orders/" + id + "/toggle-status", { method: "PUT" });
      await reload();
    } catch (e) {
      showToast(e.message);
    }
  };

  let view;
  if (route.startsWith("/menu")) view = <Menu items={items} cart={cart} onToast={showToast} />;
  else if (route.startsWith("/item/")) view = <ItemDetail items={items} cart={cart} addToCart={addToCart} />;
  else if (route.startsWith("/cart")) view = <Cart cart={cart} removeFromCart={removeFromCart} checkout={checkout} />;
  else if (route.startsWith("/complete")) view = <Complete />;
  else if (route.startsWith("/admin/form")) view = <AdminForm items={items} saveItem={saveItem} />;
  else if (route.startsWith("/admin")) view = <Admin items={items} orders={orders} deleteItem={deleteItem} />;
  else if (route.startsWith("/orders")) view = <Orders orders={orders} toggleOrder={toggleOrder} />;
  else view = <Welcome />;

  if (loading) {
    return (
      <div className="kiosk view">
        <main className="empty">データを読み込んでいます…</main>
      </div>
    );
  }

  return (
    <React.Fragment>
      {view}
      <Toast message={toast} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
