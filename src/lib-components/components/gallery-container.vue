<template>
  <div class="gallery-container-wrapper">
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

const RESIZE_DEBOUNCE_MS = 100;
const SCROLL_DEBOUNCE_MS = 100;

const MIN_FRACTION = 0.15;
const MAX_FRACTION = 0.75;

@Component({})
export default class GalleryContainer extends Vue {

  @Prop()
  hideScrollbar!: boolean;

  @Prop({ default: 0 })
  selectedPage!: number;

  @Ref('content')
  private content!: HTMLElement;

  @Ref('container')
  private container!: HTMLElement;

  currentPage = 0;

  resizeListener: EventListener | null = null;
  scrollListener: EventListener | null = null;
  contentChangeListener: MutationObserver | null = null;

  isInitialised = false;
  initialTileWidth!: number;
  initialTileMargin!: {left:number, right:number};

  adjustedTileWidth!: number;

  mounted() {
    this.initialize();
    this.addResizeListener();
    this.addScrollListener();
    this.addContentChangeListener();
  }

  beforeDestroy() {
    this.removeResizeListener();
    this.removeScrollListener();
    this.removeContentChangeListener();
  }

  addContentChangeListener() {
    // Create the observer (and what to do on changes...)
    this.contentChangeListener = new MutationObserver(() => {
      this.$nextTick().then(() => {
        this.initialize();
      });
    });

    // Setup the observer
    this.contentChangeListener.observe(
        this.content,
        { attributes: true, childList: true, characterData: true, subtree: true }
    );
  }

  addScrollListener() {
    this.scrollListener = debounce(this.onScroll.bind(this), SCROLL_DEBOUNCE_MS);
    this.container.addEventListener('scroll', this.scrollListener);
  }

  addResizeListener() {
    this.resizeListener = debounce(this.onResize.bind(this), RESIZE_DEBOUNCE_MS);
    window.addEventListener('resize', this.resizeListener);
  }

  removeResizeListener() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  removeScrollListener() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  removeContentChangeListener() {
    if (this.contentChangeListener) {
      this.contentChangeListener.disconnect();
    }
  }

  async initialize() {
    const tiles = this.content.children;
    if (tiles.length === 0) {
      return;
    }
    let tile1 = tiles[0] as HTMLElement;
    this.initialTileWidth = this.getOuterWidth(tile1);
    this.initialTileMargin = this.getMargin(tile1);

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
      console.log(event);
      return;
    }
    let currentTarget = event.target as HTMLElement;
    const horizontal = currentTarget.scrollLeft;
    // const vertical = currentTarget.scrollTop;
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
    const visibleTiles = this.getVisibleTiles(this.content, tiles[0] as HTMLElement);
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
    const marginToAdd = Math.round(offset / tileAmount /2);
    this.addMarginToAllTiles(marginToAdd);
    this.adjustedTileWidth = this.initialTileWidth + (marginToAdd * 2);
  }

  getVisibleTiles(container: HTMLElement, tile: HTMLElement): number {
    const tileWidth = this.getOuterWidth(tile);
    const containerWidth = container.getBoundingClientRect().width;
    return containerWidth / tileWidth;
  }

  getOuterWidth(element: HTMLElement): number {
    const { left, right } = this.getMargin(element);
    return element.getBoundingClientRect().width + left + right;
  }

  getMargin(element: HTMLElement):{ left:number, right:number } {
    const style = window.getComputedStyle(element);
    return {
      left: parseInt(style.marginLeft, 10),
      right: parseInt(style.marginRight, 10),
    };
  }

  addMarginToAllTiles(marginToAdd: number) {
    const tiles = this.content.children;
    Array.from(tiles).forEach((tile) => {
      this.addMarginToTile(tile as HTMLElement, marginToAdd);
    });
  }

  addMarginToTile(tile: HTMLElement, marginToAdd:number) {
    const left = this.initialTileMargin.left + marginToAdd;
    const right = this.initialTileMargin.right + marginToAdd;
    tile.style.marginLeft = left+'px';
    tile.style.marginRight = right+'px';
  }

  @Emit('resize')
  async emitResizeEvent() {
    await this.$nextTick();
    const containerWidth = this.content.getBoundingClientRect().width;
    const tileWidth = this.initialTileWidth;
    const pages = this.getPageCount();
    const currentPage = this.getCurrentPage();
    return { containerWidth, tileWidth, pages, currentPage };
  }

  getPageCount(): number {
    const containerWidth = this.content.getBoundingClientRect().width;
    const tiles = this.content.children;
    return Math.ceil(this.adjustedTileWidth * tiles.length / containerWidth);
  }

  getCurrentPage(): number {
    return 3;
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
  margin-bottom: -12px;
}
.vue-gallery-slider_content {
  display: flex;
}
.vue-gallery-slider_content.invisible {
  opacity: 0;
}
.vue-gallery-slider_content > * {
  flex: 0 0 auto;
}
</style>
