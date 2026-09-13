function Unauthorized() {
  return (
    <main
      style={{
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <h1>你無權限觀看此頁面</h1>

      <p>
        請聯絡管理員取得相關權限。
      </p>
    </main>
  );
}

export default Unauthorized;