<template>
  <div ref="wrapper" class="gallery-container-wrapper">
    <div ref="container" class="gallery-container" :class="{ 'hide-scrollbar': hideScrollbar }">
      <div ref="content" class="vue-gallery-slider_content" :class="{ invisible: !isInitialised }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Ref, Emit, Watch} from 'vue-property-decorator';
import { debounce } from 'debounce';
import {addHorizontalMarginToElement, getMargin, getOuterWidth} from "@/lib-components/util/htmlUtils";
import {buildMouseDragHandler} from "@/lib-components/util/dragUtils";
import {checkForPassiveMode, swapScroll} from "@/lib-components/util/scrollUtils";

function preventDefault(e:Event) {
  e.preventDefault();
}

function stopPropagation(e:Event) {
  const direction = (e as WheelEvent).deltaY;
  const target = e.target as HTMLElement;
  if (!target) {
    e.stopPropagation();
    return;
  }
  if (direction > 0) {
    const isBottom = target.scrollHeight - Math.round(target.scrollTop) === target.clientHeight;
    if (isBottom) {
      return;
    }
  } else if (direction < 0) {
    const isTop = target.scrollTop === 0;
    if (isTop) {
      return;
    }
  }
  e.stopPropagation();
}

const RESIZE_DEBOUNCE_MS = 100;
const SCROLL_DEBOUNCE_MS = 100;

/** if visible part is below this, action will be triggered */
const MIN_FRACTION = 0.15;

/** if visible part is more than this, action will be triggered */
const MAX_FRACTION = 0.75;

@Component({})
export default class GalleryContainer extends Vue {

  @Prop()
  hideScrollbar!: boolean;

  @Prop({ default: 0 })
  selectedPage!: number;

  @Prop({ type: String, default: 'both' })
  addMarginToSide!: 'both' | 'left' | 'right';

  @Prop()
  allowScroll!: string;

  @Ref('content')
  private content!: HTMLElement;

  @Ref('container')
  private container!: HTMLElement;

  @Ref('wrapper')
  private wrapper!: HTMLElement;

  currentPage = 0;

  resizeListener: EventListener | null = null;
  scrollListener: EventListener | null = null;
  contentChangeListener: MutationObserver | null = null;
  dragListener: { disconnect: () => void } | null = null;
  wheelListener: { disconnect: () => void } | null = null;

  isInitialised = false;
  initialTileWidth!: number;
  initialTileMargin!: {left:number, right:number};

  adjustedTileWidth!: number;

  mounted() {
    this.initialize();

    this.addWheelListener();
    this.addResizeListener();
    this.addScrollListener();
    this.addContentChangeListener();
    this.addDragListener();
    this.addPreventListener();
    this.allowScrollingInside();
  }

  beforeDestroy() {
    this.removeWheelListener();
    this.removeResizeListener();
    this.removeScrollListener();
    this.removeContentChangeListener();
    this.removeDragListener();
    this.removePreventListener();
  }

  addContentChangeListener() {
    // Create the observer (and what to do on changes...)
    this.contentChangeListener = new MutationObserver(() => {
      this.$nextTick().then(() => {
        this.initialize();
        this.allowScrollingInside();
      });
    });

    // Setup the observer
    this.contentChangeListener.observe(
        this.content,
        { attributes: false, childList: true, characterData: true, subtree: true }
    );
  }

  addWheelListener() {
    this.wheelListener = swapScroll(this.container);
  }

  addScrollListener() {
    const debouncedHandler = debounce(this.onScroll.bind(this), SCROLL_DEBOUNCE_MS);
    this.scrollListener = (event) => {
      debouncedHandler(event);
      return;
    };
    this.container.addEventListener('scroll', this.scrollListener);
  }

  addPreventListener() {
    // modern Chrome requires { passive: false } when adding event
    const wheelOpt = checkForPassiveMode() ? { passive: false } : false;
    const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    this.wrapper.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    this.wrapper.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  }

  removePreventListener() {
    const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    this.wrapper.removeEventListener('DOMMouseScroll', preventDefault, false); // older FF
    this.wrapper.removeEventListener(wheelEvent, preventDefault); // modern desktop
  }

  addResizeListener() {
    this.resizeListener = debounce(this.onResize.bind(this), RESIZE_DEBOUNCE_MS);
    window.addEventListener('resize', this.resizeListener);
  }

  addDragListener() {
    this.dragListener = buildMouseDragHandler(this.container);
  }

  removeWheelListener() {
    if (this.wheelListener !== null) {
      this.wheelListener.disconnect();
      this.wheelListener = null;
    }
  }

