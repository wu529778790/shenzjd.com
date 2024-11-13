import "./index.css";

function Header() {
  return (
    <div className="header">
      <div className="header-logo">
        <img src="/logo.png" alt="logo" />
        <span>神族九帝导航</span>
      </div>
      <div className="header-search">
        <input type="text" placeholder="搜索..." />
        <button>搜索</button>
      </div>
    </div>
  );
}

export default Header;
