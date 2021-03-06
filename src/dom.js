/**
 * 获取视口大小
 */
export function getViewport() {
  return {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  }
}

/**
 * 设置元素样式
 * @param {HtmlElement} el 元素
 * @param {Object} styles 样式信息
 */
export function css(el, styles) {
  Object.keys(styles).forEach(name => {
    el.style[name] = styles[name]
  })
}

/**
 * 获取元素的边界信息
 * @param {HtmlElement} el 元素
 */
export function getBounds(el) {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left,
    y: rect.top,
    w: rect.width,
    h: rect.height
  }
}

/**
 * 加载图片
 * @param {String} src 图片地址
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = (err) => {
      reject(err)
    }
    img.src = src
    if (img.complete) return resolve(img)
  })
}

/**
 * 锁定/解锁页面滚动
 * @param {Boolean} lock 是否锁定
 */
export function lockBodyScroll(lock) {
  css(document.body, {
    overflow: lock ? 'hidden' : null
  })
}

/**
 * 获取下一个绘制帧
 * @param {Function} cb 回调
 */
export function requestAnimationFrame(cb) {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(cb)
  } else {
    setTimeout(() => {
      cb()
    }, 16)
  }
}

/**
 * 获取图片的原始大小
 * @param {HtmlImageElement} img 图片
 */
export function getImageNaturalSize(img) {
  return new Promise(async(resolve, reject) => {
    if (!img) return reject()
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (w || h)  return resolve({ w, h })
    try {
      const image = await loadImage(img.src)
      resolve({ w: image.width, h: image.height })
    } catch (err) {
      reject(err)
    }
  })
}
