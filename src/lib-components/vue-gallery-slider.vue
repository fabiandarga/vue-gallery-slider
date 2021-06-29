<template>
  <div class="vue-gallery-slider">
    <GalleryContainer :selected-page="currentPage"
                      :hide-scrollbar="hideScrollbar"
                      :add-margin-to-side="addMarginToSide"
                      :allow-scroll="allowScroll"
                      @resize="onResize" @scroll="onScroll">
      <slot/>
    </GalleryContainer>
    <PageIndicator :page-amount="pages"
                   v-model="currentPage"
                   variant="light"
                   class="vue-gallery-slider__page-indicator"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import GalleryContainer from "@/lib-components/components/gallery-container.vue";
import PageIndicator from "@/lib-components/components/page-indicator.vue";

@Component({
  components: {PageIndicator, GalleryContainer}
})
export default class VueGallerySlider extends Vue {
  @Prop()
  hideScrollbar!: boolean;

  @Prop({type: String, default: 'both'})
  addMarginToSide!: 'both' | 'left' | 'right';

  @Prop()
  allowScroll!: string;

  currentPage = 0;
  pages = 0;

  onResize(data: { containerWidth: number, tileWidth: number, pages: number, currentPage: number }) {
    this.currentPage = data.currentPage;
    this.pages = data.pages;
  }

  onScroll(data: { page: number, horizontalOffset: number }) {
    this.currentPage = data.page;
  }
}
</script>

<style scoped>
.vue-gallery-slider {
  width: 100%;
  overflow: hidden;
}

.vue-gallery-slider__page-indicator {
  margin-top: 1.5rem;
}
</style>
