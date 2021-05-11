# fly-image

会飞的图片查看器

![fly-image](./images/fly-image.gif)

> 实际效果比动图中更流畅，因为动图太大，因此压缩了质量，具体效果以实际运行为准。


# options

属性名 | 类型 | 说明 | 默认值 | 可选值
-- | -- | -- | -- | --
modal | boolean | 是否显示遮罩效果 | true | -
zIndex | number | z-index | 10000 | -
size | number | 图片宽度 / 容器宽度，默认为0，图片宽度动态计算 | 0 | [0, N]

# 原理

