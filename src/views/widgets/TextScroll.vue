<template>
  <div class="page-content">
    <!-- 基础用法 -->
    <ArtTextScroll
      text="审知 Pro 是一款审计智能化工具，致力于为审计行业提供高效、便捷的解决方案。"
    />

    <!-- 使用不同的类型 -->
    <ArtTextScroll type="success" text="这是一条成功类型的滚动公告" />

    <ArtTextScroll type="warning" text="这是一条警告类型的滚动公告" />

    <ArtTextScroll type="danger" text="这是一条危险类型的滚动公告" />

    <ArtTextScroll type="info" text="这是一条信息类型的滚动公告" />

    <!-- 自定义速度和方向 -->
    <ArtTextScroll text="这是一条速度较慢、向右滚动的公告" :speed="30" direction="right" />
  </div>
</template>

<style lang="scss" scoped>
  .page-content {
    :deep(.text-scroll-container) {
      margin-bottom: 20px;
    }
  }
</style>
