<template>
  <div class="gallery-container-wrapper">
    <div class="gallery-container" :class="{ 'hide-scrollbar': hideScrollbar }">
      <div ref="content" class="vue-gallery-slider_content" :class="{ invisible: !isInitialised }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Ref} from 'vue-property-decorator';
import { debounce } from 'debounce';

const RESIZE_DEBOUNCE_MS = 100;

const MIN_FRACTION = 0.15;
const MAX_FRACTION = 0.75;

@Component({})
export default class GalleryContainer extends Vue {

  @Prop()
  hideScrollbar!: boolean;

  @Ref('content')
  private content!: HTMLElement;

  isInitialised = false;
  resizeListener: EventListener | null = null;
  initialTileWidth!: number;
  initialTileMargin!: {left:number, right:number};

  mounted() {
    this.initialize().then(() => {
      this.$nextTick(() => {
        this.isInitialised = true;
      });
    });
    this.addResizeListener();
  }

  beforeDestroy() {
    this.removeResizeListener();
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

  async initialize() {
    const tiles = this.content.children;
    if (tiles.length === 0) {
      return;
    }
    let tile1 = tiles[0] as HTMLElement;
    this.initialTileWidth = this.getOuterWidth(tile1);
    this.initialTileMargin = this.getMargin(tile1);

    this.onResize();
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
    }
  }

  adjustMarginsToFitTiles(tileAmount: number) {
    const contentBounds = this.content.getBoundingClientRect();
    const actualContentWidth = tileAmount * this.initialTileWidth;
    const expectedContentWidth = contentBounds.width + (this.initialTileWidth / 2);
    const offset = Math.round(expectedContentWidth - actualContentWidth);
    const marginToAdd = Math.round(offset / tileAmount /2);
    this.addMarginToAllTiles(marginToAdd);
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
