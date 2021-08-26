# fly-image

会飞的图片查看器

![fly-image](https://github.com/shoppingzh/fly-image/raw/main/images/fly-image.gif)

> 实际效果比动图中更流畅，因为动图太大，因此压缩了质量，具体效果以实际运行为准。

# 下载/使用

```bash
npm i fly-image
```

```js
import FlyImage from 'fly-image'
const options = {
  modal: false,
  size: 0.5
}
new FlyImage(img, options)
```


# 特性
- 飞行效果
- 自动计算，展示合适的大小


# options

属性名 | 类型 | 说明 | 默认值 | 可选值
-- | -- | -- | -- | --
modal | boolean | 是否显示遮罩效果 | true | -
zIndex | number | z-index | 10000 | -
size | number | 图片宽度 / 容器宽度，默认为0，图片宽度动态计算 | 0 | [0, N]
offset | number | 图片全屏显示时，距离四周的偏移量(px) | 20 | -
speed | number | 飞行速度(ms) | 250 | -
hide | boolean | 是否隐藏原图 | false | -

# 原理

[fly-image的实现原理](./docs/detail.md)


# 性能问题

- 事件绑定
- 资源回收