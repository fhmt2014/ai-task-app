export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: 200, background: "#eee", padding: 16 }}>
        <ul>
          <li>仪表盘</li>
          <li>用户管理</li>
          <li>
            <a href="/dashboard/settings">设置</a>
          </li>
        </ul>
      </aside>
      <section style={{ flex: 1, padding: 16 }}>{children}</section>
    </div>
  );
}
