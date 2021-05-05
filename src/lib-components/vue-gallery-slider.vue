<template>
  <div class="vue-gallery-slider" :class="{'hide-scrollbar':hideScrollbar}">
    <div class="scroll-container">
      <div ref="content" class="vue-gallery-slider_content" :class="{ invisible: !isInitialised }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Ref, Prop} from 'vue-property-decorator';

@Component({})
export default class VueGallerySlider extends Vue {

  @Prop()
  hideScrollbar!: boolean;

  @Ref('content')
  private content!: HTMLElement;


  isInitialised = false;

  mounted() {
    const rect = this.content.getBoundingClientRect();
    console.log('container ', rect);

    this.$nextTick(() => {
      this.isInitialised = true;
    });
  }

  initialize() {
    const rect = this.content.getBoundingClientRect();
    console.log('container ', rect);
    const tiles = this.content.children;
    console.log('container ', tiles.length);
  }
}
</script>

<style scoped>
.vue-gallery-slider {
  width: 100%;
  overflow: hidden;
}
.vue-gallery-slider.hide-scrollbar .scroll-container {
  margin-bottom: -12px;
}
.scroll-container {
  overflow-x: auto;
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
