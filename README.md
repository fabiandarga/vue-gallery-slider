# Paged Gallery
### A Vue Component for a gallery that
- scrolls horizontally
- can jump to a certain page
- adjusts margin to always show half a "tile" at the end
- supports ltr and rtl

### Sub-Components
### Horizontal Scroll Container
- prop: hideScrollbar
- prop: selectedPage
- slot: default
    - The slot for the content(the gallery tiles).
    - Each tile should have the same size.
- event: resize({containerWidth, tileWidth, pages, currentPage})

The (horizontal)margin between the tiles will be adjusted *on start and on resize*.
The margin will be increased so that the last visible tile satisfies "25% < visible width < 75%" ¹.
The container has no own styling.

¹ we can find good proportions as a default and/or make this configurable. 

### pages indicator
- prop: value (selectedPage index)
- prop: pages
- slot: page-item(props: index, isSelected)
    - The default appearance of each page indicator can be overwritten here.
- event: input (new selected index)
      
The default appearance of the page items are white bullets, with a light transparency while not selected.
Page items are on a horizontal line with an equal distribution and vertically aligned. 
The indicator component has no other styling (only the page items are styles).

Changes in the selectedPage or pages prop should rerender immediately.

## Usage
### enable scrolling inside the gallery content
To allow scrolling inside the content area you need to append the `.vgs-scrollable` class to the HTML element which should allow scrolling.
Alternatively use the `allow-scroll` property to pass in one or more css selectors (coma separated):  
```html
<VueGallerySlider :allow-scroll="'.selector-1, #id_one'">
  <!--- ... --->
```

## Development
#### Start the development server
```shell
yarn serve
```

#### Run tests
```shell
yarn test
```

#### Build the project
```shell
yarn build
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2021-present, Fabian Darga