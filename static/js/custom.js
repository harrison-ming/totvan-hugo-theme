// 在页面加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
  // 获取菜单元素
  const menuBar = document.getElementById("menu-bar");
  
  // 如果菜单存在
  if (menuBar) {
    // 移除关闭类名
    menuBar.classList.remove("close");
    // 添加打开类名
    menuBar.classList.add("open");
  }
}); 