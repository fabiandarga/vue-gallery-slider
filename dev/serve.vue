<script lang="ts">
import Vue from 'vue';
import ExampleTile from "./components/example-tile.vue";
// Uncomment import and local "components" registration if library is not registered globally.
// import { VueGallerySliderSample } from '@/entry.esm';

export default Vue.extend({
  name: 'ServeDev',
  data: () => {
    return {
      tiles: 23,
    }
  },
  components: {ExampleTile},
  computed: {
    tileRangeArray() {
      return Array.from(Array(this.tiles).keys());
    }
  },
  // components: {
  //  VueGallerySliderSample,
  // }
});
</script>

<template>
  <div id="app" style="display: flex; justify-content: center">
    <div>
      <div style="background-color:rgba(186,186,186,0.4); width: 60vw; padding: 20px;">
        <vue-gallery-slider :hide-scrollbar="true">
          <example-tile v-for="i in tileRangeArray" :index="i" :key="i" />
        </vue-gallery-slider>
      </div>
    </div>
  </div>
</template>
