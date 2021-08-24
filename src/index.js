import defaults from './options'
import {
  css,
  getBounds,
  lockBodyScroll,
  requestAnimationFrame,
  getImageNaturalSize
} from './dom'

export default class FlyImage {

  constructor(el, options) {
    if (!el || !(el instanceof HTMLImageElement)) throw new DOMError()
    this.el = el
    this.options = Object.assign({}, defaults, options)
    this.init()
  }

  init() {
    this.size = this.options.size < 0 ? 0 : this.options.size
    this.handlers = {}
    this.session = null

    this.handlers.open = this.open.bind(this)
    css(this.el, { cursor: 'zoom-in' })
    this.el.addEventListener('click', this.handlers.open)
  }

  open() {
    this.opened = true
    this.session = {}
    // 锁定页面滚动
    lockBodyScroll(true)

    // 第一个渲染帧：遮罩层、查看层、图片初始化
    const doc = document.createDocumentFragment()
    const modalEl = this._createModal()
    const viewerEl = this._createViewer()
    const imgEl = this._createFlyImage(this.el.src)
    const bounds = getBounds(this.el)
    const sourceStyle = {
      width: `${bounds.w}px`,
      height: `${bounds.h}px`,
      transform: `translate(${bounds.x}px, ${bounds.y}px)`
    }
    css(imgEl, sourceStyle)
    viewerEl.appendChild(imgEl)
    modalEl.appendChild(viewerEl)
    doc.appendChild(modalEl)
    document.body.appendChild(doc)

    const containerBounds = {
      x: modalEl.offsetLeft,
      y: modalEl.offsetTop,
      w: modalEl.clientWidth,
      h: modalEl.clientHeight
    }

    Object.assign(this.session, {
      modalEl,
      viewerEl,
      imgEl,
      bounds,
      sourceStyle,
      containerBounds
    })


    // 下一个渲染帧：将图片动画至屏幕中央，设置合适的大小
    requestAnimationFrame(() => {
      
      this._getOriginalSize().then(originalSize => {
        const tw = Math.max(bounds.w, originalSize.w) // 目标宽度取展示宽度与原图宽度的较大值(可处理小图被放大展示的情况)
        const overflow = tw > containerBounds.w // 是否超出容器
        let scale = overflow ? ((containerBounds.w - this.options.offset * 2) / bounds.w) : (tw / bounds.w)
        if (this.size > 0) {
          scale = (containerBounds.w * this.size) / bounds.w
        }
        const targetSize = { w: bounds.w * scale, h: bounds.h * scale }
        const translate = {
          x: (containerBounds.w - bounds.w) / 2,
          y: (Math.max(containerBounds.h, targetSize.h) - bounds.h) / 2 + this.options.offset // 注：当展示图过高时，容器实际大小为容器宽度和展示图宽度构成的区域
        }
        const targetStyle = {
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
        }
        css(imgEl, targetStyle)

        Object.assign(this.session, {
          originalSize,
          targetSize,
          targetStyle
        })
        this._onOpen()
      }).catch(err => {
        this._close()
      })
    })
  }

  close() {
    css(this.session.imgEl, this.session.sourceStyle)
    this.session.modalEl.addEventListener('transitionend', () => {
      this._close()
    })
  }

  destroy() {
    // 资源清理
    // ...
  }

  // 获取原图的尺寸
  _getOriginalSize() {
    if (this.originalSize) return Promise.resolve(this.originalSize)
    return getImageNaturalSize(this.el).then(size => {
      this.originalSize = size
      return size
    })
  }

  _createModal() {
    const el = document.createElement('div')
    css(el, {
      position: 'fixed',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: this.options.zIndex,
      backgroundColor: this.options.modal ? 'rgba(100, 100, 100, .5)' : null
    })
    el.addEventListener('click', () => {
      this.close()
    })
    return el
  }

  _createViewer() {
    const el = document.createElement('div')
    css(el, {
      width: '100%',
      height: '100%',
      overflow: 'auto'
    })
    return el
  }

  _createFlyImage() {
    const img = new Image()
    img.src = this.el.src
    css(img, {
      cursor: 'zoom-out',
      transition: `transform ${this.options.speed}ms ease-out`
    })
    return img
  }

  _onOpen() {
    const cb = this.options.onOpen
    if (cb) {
      cb.call(this)
    }
  }

  _close() {
    document.body.removeChild(this.session.modalEl)
    lockBodyScroll(false)
    this.session = null
    this.opened = false
  }


}