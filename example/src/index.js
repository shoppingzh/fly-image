import ImageViewer from '../../src/index'

const arr = []

window.addEventListener('DOMContentLoaded', e => {
  document.querySelectorAll('img').forEach(img => {
    const viewer = new ImageViewer(img, {
      modal: true,
      zIndex: 1000
    })
    arr.push(viewer)
  })
  console.log(arr)
})
