export default {

  name: 'magic-grid',

  props: {
    wrapper: {
      type: String,
      default: 'wrapper'
    },
    gap: {
      type: Number,
      default: 32
    },
    maxCols: {
      type: Number,
      default: 5
    },
    maxColWidth: {
      type: Number,
      default: 280
    },
    animate: {
      type: Boolean,
      default: true
    },
    useMin: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      started: false,
      items: []
    }
  },

  watch: {
    items (itemsModified) {
      this.positionItems()
    }
  },

  mounted () {
    this.waitUntilReady()
  },

  methods: {
    waitUntilReady () {
      if (this.isEverythingInitialized()) {
        this.positionItems()

        window.addEventListener('resize', () => {
          setTimeout(() => {
            this.positionItems()
          }, 100)
        })
        window.addEventListener('scroll', () => {
          setTimeout(() => {
            this.positionItems()
          }, 100)
        })
      } else {
        this.checkIfReady()
      }
    },

    isEverythingInitialized () {
      return this.$el && this.items.length > 0
    },

    checkIfReady () {
      const interval = setInterval(() => {
        this.items = this.$el.children

        if (this.isEverythingInitialized()) {
          clearInterval(interval)
          this.init()
        }
      }, 100)
    },

    setElementCss (item, left = 0, top = 0) {
      item.style.position = 'absolute'
      item.style.maxWidth = this.maxColWidth + 'px'
      item.style.left = left
      item.style.top = top
      if (this.animate) {
        item.style.transition = 'top, left 0.2s ease'
      }
    },

    init () {
      if (!this.isEverythingInitialized() || this.started) {
        return
      }

      this.$el.style.position = 'relative'

      Array.prototype.forEach.call(this.items, item => {
        this.setElementCss(item)
      })

      this.started = true
      this.waitUntilReady()
    },

    colWidth () {
      return this.items[0].getBoundingClientRect().width + this.gap
    },

    setup () {
      const width = this.$el.getBoundingClientRect().width
      const cols = []
      let numCols = Math.floor(width / this.colWidth()) || 1

      if (this.maxCols && numCols > this.maxCols) {
        numCols = this.maxCols
      }

      for (let i = 0; i < numCols; i++) {
        cols[i] = {
          height: 0,
          top: 0,
          index: i
        }
      }

      let wSpace = width - numCols * this.colWidth() + this.gap
      wSpace = Math.floor(wSpace / 2)
      return {
        cols,
        wSpace
      }
    },

    nextCol (cols, i) {
      if (this.useMin) {
        return this.getShortestColumn(cols)
      }

      const columnIndex = i % cols.length
      return cols[columnIndex]
    },

    positionItems () {
      const setupCalculated = this.setup()
      const cols = setupCalculated.cols
      const wSpace = setupCalculated.wSpace

      Array.prototype.forEach.call(this.items, (item, i) => {
        const min = this.nextCol(cols, i)
        const left = min.index * this.colWidth() + wSpace

        const leftStr = left + 'px'
        const topStr = min.height + min.top + 'px'
        this.setElementCss(item, leftStr, topStr)

        min.height += min.top + item.getBoundingClientRect().height
        min.top = this.gap
      })

      this.$el.style.height = this.getHighestColumn(cols).height + 'px'
    },

    getHighestColumn (cols) {
      let max = cols[0]

      for (const col of cols) {
        if (col.height > max.height) {
          max = col
        }
      }

      return max
    },

    getShortestColumn (cols) {
      let min = cols[0]

      for (const col of cols) {
        if (col.height < min.height) {
          min = col
        }
      }

      return min
    }
  }
}