  removeResizeListener() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
  }

  removeScrollListener() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }

  removeContentChangeListener() {
    if (this.contentChangeListener) {
      this.contentChangeListener.disconnect();
      this.contentChangeListener = null;
    }
  }

  removeDragListener() {
    if (this.dragListener) {
      this.dragListener.disconnect();
      this.dragListener = null;
    }
  }

  allowScrollingInside() {
    // modern Chrome requires { passive: false } when adding event
    const wheelOpt = checkForPassiveMode() ? { passive: false } : false;
    const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    function enableScrolling(elem: HTMLElement) {
      elem.addEventListener('DOMMouseScroll', stopPropagation, false); // older FF
      elem.addEventListener(wheelEvent, stopPropagation, wheelOpt); // modern desktop
    }

    this.content.querySelectorAll('.vgs-scrollable')
        .forEach(elem => enableScrolling(elem as HTMLElement));

    if(this.allowScroll && this.allowScroll.length) {
      this.content.querySelectorAll(this.allowScroll)
          .forEach(elem => enableScrolling(elem as HTMLElement));
    }

  }

  async initialize() {
    const tiles = this.content.children;
    if (tiles.length === 0) {
      return;
    }
    let tile1 = tiles[0] as HTMLElement;
    this.initialTileWidth = getOuterWidth(tile1);
    this.initialTileMargin = getMargin(tile1);

    this.onResize();
    this.$nextTick(() => {
      this.isInitialised = true;
    });
  }

  @Watch('selectedPage', { immediate: true })
  onPageChange(newPage: number) {
    if (this.currentPage !== newPage) {
      this.scrollToPage(newPage);
    }
  }

  scrollToPage(pageIndex: number) {
    if (this.container && this.content) {
      this.currentPage = pageIndex;
      this.container.scrollLeft = this.content.getBoundingClientRect().width * pageIndex;
    }
  }

  onScroll(event: Event) {
    if (!event.target) {
      return;
    }

    let currentTarget = event.target as HTMLElement;
    const horizontal = currentTarget.scrollLeft;
    const page = Math.ceil(horizontal / this.content.getBoundingClientRect().width);
    this.currentPage = page;
    this.emitScrollEvent(page, horizontal);
  }

  @Emit('scroll')
  emitScrollEvent(page: number, horizontalOffset: number) {
    return { page, horizontalOffset };
  }

  onResize() {
    const tiles = this.content.children;
    if (tiles.length === 0) {
      return;
    }
    const visibleTiles = this.getVisibleTiles(this.content, this.initialTileWidth);
    const visibleFractionLastTile = visibleTiles % 1;

    if (visibleFractionLastTile > MAX_FRACTION) {
      const visibleTilesAmount = Math.ceil(visibleTiles);
      this.adjustMarginsToFitTiles(visibleTilesAmount)
    } else  if (visibleFractionLastTile < MIN_FRACTION) {
      const visibleTilesAmount = Math.ceil(visibleTiles) - 1;
      this.adjustMarginsToFitTiles(visibleTilesAmount)
    } else {
     this.addMarginToAllTiles(0); // resets to initial value
      this.adjustedTileWidth = this.initialTileWidth;
    }
    this.$nextTick(() => {
      this.scrollToPage(this.selectedPage);
    });
    this.emitResizeEvent();
  }

  adjustMarginsToFitTiles(tileAmount: number) {
    const contentBounds = this.content.getBoundingClientRect();
    const actualContentWidth = tileAmount * this.initialTileWidth;
    const expectedContentWidth = contentBounds.width + (this.initialTileWidth / 2);
    const offset = Math.round(expectedContentWidth - actualContentWidth);
    const marginToAdd = Math.round(offset / tileAmount);
    this.addMarginToAllTiles(marginToAdd);
    this.adjustedTileWidth = this.initialTileWidth + (marginToAdd * 2);
  }

  getVisibleTiles(container: HTMLElement, tileWidth: number): number {
    const containerWidth = container.getBoundingClientRect().width;
    return containerWidth / tileWidth;
  }

  addMarginToAllTiles(marginToAdd: number) {
    const tiles = this.content.children;
    Array.from(tiles).forEach((tile) => {
      this.resetTileMargins(tile as HTMLElement);
      const margins = this.getMarginPerSide(marginToAdd);
      addHorizontalMarginToElement(tile as HTMLElement, margins.left, margins.right);
    });
  }

  getMarginPerSide(totalMargin: number) : {left: number, right: number} {
    if (this.addMarginToSide == 'both') {
      const divided = Math.round(totalMargin / 2);
      return {left: divided, right: divided};
    } else if (this.addMarginToSide === 'left') {
      return {left: totalMargin, right: 0};
    } else{
      return {left: 0, right: totalMargin};
    }
  }

  resetTileMargins(tile: HTMLElement) {
    const margins = this.initialTileMargin;
    tile.style.marginLeft = margins.left+'px';
    tile.style.marginRight = margins.right+'px';
  }

  @Emit('resize')
  async emitResizeEvent() {
    await this.$nextTick();
    const containerWidth = this.content.getBoundingClientRect().width;
    const tileWidth = this.initialTileWidth;
    const pages = this.getPageCount();
    const currentPage = this.selectedPage;
    return { containerWidth, tileWidth, pages, currentPage };
  }

  getPageCount(): number {
    const containerWidth = this.content.getBoundingClientRect().width;
    const tiles = this.content.children;
    return Math.ceil(this.adjustedTileWidth * tiles.length / containerWidth);
  }
}
</script>

<style scoped>
.gallery-container-wrapper {
  overflow: hidden;
}
.gallery-container {
  overflow-x: auto;
}
.gallery-container.hide-scrollbar {
  margin-bottom: -13px;
  padding-bottom: 13px;
}
.vue-gallery-slider_content {
  display: flex;

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
.vue-gallery-slider_content.invisible {
  opacity: 0;
}
.vue-gallery-slider_content > * {
  flex: 0 0 auto;
}
</style>
