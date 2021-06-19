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

  return {
    disconnect() {
      elem.removeEventListener('wheel', onWheel);
    }
  }
}

/**
 * more modern browser implement the passive option, older browsers do not
 */
export const checkForPassiveMode = () => {
  let passiveSupported = false;

  try {
    const options = {
      get passive() { // This function will be called when the browser
        //   attempts to access the passive property.
        passiveSupported = true;
        return false;
      }
    };

    // the following is a hack to check whether the 'passive' option is evaluated by the browser.
    // @ts-ignore
    window.addEventListener("test", null, options);
    // @ts-ignore
    window.removeEventListener("test", null, options);
  } catch(err) {
    passiveSupported = false;
  }
  return passiveSupported;
}