import {ExecutionContext} from "ava";
import test from 'ava';

const fn = () => 'foo';

test('fn() returns foo', (t: ExecutionContext) => {
    t.is(fn(), 'foo');
});