<template>
  <div class="page-indicator" :class="variantClass">
    <ul>
      <li v-for="page in pages" :key="page.index" class="page-item" :class="{ 'is-selected': page.isSelected }" @click="onItemClick(page.index)">
        <slot :page="page">
          <div class="page-bullet"></div>
        </slot>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Emit, Watch} from 'vue-property-decorator';

type PageData = { index: number, isSelected: boolean};

@Component({})
export default class PageIndicator extends Vue {
  @Prop()
  pageAmount!: number;

  @Prop()
  value!: number; // The selected index

  @Prop({ default: "light" })
  variant!: "light" | "dark";

  selectedIndex = 0;

  setSelectedIndex(index:number) {
    this.selectedIndex = index;
  }

  @Watch('value')
  onValueChange(value: number) {
    this.selectedIndex = value;
  }

  get pages(): PageData[] {
    const selectedIndex = this.selectedIndex;
    const pageIndices = Array.from(Array(this.pageAmount).keys());
    return pageIndices.map((index: number) => ({ index, isSelected: index === selectedIndex}));
  }

  get variantClass(): string[] {
    return [`variant-${this.variant}`];
  }

  onItemClick(pageIndex: number) {
    let page = this.pages[pageIndex];
    if (page && !page.isSelected) {
      this.changeSelected(pageIndex);
    }
  }

  @Emit('input')
  changeSelected(index: number) {
    this.setSelectedIndex(index);
    return index;
  }
}
</script>

<style scoped>
.page-indicator ul {
  display: flex;
  list-style: none;
  padding: 0;
  width: 100%;
  justify-content: center;
}
.page-indicator li {
  padding: 0;
}

.page-item .page-bullet {
  width: 1rem;
  height: 1rem;
  border-radius: 1rem;
  margin: 0 0.5rem;
}

/* variant "ligh" */
.page-indicator.variant-light .page-item .page-bullet  {
  background: rgba(255, 255, 255, 0.35);
}
.page-indicator.variant-light .page-item.is-selected .page-bullet  {
  background: rgba(255, 255, 255, 0.78);
}
/* variant "dark" */
.page-indicator.variant-dark .page-item .page-bullet  {
  background: rgba(12, 12, 12, 0.35);
}
.page-indicator.variant-dark .page-item.is-selected .page-bullet  {
  background: rgba(12, 12, 12, 0.78);
}
</style>
