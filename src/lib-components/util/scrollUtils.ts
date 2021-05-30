export const swapScroll = (elem: HTMLElement) => {
  function scrolledOutOfBounds(deltaY: number) {
    return (deltaY < 0 && elem.scrollLeft <= 0)
      || (deltaY > 0 && elem.scrollLeft >= elem.scrollWidth - elem.getBoundingClientRect().width);

  }
  function onWheel(event: WheelEvent) {
    const deltaY = event.deltaY;
    if (scrolledOutOfBounds(deltaY)) {
      return;
    }

    // this needs fixing for RTL
    elem.scrollLeft += deltaY;
  }
 elem.addEventListener('wheel', onWheel);
}