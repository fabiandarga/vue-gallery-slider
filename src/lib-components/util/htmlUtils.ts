/**
 * Contains the logic for getting sizes and calculations
 */

export const getOuterWidth = (element: HTMLElement): number => {
  const { left, right } = getMargin(element);
  const boundingClientRect = element.getBoundingClientRect();
  return boundingClientRect.width + left + right;
}

export const getMargin = (element: HTMLElement):{ left:number, right:number } => {
  const style = window.getComputedStyle(element);
  return {
    left: parseInt(style.marginLeft, 10),
    right: parseInt(style.marginRight, 10),
  };
}

/**
 * Adds the margin to both sides
 * @param {HTMLElement} elem
 * @param marginLeft
 * @param marginRight
 */
export const addHorizontalMarginToElement = (elem: HTMLElement, marginLeft: number, marginRight: number) => {
  const margins = getMargin(elem);
  const left = margins.left + marginLeft;
  const right = margins.right + marginRight;
  elem.style.marginLeft = left+'px';
  elem.style.marginRight = right+'px';
};