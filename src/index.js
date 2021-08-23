import defaults from './options'
import { css, getBounds, loadImage, lockBodyScroll, requestAnimationFrame, getViewport } from './dom'

/**
 * 获取容器边界
 */
function getContainerBounds() {
  const viewport = getViewport()
  return {
    x: 0,
    y: 0,
    w: viewport.width,
    h: viewport.height
  }
}

export default class FlyImage {

  constructor(el, options) {
    if (!el || !(el instanceof HTMLImageElement)) throw new DOMError()
    this.el = el
    this.options = Object.assign({}, defaults, options)
    this.init()
  }

  init() {
    this.size = this.options.size < 0 ? 0 : this.options.size
    css(this.el, { cursor: 'zoom-in' })
    this.openHandler = this.open.bind(this)
    this.el.addEventListener('click', this.openHandler)
  }

  // 获取原图的尺寸
  getOriginalSize() {
    return new Promise((resolve, reject) => {
      if (this.originalSize) return resolve(this.originalSize)
      loadImage(this.el.src).then(img => {
        this.originalSize = {
          w: img.width,
          h: img.height
        }
        resolve(this.originalSize)
      }).catch(err => {
        reject(err)
      })
    })
  }

  createContainer() {
    const outerEl = document.createElement('div')
    css(outerEl, {
      position: 'fixed',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: this.options.zIndex,
      backgroundColor: this.options.modal ? 'rgba(0, 0, 0, .5)' : null
    })
    const innerEl = document.createElement('div')
    css(innerEl, {
      overflow: 'auto',
      height: '100%'
    })
    outerEl.appendChild(innerEl)
    outerEl.addEventListener('click', () => {
      this.close()
    })
    return { outerEl, innerEl }
  }

  createImage() {
    const el = new Image()
    el.src = this.el.src
    css(el, {
      cursor: 'zoom-out',
      transition: 'transform .3s ease-in-out'
    })
    return el
  }

  open() {
    lockBodyScroll(true)

    const doc = document.createDocumentFragment()
    const { outerEl, innerEl } =  this.createContainer()

    // 获取原图位置，将目标图移动到原图相同的位置
    const imgEl = this.createImage()
    const bounds = getBounds(this.el)
    const sourceStyle = {
      width: `${bounds.w}px`,
      transform: `translate(${bounds.x}px, ${bounds.y}px)`
    }
    css(imgEl, sourceStyle)

    innerEl.appendChild(imgEl)
    doc.appendChild(outerEl)
    document.body.appendChild(doc)

    // 下一个渲染帧，将图片动画至屏幕中央，设置合适的大小
    requestAnimationFrame(() => {
      const containerBounds = getContainerBounds()
      this.getOriginalSize().then(originalSize => {
        const tw = Math.max(bounds.w, originalSize.w) // 目标宽度取展示宽度与原图宽度的较大值(可处理小图被放大展示的情况)
        const overflow = tw > containerBounds.w // 是否超出容器
        let scale = overflow ? ((containerBounds.w - 20) / bounds.w) : (tw / bounds.w)
        if (this.size > 0) {
          scale = (containerBounds.w * this.size) / bounds.w
        }
        const targetSize = {
          w: bounds.w * scale,
          h: bounds.h * scale
        }
        const translate = {
          x: (containerBounds.w - bounds.w) / 2,
          y: (Math.max(containerBounds.h, targetSize.h) - bounds.h) / 2 + 20 // 注：当展示图过高时，容器实际大小为容器宽度和展示图宽度构成的区域
        }
        const targetStyle = {
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
        }
        css(imgEl, targetStyle)

        this.session = {
          containerEl: outerEl,
          imgEl,
          bounds,
          originalSize,
          targetSize,
          containerBounds,
          sourceStyle,
          targetStyle
        }
        this.onOpen()
      })
    })
  }

  close() {
    css(this.session.imgEl, this.session.sourceStyle)
    this.session.containerEl.addEventListener('transitionend', () => {
      document.body.removeChild(this.session.containerEl)
      lockBodyScroll(false)
      this.session = null
    })
  }

  onOpen() {
    const cb = this.options.onOpen
    if (cb) {
      cb.call(this)
    }
  }

  destroy() {
  }


}