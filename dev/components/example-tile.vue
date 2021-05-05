<template>
  <div class="example-tile">
    <h3>Some Tile #{{index + 1}}</h3>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Cursus metus aliquam eleifend mi. Nunc mattis enim ut tellus. Commodo ullamcorper a lacus vestibulum. A iaculis at erat pellentesque adipiscing commodo elit at imperdiet. Id diam vel quam elementum pulvinar.</p>
  </div>
</template>

<script>
export default {
  name: "example-tile",
  props: {
    index: Number,
  }
}
</script>

<style scoped>
.example-tile {
  background: rgba(205, 92, 92, 0.79);
  color: white;
  width: 200px;
  padding: 10px;
  margin: 0 10px;
}
</style>