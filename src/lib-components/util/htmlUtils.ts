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
 * @param {number} marginToAdd
 */
export const addHorizontalMarginToElement = (elem: HTMLDivElement, marginToAdd: number) => {
  const margins = getMargin(elem);
  const left = margins.left + marginToAdd;
  const right = margins.right + marginToAdd;
  elem.style.marginLeft = left+'px';
  elem.style.marginRight = right+'px';
};