<template>
  <div class="vue-gallery-slider">
    <GalleryContainer :hide-scrollbar="hideScrollbar">
      <slot />
    </GalleryContainer>
    <PageIndicator :page-amount="5" v-model="currentPage" variant="light" class="vue-gallery-slider__page-indicator" />
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

  currentPage = 0;
}
</script>

<style scoped>
.vue-gallery-slider {
  width: 100%;
  overflow: hidden;
}
.vue-gallery-slider__page-indicator {
  margin-top: 2rem;
}
</style>
