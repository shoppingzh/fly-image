import defaults from './options'
import { css, getBounds, loadImage, lockBodyScroll, requestAnimationFrame } from './dom'

function getContainerBounds() {
  return {
    x: 0,
    y: 0,
    w: document.body.clientWidth,
    h: document.body.clientHeight
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
    css(this.el, { cursor: 'zoom-in' })
    this.el.addEventListener('click', this.open.bind(this))
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

  getSize() {
    const size = this.options.size
    return size < 0 ? 0 : (size || 0)
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
      transition: 'transform .5s ease-out'
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
        const overflow = originalSize.w > containerBounds.w // 是否超出容器
        let scale = overflow ? ((containerBounds.w - 40) / bounds.w) : (originalSize.w / bounds.w)
        const size = this.getSize()
        if (size > 0) {
          scale = (containerBounds.w * size) / bounds.w
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


}