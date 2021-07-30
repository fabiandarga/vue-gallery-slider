<script lang="ts">
import Vue from 'vue';
import ExampleTile from "./components/example-tile.vue";
// Uncomment import and local "components" registration if library is not registered globally.
// import { VueGallerySliderSample } from '@/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  data: () => {
    return {
      tiles: 0,
    }
  },
  components: {ExampleTile},
  mounted() {
    setTimeout(() => {
      // to test initialization with empty content.
      this.tiles = 22;
    }, 1000);
  },
  computed: {
    tileRangeArray() {
      return Array.from(Array(this.tiles).keys());
    }
  },
});
</script>

<template>
  <div id="app" style="display: flex; justify-content: center">
    <div style="background-color:rgba(186,186,186,0.2); width: 60vw; padding: 20px;">
      <div style="margin-bottom: 20px;">
        <vue-gallery-slider :hide-scrollbar="true" :add-margin-to-side="'right'" :allow-scroll="'.scrollable'">
          <example-tile v-for="i in tileRangeArray" :index="i" :key="i" />
        </vue-gallery-slider>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background: rgb(34, 193, 195);
  background: radial-gradient(circle, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
  height: 120vh; /* to be able to test scroll behaviour */
}
</style>