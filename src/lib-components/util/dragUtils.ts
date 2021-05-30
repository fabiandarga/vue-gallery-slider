export const buildMouseDragHandler = (elem: HTMLElement) => {
  let activeMouseDownHandler: EventListener | null = null;
  let activeMouseMoveHandler: ((event: MouseEvent) => void) | null = null;
  let activeMouseUpHandler: ((event: MouseEvent) => void)  | null = null;

  /**
   * Scroll the container
   * @param offsetX
   */
  function scrollBy(offsetX: number) {
    elem.scrollLeft += offsetX;
  }

  /**
   * @param event
   */
  function mouseMoveHandler(event:MouseEvent) {
    scrollBy(-1 * event.movementX);
  }

  /**
   * mouseup has to clean up the move and up listeners
   */
  function mouseUpHandler() {
      console.log('mouseupped');
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      activeMouseMoveHandler = null;
      activeMouseUpHandler = null;
  }

  function mouseDownHandler () {
    console.log('mouse downed');

    removeMouseMoveListener();
    document.addEventListener('mousemove', mouseMoveHandler);
    activeMouseMoveHandler = mouseMoveHandler;

    removeMouseUpListener();
    document.addEventListener('mouseup', mouseUpHandler);
    activeMouseUpHandler = mouseUpHandler;
  }

  function removeMouseDownListener() {
    console.log('remove down')
    if (activeMouseDownHandler !== null) {
      elem.removeEventListener('mousedown', activeMouseDownHandler);
    }
  }

  function removeMouseMoveListener() {
    if (activeMouseMoveHandler !== null) {
      elem.removeEventListener('mousemove', activeMouseMoveHandler);
    }
  }

  function removeMouseUpListener() {
    if (activeMouseUpHandler !== null) {
      elem.removeEventListener('mouseup', activeMouseUpHandler);
    }
  }

  elem.addEventListener('mousedown', mouseDownHandler);
  activeMouseDownHandler = mouseDownHandler;

  return {
    disconnect() {
      removeMouseUpListener();
      removeMouseDownListener();
      removeMouseMoveListener();
    }
  }
}