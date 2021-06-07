import {ExecutionContext} from "ava";
import test from 'ava';

import {
    getMargin,
    getOuterWidth,
    addHorizontalMarginToElement
} from '../src/lib-components/util/htmlUtils';

test('returns margin', (t: ExecutionContext) => {
    const elem = document.createElement('div');
    elem.style.marginRight = '15px';
    elem.style.marginLeft = '5px';

    const margins = getMargin(elem);
    t.is(margins.left, 5);
    t.is(margins.right, 15)
});

test('returns outer width including margins', (t) => {
    const elem = document.createElement('div');
    elem.getBoundingClientRect = () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 17,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    }) as DOMRect;
    elem.style.marginRight = '15px';
    elem.style.marginLeft = '5px';

    t.is(getOuterWidth(elem), 120);
});

test('add margins to element', (t) => {
    const elem = document.createElement('div');
    elem.style.marginRight = '5px';
    elem.style.marginLeft = '5px';

    addHorizontalMarginToElement(elem, 10, 10);

    t.is(elem.style.marginRight, '15px');
    t.is(elem.style.marginLeft, '15px');
});