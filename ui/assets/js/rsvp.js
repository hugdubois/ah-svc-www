
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _debois$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _debois$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _debois$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _debois$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _debois$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _debois$elm_dom$DOM$nextSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'nextSibling', decoder);
};
var _debois$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_debois$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_debois$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_debois$elm_dom$DOM$scrollLeft,
				_debois$elm_dom$DOM$scrollTop,
				_debois$elm_dom$DOM$offsetLeft,
				_debois$elm_dom$DOM$offsetTop));
	});
var _debois$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_debois$elm_dom$DOM$position, 0, 0),
	_debois$elm_dom$DOM$offsetWidth,
	_debois$elm_dom$DOM$offsetHeight);
var _debois$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _debois$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

//import Result //

var _elm_lang$core$Native_Date = function() {

function fromString(str)
{
	var date = new Date(str);
	return isNaN(date.getTime())
		? _elm_lang$core$Result$Err('Unable to parse \'' + str + '\' as a date. Dates must be in the ISO 8601 format.')
		: _elm_lang$core$Result$Ok(date);
}

var dayTable = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthTable =
	['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


return {
	fromString: fromString,
	year: function(d) { return d.getFullYear(); },
	month: function(d) { return { ctor: monthTable[d.getMonth()] }; },
	day: function(d) { return d.getDate(); },
	hour: function(d) { return d.getHours(); },
	minute: function(d) { return d.getMinutes(); },
	second: function(d) { return d.getSeconds(); },
	millisecond: function(d) { return d.getMilliseconds(); },
	toTime: function(d) { return d.getTime(); },
	fromTime: function(t) { return new Date(t); },
	dayOfWeek: function(d) { return { ctor: dayTable[d.getDay()] }; }
};

}();
var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Date$millisecond = _elm_lang$core$Native_Date.millisecond;
var _elm_lang$core$Date$second = _elm_lang$core$Native_Date.second;
var _elm_lang$core$Date$minute = _elm_lang$core$Native_Date.minute;
var _elm_lang$core$Date$hour = _elm_lang$core$Native_Date.hour;
var _elm_lang$core$Date$dayOfWeek = _elm_lang$core$Native_Date.dayOfWeek;
var _elm_lang$core$Date$day = _elm_lang$core$Native_Date.day;
var _elm_lang$core$Date$month = _elm_lang$core$Native_Date.month;
var _elm_lang$core$Date$year = _elm_lang$core$Native_Date.year;
var _elm_lang$core$Date$fromTime = _elm_lang$core$Native_Date.fromTime;
var _elm_lang$core$Date$toTime = _elm_lang$core$Native_Date.toTime;
var _elm_lang$core$Date$fromString = _elm_lang$core$Native_Date.fromString;
var _elm_lang$core$Date$now = A2(_elm_lang$core$Task$map, _elm_lang$core$Date$fromTime, _elm_lang$core$Time$now);
var _elm_lang$core$Date$Date = {ctor: 'Date'};
var _elm_lang$core$Date$Sun = {ctor: 'Sun'};
var _elm_lang$core$Date$Sat = {ctor: 'Sat'};
var _elm_lang$core$Date$Fri = {ctor: 'Fri'};
var _elm_lang$core$Date$Thu = {ctor: 'Thu'};
var _elm_lang$core$Date$Wed = {ctor: 'Wed'};
var _elm_lang$core$Date$Tue = {ctor: 'Tue'};
var _elm_lang$core$Date$Mon = {ctor: 'Mon'};
var _elm_lang$core$Date$Dec = {ctor: 'Dec'};
var _elm_lang$core$Date$Nov = {ctor: 'Nov'};
var _elm_lang$core$Date$Oct = {ctor: 'Oct'};
var _elm_lang$core$Date$Sep = {ctor: 'Sep'};
var _elm_lang$core$Date$Aug = {ctor: 'Aug'};
var _elm_lang$core$Date$Jul = {ctor: 'Jul'};
var _elm_lang$core$Date$Jun = {ctor: 'Jun'};
var _elm_lang$core$Date$May = {ctor: 'May'};
var _elm_lang$core$Date$Apr = {ctor: 'Apr'};
var _elm_lang$core$Date$Mar = {ctor: 'Mar'};
var _elm_lang$core$Date$Feb = {ctor: 'Feb'};
var _elm_lang$core$Date$Jan = {ctor: 'Jan'};

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$http$Native_Http = function() {


// ENCODING AND DECODING

function encodeUri(string)
{
	return encodeURIComponent(string);
}

function decodeUri(string)
{
	try
	{
		return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch(e)
	{
		return _elm_lang$core$Maybe$Nothing;
	}
}


// SEND REQUEST

function toTask(request, maybeProgress)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
		});
		xhr.addEventListener('timeout', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
		});
		xhr.addEventListener('load', function() {
			callback(handleResponse(xhr, request.expect.responseToResult));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
		}

		configureRequest(xhr, request);
		send(xhr, request.body);

		return function() { xhr.abort(); };
	});
}

function configureProgress(xhr, maybeProgress)
{
	if (maybeProgress.ctor === 'Nothing')
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function configureRequest(xhr, request)
{
	function setHeader(pair)
	{
		xhr.setRequestHeader(pair._0, pair._1);
	}

	A2(_elm_lang$core$List$map, setHeader, request.headers);
	xhr.responseType = request.expect.responseType;
	xhr.withCredentials = request.withCredentials;

	if (request.timeout.ctor === 'Just')
	{
		xhr.timeout = request.timeout._0;
	}
}

function send(xhr, body)
{
	switch (body.ctor)
	{
		case 'EmptyBody':
			xhr.send();
			return;

		case 'StringBody':
			xhr.setRequestHeader('Content-Type', body._0);
			xhr.send(body._1);
			return;

		case 'FormDataBody':
			xhr.send(body._0);
			return;
	}
}


// RESPONSES

function handleResponse(xhr, responseToResult)
{
	var response = toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadStatus',
			_0: response
		});
	}

	var result = responseToResult(response);

	if (result.ctor === 'Ok')
	{
		return _elm_lang$core$Native_Scheduler.succeed(result._0);
	}
	else
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadPayload',
			_0: result._0,
			_1: response
		});
	}
}

function toResponse(xhr)
{
	return {
		status: { code: xhr.status, message: xhr.statusText },
		headers: parseHeaders(xhr.getAllResponseHeaders()),
		url: xhr.responseURL,
		body: xhr.response
	};
}

function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function expectStringResponse(responseToResult)
{
	return {
		responseType: 'text',
		responseToResult: responseToResult
	};
}

function mapExpect(func, expect)
{
	return {
		responseType: expect.responseType,
		responseToResult: function(response) {
			var convertedResponse = expect.responseToResult(response);
			return A2(_elm_lang$core$Result$map, func, convertedResponse);
		}
	};
}


// BODY

function multipart(parts)
{
	var formData = new FormData();

	while (parts.ctor !== '[]')
	{
		var part = parts._0;
		formData.append(part._0, part._1);
		parts = parts._1;
	}

	return { ctor: 'FormDataBody', _0: formData };
}

return {
	toTask: F2(toTask),
	expectStringResponse: expectStringResponse,
	mapExpect: F2(mapExpect),
	multipart: multipart,
	encodeUri: encodeUri,
	decodeUri: decodeUri
};

}();

var _elm_lang$http$Http_Internal$map = F2(
	function (func, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				expect: A2(_elm_lang$http$Native_Http.mapExpect, func, request.expect)
			});
	});
var _elm_lang$http$Http_Internal$RawRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g};
	});
var _elm_lang$http$Http_Internal$Request = function (a) {
	return {ctor: 'Request', _0: a};
};
var _elm_lang$http$Http_Internal$Expect = {ctor: 'Expect'};
var _elm_lang$http$Http_Internal$FormDataBody = {ctor: 'FormDataBody'};
var _elm_lang$http$Http_Internal$StringBody = F2(
	function (a, b) {
		return {ctor: 'StringBody', _0: a, _1: b};
	});
var _elm_lang$http$Http_Internal$EmptyBody = {ctor: 'EmptyBody'};
var _elm_lang$http$Http_Internal$Header = F2(
	function (a, b) {
		return {ctor: 'Header', _0: a, _1: b};
	});

var _elm_lang$http$Http$decodeUri = _elm_lang$http$Native_Http.decodeUri;
var _elm_lang$http$Http$encodeUri = _elm_lang$http$Native_Http.encodeUri;
var _elm_lang$http$Http$expectStringResponse = _elm_lang$http$Native_Http.expectStringResponse;
var _elm_lang$http$Http$expectJson = function (decoder) {
	return _elm_lang$http$Http$expectStringResponse(
		function (response) {
			return A2(_elm_lang$core$Json_Decode$decodeString, decoder, response.body);
		});
};
var _elm_lang$http$Http$expectString = _elm_lang$http$Http$expectStringResponse(
	function (response) {
		return _elm_lang$core$Result$Ok(response.body);
	});
var _elm_lang$http$Http$multipartBody = _elm_lang$http$Native_Http.multipart;
var _elm_lang$http$Http$stringBody = _elm_lang$http$Http_Internal$StringBody;
var _elm_lang$http$Http$jsonBody = function (value) {
	return A2(
		_elm_lang$http$Http_Internal$StringBody,
		'application/json',
		A2(_elm_lang$core$Json_Encode$encode, 0, value));
};
var _elm_lang$http$Http$emptyBody = _elm_lang$http$Http_Internal$EmptyBody;
var _elm_lang$http$Http$header = _elm_lang$http$Http_Internal$Header;
var _elm_lang$http$Http$request = _elm_lang$http$Http_Internal$Request;
var _elm_lang$http$Http$post = F3(
	function (url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'POST',
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$get = F2(
	function (url, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {ctor: '[]'},
				url: url,
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$getString = function (url) {
	return _elm_lang$http$Http$request(
		{
			method: 'GET',
			headers: {ctor: '[]'},
			url: url,
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
};
var _elm_lang$http$Http$toTask = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$http$Native_Http.toTask, _p1._0, _elm_lang$core$Maybe$Nothing);
};
var _elm_lang$http$Http$send = F2(
	function (resultToMessage, request) {
		return A2(
			_elm_lang$core$Task$attempt,
			resultToMessage,
			_elm_lang$http$Http$toTask(request));
	});
var _elm_lang$http$Http$Response = F4(
	function (a, b, c, d) {
		return {url: a, status: b, headers: c, body: d};
	});
var _elm_lang$http$Http$BadPayload = F2(
	function (a, b) {
		return {ctor: 'BadPayload', _0: a, _1: b};
	});
var _elm_lang$http$Http$BadStatus = function (a) {
	return {ctor: 'BadStatus', _0: a};
};
var _elm_lang$http$Http$NetworkError = {ctor: 'NetworkError'};
var _elm_lang$http$Http$Timeout = {ctor: 'Timeout'};
var _elm_lang$http$Http$BadUrl = function (a) {
	return {ctor: 'BadUrl', _0: a};
};
var _elm_lang$http$Http$StringPart = F2(
	function (a, b) {
		return {ctor: 'StringPart', _0: a, _1: b};
	});
var _elm_lang$http$Http$stringPart = _elm_lang$http$Http$StringPart;

var _elm_lang$mouse$Mouse_ops = _elm_lang$mouse$Mouse_ops || {};
_elm_lang$mouse$Mouse_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return t2;
			},
			t1);
	});
var _elm_lang$mouse$Mouse$onSelfMsg = F3(
	function (router, _p1, state) {
		var _p2 = _p1;
		var _p3 = A2(_elm_lang$core$Dict$get, _p2.category, state);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p2.position));
			};
			return A2(
				_elm_lang$mouse$Mouse_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p3._0.taggers)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$mouse$Mouse$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$mouse$Mouse$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p4 = maybeValues;
		if (_p4.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p4._0});
		}
	});
var _elm_lang$mouse$Mouse$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p5 = subs;
			if (_p5.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p5._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p5._0._0,
					_elm_lang$mouse$Mouse$categorizeHelpHelp(_p5._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$mouse$Mouse$categorize = function (subs) {
	return A2(_elm_lang$mouse$Mouse$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$mouse$Mouse$subscription = _elm_lang$core$Native_Platform.leaf('Mouse');
var _elm_lang$mouse$Mouse$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _elm_lang$mouse$Mouse$position = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$mouse$Mouse$Position,
	A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$int));
var _elm_lang$mouse$Mouse$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$mouse$Mouse$Msg = F2(
	function (a, b) {
		return {category: a, position: b};
	});
var _elm_lang$mouse$Mouse$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				var tracker = A3(
					_elm_lang$dom$Dom_LowLevel$onDocument,
					category,
					_elm_lang$mouse$Mouse$position,
					function (_p6) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$mouse$Mouse$Msg, category, _p6));
					});
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$mouse$Mouse$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(tracker));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p7, taggers, task) {
				var _p8 = _p7;
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$core$Dict$insert,
								category,
								A2(_elm_lang$mouse$Mouse$Watcher, taggers, _p8.pid),
								state));
					},
					task);
			});
		var leftStep = F3(
			function (category, _p9, task) {
				var _p10 = _p9;
				return A2(
					_elm_lang$mouse$Mouse_ops['&>'],
					_elm_lang$core$Process$kill(_p10.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$mouse$Mouse$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$mouse$Mouse$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$mouse$Mouse$clicks = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'click', tagger));
};
var _elm_lang$mouse$Mouse$moves = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousemove', tagger));
};
var _elm_lang$mouse$Mouse$downs = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousedown', tagger));
};
var _elm_lang$mouse$Mouse$ups = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mouseup', tagger));
};
var _elm_lang$mouse$Mouse$subMap = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return A2(
			_elm_lang$mouse$Mouse$MySub,
			_p12._0,
			function (_p13) {
				return func(
					_p12._1(_p13));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Mouse'] = {pkg: 'elm-lang/mouse', init: _elm_lang$mouse$Mouse$init, onEffects: _elm_lang$mouse$Mouse$onEffects, onSelfMsg: _elm_lang$mouse$Mouse$onSelfMsg, tag: 'sub', subMap: _elm_lang$mouse$Mouse$subMap};

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _jweir$elm_iso8601$ISO8601_Helpers$calendar = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: {ctor: '_Tuple3', _0: 'January', _1: 31, _2: 31},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple3', _0: 'February', _1: 28, _2: 29},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple3', _0: 'March', _1: 31, _2: 31},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple3', _0: 'April', _1: 30, _2: 30},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple3', _0: 'May', _1: 31, _2: 31},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple3', _0: 'June', _1: 30, _2: 30},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple3', _0: 'July', _1: 31, _2: 31},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple3', _0: 'August', _1: 31, _2: 31},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple3', _0: 'September', _1: 30, _2: 30},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple3', _0: 'October', _1: 31, _2: 31},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple3', _0: 'November', _1: 30, _2: 30},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple3', _0: 'December', _1: 31, _2: 31},
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _jweir$elm_iso8601$ISO8601_Helpers$isLeapYear = function (year) {
	var c = _elm_lang$core$Native_Utils.eq(
		0,
		A2(_elm_lang$core$Basics_ops['%'], year, 400));
	var b = _elm_lang$core$Native_Utils.eq(
		0,
		A2(_elm_lang$core$Basics_ops['%'], year, 100));
	var a = _elm_lang$core$Native_Utils.eq(
		0,
		A2(_elm_lang$core$Basics_ops['%'], year, 4));
	var _p0 = {
		ctor: '::',
		_0: a,
		_1: {
			ctor: '::',
			_0: b,
			_1: {
				ctor: '::',
				_0: c,
				_1: {ctor: '[]'}
			}
		}
	};
	_v0_3:
	do {
		if (((_p0.ctor === '::') && (_p0._0 === true)) && (_p0._1.ctor === '::')) {
			if (_p0._1._0 === false) {
				if ((_p0._1._1.ctor === '::') && (_p0._1._1._1.ctor === '[]')) {
					return true;
				} else {
					break _v0_3;
				}
			} else {
				if (_p0._1._1.ctor === '::') {
					if (_p0._1._1._0 === true) {
						if (_p0._1._1._1.ctor === '[]') {
							return true;
						} else {
							break _v0_3;
						}
					} else {
						if (_p0._1._1._1.ctor === '[]') {
							return false;
						} else {
							break _v0_3;
						}
					}
				} else {
					break _v0_3;
				}
			}
		} else {
			break _v0_3;
		}
	} while(false);
	return false;
};
var _jweir$elm_iso8601$ISO8601_Helpers$daysInMonth = F2(
	function (year, monthInt) {
		var calMonth = A2(_elm_lang$core$Array$get, monthInt - 1, _jweir$elm_iso8601$ISO8601_Helpers$calendar);
		var _p1 = calMonth;
		if (_p1.ctor === 'Just') {
			return _jweir$elm_iso8601$ISO8601_Helpers$isLeapYear(year) ? _p1._0._2 : _p1._0._1;
		} else {
			return 0;
		}
	});
var _jweir$elm_iso8601$ISO8601_Helpers$daysToMonths = F3(
	function (year, startMonth, remainingDays) {
		daysToMonths:
		while (true) {
			var remainingDays_ = remainingDays - A2(_jweir$elm_iso8601$ISO8601_Helpers$daysInMonth, year, startMonth);
			if (_elm_lang$core$Native_Utils.cmp(remainingDays_, 0) > 0) {
				var _v2 = year,
					_v3 = startMonth + 1,
					_v4 = remainingDays_;
				year = _v2;
				startMonth = _v3;
				remainingDays = _v4;
				continue daysToMonths;
			} else {
				return {ctor: '_Tuple2', _0: startMonth, _1: remainingDays};
			}
		}
	});
var _jweir$elm_iso8601$ISO8601_Helpers$daysInYear = function (year) {
	return _jweir$elm_iso8601$ISO8601_Helpers$isLeapYear(year) ? 366 : 365;
};
var _jweir$elm_iso8601$ISO8601_Helpers$yearsToDays = F3(
	function (ending, current, days) {
		yearsToDays:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(ending, current) > 0) {
				var _v5 = ending,
					_v6 = current + 1,
					_v7 = _jweir$elm_iso8601$ISO8601_Helpers$daysInYear(current);
				ending = _v5;
				current = _v6;
				days = _v7;
				continue yearsToDays;
			} else {
				return days;
			}
		}
	});
var _jweir$elm_iso8601$ISO8601_Helpers$toInt = function (str) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		0,
		_elm_lang$core$Result$toMaybe(
			_elm_lang$core$String$toInt(str)));
};
var _jweir$elm_iso8601$ISO8601_Helpers$After = {ctor: 'After'};
var _jweir$elm_iso8601$ISO8601_Helpers$Before = {ctor: 'Before'};
var _jweir$elm_iso8601$ISO8601_Helpers$daysToYears = F3(
	function (rel, startYear, remainingDays) {
		daysToYears:
		while (true) {
			var _p2 = rel;
			if (_p2.ctor === 'After') {
				var remainingDays_ = remainingDays - _jweir$elm_iso8601$ISO8601_Helpers$daysInYear(startYear);
				if (_elm_lang$core$Native_Utils.cmp(remainingDays_, 0) > 0) {
					var _v9 = _jweir$elm_iso8601$ISO8601_Helpers$After,
						_v10 = startYear + 1,
						_v11 = remainingDays_;
					rel = _v9;
					startYear = _v10;
					remainingDays = _v11;
					continue daysToYears;
				} else {
					if (_elm_lang$core$Native_Utils.eq(remainingDays_, 0)) {
						return {ctor: '_Tuple2', _0: startYear + 1, _1: 0};
					} else {
						return {ctor: '_Tuple2', _0: startYear, _1: remainingDays};
					}
				}
			} else {
				var remainingDays_ = remainingDays + _jweir$elm_iso8601$ISO8601_Helpers$daysInYear(startYear);
				if (_elm_lang$core$Native_Utils.cmp(remainingDays_, 0) < 0) {
					var _v12 = _jweir$elm_iso8601$ISO8601_Helpers$Before,
						_v13 = startYear - 1,
						_v14 = remainingDays_;
					rel = _v12;
					startYear = _v13;
					remainingDays = _v14;
					continue daysToYears;
				} else {
					return {
						ctor: '_Tuple2',
						_0: startYear,
						_1: _jweir$elm_iso8601$ISO8601_Helpers$daysInYear(startYear) + remainingDays
					};
				}
			}
		}
	});

var _jweir$elm_iso8601$ISO8601$offset = function (time) {
	return time.offset;
};
var _jweir$elm_iso8601$ISO8601$millisecond = function (time) {
	return time.millisecond;
};
var _jweir$elm_iso8601$ISO8601$second = function (time) {
	return time.second;
};
var _jweir$elm_iso8601$ISO8601$minute = function (time) {
	return time.minute;
};
var _jweir$elm_iso8601$ISO8601$hour = function (time) {
	return time.hour;
};
var _jweir$elm_iso8601$ISO8601$day = function (time) {
	return time.day;
};
var _jweir$elm_iso8601$ISO8601$month = function (time) {
	return time.month;
};
var _jweir$elm_iso8601$ISO8601$year = function (time) {
	return time.year;
};
var _jweir$elm_iso8601$ISO8601$validateHour = function (time) {
	var s = time.second;
	var m = time.minute;
	var h = time.hour;
	return (_elm_lang$core$Native_Utils.eq(h, 24) && (_elm_lang$core$Native_Utils.cmp(m + s, 0) > 0)) ? _elm_lang$core$Result$Err('hour is out of range') : (((_elm_lang$core$Native_Utils.cmp(h, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(h, 24) > 0)) ? _elm_lang$core$Result$Err('hour is out of range') : (((_elm_lang$core$Native_Utils.cmp(m, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(m, 59) > 0)) ? _elm_lang$core$Result$Err('minute is out of range') : (((_elm_lang$core$Native_Utils.cmp(s, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(s, 59) > 0)) ? _elm_lang$core$Result$Err('second is out of range') : _elm_lang$core$Result$Ok(time))));
};
var _jweir$elm_iso8601$ISO8601$validateTime = function (time) {
	var maxDays = _jweir$elm_iso8601$ISO8601_Helpers$daysInMonth;
	return ((_elm_lang$core$Native_Utils.cmp(time.month, 1) < 0) || (_elm_lang$core$Native_Utils.cmp(time.month, 12) > 0)) ? _elm_lang$core$Result$Err('month is out of range') : (((_elm_lang$core$Native_Utils.cmp(time.day, 1) < 0) || (_elm_lang$core$Native_Utils.cmp(
		time.day,
		A2(_jweir$elm_iso8601$ISO8601_Helpers$daysInMonth, time.year, time.month)) > 0)) ? _elm_lang$core$Result$Err('day is out of range') : _jweir$elm_iso8601$ISO8601$validateHour(time));
};
var _jweir$elm_iso8601$ISO8601$parseOffset = function (timeString) {
	var setHour = F2(
		function (modifier, hour) {
			var _p0 = modifier;
			switch (_p0) {
				case '+':
					return hour;
				case '-':
					return A2(_elm_lang$core$Basics_ops['++'], modifier, hour);
				default:
					return hour;
			}
		});
	var match = A3(
		_elm_lang$core$Regex$find,
		_elm_lang$core$Regex$AtMost(1),
		_elm_lang$core$Regex$regex('([-+])(\\d\\d):?(\\d\\d)'),
		A2(_elm_lang$core$Maybe$withDefault, '', timeString));
	var parts = A2(
		_elm_lang$core$List$map,
		function (_) {
			return _.submatches;
		},
		match);
	var re = _elm_lang$core$Regex$regex('(Z|([+-]\\d{2}:?\\d{2}))?');
	var _p1 = parts;
	_v1_2:
	do {
		if (((((_p1.ctor === '::') && (_p1._0.ctor === '::')) && (_p1._0._0.ctor === 'Just')) && (_p1._0._1.ctor === '::')) && (_p1._0._1._0.ctor === 'Just')) {
			if (_p1._0._1._1.ctor === '::') {
				if (((_p1._0._1._1._0.ctor === 'Just') && (_p1._0._1._1._1.ctor === '[]')) && (_p1._1.ctor === '[]')) {
					return {
						ctor: '_Tuple2',
						_0: _jweir$elm_iso8601$ISO8601_Helpers$toInt(
							A2(setHour, _p1._0._0._0, _p1._0._1._0._0)),
						_1: _jweir$elm_iso8601$ISO8601_Helpers$toInt(_p1._0._1._1._0._0)
					};
				} else {
					break _v1_2;
				}
			} else {
				if (_p1._1.ctor === '[]') {
					return {
						ctor: '_Tuple2',
						_0: _jweir$elm_iso8601$ISO8601_Helpers$toInt(
							A2(setHour, _p1._0._0._0, _p1._0._1._0._0)),
						_1: 0
					};
				} else {
					break _v1_2;
				}
			}
		} else {
			break _v1_2;
		}
	} while(false);
	return {ctor: '_Tuple2', _0: 0, _1: 0};
};
var _jweir$elm_iso8601$ISO8601$parseMilliseconds = function (msString) {
	var _p2 = msString;
	if (_p2.ctor === 'Nothing') {
		return 0;
	} else {
		var decimalStr = A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$AtMost(1),
			_elm_lang$core$Regex$regex('[,.]'),
			function (_p3) {
				return '0.';
			},
			_p2._0);
		var decimal = A2(
			_elm_lang$core$Maybe$withDefault,
			0.0,
			_elm_lang$core$Result$toMaybe(
				_elm_lang$core$String$toFloat(decimalStr)));
		return _elm_lang$core$Basics$round(1000 * decimal);
	}
};
var _jweir$elm_iso8601$ISO8601$iso8601Regex = A2(
	_elm_lang$core$Regex$find,
	_elm_lang$core$Regex$AtMost(1),
	_elm_lang$core$Regex$regex(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'(\\d{4})?-?',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'(\\d{2})?-?',
				A2(
					_elm_lang$core$Basics_ops['++'],
					'(\\d{2})?',
					A2(
						_elm_lang$core$Basics_ops['++'],
						'T?',
						A2(
							_elm_lang$core$Basics_ops['++'],
							'(\\d{2})?:?',
							A2(
								_elm_lang$core$Basics_ops['++'],
								'(\\d{2})?:?',
								A2(
									_elm_lang$core$Basics_ops['++'],
									'(\\d{2})?',
									A2(
										_elm_lang$core$Basics_ops['++'],
										'([.,]\\d{1,})?',
										A2(_elm_lang$core$Basics_ops['++'], '(Z|[+-]\\d{2}:?\\d{2})?', '(.*)?')))))))))));
var _jweir$elm_iso8601$ISO8601$fromString = function (s) {
	var unwrap = F2(
		function (x, d) {
			return _jweir$elm_iso8601$ISO8601_Helpers$toInt(
				A2(_elm_lang$core$Maybe$withDefault, d, x));
		});
	var parts = A2(
		_elm_lang$core$List$map,
		function (_) {
			return _.submatches;
		},
		_jweir$elm_iso8601$ISO8601$iso8601Regex(s));
	var _p4 = parts;
	if ((((((((((((_p4.ctor === '::') && (_p4._0.ctor === '::')) && (_p4._0._1.ctor === '::')) && (_p4._0._1._1.ctor === '::')) && (_p4._0._1._1._1.ctor === '::')) && (_p4._0._1._1._1._1.ctor === '::')) && (_p4._0._1._1._1._1._1.ctor === '::')) && (_p4._0._1._1._1._1._1._1.ctor === '::')) && (_p4._0._1._1._1._1._1._1._1.ctor === '::')) && (_p4._0._1._1._1._1._1._1._1._1.ctor === '::')) && (_p4._0._1._1._1._1._1._1._1._1._1.ctor === '[]')) && (_p4._1.ctor === '[]')) {
		var _p5 = _p4._0._1._1._1._1._1._1._1._1._0;
		if (_p5.ctor === 'Just') {
			return _elm_lang$core$Result$Err('unexpected text');
		} else {
			return _jweir$elm_iso8601$ISO8601$validateTime(
				{
					year: A2(unwrap, _p4._0._0, '0'),
					month: A2(unwrap, _p4._0._1._0, '1'),
					day: A2(unwrap, _p4._0._1._1._0, '1'),
					hour: A2(unwrap, _p4._0._1._1._1._0, '0'),
					minute: A2(unwrap, _p4._0._1._1._1._1._0, '0'),
					second: A2(unwrap, _p4._0._1._1._1._1._1._0, '0'),
					millisecond: _jweir$elm_iso8601$ISO8601$parseMilliseconds(_p4._0._1._1._1._1._1._1._0),
					offset: _jweir$elm_iso8601$ISO8601$parseOffset(_p4._0._1._1._1._1._1._1._1._0)
				});
		}
	} else {
		return _elm_lang$core$Result$Err('unknown error');
	}
};
var _jweir$elm_iso8601$ISO8601$fmtMs = function (n) {
	return _elm_lang$core$Native_Utils.eq(n, 0) ? '' : ((_elm_lang$core$Native_Utils.cmp(n, 10) < 0) ? A2(
		_elm_lang$core$Basics_ops['++'],
		'.00',
		_elm_lang$core$Basics$toString(n)) : ((_elm_lang$core$Native_Utils.cmp(n, 100) < 0) ? A2(
		_elm_lang$core$Basics_ops['++'],
		'.0',
		_elm_lang$core$Basics$toString(n)) : A2(
		_elm_lang$core$Basics_ops['++'],
		'.',
		_elm_lang$core$Basics$toString(n))));
};
var _jweir$elm_iso8601$ISO8601$fmtYear = function (n) {
	var s = _elm_lang$core$Basics$toString(n);
	return (_elm_lang$core$Native_Utils.cmp(n, 10) < 0) ? A2(_elm_lang$core$Basics_ops['++'], '000', s) : ((_elm_lang$core$Native_Utils.cmp(n, 100) < 0) ? A2(_elm_lang$core$Basics_ops['++'], '00', s) : ((_elm_lang$core$Native_Utils.cmp(n, 1000) < 0) ? A2(_elm_lang$core$Basics_ops['++'], '0', s) : s));
};
var _jweir$elm_iso8601$ISO8601$fmt = function (n) {
	return (_elm_lang$core$Native_Utils.cmp(n, 10) < 0) ? A2(
		_elm_lang$core$Basics_ops['++'],
		'0',
		_elm_lang$core$Basics$toString(n)) : _elm_lang$core$Basics$toString(n);
};
var _jweir$elm_iso8601$ISO8601$fmtOffset = function (offset) {
	var _p6 = offset;
	if ((_p6._0 === 0) && (_p6._1 === 0)) {
		return 'Z';
	} else {
		var _p7 = _p6._0;
		var symbol = (_elm_lang$core$Native_Utils.cmp(_p7, 0) > -1) ? '+' : '-';
		return A2(
			_elm_lang$core$Basics_ops['++'],
			symbol,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_jweir$elm_iso8601$ISO8601$fmt(
					_elm_lang$core$Basics$abs(_p7)),
				_jweir$elm_iso8601$ISO8601$fmt(_p6._1)));
	}
};
var _jweir$elm_iso8601$ISO8601$toString = function (time) {
	return A2(
		_elm_lang$core$String$join,
		'',
		{
			ctor: '::',
			_0: _jweir$elm_iso8601$ISO8601$fmtYear(time.year),
			_1: {
				ctor: '::',
				_0: '-',
				_1: {
					ctor: '::',
					_0: _jweir$elm_iso8601$ISO8601$fmt(time.month),
					_1: {
						ctor: '::',
						_0: '-',
						_1: {
							ctor: '::',
							_0: _jweir$elm_iso8601$ISO8601$fmt(time.day),
							_1: {
								ctor: '::',
								_0: 'T',
								_1: {
									ctor: '::',
									_0: _jweir$elm_iso8601$ISO8601$fmt(time.hour),
									_1: {
										ctor: '::',
										_0: ':',
										_1: {
											ctor: '::',
											_0: _jweir$elm_iso8601$ISO8601$fmt(time.minute),
											_1: {
												ctor: '::',
												_0: ':',
												_1: {
													ctor: '::',
													_0: _jweir$elm_iso8601$ISO8601$fmt(time.second),
													_1: {
														ctor: '::',
														_0: _jweir$elm_iso8601$ISO8601$fmtMs(time.millisecond),
														_1: {
															ctor: '::',
															_0: _jweir$elm_iso8601$ISO8601$fmtOffset(time.offset),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _jweir$elm_iso8601$ISO8601$defaultTime = {
	year: 0,
	month: 1,
	day: 1,
	hour: 0,
	minute: 0,
	second: 0,
	millisecond: 0,
	offset: {ctor: '_Tuple2', _0: 0, _1: 0}
};
var _jweir$elm_iso8601$ISO8601$ims = 1;
var _jweir$elm_iso8601$ISO8601$isec = _jweir$elm_iso8601$ISO8601$ims * 1000;
var _jweir$elm_iso8601$ISO8601$imin = _jweir$elm_iso8601$ISO8601$isec * 60;
var _jweir$elm_iso8601$ISO8601$ihour = _jweir$elm_iso8601$ISO8601$imin * 60;
var _jweir$elm_iso8601$ISO8601$iday = _jweir$elm_iso8601$ISO8601$ihour * 24;
var _jweir$elm_iso8601$ISO8601$offsetToTime = function (time) {
	var _p8 = time.offset;
	var m = _p8._0;
	var s = _p8._1;
	return (_jweir$elm_iso8601$ISO8601$ihour * m) + (_jweir$elm_iso8601$ISO8601$imin * s);
};
var _jweir$elm_iso8601$ISO8601$toTime = function (time) {
	var _p9 = _elm_lang$core$Native_Utils.cmp(time.year, 1970) > -1;
	if (_p9 === false) {
		var totalDays = _elm_lang$core$List$sum(
			A2(
				_elm_lang$core$List$map,
				_jweir$elm_iso8601$ISO8601_Helpers$daysInMonth(time.year),
				A2(_elm_lang$core$List$range, 1, time.month)));
		var years = A2(
			_elm_lang$core$List$map,
			_jweir$elm_iso8601$ISO8601_Helpers$daysInYear,
			A2(_elm_lang$core$List$range, time.year + 1, 1970 - 1));
		var tots = {
			ctor: '::',
			_0: _jweir$elm_iso8601$ISO8601$iday * _elm_lang$core$List$sum(years),
			_1: {
				ctor: '::',
				_0: _jweir$elm_iso8601$ISO8601$iday * (_jweir$elm_iso8601$ISO8601_Helpers$daysInYear(time.year) - totalDays),
				_1: {
					ctor: '::',
					_0: _jweir$elm_iso8601$ISO8601$iday * (A2(_jweir$elm_iso8601$ISO8601_Helpers$daysInMonth, time.year, time.month) - time.day),
					_1: {
						ctor: '::',
						_0: (_jweir$elm_iso8601$ISO8601$iday - _jweir$elm_iso8601$ISO8601$ihour) - (_jweir$elm_iso8601$ISO8601$ihour * time.hour),
						_1: {
							ctor: '::',
							_0: (_jweir$elm_iso8601$ISO8601$ihour - _jweir$elm_iso8601$ISO8601$imin) - (_jweir$elm_iso8601$ISO8601$imin * time.minute),
							_1: {
								ctor: '::',
								_0: _jweir$elm_iso8601$ISO8601$imin - (_jweir$elm_iso8601$ISO8601$isec * time.second),
								_1: {
									ctor: '::',
									_0: _jweir$elm_iso8601$ISO8601$offsetToTime(time),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		};
		return 0 - (_elm_lang$core$List$sum(tots) - time.millisecond);
	} else {
		var months = A2(
			_elm_lang$core$List$map,
			_jweir$elm_iso8601$ISO8601_Helpers$daysInMonth(time.year),
			A2(_elm_lang$core$List$range, 1, time.month - 1));
		var years = A2(
			_elm_lang$core$List$map,
			_jweir$elm_iso8601$ISO8601_Helpers$daysInYear,
			A2(_elm_lang$core$List$range, 1970, time.year - 1));
		var tots = {
			ctor: '::',
			_0: _jweir$elm_iso8601$ISO8601$iday * _elm_lang$core$List$sum(years),
			_1: {
				ctor: '::',
				_0: _jweir$elm_iso8601$ISO8601$iday * _elm_lang$core$List$sum(months),
				_1: {
					ctor: '::',
					_0: _jweir$elm_iso8601$ISO8601$iday * (time.day - 1),
					_1: {
						ctor: '::',
						_0: _jweir$elm_iso8601$ISO8601$ihour * time.hour,
						_1: {
							ctor: '::',
							_0: _jweir$elm_iso8601$ISO8601$imin * time.minute,
							_1: {
								ctor: '::',
								_0: _jweir$elm_iso8601$ISO8601$isec * time.second,
								_1: {
									ctor: '::',
									_0: -1 * _jweir$elm_iso8601$ISO8601$offsetToTime(time),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		};
		return _elm_lang$core$List$sum(tots) + time.millisecond;
	}
};
var _jweir$elm_iso8601$ISO8601$fromTime = function (ms) {
	var v = (_elm_lang$core$Native_Utils.cmp(ms, 0) > -1) ? _jweir$elm_iso8601$ISO8601_Helpers$After : _jweir$elm_iso8601$ISO8601_Helpers$Before;
	var milliseconds = A2(_elm_lang$core$Basics_ops['%'], ms, _jweir$elm_iso8601$ISO8601$isec);
	var _p10 = v;
	if (_p10.ctor === 'After') {
		var hours = A2(_elm_lang$core$Basics_ops['%'], (ms / _jweir$elm_iso8601$ISO8601$ihour) | 0, 24);
		var minutes = A2(_elm_lang$core$Basics_ops['%'], (ms / _jweir$elm_iso8601$ISO8601$imin) | 0, 60);
		var seconds = A2(_elm_lang$core$Basics_ops['%'], (ms / _jweir$elm_iso8601$ISO8601$isec) | 0, 60);
		var days = (ms / _jweir$elm_iso8601$ISO8601$iday) | 0;
		var _p11 = A3(_jweir$elm_iso8601$ISO8601_Helpers$daysToYears, _jweir$elm_iso8601$ISO8601_Helpers$After, 1970, days);
		var years = _p11._0;
		var remainingDays = _p11._1;
		var _p12 = A3(_jweir$elm_iso8601$ISO8601_Helpers$daysToMonths, years, 1, remainingDays + 1);
		var month = _p12._0;
		var daysInMonth = _p12._1;
		return _elm_lang$core$Native_Utils.update(
			_jweir$elm_iso8601$ISO8601$defaultTime,
			{second: seconds, minute: minutes, hour: hours, day: daysInMonth, month: month, year: years, millisecond: milliseconds});
	} else {
		var totalDays = (ms / _jweir$elm_iso8601$ISO8601$iday) | 0;
		var rem = A2(_elm_lang$core$Basics_ops['%'], ms, _jweir$elm_iso8601$ISO8601$iday);
		var _p13 = _elm_lang$core$Native_Utils.eq(rem, 0) ? A3(_jweir$elm_iso8601$ISO8601_Helpers$daysToYears, _jweir$elm_iso8601$ISO8601_Helpers$Before, 1969, totalDays + 1) : A3(_jweir$elm_iso8601$ISO8601_Helpers$daysToYears, _jweir$elm_iso8601$ISO8601_Helpers$Before, 1969, totalDays);
		var years = _p13._0;
		var remainingDays = _p13._1;
		var _p14 = A3(_jweir$elm_iso8601$ISO8601_Helpers$daysToMonths, years, 1, remainingDays);
		var month = _p14._0;
		var daysInMonth = _p14._1;
		var days = (rem / _jweir$elm_iso8601$ISO8601$iday) | 0;
		var seconds = A2(_elm_lang$core$Basics_ops['%'], (rem / _jweir$elm_iso8601$ISO8601$isec) | 0, 60);
		var minutes = A2(_elm_lang$core$Basics_ops['%'], (rem / _jweir$elm_iso8601$ISO8601$imin) | 0, 60);
		var hours = A2(_elm_lang$core$Basics_ops['%'], (rem / _jweir$elm_iso8601$ISO8601$ihour) | 0, 24);
		return _elm_lang$core$Native_Utils.update(
			_jweir$elm_iso8601$ISO8601$defaultTime,
			{second: seconds, minute: minutes, hour: hours, day: daysInMonth, month: month, year: years, millisecond: milliseconds});
	}
};
var _jweir$elm_iso8601$ISO8601$Model = F8(
	function (a, b, c, d, e, f, g, h) {
		return {year: a, month: b, day: c, hour: d, minute: e, second: f, millisecond: g, offset: h};
	});
var _jweir$elm_iso8601$ISO8601$Sun = {ctor: 'Sun'};
var _jweir$elm_iso8601$ISO8601$Sat = {ctor: 'Sat'};
var _jweir$elm_iso8601$ISO8601$Fri = {ctor: 'Fri'};
var _jweir$elm_iso8601$ISO8601$Thu = {ctor: 'Thu'};
var _jweir$elm_iso8601$ISO8601$Wed = {ctor: 'Wed'};
var _jweir$elm_iso8601$ISO8601$Tue = {ctor: 'Tue'};
var _jweir$elm_iso8601$ISO8601$Mon = {ctor: 'Mon'};
var _jweir$elm_iso8601$ISO8601$daysFromEpoch = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: _jweir$elm_iso8601$ISO8601$Thu,
		_1: {
			ctor: '::',
			_0: _jweir$elm_iso8601$ISO8601$Fri,
			_1: {
				ctor: '::',
				_0: _jweir$elm_iso8601$ISO8601$Sat,
				_1: {
					ctor: '::',
					_0: _jweir$elm_iso8601$ISO8601$Sun,
					_1: {
						ctor: '::',
						_0: _jweir$elm_iso8601$ISO8601$Mon,
						_1: {
							ctor: '::',
							_0: _jweir$elm_iso8601$ISO8601$Tue,
							_1: {
								ctor: '::',
								_0: _jweir$elm_iso8601$ISO8601$Wed,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}
	});
var _jweir$elm_iso8601$ISO8601$weekday = function (time) {
	var t = _elm_lang$core$Native_Utils.update(
		_jweir$elm_iso8601$ISO8601$defaultTime,
		{year: time.year, month: time.month, day: time.day});
	var t_ = _jweir$elm_iso8601$ISO8601$toTime(t);
	var days = (t_ / _jweir$elm_iso8601$ISO8601$iday) | 0;
	var day = A2(
		_elm_lang$core$Array$get,
		A2(_elm_lang$core$Basics_ops['%'], days, 7),
		_jweir$elm_iso8601$ISO8601$daysFromEpoch);
	var _p15 = day;
	if (_p15.ctor === 'Just') {
		return _p15._0;
	} else {
		return _jweir$elm_iso8601$ISO8601$Sun;
	}
};

var _krisajenkins$remotedata$RemoteData$isNotAsked = function (data) {
	var _p0 = data;
	if (_p0.ctor === 'NotAsked') {
		return true;
	} else {
		return false;
	}
};
var _krisajenkins$remotedata$RemoteData$isLoading = function (data) {
	var _p1 = data;
	if (_p1.ctor === 'Loading') {
		return true;
	} else {
		return false;
	}
};
var _krisajenkins$remotedata$RemoteData$isFailure = function (data) {
	var _p2 = data;
	if (_p2.ctor === 'Failure') {
		return true;
	} else {
		return false;
	}
};
var _krisajenkins$remotedata$RemoteData$isSuccess = function (data) {
	var _p3 = data;
	if (_p3.ctor === 'Success') {
		return true;
	} else {
		return false;
	}
};
var _krisajenkins$remotedata$RemoteData$withDefault = F2(
	function ($default, data) {
		var _p4 = data;
		if (_p4.ctor === 'Success') {
			return _p4._0;
		} else {
			return $default;
		}
	});
var _krisajenkins$remotedata$RemoteData$Success = function (a) {
	return {ctor: 'Success', _0: a};
};
var _krisajenkins$remotedata$RemoteData$succeed = _krisajenkins$remotedata$RemoteData$Success;
var _krisajenkins$remotedata$RemoteData$prism = {
	reverseGet: _krisajenkins$remotedata$RemoteData$Success,
	getOption: function (data) {
		var _p5 = data;
		if (_p5.ctor === 'Success') {
			return _elm_lang$core$Maybe$Just(_p5._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	}
};
var _krisajenkins$remotedata$RemoteData$Failure = function (a) {
	return {ctor: 'Failure', _0: a};
};
var _krisajenkins$remotedata$RemoteData$fromMaybe = F2(
	function (error, maybe) {
		var _p6 = maybe;
		if (_p6.ctor === 'Nothing') {
			return _krisajenkins$remotedata$RemoteData$Failure(error);
		} else {
			return _krisajenkins$remotedata$RemoteData$Success(_p6._0);
		}
	});
var _krisajenkins$remotedata$RemoteData$fromResult = function (result) {
	var _p7 = result;
	if (_p7.ctor === 'Err') {
		return _krisajenkins$remotedata$RemoteData$Failure(_p7._0);
	} else {
		return _krisajenkins$remotedata$RemoteData$Success(_p7._0);
	}
};
var _krisajenkins$remotedata$RemoteData$asCmd = _elm_lang$core$Task$attempt(_krisajenkins$remotedata$RemoteData$fromResult);
var _krisajenkins$remotedata$RemoteData$sendRequest = _elm_lang$http$Http$send(_krisajenkins$remotedata$RemoteData$fromResult);
var _krisajenkins$remotedata$RemoteData$fromTask = function (_p8) {
	return A2(
		_elm_lang$core$Task$onError,
		function (_p9) {
			return _elm_lang$core$Task$succeed(
				_krisajenkins$remotedata$RemoteData$Failure(_p9));
		},
		A2(_elm_lang$core$Task$map, _krisajenkins$remotedata$RemoteData$Success, _p8));
};
var _krisajenkins$remotedata$RemoteData$Loading = {ctor: 'Loading'};
var _krisajenkins$remotedata$RemoteData$NotAsked = {ctor: 'NotAsked'};
var _krisajenkins$remotedata$RemoteData$map = F2(
	function (f, data) {
		var _p10 = data;
		switch (_p10.ctor) {
			case 'Success':
				return _krisajenkins$remotedata$RemoteData$Success(
					f(_p10._0));
			case 'Loading':
				return _krisajenkins$remotedata$RemoteData$Loading;
			case 'NotAsked':
				return _krisajenkins$remotedata$RemoteData$NotAsked;
			default:
				return _krisajenkins$remotedata$RemoteData$Failure(_p10._0);
		}
	});
var _krisajenkins$remotedata$RemoteData$toMaybe = function (_p11) {
	return A2(
		_krisajenkins$remotedata$RemoteData$withDefault,
		_elm_lang$core$Maybe$Nothing,
		A2(_krisajenkins$remotedata$RemoteData$map, _elm_lang$core$Maybe$Just, _p11));
};
var _krisajenkins$remotedata$RemoteData$mapError = F2(
	function (f, data) {
		var _p12 = data;
		switch (_p12.ctor) {
			case 'Success':
				return _krisajenkins$remotedata$RemoteData$Success(_p12._0);
			case 'Failure':
				return _krisajenkins$remotedata$RemoteData$Failure(
					f(_p12._0));
			case 'Loading':
				return _krisajenkins$remotedata$RemoteData$Loading;
			default:
				return _krisajenkins$remotedata$RemoteData$NotAsked;
		}
	});
var _krisajenkins$remotedata$RemoteData$mapBoth = F2(
	function (successFn, errorFn) {
		return function (_p13) {
			return A2(
				_krisajenkins$remotedata$RemoteData$mapError,
				errorFn,
				A2(_krisajenkins$remotedata$RemoteData$map, successFn, _p13));
		};
	});
var _krisajenkins$remotedata$RemoteData$andThen = F2(
	function (f, data) {
		var _p14 = data;
		switch (_p14.ctor) {
			case 'Success':
				return f(_p14._0);
			case 'Failure':
				return _krisajenkins$remotedata$RemoteData$Failure(_p14._0);
			case 'NotAsked':
				return _krisajenkins$remotedata$RemoteData$NotAsked;
			default:
				return _krisajenkins$remotedata$RemoteData$Loading;
		}
	});
var _krisajenkins$remotedata$RemoteData$andMap = F2(
	function (wrappedValue, wrappedFunction) {
		var _p15 = {ctor: '_Tuple2', _0: wrappedFunction, _1: wrappedValue};
		_v11_5:
		do {
			_v11_4:
			do {
				_v11_3:
				do {
					_v11_2:
					do {
						switch (_p15._0.ctor) {
							case 'Success':
								switch (_p15._1.ctor) {
									case 'Success':
										return _krisajenkins$remotedata$RemoteData$Success(
											_p15._0._0(_p15._1._0));
									case 'Failure':
										break _v11_2;
									case 'Loading':
										break _v11_4;
									default:
										return _krisajenkins$remotedata$RemoteData$NotAsked;
								}
							case 'Failure':
								return _krisajenkins$remotedata$RemoteData$Failure(_p15._0._0);
							case 'Loading':
								switch (_p15._1.ctor) {
									case 'Failure':
										break _v11_2;
									case 'Loading':
										break _v11_3;
									case 'NotAsked':
										break _v11_3;
									default:
										break _v11_3;
								}
							default:
								switch (_p15._1.ctor) {
									case 'Failure':
										break _v11_2;
									case 'Loading':
										break _v11_4;
									case 'NotAsked':
										break _v11_5;
									default:
										break _v11_5;
								}
						}
					} while(false);
					return _krisajenkins$remotedata$RemoteData$Failure(_p15._1._0);
				} while(false);
				return _krisajenkins$remotedata$RemoteData$Loading;
			} while(false);
			return _krisajenkins$remotedata$RemoteData$Loading;
		} while(false);
		return _krisajenkins$remotedata$RemoteData$NotAsked;
	});
var _krisajenkins$remotedata$RemoteData$map2 = F3(
	function (f, a, b) {
		return A2(
			_krisajenkins$remotedata$RemoteData$andMap,
			b,
			A2(_krisajenkins$remotedata$RemoteData$map, f, a));
	});
var _krisajenkins$remotedata$RemoteData$fromList = A2(
	_elm_lang$core$List$foldr,
	_krisajenkins$remotedata$RemoteData$map2(
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			})),
	_krisajenkins$remotedata$RemoteData$Success(
		{ctor: '[]'}));
var _krisajenkins$remotedata$RemoteData$map3 = F4(
	function (f, a, b, c) {
		return A2(
			_krisajenkins$remotedata$RemoteData$andMap,
			c,
			A2(
				_krisajenkins$remotedata$RemoteData$andMap,
				b,
				A2(_krisajenkins$remotedata$RemoteData$map, f, a)));
	});
var _krisajenkins$remotedata$RemoteData$append = F2(
	function (a, b) {
		return A2(
			_krisajenkins$remotedata$RemoteData$andMap,
			b,
			A2(
				_krisajenkins$remotedata$RemoteData$map,
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				a));
	});
var _krisajenkins$remotedata$RemoteData$update = F2(
	function (f, remoteData) {
		var _p16 = remoteData;
		switch (_p16.ctor) {
			case 'Success':
				var _p17 = f(_p16._0);
				var first = _p17._0;
				var second = _p17._1;
				return {
					ctor: '_Tuple2',
					_0: _krisajenkins$remotedata$RemoteData$Success(first),
					_1: second
				};
			case 'NotAsked':
				return {ctor: '_Tuple2', _0: _krisajenkins$remotedata$RemoteData$NotAsked, _1: _elm_lang$core$Platform_Cmd$none};
			case 'Loading':
				return {ctor: '_Tuple2', _0: _krisajenkins$remotedata$RemoteData$Loading, _1: _elm_lang$core$Platform_Cmd$none};
			default:
				return {
					ctor: '_Tuple2',
					_0: _krisajenkins$remotedata$RemoteData$Failure(_p16._0),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});

var _lukewestby$elm_http_builder$HttpBuilder$replace = F2(
	function (old, $new) {
		return function (_p0) {
			return A2(
				_elm_lang$core$String$join,
				$new,
				A2(_elm_lang$core$String$split, old, _p0));
		};
	});
var _lukewestby$elm_http_builder$HttpBuilder$queryEscape = function (_p1) {
	return A3(
		_lukewestby$elm_http_builder$HttpBuilder$replace,
		'%20',
		'+',
		_elm_lang$http$Http$encodeUri(_p1));
};
var _lukewestby$elm_http_builder$HttpBuilder$queryPair = function (_p2) {
	var _p3 = _p2;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_lukewestby$elm_http_builder$HttpBuilder$queryEscape(_p3._0),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'=',
			_lukewestby$elm_http_builder$HttpBuilder$queryEscape(_p3._1)));
};
var _lukewestby$elm_http_builder$HttpBuilder$joinUrlEncoded = function (args) {
	return A2(
		_elm_lang$core$String$join,
		'&',
		A2(_elm_lang$core$List$map, _lukewestby$elm_http_builder$HttpBuilder$queryPair, args));
};
var _lukewestby$elm_http_builder$HttpBuilder$toRequest = function (builder) {
	var encodedParams = _lukewestby$elm_http_builder$HttpBuilder$joinUrlEncoded(builder.queryParams);
	var fullUrl = _elm_lang$core$String$isEmpty(encodedParams) ? builder.url : A2(
		_elm_lang$core$Basics_ops['++'],
		builder.url,
		A2(_elm_lang$core$Basics_ops['++'], '?', encodedParams));
	return _elm_lang$http$Http$request(
		{method: builder.method, url: fullUrl, headers: builder.headers, body: builder.body, expect: builder.expect, timeout: builder.timeout, withCredentials: builder.withCredentials});
};
var _lukewestby$elm_http_builder$HttpBuilder$toTaskPlain = function (builder) {
	return _elm_lang$http$Http$toTask(
		_lukewestby$elm_http_builder$HttpBuilder$toRequest(builder));
};
var _lukewestby$elm_http_builder$HttpBuilder$withCacheBuster = F2(
	function (paramName, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				cacheBuster: _elm_lang$core$Maybe$Just(paramName)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withQueryParams = F2(
	function (queryParams, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				queryParams: A2(_elm_lang$core$Basics_ops['++'], builder.queryParams, queryParams)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$toTaskWithCacheBuster = F2(
	function (paramName, builder) {
		var request = function (timestamp) {
			return _lukewestby$elm_http_builder$HttpBuilder$toTaskPlain(
				A2(
					_lukewestby$elm_http_builder$HttpBuilder$withQueryParams,
					{
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: paramName,
							_1: _elm_lang$core$Basics$toString(timestamp)
						},
						_1: {ctor: '[]'}
					},
					builder));
		};
		return A2(_elm_lang$core$Task$andThen, request, _elm_lang$core$Time$now);
	});
var _lukewestby$elm_http_builder$HttpBuilder$toTask = function (builder) {
	var _p4 = builder.cacheBuster;
	if (_p4.ctor === 'Just') {
		return A2(_lukewestby$elm_http_builder$HttpBuilder$toTaskWithCacheBuster, _p4._0, builder);
	} else {
		return _lukewestby$elm_http_builder$HttpBuilder$toTaskPlain(builder);
	}
};
var _lukewestby$elm_http_builder$HttpBuilder$send = F2(
	function (tagger, builder) {
		return A2(
			_elm_lang$core$Task$attempt,
			tagger,
			_lukewestby$elm_http_builder$HttpBuilder$toTask(builder));
	});
var _lukewestby$elm_http_builder$HttpBuilder$withExpectString = function (builder) {
	return _elm_lang$core$Native_Utils.update(
		builder,
		{expect: _elm_lang$http$Http$expectString});
};
var _lukewestby$elm_http_builder$HttpBuilder$withExpectJson = F2(
	function (decoder, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				expect: _elm_lang$http$Http$expectJson(decoder)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withExpect = F2(
	function (expect, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{expect: expect});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withCredentials = function (builder) {
	return _elm_lang$core$Native_Utils.update(
		builder,
		{withCredentials: true});
};
var _lukewestby$elm_http_builder$HttpBuilder$withTimeout = F2(
	function (timeout, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				timeout: _elm_lang$core$Maybe$Just(timeout)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withBody = F2(
	function (body, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{body: body});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withStringBody = F2(
	function (contentType, value) {
		return _lukewestby$elm_http_builder$HttpBuilder$withBody(
			A2(_elm_lang$http$Http$stringBody, contentType, value));
	});
var _lukewestby$elm_http_builder$HttpBuilder$withUrlEncodedBody = function (_p5) {
	return A2(
		_lukewestby$elm_http_builder$HttpBuilder$withStringBody,
		'application/x-www-form-urlencoded',
		_lukewestby$elm_http_builder$HttpBuilder$joinUrlEncoded(_p5));
};
var _lukewestby$elm_http_builder$HttpBuilder$withJsonBody = function (value) {
	return _lukewestby$elm_http_builder$HttpBuilder$withBody(
		_elm_lang$http$Http$jsonBody(value));
};
var _lukewestby$elm_http_builder$HttpBuilder$withMultipartStringBody = function (partPairs) {
	return _lukewestby$elm_http_builder$HttpBuilder$withBody(
		_elm_lang$http$Http$multipartBody(
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Basics$uncurry(_elm_lang$http$Http$stringPart),
				partPairs)));
};
var _lukewestby$elm_http_builder$HttpBuilder$withBearerToken = F2(
	function (value, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				headers: {
					ctor: '::',
					_0: A2(
						_elm_lang$http$Http$header,
						'Authorization',
						A2(_elm_lang$core$Basics_ops['++'], 'Bearer ', value)),
					_1: builder.headers
				}
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withHeaders = F2(
	function (headerPairs, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				headers: A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$List$map,
						_elm_lang$core$Basics$uncurry(_elm_lang$http$Http$header),
						headerPairs),
					builder.headers)
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$withHeader = F3(
	function (key, value, builder) {
		return _elm_lang$core$Native_Utils.update(
			builder,
			{
				headers: {
					ctor: '::',
					_0: A2(_elm_lang$http$Http$header, key, value),
					_1: builder.headers
				}
			});
	});
var _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl = F2(
	function (method, url) {
		return {
			method: method,
			url: url,
			headers: {ctor: '[]'},
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectStringResponse(
				function (_p6) {
					return _elm_lang$core$Result$Ok(
						{ctor: '_Tuple0'});
				}),
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false,
			queryParams: {ctor: '[]'},
			cacheBuster: _elm_lang$core$Maybe$Nothing
		};
	});
var _lukewestby$elm_http_builder$HttpBuilder$get = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('GET');
var _lukewestby$elm_http_builder$HttpBuilder$post = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('POST');
var _lukewestby$elm_http_builder$HttpBuilder$put = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('PUT');
var _lukewestby$elm_http_builder$HttpBuilder$patch = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('PATCH');
var _lukewestby$elm_http_builder$HttpBuilder$delete = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('DELETE');
var _lukewestby$elm_http_builder$HttpBuilder$options = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('OPTIONS');
var _lukewestby$elm_http_builder$HttpBuilder$trace = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('TRACE');
var _lukewestby$elm_http_builder$HttpBuilder$head = _lukewestby$elm_http_builder$HttpBuilder$requestWithMethodAndUrl('HEAD');
var _lukewestby$elm_http_builder$HttpBuilder$RequestBuilder = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g, queryParams: h, cacheBuster: i};
	});

var _rtfeldman$elm_validate$Validate$validEmail = _elm_lang$core$Regex$caseInsensitive(
	_elm_lang$core$Regex$regex('^[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'));
var _rtfeldman$elm_validate$Validate$isInt = function (str) {
	var _p0 = _elm_lang$core$String$toInt(str);
	if (_p0.ctor === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var _rtfeldman$elm_validate$Validate$isFloat = function (str) {
	var _p1 = _elm_lang$core$String$toFloat(str);
	if (_p1.ctor === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var _rtfeldman$elm_validate$Validate$isValidEmail = function (email) {
	return A2(_elm_lang$core$Regex$contains, _rtfeldman$elm_validate$Validate$validEmail, email);
};
var _rtfeldman$elm_validate$Validate$isWhitespaceChar = function ($char) {
	return _elm_lang$core$Native_Utils.eq(
		$char,
		_elm_lang$core$Native_Utils.chr(' ')) || (_elm_lang$core$Native_Utils.eq(
		$char,
		_elm_lang$core$Native_Utils.chr('\n')) || (_elm_lang$core$Native_Utils.eq(
		$char,
		_elm_lang$core$Native_Utils.chr('\t')) || _elm_lang$core$Native_Utils.eq(
		$char,
		_elm_lang$core$Native_Utils.chr('\r'))));
};
var _rtfeldman$elm_validate$Validate$isBlank = function (str) {
	isBlank:
	while (true) {
		var _p2 = _elm_lang$core$String$uncons(str);
		if (_p2.ctor === 'Just') {
			if (_rtfeldman$elm_validate$Validate$isWhitespaceChar(_p2._0._0)) {
				var _v3 = _p2._0._1;
				str = _v3;
				continue isBlank;
			} else {
				return false;
			}
		} else {
			return true;
		}
	}
};
var _rtfeldman$elm_validate$Validate$any = F2(
	function (validators, subject) {
		any:
		while (true) {
			var _p3 = validators;
			if (_p3.ctor === '[]') {
				return true;
			} else {
				var _p4 = _p3._0._0(subject);
				if (_p4.ctor === '[]') {
					var _v6 = _p3._1,
						_v7 = subject;
					validators = _v6;
					subject = _v7;
					continue any;
				} else {
					return false;
				}
			}
		}
	});
var _rtfeldman$elm_validate$Validate$firstErrorHelp = F2(
	function (validators, subject) {
		firstErrorHelp:
		while (true) {
			var _p5 = validators;
			if (_p5.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				var _p6 = _p5._0._0(subject);
				if (_p6.ctor === '[]') {
					var _v10 = _p5._1,
						_v11 = subject;
					validators = _v10;
					subject = _v11;
					continue firstErrorHelp;
				} else {
					return _p6;
				}
			}
		}
	});
var _rtfeldman$elm_validate$Validate$validate = F2(
	function (_p7, subject) {
		var _p8 = _p7;
		return _p8._0(subject);
	});
var _rtfeldman$elm_validate$Validate$Validator = function (a) {
	return {ctor: 'Validator', _0: a};
};
var _rtfeldman$elm_validate$Validate$ifNotInt = F2(
	function (subjectToString, errorFromString) {
		var getErrors = function (subject) {
			var str = subjectToString(subject);
			return _rtfeldman$elm_validate$Validate$isInt(str) ? {ctor: '[]'} : {
				ctor: '::',
				_0: errorFromString(str),
				_1: {ctor: '[]'}
			};
		};
		return _rtfeldman$elm_validate$Validate$Validator(getErrors);
	});
var _rtfeldman$elm_validate$Validate$ifInvalidEmail = F2(
	function (subjectToEmail, errorFromEmail) {
		var getErrors = function (subject) {
			var email = subjectToEmail(subject);
			return _rtfeldman$elm_validate$Validate$isValidEmail(email) ? {ctor: '[]'} : {
				ctor: '::',
				_0: errorFromEmail(email),
				_1: {ctor: '[]'}
			};
		};
		return _rtfeldman$elm_validate$Validate$Validator(getErrors);
	});
var _rtfeldman$elm_validate$Validate$fromErrors = function (toErrors) {
	return _rtfeldman$elm_validate$Validate$Validator(toErrors);
};
var _rtfeldman$elm_validate$Validate$ifTrue = F2(
	function (test, error) {
		var getErrors = function (subject) {
			return test(subject) ? {
				ctor: '::',
				_0: error,
				_1: {ctor: '[]'}
			} : {ctor: '[]'};
		};
		return _rtfeldman$elm_validate$Validate$Validator(getErrors);
	});
var _rtfeldman$elm_validate$Validate$ifBlank = F2(
	function (subjectToString, error) {
		return A2(
			_rtfeldman$elm_validate$Validate$ifTrue,
			function (subject) {
				return _rtfeldman$elm_validate$Validate$isBlank(
					subjectToString(subject));
			},
			error);
	});
var _rtfeldman$elm_validate$Validate$ifEmptyList = F2(
	function (subjectToList, error) {
		return A2(
			_rtfeldman$elm_validate$Validate$ifTrue,
			function (subject) {
				return _elm_lang$core$List$isEmpty(
					subjectToList(subject));
			},
			error);
	});
var _rtfeldman$elm_validate$Validate$ifEmptyDict = F2(
	function (subjectToDict, error) {
		return A2(
			_rtfeldman$elm_validate$Validate$ifTrue,
			function (subject) {
				return _elm_lang$core$Dict$isEmpty(
					subjectToDict(subject));
			},
			error);
	});
var _rtfeldman$elm_validate$Validate$ifEmptySet = F2(
	function (subjectToSet, error) {
		return A2(
			_rtfeldman$elm_validate$Validate$ifTrue,
			function (subject) {
				return _elm_lang$core$Set$isEmpty(
					subjectToSet(subject));
			},
			error);
	});
var _rtfeldman$elm_validate$Validate$ifNothing = F2(
	function (subjectToMaybe, error) {
		return A2(
			_rtfeldman$elm_validate$Validate$ifTrue,
			function (subject) {
				return _elm_lang$core$Native_Utils.eq(
					subjectToMaybe(subject),
					_elm_lang$core$Maybe$Nothing);
			},
			error);
	});
var _rtfeldman$elm_validate$Validate$ifNotFloat = F2(
	function (subjectToString, error) {
		return A2(
			_rtfeldman$elm_validate$Validate$ifTrue,
			function (subject) {
				return _rtfeldman$elm_validate$Validate$isFloat(
					subjectToString(subject));
			},
			error);
	});
var _rtfeldman$elm_validate$Validate$ifFalse = F2(
	function (test, error) {
		var getErrors = function (subject) {
			return test(subject) ? {ctor: '[]'} : {
				ctor: '::',
				_0: error,
				_1: {ctor: '[]'}
			};
		};
		return _rtfeldman$elm_validate$Validate$Validator(getErrors);
	});
var _rtfeldman$elm_validate$Validate$all = function (validators) {
	var newGetErrors = function (subject) {
		var accumulateErrors = F2(
			function (_p9, totalErrors) {
				var _p10 = _p9;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					totalErrors,
					_p10._0(subject));
			});
		return A3(
			_elm_lang$core$List$foldl,
			accumulateErrors,
			{ctor: '[]'},
			validators);
	};
	return _rtfeldman$elm_validate$Validate$Validator(newGetErrors);
};
var _rtfeldman$elm_validate$Validate$firstError = function (validators) {
	var getErrors = function (subject) {
		return A2(_rtfeldman$elm_validate$Validate$firstErrorHelp, validators, subject);
	};
	return _rtfeldman$elm_validate$Validate$Validator(getErrors);
};

var _tiziano88$elm_protobuf$Protobuf$floatValueEncoder = _elm_lang$core$Json_Encode$float;
var _tiziano88$elm_protobuf$Protobuf$floatValueDecoder = _elm_lang$core$Json_Decode$float;
var _tiziano88$elm_protobuf$Protobuf$boolValueEncoder = _elm_lang$core$Json_Encode$bool;
var _tiziano88$elm_protobuf$Protobuf$boolValueDecoder = _elm_lang$core$Json_Decode$bool;
var _tiziano88$elm_protobuf$Protobuf$stringValueEncoder = _elm_lang$core$Json_Encode$string;
var _tiziano88$elm_protobuf$Protobuf$stringValueDecoder = _elm_lang$core$Json_Decode$string;
var _tiziano88$elm_protobuf$Protobuf$intValueEncoder = _elm_lang$core$Json_Encode$int;
var _tiziano88$elm_protobuf$Protobuf$numericStringEncoder = function (_p0) {
	return _elm_lang$core$Json_Encode$string(
		_elm_lang$core$Basics$toString(_p0));
};
var _tiziano88$elm_protobuf$Protobuf$fromResult = function (result) {
	var _p1 = result;
	if (_p1.ctor === 'Ok') {
		return _elm_lang$core$Json_Decode$succeed(_p1._0);
	} else {
		return _elm_lang$core$Json_Decode$fail(_p1._0);
	}
};
var _tiziano88$elm_protobuf$Protobuf$intDecoder = _elm_lang$core$Json_Decode$oneOf(
	{
		ctor: '::',
		_0: _elm_lang$core$Json_Decode$int,
		_1: {
			ctor: '::',
			_0: A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p2) {
					return _tiziano88$elm_protobuf$Protobuf$fromResult(
						_elm_lang$core$String$toInt(_p2));
				},
				_elm_lang$core$Json_Decode$string),
			_1: {ctor: '[]'}
		}
	});
var _tiziano88$elm_protobuf$Protobuf$intValueDecoder = _tiziano88$elm_protobuf$Protobuf$intDecoder;
var _tiziano88$elm_protobuf$Protobuf$timestampEncoder = function (v) {
	return _elm_lang$core$Json_Encode$string(
		_jweir$elm_iso8601$ISO8601$toString(
			_jweir$elm_iso8601$ISO8601$fromTime(
				_elm_lang$core$Basics$round(
					_elm_lang$core$Time$inMilliseconds(
						_elm_lang$core$Date$toTime(v))))));
};
var _tiziano88$elm_protobuf$Protobuf$timestampDecoder = A2(
	_elm_lang$core$Json_Decode$andThen,
	function (v) {
		var _p3 = v;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Json_Decode$succeed(
				_elm_lang$core$Date$fromTime(
					_elm_lang$core$Time$millisecond * _elm_lang$core$Basics$toFloat(
						_jweir$elm_iso8601$ISO8601$toTime(_p3._0))));
		} else {
			return _elm_lang$core$Json_Decode$fail(_p3._0);
		}
	},
	A2(_elm_lang$core$Json_Decode$map, _jweir$elm_iso8601$ISO8601$fromString, _elm_lang$core$Json_Decode$string));
var _tiziano88$elm_protobuf$Protobuf$bytesFieldEncoder = function (v) {
	return _elm_lang$core$Json_Encode$list(
		{ctor: '[]'});
};
var _tiziano88$elm_protobuf$Protobuf$bytesValueEncoder = _tiziano88$elm_protobuf$Protobuf$bytesFieldEncoder;
var _tiziano88$elm_protobuf$Protobuf$bytesFieldDecoder = _elm_lang$core$Json_Decode$succeed(
	{ctor: '[]'});
var _tiziano88$elm_protobuf$Protobuf$bytesValueDecoder = _tiziano88$elm_protobuf$Protobuf$bytesFieldDecoder;
var _tiziano88$elm_protobuf$Protobuf$repeatedFieldEncoder = F3(
	function (name, encoder, v) {
		var _p4 = v;
		if (_p4.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '_Tuple2',
					_0: name,
					_1: _elm_lang$core$Json_Encode$list(
						A2(_elm_lang$core$List$map, encoder, v))
				});
		}
	});
var _tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder = F4(
	function (name, encoder, $default, v) {
		return _elm_lang$core$Native_Utils.eq(v, $default) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			{
				ctor: '_Tuple2',
				_0: name,
				_1: encoder(v)
			});
	});
var _tiziano88$elm_protobuf$Protobuf$optionalEncoder = F3(
	function (name, encoder, v) {
		var _p5 = v;
		if (_p5.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '_Tuple2',
					_0: name,
					_1: encoder(_p5._0)
				});
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _tiziano88$elm_protobuf$Protobuf$withDefault = F2(
	function ($default, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: decoder,
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$succeed($default),
					_1: {ctor: '[]'}
				}
			});
	});
var _tiziano88$elm_protobuf$Protobuf$field = _elm_lang$core$Json_Decode$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _tiziano88$elm_protobuf$Protobuf$repeated = F3(
	function (name, decoder, d) {
		return A2(
			_tiziano88$elm_protobuf$Protobuf$field,
			A2(
				_tiziano88$elm_protobuf$Protobuf$withDefault,
				{ctor: '[]'},
				A2(
					_elm_lang$core$Json_Decode$field,
					name,
					_elm_lang$core$Json_Decode$list(decoder))),
			d);
	});
var _tiziano88$elm_protobuf$Protobuf$optional = F3(
	function (name, decoder, d) {
		return A2(
			_tiziano88$elm_protobuf$Protobuf$field,
			_elm_lang$core$Json_Decode$maybe(
				A2(_elm_lang$core$Json_Decode$field, name, decoder)),
			d);
	});
var _tiziano88$elm_protobuf$Protobuf$required = F4(
	function (name, decoder, $default, d) {
		return A2(
			_tiziano88$elm_protobuf$Protobuf$field,
			A2(
				_tiziano88$elm_protobuf$Protobuf$withDefault,
				$default,
				A2(_elm_lang$core$Json_Decode$field, name, decoder)),
			d);
	});
var _tiziano88$elm_protobuf$Protobuf$decode = _elm_lang$core$Json_Decode$succeed;

var _user$project$Internal_Ripple_Model$defaultGeometry = {
	isSurfaceDisabled: false,
	event: {type_: '', pageX: 0, pageY: 0},
	frame: {width: 0, height: 0, left: 0, top: 0}
};
var _user$project$Internal_Ripple_Model$defaultModel = {focus: false, active: false, animating: false, deactivation: false, geometry: _user$project$Internal_Ripple_Model$defaultGeometry, animation: 0};
var _user$project$Internal_Ripple_Model$Model = F6(
	function (a, b, c, d, e, f) {
		return {focus: a, active: b, animating: c, deactivation: d, geometry: e, animation: f};
	});
var _user$project$Internal_Ripple_Model$Geometry = F3(
	function (a, b, c) {
		return {isSurfaceDisabled: a, event: b, frame: c};
	});
var _user$project$Internal_Ripple_Model$AnimationEnd = F2(
	function (a, b) {
		return {ctor: 'AnimationEnd', _0: a, _1: b};
	});
var _user$project$Internal_Ripple_Model$Deactivate = function (a) {
	return {ctor: 'Deactivate', _0: a};
};
var _user$project$Internal_Ripple_Model$Activate = F3(
	function (a, b, c) {
		return {ctor: 'Activate', _0: a, _1: b, _2: c};
	});
var _user$project$Internal_Ripple_Model$Blur = {ctor: 'Blur'};
var _user$project$Internal_Ripple_Model$Focus = {ctor: 'Focus'};

var _user$project$Internal_Button_Model$defaultModel = {ripple: _user$project$Internal_Ripple_Model$defaultModel};
var _user$project$Internal_Button_Model$Model = function (a) {
	return {ripple: a};
};
var _user$project$Internal_Button_Model$Click = F2(
	function (a, b) {
		return {ctor: 'Click', _0: a, _1: b};
	});
var _user$project$Internal_Button_Model$RippleMsg = function (a) {
	return {ctor: 'RippleMsg', _0: a};
};


var _user$project$Internal_Checkbox_Model$defaultModel = {isFocused: false, lastKnownState: _elm_lang$core$Maybe$Nothing, animation: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_Checkbox_Model$Model = F3(
	function (a, b, c) {
		return {isFocused: a, lastKnownState: b, animation: c};
	});
var _user$project$Internal_Checkbox_Model$AnimationEnd = {ctor: 'AnimationEnd'};
var _user$project$Internal_Checkbox_Model$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};
var _user$project$Internal_Checkbox_Model$Init = F2(
	function (a, b) {
		return {ctor: 'Init', _0: a, _1: b};
	});
var _user$project$Internal_Checkbox_Model$NoOp = {ctor: 'NoOp'};
var _user$project$Internal_Checkbox_Model$Unchecked = {ctor: 'Unchecked'};
var _user$project$Internal_Checkbox_Model$Checked = {ctor: 'Checked'};
var _user$project$Internal_Checkbox_Model$IndeterminateUnchecked = {ctor: 'IndeterminateUnchecked'};
var _user$project$Internal_Checkbox_Model$IndeterminateChecked = {ctor: 'IndeterminateChecked'};
var _user$project$Internal_Checkbox_Model$CheckedIndeterminate = {ctor: 'CheckedIndeterminate'};
var _user$project$Internal_Checkbox_Model$CheckedUnchecked = {ctor: 'CheckedUnchecked'};
var _user$project$Internal_Checkbox_Model$UncheckedIndeterminate = {ctor: 'UncheckedIndeterminate'};
var _user$project$Internal_Checkbox_Model$UncheckedChecked = {ctor: 'UncheckedChecked'};

var _user$project$Internal_Chip_Model$defaultModel = {ripple: _user$project$Internal_Ripple_Model$defaultModel};
var _user$project$Internal_Chip_Model$Model = function (a) {
	return {ripple: a};
};
var _user$project$Internal_Chip_Model$Click = function (a) {
	return {ctor: 'Click', _0: a};
};
var _user$project$Internal_Chip_Model$RippleMsg = function (a) {
	return {ctor: 'RippleMsg', _0: a};
};

var _user$project$Internal_Dialog_Model$defaultModel = {animating: false, open: false};
var _user$project$Internal_Dialog_Model$Model = F2(
	function (a, b) {
		return {animating: a, open: b};
	});
var _user$project$Internal_Dialog_Model$AnimationEnd = {ctor: 'AnimationEnd'};
var _user$project$Internal_Dialog_Model$SetOpen = function (a) {
	return {ctor: 'SetOpen', _0: a};
};
var _user$project$Internal_Dialog_Model$SetState = function (a) {
	return {ctor: 'SetState', _0: a};
};
var _user$project$Internal_Dialog_Model$NoOp = {ctor: 'NoOp'};

var _user$project$Internal_Drawer_Model$defaultGeometry = {width: 0};
var _user$project$Internal_Drawer_Model$defaultModel = {open: false, state: _elm_lang$core$Maybe$Nothing, animating: false, persistent: false};
var _user$project$Internal_Drawer_Model$Model = F4(
	function (a, b, c, d) {
		return {open: a, state: b, animating: c, persistent: d};
	});
var _user$project$Internal_Drawer_Model$Geometry = function (a) {
	return {width: a};
};
var _user$project$Internal_Drawer_Model$SetOpen = function (a) {
	return {ctor: 'SetOpen', _0: a};
};
var _user$project$Internal_Drawer_Model$Tick = {ctor: 'Tick'};
var _user$project$Internal_Drawer_Model$NoOp = {ctor: 'NoOp'};

var _user$project$Internal_Fab_Model$defaultModel = {ripple: _user$project$Internal_Ripple_Model$defaultModel};
var _user$project$Internal_Fab_Model$Model = function (a) {
	return {ripple: a};
};
var _user$project$Internal_Fab_Model$NoOp = {ctor: 'NoOp'};
var _user$project$Internal_Fab_Model$RippleMsg = function (a) {
	return {ctor: 'RippleMsg', _0: a};
};

var _user$project$Internal_GridList_Model$defaultGeometry = {width: 0, tileWidth: 0};
var _user$project$Internal_GridList_Model$defaultModel = {configured: false, geometry: _elm_lang$core$Maybe$Nothing, resizing: false, lastResize: 0, requestAnimationFrame: true};
var _user$project$Internal_GridList_Model$Model = F5(
	function (a, b, c, d, e) {
		return {configured: a, geometry: b, resizing: c, lastResize: d, requestAnimationFrame: e};
	});
var _user$project$Internal_GridList_Model$Geometry = F2(
	function (a, b) {
		return {width: a, tileWidth: b};
	});
var _user$project$Internal_GridList_Model$Init = function (a) {
	return {ctor: 'Init', _0: a};
};

var _user$project$Internal_IconToggle_Model$defaultModel = {on: false, ripple: _user$project$Internal_Ripple_Model$defaultModel};
var _user$project$Internal_IconToggle_Model$Model = F2(
	function (a, b) {
		return {on: a, ripple: b};
	});
var _user$project$Internal_IconToggle_Model$RippleMsg = function (a) {
	return {ctor: 'RippleMsg', _0: a};
};

var _user$project$Internal_Menu_Model$defaultGeometry = {
	viewport: {width: 0, height: 0},
	viewportDistance: {top: 0, right: 0, left: 0, bottom: 0},
	anchor: {width: 0, height: 0},
	menu: {width: 0, height: 0}
};
var _user$project$Internal_Menu_Model$defaultMeta = {altKey: false, ctrlKey: false, metaKey: false, shiftKey: false};
var _user$project$Internal_Menu_Model$defaultModel = {index: _elm_lang$core$Maybe$Nothing, open: false, animating: false, geometry: _elm_lang$core$Maybe$Nothing, quickOpen: _elm_lang$core$Maybe$Nothing, focusedItemAtIndex: _elm_lang$core$Maybe$Nothing, keyDownWithinMenu: false};
var _user$project$Internal_Menu_Model$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {index: a, open: b, animating: c, geometry: d, quickOpen: e, focusedItemAtIndex: f, keyDownWithinMenu: g};
	});
var _user$project$Internal_Menu_Model$Meta = F4(
	function (a, b, c, d) {
		return {altKey: a, ctrlKey: b, metaKey: c, shiftKey: d};
	});
var _user$project$Internal_Menu_Model$Geometry = F4(
	function (a, b, c, d) {
		return {viewport: a, viewportDistance: b, anchor: c, menu: d};
	});
var _user$project$Internal_Menu_Model$Viewport = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _user$project$Internal_Menu_Model$ViewportDistance = F4(
	function (a, b, c, d) {
		return {top: a, right: b, left: c, bottom: d};
	});
var _user$project$Internal_Menu_Model$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};
var _user$project$Internal_Menu_Model$KeyUp = F3(
	function (a, b, c) {
		return {ctor: 'KeyUp', _0: a, _1: b, _2: c};
	});
var _user$project$Internal_Menu_Model$KeyDown = F4(
	function (a, b, c, d) {
		return {ctor: 'KeyDown', _0: a, _1: b, _2: c, _3: d};
	});
var _user$project$Internal_Menu_Model$DocumentClick = {ctor: 'DocumentClick'};
var _user$project$Internal_Menu_Model$CloseDelayed = {ctor: 'CloseDelayed'};
var _user$project$Internal_Menu_Model$Toggle = {ctor: 'Toggle'};
var _user$project$Internal_Menu_Model$Close = {ctor: 'Close'};
var _user$project$Internal_Menu_Model$Open = {ctor: 'Open'};
var _user$project$Internal_Menu_Model$AnimationEnd = {ctor: 'AnimationEnd'};
var _user$project$Internal_Menu_Model$Init = F2(
	function (a, b) {
		return {ctor: 'Init', _0: a, _1: b};
	});
var _user$project$Internal_Menu_Model$NoOp = {ctor: 'NoOp'};

var _user$project$Internal_RadioButton_Model$defaultModel = {ripple: _user$project$Internal_Ripple_Model$defaultModel, isFocused: false};
var _user$project$Internal_RadioButton_Model$Model = F2(
	function (a, b) {
		return {ripple: a, isFocused: b};
	});
var _user$project$Internal_RadioButton_Model$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};
var _user$project$Internal_RadioButton_Model$NoOp = {ctor: 'NoOp'};
var _user$project$Internal_RadioButton_Model$RippleMsg = function (a) {
	return {ctor: 'RippleMsg', _0: a};
};

var _user$project$Internal_Select_Model$defaultModel = {focused: false, isDirty: false, ripple: _user$project$Internal_Ripple_Model$defaultModel};
var _user$project$Internal_Select_Model$Model = F3(
	function (a, b, c) {
		return {focused: a, isDirty: b, ripple: c};
	});
var _user$project$Internal_Select_Model$RippleMsg = function (a) {
	return {ctor: 'RippleMsg', _0: a};
};
var _user$project$Internal_Select_Model$Change = function (a) {
	return {ctor: 'Change', _0: a};
};
var _user$project$Internal_Select_Model$Focus = {ctor: 'Focus'};
var _user$project$Internal_Select_Model$Blur = {ctor: 'Blur'};

var _user$project$Internal_Slider_Model$defaultGeometry = {
	rect: {left: 0, width: 0},
	discrete: false,
	min: 0,
	max: 100,
	step: _elm_lang$core$Maybe$Nothing
};
var _user$project$Internal_Slider_Model$defaultModel = {focus: false, active: false, geometry: _elm_lang$core$Maybe$Nothing, activeValue: _elm_lang$core$Maybe$Nothing, inTransit: false, preventFocus: false};
var _user$project$Internal_Slider_Model$Model = F6(
	function (a, b, c, d, e, f) {
		return {focus: a, active: b, geometry: c, activeValue: d, inTransit: e, preventFocus: f};
	});
var _user$project$Internal_Slider_Model$Geometry = F5(
	function (a, b, c, d, e) {
		return {rect: a, discrete: b, step: c, min: d, max: e};
	});
var _user$project$Internal_Slider_Model$Rect = F2(
	function (a, b) {
		return {left: a, width: b};
	});
var _user$project$Internal_Slider_Model$ActualUp = {ctor: 'ActualUp'};
var _user$project$Internal_Slider_Model$Up = {ctor: 'Up'};
var _user$project$Internal_Slider_Model$Drag = function (a) {
	return {ctor: 'Drag', _0: a};
};
var _user$project$Internal_Slider_Model$TransitionEnd = {ctor: 'TransitionEnd'};
var _user$project$Internal_Slider_Model$ThumbContainerPointer = F2(
	function (a, b) {
		return {ctor: 'ThumbContainerPointer', _0: a, _1: b};
	});
var _user$project$Internal_Slider_Model$Blur = {ctor: 'Blur'};
var _user$project$Internal_Slider_Model$Focus = {ctor: 'Focus'};
var _user$project$Internal_Slider_Model$KeyDown = {ctor: 'KeyDown'};
var _user$project$Internal_Slider_Model$InteractionStart = F2(
	function (a, b) {
		return {ctor: 'InteractionStart', _0: a, _1: b};
	});
var _user$project$Internal_Slider_Model$Resize = function (a) {
	return {ctor: 'Resize', _0: a};
};
var _user$project$Internal_Slider_Model$Init = function (a) {
	return {ctor: 'Init', _0: a};
};
var _user$project$Internal_Slider_Model$NoOp = {ctor: 'NoOp'};

var _user$project$Internal_Snackbar_Model$Model = F3(
	function (a, b, c) {
		return {queue: a, state: b, seq: c};
	});
var _user$project$Internal_Snackbar_Model$Contents = F8(
	function (a, b, c, d, e, f, g, h) {
		return {message: a, action: b, timeout: c, fade: d, multiline: e, actionOnBottom: f, dismissOnAction: g, onDismiss: h};
	});
var _user$project$Internal_Snackbar_Model$Fading = function (a) {
	return {ctor: 'Fading', _0: a};
};
var _user$project$Internal_Snackbar_Model$Active = function (a) {
	return {ctor: 'Active', _0: a};
};
var _user$project$Internal_Snackbar_Model$Inert = {ctor: 'Inert'};
var _user$project$Internal_Snackbar_Model$defaultModel = {
	queue: {ctor: '[]'},
	state: _user$project$Internal_Snackbar_Model$Inert,
	seq: -1
};
var _user$project$Internal_Snackbar_Model$Dismiss = F2(
	function (a, b) {
		return {ctor: 'Dismiss', _0: a, _1: b};
	});
var _user$project$Internal_Snackbar_Model$Move = F2(
	function (a, b) {
		return {ctor: 'Move', _0: a, _1: b};
	});
var _user$project$Internal_Snackbar_Model$Clicked = {ctor: 'Clicked'};
var _user$project$Internal_Snackbar_Model$Timeout = {ctor: 'Timeout'};

var _user$project$Internal_Switch_Model$defaultModel = {isFocused: false};
var _user$project$Internal_Switch_Model$Model = function (a) {
	return {isFocused: a};
};
var _user$project$Internal_Switch_Model$NoOp = {ctor: 'NoOp'};
var _user$project$Internal_Switch_Model$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};

var _user$project$Internal_Tabs_Model$defaultGeometry = {
	tabs: {ctor: '[]'},
	tabBar: {offsetWidth: 0},
	scrollFrame: {offsetWidth: 0}
};
var _user$project$Internal_Tabs_Model$defaultModel = {geometry: _elm_lang$core$Maybe$Nothing, index: 0, translateOffset: 0, scale: 0, ripples: _elm_lang$core$Dict$empty, indicatorShown: false, forwardIndicator: false, backIndicator: false, scrollLeftAmount: 0};
var _user$project$Internal_Tabs_Model$Model = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {geometry: a, index: b, translateOffset: c, scale: d, ripples: e, indicatorShown: f, forwardIndicator: g, backIndicator: h, scrollLeftAmount: i};
	});
var _user$project$Internal_Tabs_Model$Geometry = F3(
	function (a, b, c) {
		return {tabs: a, tabBar: b, scrollFrame: c};
	});
var _user$project$Internal_Tabs_Model$Focus = F2(
	function (a, b) {
		return {ctor: 'Focus', _0: a, _1: b};
	});
var _user$project$Internal_Tabs_Model$SetIndicatorShown = {ctor: 'SetIndicatorShown'};
var _user$project$Internal_Tabs_Model$Init = function (a) {
	return {ctor: 'Init', _0: a};
};
var _user$project$Internal_Tabs_Model$RippleMsg = F2(
	function (a, b) {
		return {ctor: 'RippleMsg', _0: a, _1: b};
	});
var _user$project$Internal_Tabs_Model$ScrollBack = function (a) {
	return {ctor: 'ScrollBack', _0: a};
};
var _user$project$Internal_Tabs_Model$ScrollForward = function (a) {
	return {ctor: 'ScrollForward', _0: a};
};
var _user$project$Internal_Tabs_Model$Select = F2(
	function (a, b) {
		return {ctor: 'Select', _0: a, _1: b};
	});
var _user$project$Internal_Tabs_Model$Dispatch = function (a) {
	return {ctor: 'Dispatch', _0: a};
};
var _user$project$Internal_Tabs_Model$NoOp = {ctor: 'NoOp'};

var _user$project$Internal_Textfield_Model$defaultGeometry = {width: 0, height: 0, labelWidth: 0};
var _user$project$Internal_Textfield_Model$defaultModel = {focused: false, isDirty: false, value: _elm_lang$core$Maybe$Nothing, ripple: _user$project$Internal_Ripple_Model$defaultModel, geometry: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_Textfield_Model$Model = F5(
	function (a, b, c, d, e) {
		return {focused: a, isDirty: b, value: c, ripple: d, geometry: e};
	});
var _user$project$Internal_Textfield_Model$Geometry = F3(
	function (a, b, c) {
		return {width: a, height: b, labelWidth: c};
	});
var _user$project$Internal_Textfield_Model$RippleMsg = function (a) {
	return {ctor: 'RippleMsg', _0: a};
};
var _user$project$Internal_Textfield_Model$NoOp = {ctor: 'NoOp'};
var _user$project$Internal_Textfield_Model$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _user$project$Internal_Textfield_Model$Focus = function (a) {
	return {ctor: 'Focus', _0: a};
};
var _user$project$Internal_Textfield_Model$Blur = {ctor: 'Blur'};

var _user$project$Internal_Toolbar_Model$defaultGeometry = {getRowHeight: 0, getFirstRowElementOffsetHeight: 0, getOffsetHeight: 0};
var _user$project$Internal_Toolbar_Model$defaultConfig = {fixed: false, fixedLastrow: false, fixedLastRowOnly: false, flexible: false, useFlexibleDefaultBehavior: false, waterfall: false, backgroundImage: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_Toolbar_Model$defaultCalculations = {toolbarRowHeight: 0, toolbarRatio: 0, flexibleExpansionRatio: 0, maxTranslateYRatio: 0, scrollThresholdRatio: 0, toolbarHeight: 0, flexibleExpansionHeight: 0, maxTranslateYDistance: 0, scrollThreshold: 0};
var _user$project$Internal_Toolbar_Model$defaultModel = {geometry: _elm_lang$core$Maybe$Nothing, scrollTop: 0, calculations: _elm_lang$core$Maybe$Nothing, config: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_Toolbar_Model$Model = F4(
	function (a, b, c, d) {
		return {geometry: a, scrollTop: b, calculations: c, config: d};
	});
var _user$project$Internal_Toolbar_Model$Calculations = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {toolbarRowHeight: a, toolbarRatio: b, flexibleExpansionRatio: c, maxTranslateYRatio: d, scrollThresholdRatio: e, toolbarHeight: f, flexibleExpansionHeight: g, maxTranslateYDistance: h, scrollThreshold: i};
	});
var _user$project$Internal_Toolbar_Model$Config = F7(
	function (a, b, c, d, e, f, g) {
		return {fixed: a, fixedLastrow: b, fixedLastRowOnly: c, flexible: d, useFlexibleDefaultBehavior: e, waterfall: f, backgroundImage: g};
	});
var _user$project$Internal_Toolbar_Model$Geometry = F3(
	function (a, b, c) {
		return {getRowHeight: a, getFirstRowElementOffsetHeight: b, getOffsetHeight: c};
	});
var _user$project$Internal_Toolbar_Model$Scroll = F2(
	function (a, b) {
		return {ctor: 'Scroll', _0: a, _1: b};
	});
var _user$project$Internal_Toolbar_Model$Resize = F2(
	function (a, b) {
		return {ctor: 'Resize', _0: a, _1: b};
	});
var _user$project$Internal_Toolbar_Model$Init = F2(
	function (a, b) {
		return {ctor: 'Init', _0: a, _1: b};
	});

var _user$project$Internal_TopAppBar_Model$defaultConfig = {dense: false, fixed: false, prominent: false, $short: false, collapsed: false};
var _user$project$Internal_TopAppBar_Model$defaultModel = {lastScrollPosition: _elm_lang$core$Maybe$Nothing, topAppBarHeight: _elm_lang$core$Maybe$Nothing, wasDocked: true, isDockedShowing: true, currentAppBarOffsetTop: 0, styleTop: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_TopAppBar_Model$Model = F6(
	function (a, b, c, d, e, f) {
		return {lastScrollPosition: a, topAppBarHeight: b, wasDocked: c, isDockedShowing: d, currentAppBarOffsetTop: e, styleTop: f};
	});
var _user$project$Internal_TopAppBar_Model$Config = F5(
	function (a, b, c, d, e) {
		return {dense: a, fixed: b, prominent: c, $short: d, collapsed: e};
	});
var _user$project$Internal_TopAppBar_Model$Scroll = function (a) {
	return {ctor: 'Scroll', _0: a};
};
var _user$project$Internal_TopAppBar_Model$Resize = function (a) {
	return {ctor: 'Resize', _0: a};
};
var _user$project$Internal_TopAppBar_Model$Init = function (a) {
	return {ctor: 'Init', _0: a};
};

var _user$project$Internal_Msg$TopAppBarMsg = F2(
	function (a, b) {
		return {ctor: 'TopAppBarMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$ToolbarMsg = F2(
	function (a, b) {
		return {ctor: 'ToolbarMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$TextfieldMsg = F2(
	function (a, b) {
		return {ctor: 'TextfieldMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$TabsMsg = F2(
	function (a, b) {
		return {ctor: 'TabsMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$SwitchMsg = F2(
	function (a, b) {
		return {ctor: 'SwitchMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$SnackbarMsg = F2(
	function (a, b) {
		return {ctor: 'SnackbarMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$SliderMsg = F2(
	function (a, b) {
		return {ctor: 'SliderMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$SelectMsg = F2(
	function (a, b) {
		return {ctor: 'SelectMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$RippleMsg = F2(
	function (a, b) {
		return {ctor: 'RippleMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$RadioButtonMsg = F2(
	function (a, b) {
		return {ctor: 'RadioButtonMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$MenuMsg = F2(
	function (a, b) {
		return {ctor: 'MenuMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$IconToggleMsg = F2(
	function (a, b) {
		return {ctor: 'IconToggleMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$GridListMsg = F2(
	function (a, b) {
		return {ctor: 'GridListMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$FabMsg = F2(
	function (a, b) {
		return {ctor: 'FabMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$DrawerMsg = F2(
	function (a, b) {
		return {ctor: 'DrawerMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$DialogMsg = F2(
	function (a, b) {
		return {ctor: 'DialogMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$ChipMsg = F2(
	function (a, b) {
		return {ctor: 'ChipMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$CheckboxMsg = F2(
	function (a, b) {
		return {ctor: 'CheckboxMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$ButtonMsg = F2(
	function (a, b) {
		return {ctor: 'ButtonMsg', _0: a, _1: b};
	});
var _user$project$Internal_Msg$Dispatch = function (a) {
	return {ctor: 'Dispatch', _0: a};
};

var _user$project$Internal_Dispatch_Internal$Config = function (a) {
	return {ctor: 'Config', _0: a};
};

var _user$project$Internal_Dispatch$split = F4(
	function (k0, same, differ, xs) {
		split:
		while (true) {
			var _p0 = xs;
			if (_p0.ctor === '[]') {
				return {ctor: '_Tuple2', _0: same, _1: differ};
			} else {
				var _p1 = _p0._1;
				if (_elm_lang$core$Native_Utils.eq(_p0._0._0, k0)) {
					var _v1 = k0,
						_v2 = {ctor: '::', _0: _p0._0._1, _1: same},
						_v3 = differ,
						_v4 = _p1;
					k0 = _v1;
					same = _v2;
					differ = _v3;
					xs = _v4;
					continue split;
				} else {
					var _v5 = k0,
						_v6 = same,
						_v7 = {ctor: '::', _0: _p0._0, _1: differ},
						_v8 = _p1;
					k0 = _v5;
					same = _v6;
					differ = _v7;
					xs = _v8;
					continue split;
				}
			}
		}
	});
var _user$project$Internal_Dispatch$group_ = F2(
	function (acc, items) {
		group_:
		while (true) {
			var _p2 = items;
			if (_p2.ctor === '[]') {
				return acc;
			} else {
				if (_p2._1.ctor === '[]') {
					return {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _p2._0._0,
							_1: {
								ctor: '::',
								_0: _p2._0._1,
								_1: {ctor: '[]'}
							}
						},
						_1: acc
					};
				} else {
					if ((_p2._1._0.ctor === '_Tuple2') && (_p2._1._1.ctor === '[]')) {
						var _p6 = _p2._1._0._1;
						var _p5 = _p2._0._1;
						var _p4 = _p2._1._0._0;
						var _p3 = _p2._0._0;
						return _elm_lang$core$Native_Utils.eq(_p3, _p4) ? {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p3,
								_1: {
									ctor: '::',
									_0: _p6,
									_1: {
										ctor: '::',
										_0: _p5,
										_1: {ctor: '[]'}
									}
								}
							},
							_1: acc
						} : {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p4,
								_1: {
									ctor: '::',
									_0: _p6,
									_1: {ctor: '[]'}
								}
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p3,
									_1: {
										ctor: '::',
										_0: _p5,
										_1: {ctor: '[]'}
									}
								},
								_1: acc
							}
						};
					} else {
						var _p8 = _p2._0._0;
						var _p7 = A4(
							_user$project$Internal_Dispatch$split,
							_p8,
							{
								ctor: '::',
								_0: _p2._0._1,
								_1: {ctor: '[]'}
							},
							{ctor: '[]'},
							_p2._1);
						var same = _p7._0;
						var different = _p7._1;
						var _v10 = {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _p8, _1: same},
							_1: acc
						},
							_v11 = different;
						acc = _v10;
						items = _v11;
						continue group_;
					}
				}
			}
		}
	});
var _user$project$Internal_Dispatch$group = _user$project$Internal_Dispatch$group_(
	{ctor: '[]'});
var _user$project$Internal_Dispatch$onSingle = function (_p9) {
	var _p10 = _p9;
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		_p10._0,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html_Events$defaultOptions, _p10._1._1),
		_p10._1._0);
};
var _user$project$Internal_Dispatch$pickOptions = function (decoders) {
	var pick = F2(
		function (_p11, pickedOptions) {
			var _p12 = _p11;
			return A2(
				_elm_lang$core$Maybe$withDefault,
				pickedOptions,
				A2(
					_elm_lang$core$Maybe$map,
					function (options) {
						return {preventDefault: pickedOptions.preventDefault || options.preventDefault, stopPropagation: pickedOptions.stopPropagation || options.stopPropagation};
					},
					_p12._1));
		});
	return A3(_elm_lang$core$List$foldl, pick, _elm_lang$html$Html_Events$defaultOptions, decoders);
};
var _user$project$Internal_Dispatch$flatten = function (decoders) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		function (value) {
			return A2(
				_elm_lang$core$List$filterMap,
				function (decoder) {
					return _elm_lang$core$Result$toMaybe(
						A2(_elm_lang$core$Json_Decode$decodeValue, decoder, value));
				},
				decoders);
		},
		_elm_lang$core$Json_Decode$value);
};
var _user$project$Internal_Dispatch$onWithOptions = F4(
	function (event, lift, options, decoders) {
		return A3(
			_elm_lang$html$Html_Events$onWithOptions,
			event,
			options,
			A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				_user$project$Internal_Dispatch$flatten(decoders)));
	});
var _user$project$Internal_Dispatch$on = F2(
	function (event, lift) {
		return A3(_user$project$Internal_Dispatch$onWithOptions, event, lift, _elm_lang$html$Html_Events$defaultOptions);
	});
var _user$project$Internal_Dispatch$onMany = F2(
	function (lift, decoders) {
		var _p13 = decoders;
		if ((_p13._1.ctor === '::') && (_p13._1._1.ctor === '[]')) {
			return _user$project$Internal_Dispatch$onSingle(
				{ctor: '_Tuple2', _0: _p13._0, _1: _p13._1._0});
		} else {
			var _p14 = _p13._1;
			return A3(
				_elm_lang$html$Html_Events$onWithOptions,
				_p13._0,
				_user$project$Internal_Dispatch$pickOptions(_p14),
				lift(
					_user$project$Internal_Dispatch$flatten(
						A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, _p14))));
		}
	});
var _user$project$Internal_Dispatch$map2nd = F2(
	function (f, _p15) {
		var _p16 = _p15;
		return {
			ctor: '_Tuple2',
			_0: _p16._0,
			_1: f(_p16._1)
		};
	});
var _user$project$Internal_Dispatch$update1 = F3(
	function (update, cmd, _p17) {
		var _p18 = _p17;
		return A2(
			_user$project$Internal_Dispatch$map2nd,
			A2(
				_elm_lang$core$Basics$flip,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				_p18._1),
			A2(update, cmd, _p18._0));
	});
var _user$project$Internal_Dispatch$update = F3(
	function (update, msg, model) {
		return A2(
			_user$project$Internal_Dispatch$map2nd,
			_elm_lang$core$Platform_Cmd$batch,
			A3(
				_elm_lang$core$List$foldl,
				_user$project$Internal_Dispatch$update1(update),
				{
					ctor: '_Tuple2',
					_0: model,
					_1: {ctor: '[]'}
				},
				msg));
	});
var _user$project$Internal_Dispatch$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$always(msg),
		_elm_lang$core$Task$succeed(msg));
};
var _user$project$Internal_Dispatch$forward = function (messages) {
	return _elm_lang$core$Platform_Cmd$batch(
		A2(_elm_lang$core$List$map, _user$project$Internal_Dispatch$cmd, messages));
};
var _user$project$Internal_Dispatch$toAttributes = function (_p19) {
	var _p20 = _p19;
	var _p22 = _p20._0;
	var _p21 = _p22.lift;
	if (_p21.ctor === 'Just') {
		return A2(
			_elm_lang$core$List$map,
			_user$project$Internal_Dispatch$onMany(_p21._0),
			_user$project$Internal_Dispatch$group(_p22.decoders));
	} else {
		return A2(_elm_lang$core$List$map, _user$project$Internal_Dispatch$onSingle, _p22.decoders);
	}
};
var _user$project$Internal_Dispatch$clear = function (_p23) {
	var _p24 = _p23;
	return _user$project$Internal_Dispatch_Internal$Config(
		_elm_lang$core$Native_Utils.update(
			_p24._0,
			{
				decoders: {ctor: '[]'}
			}));
};
var _user$project$Internal_Dispatch$add = F4(
	function (event, options, decoder, _p25) {
		var _p26 = _p25;
		var _p27 = _p26._0;
		return _user$project$Internal_Dispatch_Internal$Config(
			_elm_lang$core$Native_Utils.update(
				_p27,
				{
					decoders: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: event,
							_1: {ctor: '_Tuple2', _0: decoder, _1: options}
						},
						_1: _p27.decoders
					}
				}));
	});
var _user$project$Internal_Dispatch$getDecoder = function (_p28) {
	var _p29 = _p28;
	return _p29._0.lift;
};
var _user$project$Internal_Dispatch$setDecoder = F2(
	function (f, _p30) {
		var _p31 = _p30;
		return _user$project$Internal_Dispatch_Internal$Config(
			_elm_lang$core$Native_Utils.update(
				_p31._0,
				{
					lift: _elm_lang$core$Maybe$Just(f)
				}));
	});
var _user$project$Internal_Dispatch$setMsg = function (_p32) {
	return _user$project$Internal_Dispatch$setDecoder(
		_elm_lang$core$Json_Decode$map(_p32));
};
var _user$project$Internal_Dispatch$defaultConfig = _user$project$Internal_Dispatch_Internal$Config(
	{
		decoders: {ctor: '[]'},
		lift: _elm_lang$core$Maybe$Nothing
	});

var _user$project$Internal_Options$addAttributes = F2(
	function (summary, attrs) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			summary.attrs,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(summary.css),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$String$join, ' ', summary.classes)),
						_1: {ctor: '[]'}
					}
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					attrs,
					A2(
						_elm_lang$core$Basics_ops['++'],
						summary.internal,
						_user$project$Internal_Dispatch$toAttributes(summary.dispatch)))));
	});
var _user$project$Internal_Options$collect1_ = F2(
	function (options, acc) {
		var _p0 = options;
		switch (_p0.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p0._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p0._0, _1: acc.css}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p0._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						internal: {ctor: '::', _0: _p0._0, _1: acc.internal}
					});
			case 'Listener':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A4(_user$project$Internal_Dispatch$add, _p0._0, _p0._1, _p0._2, acc.dispatch)
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _user$project$Internal_Options$collect1_, acc, _p0._0);
			case 'Lift':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A2(_user$project$Internal_Dispatch$setDecoder, _p0._0, acc.dispatch)
					});
			case 'Set':
				return acc;
			default:
				return acc;
		}
	});
var _user$project$Internal_Options$collect1 = F2(
	function (option, acc) {
		var _p1 = option;
		switch (_p1.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p1._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p1._0, _1: acc.css}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p1._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						internal: {ctor: '::', _0: _p1._0, _1: acc.internal}
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _user$project$Internal_Options$collect1, acc, _p1._0);
			case 'Set':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						config: _p1._0(acc.config)
					});
			case 'Listener':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A4(_user$project$Internal_Dispatch$add, _p1._0, _p1._1, _p1._2, acc.dispatch)
					});
			case 'Lift':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A2(_user$project$Internal_Dispatch$setDecoder, _p1._0, acc.dispatch)
					});
			default:
				return acc;
		}
	});
var _user$project$Internal_Options$recollect = _elm_lang$core$List$foldl(_user$project$Internal_Options$collect1);
var _user$project$Internal_Options$apply = F4(
	function (summary, ctor, options, attrs) {
		return ctor(
			A2(
				_user$project$Internal_Options$addAttributes,
				A2(_user$project$Internal_Options$recollect, summary, options),
				attrs));
	});
var _user$project$Internal_Options$applyNativeControl = F3(
	function (summary, ctor, options) {
		return ctor(
			A2(
				_user$project$Internal_Options$addAttributes,
				A2(
					_user$project$Internal_Options$recollect,
					_elm_lang$core$Native_Utils.update(
						summary,
						{
							classes: {ctor: '[]'},
							css: {ctor: '[]'},
							attrs: {ctor: '[]'},
							internal: {ctor: '[]'},
							config: {ctor: '_Tuple0'},
							dispatch: _user$project$Internal_Dispatch$clear(summary.dispatch)
						}),
					A2(_elm_lang$core$Basics_ops['++'], summary.config.nativeControl, options)),
				{ctor: '[]'}));
	});
var _user$project$Internal_Options$Summary = F6(
	function (a, b, c, d, e, f) {
		return {classes: a, css: b, attrs: c, internal: d, dispatch: e, config: f};
	});
var _user$project$Internal_Options$collect = function (_p2) {
	return _user$project$Internal_Options$recollect(
		A6(
			_user$project$Internal_Options$Summary,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			_user$project$Internal_Dispatch$defaultConfig,
			_p2));
};
var _user$project$Internal_Options$collect_ = A2(
	_elm_lang$core$List$foldl,
	_user$project$Internal_Options$collect1_,
	A6(
		_user$project$Internal_Options$Summary,
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		_user$project$Internal_Dispatch$defaultConfig,
		{ctor: '_Tuple0'}));
var _user$project$Internal_Options$styled = F2(
	function (ctor, props) {
		return ctor(
			A2(
				_user$project$Internal_Options$addAttributes,
				_user$project$Internal_Options$collect_(props),
				{ctor: '[]'}));
	});
var _user$project$Internal_Options$None = {ctor: 'None'};
var _user$project$Internal_Options$nop = _user$project$Internal_Options$None;
var _user$project$Internal_Options$when = F2(
	function (guard, prop) {
		return guard ? prop : _user$project$Internal_Options$nop;
	});
var _user$project$Internal_Options$Lift = function (a) {
	return {ctor: 'Lift', _0: a};
};
var _user$project$Internal_Options$dispatch = function (lift) {
	return _user$project$Internal_Options$Lift(
		function (_p3) {
			return A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				A2(_elm_lang$core$Json_Decode$map, _user$project$Internal_Msg$Dispatch, _p3));
		});
};
var _user$project$Internal_Options$Listener = F3(
	function (a, b, c) {
		return {ctor: 'Listener', _0: a, _1: b, _2: c};
	});
var _user$project$Internal_Options$on1 = F3(
	function (event, lift, m) {
		return A3(
			_user$project$Internal_Options$Listener,
			event,
			_elm_lang$core$Maybe$Nothing,
			A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				_elm_lang$core$Json_Decode$succeed(m)));
	});
var _user$project$Internal_Options$on = function (event) {
	return A2(_user$project$Internal_Options$Listener, event, _elm_lang$core$Maybe$Nothing);
};
var _user$project$Internal_Options$onClick = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onDoubleClick = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onMouseDown = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onMouseUp = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onMouseEnter = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onMouseLeave = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onMouseOver = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onMouseOut = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onCheck = function (_p4) {
	return A2(
		_user$project$Internal_Options$on,
		'change',
		A3(_elm_lang$core$Basics$flip, _elm_lang$core$Json_Decode$map, _elm_lang$html$Html_Events$targetChecked, _p4));
};
var _user$project$Internal_Options$onBlur = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onFocus = function (msg) {
	return A2(
		_user$project$Internal_Options$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _user$project$Internal_Options$onInput = function (f) {
	return A2(
		_user$project$Internal_Options$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, f, _elm_lang$html$Html_Events$targetValue));
};
var _user$project$Internal_Options$onChange = function (f) {
	return A2(
		_user$project$Internal_Options$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, f, _elm_lang$html$Html_Events$targetValue));
};
var _user$project$Internal_Options$onWithOptions = F2(
	function (evt, options) {
		return A2(
			_user$project$Internal_Options$Listener,
			evt,
			_elm_lang$core$Maybe$Just(options));
	});
var _user$project$Internal_Options$onSubmit = function (f) {
	return A3(
		_user$project$Internal_Options$onWithOptions,
		'submit',
		{preventDefault: true, stopPropagation: false},
		A2(_elm_lang$core$Json_Decode$map, f, _elm_lang$html$Html_Events$targetValue));
};
var _user$project$Internal_Options$Set = function (a) {
	return {ctor: 'Set', _0: a};
};
var _user$project$Internal_Options$option = _user$project$Internal_Options$Set;
var _user$project$Internal_Options$nativeControl = function (options) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					nativeControl: A2(_elm_lang$core$Basics_ops['++'], config.nativeControl, options)
				});
		});
};
var _user$project$Internal_Options$id_ = function (id_) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{id_: id_});
		});
};
var _user$project$Internal_Options$Many = function (a) {
	return {ctor: 'Many', _0: a};
};
var _user$project$Internal_Options$many = _user$project$Internal_Options$Many;
var _user$project$Internal_Options$Internal = function (a) {
	return {ctor: 'Internal', _0: a};
};
var _user$project$Internal_Options$Attribute = function (a) {
	return {ctor: 'Attribute', _0: a};
};
var _user$project$Internal_Options$for = function (_p5) {
	return _user$project$Internal_Options$Attribute(
		_elm_lang$html$Html_Attributes$for(_p5));
};
var _user$project$Internal_Options$data = F2(
	function (key, val) {
		return _user$project$Internal_Options$Attribute(
			A2(
				_elm_lang$html$Html_Attributes$attribute,
				A2(_elm_lang$core$Basics_ops['++'], 'data-', key),
				val));
	});
var _user$project$Internal_Options$aria = F2(
	function (key, val) {
		return _user$project$Internal_Options$Attribute(
			A2(
				_elm_lang$html$Html_Attributes$attribute,
				A2(_elm_lang$core$Basics_ops['++'], 'aria-', key),
				val));
	});
var _user$project$Internal_Options$autocomplete = function (autocomplete) {
	return _user$project$Internal_Options$Attribute(
		A2(_elm_lang$html$Html_Attributes$attribute, 'autocomplete', autocomplete));
};
var _user$project$Internal_Options$tabindex = function (tabindex) {
	return _user$project$Internal_Options$Attribute(
		_elm_lang$html$Html_Attributes$tabindex(tabindex));
};
var _user$project$Internal_Options$autofocus = function (autofocus) {
	return _user$project$Internal_Options$Attribute(
		_elm_lang$html$Html_Attributes$autofocus(autofocus));
};
var _user$project$Internal_Options$role = function (role) {
	return _user$project$Internal_Options$Attribute(
		A2(_elm_lang$html$Html_Attributes$attribute, 'role', role));
};
var _user$project$Internal_Options$attribute = function (_p6) {
	return _user$project$Internal_Options$Attribute(
		A2(_elm_lang$html$Html_Attributes$map, _elm_lang$core$Basics$never, _p6));
};
var _user$project$Internal_Options$id = function (_p7) {
	return _user$project$Internal_Options$Attribute(
		_elm_lang$html$Html_Attributes$id(_p7));
};
var _user$project$Internal_Options$CSS = function (a) {
	return {ctor: 'CSS', _0: a};
};
var _user$project$Internal_Options$css = F2(
	function (key, value) {
		return _user$project$Internal_Options$CSS(
			{ctor: '_Tuple2', _0: key, _1: value});
	});
var _user$project$Internal_Options$Class = function (a) {
	return {ctor: 'Class', _0: a};
};
var _user$project$Internal_Options$cs = function (c) {
	return _user$project$Internal_Options$Class(c);
};

var _user$project$Internal_Component$subs = F5(
	function (ctor, get, subscriptions, lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			A3(
				_elm_lang$core$Dict$foldl,
				F3(
					function (idx, model, ss) {
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Platform_Sub$map,
								function (_p0) {
									return lift(
										A2(ctor, idx, _p0));
								},
								subscriptions(model)),
							_1: ss
						};
					}),
				{ctor: '[]'},
				get(model)));
	});
var _user$project$Internal_Component$generalise = F4(
	function (update, lift, msg, model) {
		return A2(
			_elm_lang$core$Tuple$mapSecond,
			_elm_lang$core$Platform_Cmd$map(lift),
			A2(
				_elm_lang$core$Tuple$mapFirst,
				_elm_lang$core$Maybe$Just,
				A2(update, msg, model)));
	});
var _user$project$Internal_Component$react = F8(
	function (get, set, ctor, update, lift, msg, idx, store) {
		return A2(
			_elm_lang$core$Tuple$mapFirst,
			_elm_lang$core$Maybe$map(
				A2(set, idx, store)),
			A3(
				update,
				function (_p1) {
					return lift(
						A2(ctor, idx, _p1));
				},
				msg,
				A2(get, idx, store)));
	});
var _user$project$Internal_Component$render = F7(
	function (get_model, view, ctor, lift, idx, store, options) {
		return A3(
			view,
			function (_p2) {
				return lift(
					A2(ctor, idx, _p2));
			},
			A2(get_model, idx, store),
			{
				ctor: '::',
				_0: _user$project$Internal_Options$dispatch(lift),
				_1: options
			});
	});
var _user$project$Internal_Component$indexed = F3(
	function (get_model, set_model, model0) {
		var set_ = F3(
			function (idx, store, model) {
				return A2(
					set_model,
					A3(
						_elm_lang$core$Dict$insert,
						idx,
						model,
						get_model(store)),
					store);
			});
		var get_ = F2(
			function (idx, store) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					model0,
					A2(
						_elm_lang$core$Dict$get,
						idx,
						get_model(store)));
			});
		return {ctor: '_Tuple2', _0: get_, _1: set_};
	});

var _user$project$Internal_Helpers$delayedCmd = F2(
	function (time, msg) {
		return A2(
			_elm_lang$core$Task$perform,
			_elm_lang$core$Basics$always(msg),
			_elm_lang$core$Process$sleep(time));
	});
var _user$project$Internal_Helpers$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$identity,
		_elm_lang$core$Task$succeed(msg));
};

var _user$project$Internal_Icon_Implementation$size48 = A2(_user$project$Internal_Options$css, 'font-size', '48px');
var _user$project$Internal_Icon_Implementation$size36 = A2(_user$project$Internal_Options$css, 'font-size', '36px');
var _user$project$Internal_Icon_Implementation$size24 = A2(_user$project$Internal_Options$css, 'font-size', '24px');
var _user$project$Internal_Icon_Implementation$size18 = A2(_user$project$Internal_Options$css, 'font-size', '18px');
var _user$project$Internal_Icon_Implementation$node = function (ctor) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{node: ctor});
		});
};
var _user$project$Internal_Icon_Implementation$anchor = _user$project$Internal_Icon_Implementation$node('a');
var _user$project$Internal_Icon_Implementation$button = _user$project$Internal_Icon_Implementation$node('button');
var _user$project$Internal_Icon_Implementation$span = _user$project$Internal_Icon_Implementation$node('span');
var _user$project$Internal_Icon_Implementation$defaultConfig = {node: 'i'};
var _user$project$Internal_Icon_Implementation$view = F2(
	function (options, name) {
		var _p0 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Icon_Implementation$defaultConfig, options);
		var summary = _p0;
		var config = _p0.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$node(config.node),
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('material-icons'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Internal_Options$aria, 'hidden', 'true'),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(name),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Icon_Implementation$Config = function (a) {
	return {node: a};
};

var _user$project$Internal_Ripple_Implementation$decodeGeometry = function (type_) {
	var view = _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'view',
			_1: {ctor: '[]'}
		});
	var currentTarget = _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'currentTarget',
			_1: {ctor: '[]'}
		});
	var changedTouch = A3(
		_elm_lang$core$Json_Decode$map2,
		F2(
			function (pageX, pageY) {
				return {pageX: pageX, pageY: pageY};
			}),
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'pageX',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$float),
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'pageY',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$float));
	var changedTouches = A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'changedTouches',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$list(changedTouch));
	var normalizeCoords = F3(
		function (pageOffset, clientRect, _p0) {
			var _p1 = _p0;
			var documentY = pageOffset.y + clientRect.top;
			var y = _p1.pageY - documentY;
			var documentX = pageOffset.x + clientRect.left;
			var x = _p1.pageX - documentX;
			return {x: x, y: y};
		});
	var boundingClientRect = function (pageOffset) {
		return A2(
			_elm_lang$core$Json_Decode$map,
			function (_p2) {
				var _p3 = _p2;
				return {top: _p3.top - pageOffset.y, left: _p3.left, width: _p3.width, height: _p3.height};
			},
			_debois$elm_dom$DOM$boundingClientRect);
	};
	var isSurfaceDisabled = _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Json_Decode$map,
				_elm_lang$core$Basics$always(true),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'disabled',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$string)),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Json_Decode$succeed(false),
				_1: {ctor: '[]'}
			}
		});
	var windowPageOffset = A3(
		_elm_lang$core$Json_Decode$map2,
		F2(
			function (x, y) {
				return {x: x, y: y};
			}),
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'pageXOffset',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$float),
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'pageYOffset',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$float));
	return A5(
		_elm_lang$core$Json_Decode$map4,
		F4(
			function (coords, pageOffset, clientRect, isSurfaceDisabled) {
				var _p4 = A3(normalizeCoords, pageOffset, clientRect, coords);
				var x = _p4.x;
				var y = _p4.y;
				var event = {type_: type_, pageX: x, pageY: y};
				return {event: event, isSurfaceDisabled: isSurfaceDisabled, frame: clientRect};
			}),
		_elm_lang$core$Native_Utils.eq(type_, 'touchstart') ? A2(
			_elm_lang$core$Json_Decode$map,
			_elm_lang$core$Maybe$withDefault(
				{pageX: 0, pageY: 0}),
			A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$List$head, changedTouches)) : A3(
			_elm_lang$core$Json_Decode$map2,
			F2(
				function (pageX, pageY) {
					return {pageX: pageX, pageY: pageY};
				}),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'pageX',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'pageY',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float)),
		view(windowPageOffset),
		A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p5) {
				return currentTarget(
					boundingClientRect(_p5));
			},
			view(windowPageOffset)),
		currentTarget(isSurfaceDisabled));
};
var _user$project$Internal_Ripple_Implementation$_p6 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.ripple;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{ripple: x});
		}),
	_user$project$Internal_Ripple_Model$defaultModel);
var _user$project$Internal_Ripple_Implementation$get = _user$project$Internal_Ripple_Implementation$_p6._0;
var _user$project$Internal_Ripple_Implementation$set = _user$project$Internal_Ripple_Implementation$_p6._1;
var _user$project$Internal_Ripple_Implementation$accent = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				color: _elm_lang$core$Maybe$Just('accent')
			});
	});
var _user$project$Internal_Ripple_Implementation$primary = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				color: _elm_lang$core$Maybe$Just('primary')
			});
	});
var _user$project$Internal_Ripple_Implementation$defaultConfig = {color: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_Ripple_Implementation$view = F4(
	function (isUnbounded, lift, model, options) {
		var isVisible = model.active || model.animating;
		var deactivateOn = function (event) {
			return A2(
				_user$project$Internal_Options$on,
				event,
				_elm_lang$core$Json_Decode$succeed(
					lift(
						_user$project$Internal_Ripple_Model$Deactivate(event))));
		};
		var activateOn = function (event) {
			return A2(
				_user$project$Internal_Options$on,
				event,
				A2(
					_elm_lang$core$Json_Decode$map,
					function (_p7) {
						return lift(
							A3(
								_user$project$Internal_Ripple_Model$Activate,
								event,
								_elm_lang$core$Maybe$Just(true),
								_p7));
					},
					_user$project$Internal_Ripple_Implementation$decodeGeometry(event)));
		};
		var blurOn = function (event) {
			return A2(
				_user$project$Internal_Options$on,
				event,
				_elm_lang$core$Json_Decode$succeed(
					lift(_user$project$Internal_Ripple_Model$Blur)));
		};
		var focusOn = function (event) {
			return A2(
				_user$project$Internal_Options$on,
				event,
				_elm_lang$core$Json_Decode$succeed(
					lift(_user$project$Internal_Ripple_Model$Focus)));
		};
		var interactionHandler = _user$project$Internal_Options$many(
			{
				ctor: '::',
				_0: focusOn('focus'),
				_1: {
					ctor: '::',
					_0: blurOn('blur'),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Options$many(
							A2(
								_elm_lang$core$List$map,
								activateOn,
								{
									ctor: '::',
									_0: 'mousedown',
									_1: {
										ctor: '::',
										_0: 'pointerdown',
										_1: {
											ctor: '::',
											_0: 'touchstart',
											_1: {ctor: '[]'}
										}
									}
								})),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Options$many(
								A2(
									_elm_lang$core$List$map,
									deactivateOn,
									{
										ctor: '::',
										_0: 'mouseup',
										_1: {
											ctor: '::',
											_0: 'pointerup',
											_1: {
												ctor: '::',
												_0: 'touchend',
												_1: {ctor: '[]'}
											}
										}
									})),
							_1: {ctor: '[]'}
						}
					}
				}
			});
		var summary = _user$project$Internal_Options$collect(
			{ctor: '_Tuple0'});
		var geometry = model.geometry;
		var surfaceWidth = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(geometry.frame.width),
			'px');
		var surfaceHeight = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(geometry.frame.height),
			'px');
		var surfaceDiameter = _elm_lang$core$Basics$sqrt(
			Math.pow(geometry.frame.width, 2) + Math.pow(geometry.frame.height, 2));
		var maxDimension = A2(_elm_lang$core$Basics$max, geometry.frame.width, geometry.frame.height);
		var maxRadius = isUnbounded ? maxDimension : (surfaceDiameter + 10);
		var initialSize = maxDimension * 0.6;
		var fgSize = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(initialSize),
			'px');
		var fgScale = _elm_lang$core$Basics$toString(maxRadius / initialSize);
		var endPoint = {x: (geometry.frame.width - initialSize) / 2, y: (geometry.frame.height - initialSize) / 2};
		var translateEnd = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(endPoint.x),
			A2(
				_elm_lang$core$Basics_ops['++'],
				'px, ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(endPoint.y),
					'px')));
		var wasActivatedByPointer = A2(
			_elm_lang$core$List$member,
			geometry.event.type_,
			{
				ctor: '::',
				_0: 'mousedown',
				_1: {
					ctor: '::',
					_0: 'touchstart',
					_1: {
						ctor: '::',
						_0: 'pointerdown',
						_1: {ctor: '[]'}
					}
				}
			});
		var startPoint = (wasActivatedByPointer && (!isUnbounded)) ? {x: geometry.event.pageX - (initialSize / 2), y: geometry.event.pageY - (initialSize / 2)} : {
			x: _elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round((geometry.frame.width - initialSize) / 2)),
			y: _elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round((geometry.frame.height - initialSize) / 2))
		};
		var translateStart = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(startPoint.x),
			A2(
				_elm_lang$core$Basics_ops['++'],
				'px, ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(startPoint.y),
					'px')));
		var top = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(startPoint.y),
			'px');
		var left = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(startPoint.x),
			'px');
		var cssVariableHack = function () {
			var className = A2(
				F2(
					function (x, y) {
						return A2(_elm_lang$core$Basics_ops['++'], x, y);
					}),
				'mdc-ripple-style-hack--',
				function (_p8) {
					return _elm_lang$core$String$fromList(
						A2(
							_elm_lang$core$List$filter,
							_elm_lang$core$Char$isDigit,
							_elm_lang$core$String$toList(
								_elm_lang$core$String$concat(_p8))));
				}(
					{
						ctor: '::',
						_0: fgSize,
						_1: {
							ctor: '::',
							_0: fgScale,
							_1: {
								ctor: '::',
								_0: top,
								_1: {
									ctor: '::',
									_0: left,
									_1: {
										ctor: '::',
										_0: translateStart,
										_1: {
											ctor: '::',
											_0: translateEnd,
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}));
			var text = function (_p9) {
				return A3(
					_elm_lang$core$Basics$flip,
					F2(
						function (x, y) {
							return A2(_elm_lang$core$Basics_ops['++'], x, y);
						}),
					'}',
					A2(
						F2(
							function (x, y) {
								return A2(_elm_lang$core$Basics_ops['++'], x, y);
							}),
						A2(
							_elm_lang$core$Basics_ops['++'],
							'.',
							A2(_elm_lang$core$Basics_ops['++'], className, '{')),
						_p9));
			}(
				function (_p10) {
					return _elm_lang$core$String$concat(
						A2(
							_elm_lang$core$List$map,
							function (_p11) {
								var _p12 = _p11;
								return A2(
									_elm_lang$core$Basics_ops['++'],
									'--mdc-ripple-',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_p12._0,
										A2(
											_elm_lang$core$Basics_ops['++'],
											':',
											A2(_elm_lang$core$Basics_ops['++'], _p12._1, ' !important;'))));
							},
							_p10));
				}(
					_elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'fg-size', _1: fgSize},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'fg-scale', _1: fgScale},
									_1: {ctor: '[]'}
								}
							},
							_1: {
								ctor: '::',
								_0: isUnbounded ? {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'top', _1: top},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'left', _1: left},
										_1: {ctor: '[]'}
									}
								} : {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'fg-translate-start', _1: translateStart},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'fg-translate-end', _1: translateEnd},
										_1: {ctor: '[]'}
									}
								},
								_1: {ctor: '[]'}
							}
						})));
			return {className: className, text: text};
		}();
		var style = A3(
			_elm_lang$html$Html$node,
			'style',
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$type_('text/css'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: isVisible ? _elm_lang$html$Html$text(cssVariableHack.text) : _elm_lang$html$Html$text(''),
				_1: {ctor: '[]'}
			});
		var _p13 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Ripple_Implementation$defaultConfig, options);
		var config = _p13.config;
		var properties = _user$project$Internal_Options$many(
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-ripple-upgraded'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						_elm_lang$core$Native_Utils.eq(
							config.color,
							_elm_lang$core$Maybe$Just('primary')),
						_user$project$Internal_Options$cs('mdc-ripple-surface--primary')),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							_elm_lang$core$Native_Utils.eq(
								config.color,
								_elm_lang$core$Maybe$Just('accent')),
							_user$project$Internal_Options$cs('mdc-ripple-surface--accent')),
						_1: {
							ctor: '::',
							_0: function (_p14) {
								return A2(
									_user$project$Internal_Options$when,
									isUnbounded,
									_user$project$Internal_Options$many(_p14));
							}(
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-ripple-upgraded--unbounded'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Internal_Options$data, 'data-mdc-ripple-is-unbounded', ''),
										_1: {ctor: '[]'}
									}
								}),
							_1: {
								ctor: '::',
								_0: function (_p15) {
									return A2(
										_user$project$Internal_Options$when,
										isVisible,
										_user$project$Internal_Options$many(_p15));
								}(
									{
										ctor: '::',
										_0: _user$project$Internal_Options$cs('mdc-ripple-upgraded--background-active-fill'),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Options$cs('mdc-ripple-upgraded--foreground-activation'),
											_1: {ctor: '[]'}
										}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										model.deactivation,
										_user$project$Internal_Options$cs('mdc-ripple-upgraded--foreground-deactivation')),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											model.focus,
											_user$project$Internal_Options$cs('mdc-ripple-upgraded--background-focused')),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$when,
												isVisible,
												_user$project$Internal_Options$cs(cssVariableHack.className)),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			});
		return {interactionHandler: interactionHandler, properties: properties, style: style};
	});
var _user$project$Internal_Ripple_Implementation$unbounded = A3(
	_user$project$Internal_Component$render,
	_user$project$Internal_Ripple_Implementation$get,
	_user$project$Internal_Ripple_Implementation$view(true),
	_user$project$Internal_Msg$RippleMsg);
var _user$project$Internal_Ripple_Implementation$bounded = A3(
	_user$project$Internal_Component$render,
	_user$project$Internal_Ripple_Implementation$get,
	_user$project$Internal_Ripple_Implementation$view(false),
	_user$project$Internal_Msg$RippleMsg);
var _user$project$Internal_Ripple_Implementation$update = F2(
	function (msg, model) {
		var _p16 = msg;
		switch (_p16.ctor) {
			case 'Focus':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{focus: true}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Blur':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{focus: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Activate':
				var isVisible = model.active || model.animating;
				if (!isVisible) {
					var animation = model.animation + 1;
					var active = A2(_elm_lang$core$Maybe$withDefault, model.active, _p16._1);
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{active: active, animating: true, geometry: _p16._2, deactivation: false, animation: animation}),
						_1: A2(
							_user$project$Internal_Helpers$delayedCmd,
							300,
							A2(_user$project$Internal_Ripple_Model$AnimationEnd, _p16._0, animation))
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'Deactivate':
				var _p18 = _p16._0;
				var sameEvent = function () {
					var _p17 = model.geometry.event.type_;
					switch (_p17) {
						case 'keydown':
							return _elm_lang$core$Native_Utils.eq(_p18, 'keyup');
						case 'mousedown':
							return _elm_lang$core$Native_Utils.eq(_p18, 'mouseup');
						case 'pointerdown':
							return _elm_lang$core$Native_Utils.eq(_p18, 'pointerup');
						case 'touchstart':
							return _elm_lang$core$Native_Utils.eq(_p18, 'touchend');
						default:
							return false;
					}
				}();
				return sameEvent ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{active: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				} : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			default:
				return (_elm_lang$core$Native_Utils.eq(model.geometry.event.type_, _p16._0) && _elm_lang$core$Native_Utils.eq(_p16._1, model.animation)) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{animating: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				} : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _user$project$Internal_Ripple_Implementation$react = A4(
	_user$project$Internal_Component$react,
	_user$project$Internal_Ripple_Implementation$get,
	_user$project$Internal_Ripple_Implementation$set,
	_user$project$Internal_Msg$RippleMsg,
	_user$project$Internal_Component$generalise(_user$project$Internal_Ripple_Implementation$update));
var _user$project$Internal_Ripple_Implementation$Config = function (a) {
	return {color: a};
};

var _user$project$Internal_Button_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.button;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{button: x});
		}),
	_user$project$Internal_Button_Model$defaultModel);
var _user$project$Internal_Button_Implementation$get = _user$project$Internal_Button_Implementation$_p0._0;
var _user$project$Internal_Button_Implementation$set = _user$project$Internal_Button_Implementation$_p0._1;
var _user$project$Internal_Button_Implementation$onClick = function (onClick) {
	return _user$project$Internal_Options$option(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					onClick: _elm_lang$core$Maybe$Just(onClick)
				});
		});
};
var _user$project$Internal_Button_Implementation$disabled = _user$project$Internal_Options$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{disabled: true});
	});
var _user$project$Internal_Button_Implementation$link = function (href) {
	return _user$project$Internal_Options$option(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					link: _elm_lang$core$Maybe$Just(href)
				});
		});
};
var _user$project$Internal_Button_Implementation$ripple = _user$project$Internal_Options$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _user$project$Internal_Button_Implementation$dense = _user$project$Internal_Options$cs('mdc-button--dense');
var _user$project$Internal_Button_Implementation$outlined = _user$project$Internal_Options$cs('mdc-button--outlined');
var _user$project$Internal_Button_Implementation$unelevated = _user$project$Internal_Options$cs('mdc-button--unelevated');
var _user$project$Internal_Button_Implementation$raised = _user$project$Internal_Options$cs('mdc-button--raised');
var _user$project$Internal_Button_Implementation$icon = function (str) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					icon: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _user$project$Internal_Button_Implementation$defaultConfig = {ripple: false, link: _elm_lang$core$Maybe$Nothing, disabled: false, icon: _elm_lang$core$Maybe$Nothing, onClick: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_Button_Implementation$button = F4(
	function (lift, model, options, nodes) {
		var ripple = A4(
			_user$project$Internal_Ripple_Implementation$view,
			false,
			function (_p1) {
				return lift(
					_user$project$Internal_Button_Model$RippleMsg(_p1));
			},
			model.ripple,
			{ctor: '[]'});
		var _p2 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Button_Implementation$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			(!_elm_lang$core$Native_Utils.eq(config.link, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$html$Html$a : _elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-button'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$cs('mdc-js-button'),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							summary.config.ripple,
							_user$project$Internal_Options$cs('mdc-js-ripple-effect')),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Internal_Options$css, 'box-sizing', 'border-box'),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									(!_elm_lang$core$Native_Utils.eq(config.link, _elm_lang$core$Maybe$Nothing)) && (!config.disabled),
									_user$project$Internal_Options$attribute(
										_elm_lang$html$Html_Attributes$href(
											A2(_elm_lang$core$Maybe$withDefault, '', config.link)))),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										config.disabled,
										_user$project$Internal_Options$attribute(
											_elm_lang$html$Html_Attributes$disabled(true))),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											config.disabled,
											_user$project$Internal_Options$cs('mdc-button--disabled')),
										_1: {
											ctor: '::',
											_0: function (_p3) {
												return A2(
													_user$project$Internal_Options$when,
													config.ripple,
													_user$project$Internal_Options$many(_p3));
											}(
												{
													ctor: '::',
													_0: ripple.interactionHandler,
													_1: {
														ctor: '::',
														_0: ripple.properties,
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$core$Maybe$withDefault,
													_user$project$Internal_Options$nop,
													A2(
														_elm_lang$core$Maybe$map,
														function (_p4) {
															return _user$project$Internal_Options$onClick(
																lift(
																	A2(_user$project$Internal_Button_Model$Click, config.ripple, _p4)));
														},
														config.onClick)),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(
							_elm_lang$core$Maybe$map,
							function (icon) {
								return {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Icon_Implementation$view,
										{
											ctor: '::',
											_0: _user$project$Internal_Options$cs('mdc-button__icon'),
											_1: {ctor: '[]'}
										},
										icon),
									_1: {ctor: '[]'}
								};
							},
							config.icon)),
					_1: {
						ctor: '::',
						_0: nodes,
						_1: {
							ctor: '::',
							_0: {
								ctor: '::',
								_0: ripple.style,
								_1: {ctor: '[]'}
							},
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _user$project$Internal_Button_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Button_Implementation$get, _user$project$Internal_Button_Implementation$button, _user$project$Internal_Msg$ButtonMsg);
var _user$project$Internal_Button_Implementation$update = F3(
	function (lift, msg, model) {
		var _p5 = msg;
		if (_p5.ctor === 'RippleMsg') {
			var _p6 = A2(_user$project$Internal_Ripple_Implementation$update, _p5._0, model.ripple);
			var ripple = _p6._0;
			var cmd = _p6._1;
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					_elm_lang$core$Native_Utils.update(
						model,
						{ripple: ripple})),
				_1: A2(
					_elm_lang$core$Platform_Cmd$map,
					function (_p7) {
						return lift(
							_user$project$Internal_Button_Model$RippleMsg(_p7));
					},
					cmd)
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A2(
					_user$project$Internal_Helpers$delayedCmd,
					_p5._0 ? 150 : 0,
					_p5._1)
			};
		}
	});
var _user$project$Internal_Button_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Button_Implementation$get, _user$project$Internal_Button_Implementation$set, _user$project$Internal_Msg$ButtonMsg, _user$project$Internal_Button_Implementation$update);
var _user$project$Internal_Button_Implementation$Config = F5(
	function (a, b, c, d, e) {
		return {ripple: a, link: b, disabled: c, icon: d, onClick: e};
	});

var _user$project$Material_Options$id = _user$project$Internal_Options$id;
var _user$project$Material_Options$onWithOptions = _user$project$Internal_Options$onWithOptions;
var _user$project$Material_Options$onSubmit = _user$project$Internal_Options$onSubmit;
var _user$project$Material_Options$onChange = _user$project$Internal_Options$onChange;
var _user$project$Material_Options$onInput = _user$project$Internal_Options$onInput;
var _user$project$Material_Options$onFocus = _user$project$Internal_Options$onFocus;
var _user$project$Material_Options$onBlur = _user$project$Internal_Options$onBlur;
var _user$project$Material_Options$onCheck = _user$project$Internal_Options$onCheck;
var _user$project$Material_Options$onMouseOut = _user$project$Internal_Options$onMouseOut;
var _user$project$Material_Options$onMouseOver = _user$project$Internal_Options$onMouseOver;
var _user$project$Material_Options$onMouseLeave = _user$project$Internal_Options$onMouseLeave;
var _user$project$Material_Options$onMouseEnter = _user$project$Internal_Options$onMouseEnter;
var _user$project$Material_Options$onMouseUp = _user$project$Internal_Options$onMouseUp;
var _user$project$Material_Options$onMouseDown = _user$project$Internal_Options$onMouseDown;
var _user$project$Material_Options$onDoubleClick = _user$project$Internal_Options$onDoubleClick;
var _user$project$Material_Options$onClick = _user$project$Internal_Options$onClick;
var _user$project$Material_Options$on = _user$project$Internal_Options$on;
var _user$project$Material_Options$attribute = _user$project$Internal_Options$attribute;
var _user$project$Material_Options$for = _user$project$Internal_Options$for;
var _user$project$Material_Options$tabindex = _user$project$Internal_Options$tabindex;
var _user$project$Material_Options$aria = _user$project$Internal_Options$aria;
var _user$project$Material_Options$data = _user$project$Internal_Options$data;
var _user$project$Material_Options$when = _user$project$Internal_Options$when;
var _user$project$Material_Options$nop = _user$project$Internal_Options$nop;
var _user$project$Material_Options$many = _user$project$Internal_Options$many;
var _user$project$Material_Options$css = _user$project$Internal_Options$css;
var _user$project$Material_Options$cs = _user$project$Internal_Options$cs;
var _user$project$Material_Options$styled = _user$project$Internal_Options$styled;

var _user$project$Internal_GlobalEvents$listenerWithValue = F3(
	function (name, value, decoder) {
		return _user$project$Material_Options$many(
			{
				ctor: '::',
				_0: A2(_user$project$Material_Options$on, name, decoder),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Material_Options$data,
						name,
						A2(_elm_lang$core$Json_Encode$encode, 0, value)),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_GlobalEvents$listener = F2(
	function (name, decoder) {
		return _user$project$Material_Options$many(
			{
				ctor: '::',
				_0: A2(_user$project$Material_Options$on, name, decoder),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$data, name, '{}'),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_GlobalEvents$onPointerUp = _user$project$Internal_GlobalEvents$listener('globalpointerup');
var _user$project$Internal_GlobalEvents$onTouchEnd = _user$project$Internal_GlobalEvents$listener('globaltouchend');
var _user$project$Internal_GlobalEvents$onMouseUp = _user$project$Internal_GlobalEvents$listener('globalmouseup');
var _user$project$Internal_GlobalEvents$onPointerMove = _user$project$Internal_GlobalEvents$listener('globalpointermove');
var _user$project$Internal_GlobalEvents$onTouchMove = _user$project$Internal_GlobalEvents$listener('globaltouchmove');
var _user$project$Internal_GlobalEvents$onMouseMove = _user$project$Internal_GlobalEvents$listener('globalmousemove');
var _user$project$Internal_GlobalEvents$onScroll = _user$project$Internal_GlobalEvents$listener('globalscroll');
var _user$project$Internal_GlobalEvents$onResize = _user$project$Internal_GlobalEvents$listener('globalresize');
var _user$project$Internal_GlobalEvents$onTick = _user$project$Internal_GlobalEvents$listener('globaltick');
var _user$project$Internal_GlobalEvents$encodeTickConfig = function (tickConfig) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'targetRect',
				_1: _elm_lang$core$Json_Encode$bool(tickConfig.targetRect)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'parentRect',
					_1: _elm_lang$core$Json_Encode$bool(tickConfig.parentRect)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Internal_GlobalEvents$onTickWith = function (config) {
	return A2(
		_user$project$Internal_GlobalEvents$listenerWithValue,
		'globaltick',
		_user$project$Internal_GlobalEvents$encodeTickConfig(config));
};
var _user$project$Internal_GlobalEvents$TickConfig = F2(
	function (a, b) {
		return {targetRect: a, parentRect: b};
	});

var _user$project$Internal_Checkbox_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.checkbox;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{checkbox: x});
		}),
	_user$project$Internal_Checkbox_Model$defaultModel);
var _user$project$Internal_Checkbox_Implementation$get = _user$project$Internal_Checkbox_Implementation$_p0._0;
var _user$project$Internal_Checkbox_Implementation$set = _user$project$Internal_Checkbox_Implementation$_p0._1;
var _user$project$Internal_Checkbox_Implementation$animationState = F2(
	function (oldState, state) {
		var _p1 = {ctor: '_Tuple2', _0: oldState, _1: state};
		_v0_6:
		do {
			if (_p1.ctor === '_Tuple2') {
				if (_p1._0.ctor === 'Nothing') {
					if (_p1._1.ctor === 'Just') {
						if (_p1._1._0.ctor === 'Checked') {
							return _elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$IndeterminateChecked);
						} else {
							return _elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$IndeterminateUnchecked);
						}
					} else {
						break _v0_6;
					}
				} else {
					if (_p1._0._0.ctor === 'Unchecked') {
						if (_p1._1.ctor === 'Nothing') {
							return _elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$UncheckedIndeterminate);
						} else {
							if (_p1._1._0.ctor === 'Checked') {
								return _elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$UncheckedChecked);
							} else {
								break _v0_6;
							}
						}
					} else {
						if (_p1._1.ctor === 'Nothing') {
							return _elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$CheckedIndeterminate);
						} else {
							if (_p1._1._0.ctor === 'Unchecked') {
								return _elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$CheckedUnchecked);
							} else {
								break _v0_6;
							}
						}
					}
				}
			} else {
				break _v0_6;
			}
		} while(false);
		return _elm_lang$core$Maybe$Nothing;
	});
var _user$project$Internal_Checkbox_Implementation$nativeControl = _user$project$Internal_Options$nativeControl;
var _user$project$Internal_Checkbox_Implementation$checked = function (value) {
	var state = value ? _user$project$Internal_Checkbox_Model$Checked : _user$project$Internal_Checkbox_Model$Unchecked;
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					state: _elm_lang$core$Maybe$Just(state)
				});
		});
};
var _user$project$Internal_Checkbox_Implementation$disabled = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _user$project$Internal_Checkbox_Implementation$defaultConfig = {
	state: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	nativeControl: {ctor: '[]'},
	id_: ''
};
var _user$project$Internal_Checkbox_Implementation$checkbox = F4(
	function (lift, model, options, _p2) {
		var preventDefault = {preventDefault: true, stopPropagation: false};
		var animationClass = function (animation) {
			var _p3 = animation;
			if (_p3.ctor === 'Just') {
				switch (_p3._0.ctor) {
					case 'UncheckedChecked':
						return _user$project$Internal_Options$cs('mdc-checkbox--anim-unchecked-checked');
					case 'UncheckedIndeterminate':
						return _user$project$Internal_Options$cs('mdc-checkbox--anim-unchecked-indeterminate');
					case 'CheckedUnchecked':
						return _user$project$Internal_Options$cs('mdc-checkbox--anim-checked-unchecked');
					case 'CheckedIndeterminate':
						return _user$project$Internal_Options$cs('mdc-checkbox--anim-checked-indeterminate');
					case 'IndeterminateChecked':
						return _user$project$Internal_Options$cs('mdc-checkbox--anim-indeterminate-checked');
					default:
						return _user$project$Internal_Options$cs('mdc-checkbox--anim-indeterminate-unchecked');
				}
			} else {
				return _user$project$Internal_Options$nop;
			}
		};
		var _p4 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Checkbox_Implementation$defaultConfig, options);
		var summary = _p4;
		var config = _p4.config;
		var configState = config.state;
		var currentState = A2(_elm_lang$core$Maybe$withDefault, configState, model.lastKnownState);
		var stateChangedOrUninitialized = _elm_lang$core$Native_Utils.eq(model.lastKnownState, _elm_lang$core$Maybe$Nothing) || (!_elm_lang$core$Native_Utils.eq(currentState, configState));
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-checkbox mdc-checkbox--upgraded'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						_elm_lang$core$Native_Utils.eq(currentState, _elm_lang$core$Maybe$Nothing),
						_user$project$Internal_Options$cs('mdc-checkbox--indeterminate')),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							_elm_lang$core$Native_Utils.eq(
								currentState,
								_elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$Checked)),
							_user$project$Internal_Options$cs('mdc-checkbox--checked')),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								config.disabled,
								_user$project$Internal_Options$cs('mdc-checkbox--disabled')),
							_1: {
								ctor: '::',
								_0: animationClass(model.animation),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										stateChangedOrUninitialized,
										_user$project$Internal_GlobalEvents$onTick(
											_elm_lang$core$Json_Decode$succeed(
												lift(
													A2(_user$project$Internal_Checkbox_Model$Init, model.lastKnownState, configState))))),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											!_elm_lang$core$Native_Utils.eq(model.animation, _elm_lang$core$Maybe$Nothing),
											A2(
												_user$project$Internal_Options$on,
												'animationend',
												_elm_lang$core$Json_Decode$succeed(
													lift(_user$project$Internal_Checkbox_Model$AnimationEnd)))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A4(
					_user$project$Internal_Options$applyNativeControl,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-checkbox__native-control'),
						_1: {
							ctor: '::',
							_0: function (_p5) {
								return _user$project$Internal_Options$many(
									A2(_elm_lang$core$List$map, _user$project$Internal_Options$attribute, _p5));
							}(
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$id(config.id_),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html_Attributes$property,
												'indeterminate',
												_elm_lang$core$Json_Encode$bool(
													_elm_lang$core$Native_Utils.eq(currentState, _elm_lang$core$Maybe$Nothing))),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$checked(
													_elm_lang$core$Native_Utils.eq(
														currentState,
														_elm_lang$core$Maybe$Just(_user$project$Internal_Checkbox_Model$Checked))),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$disabled(config.disabled),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: A3(
									_user$project$Internal_Options$onWithOptions,
									'click',
									preventDefault,
									_elm_lang$core$Json_Decode$succeed(
										lift(_user$project$Internal_Checkbox_Model$NoOp))),
								_1: {
									ctor: '::',
									_0: A3(
										_user$project$Internal_Options$onWithOptions,
										'change',
										preventDefault,
										_elm_lang$core$Json_Decode$succeed(
											lift(_user$project$Internal_Checkbox_Model$NoOp))),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$onFocus(
											lift(
												_user$project$Internal_Checkbox_Model$SetFocus(true))),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Options$onBlur(
												lift(
													_user$project$Internal_Checkbox_Model$SetFocus(false))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_user$project$Internal_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _user$project$Internal_Options$cs('mdc-checkbox__background'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$svg,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$class('mdc-checkbox__checkmark'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$class('mdc-checkbox__checkmark-path'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('none'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke('white'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M1.73,12.91 8.1,19.28 22.79,4.59'),
														_1: {ctor: '[]'}
													}
												}
											}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A3(
									_user$project$Internal_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _user$project$Internal_Options$cs('mdc-checkbox__mixedmark'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Checkbox_Implementation$view = F4(
	function (lift, index, store, options) {
		return A7(
			_user$project$Internal_Component$render,
			_user$project$Internal_Checkbox_Implementation$get,
			_user$project$Internal_Checkbox_Implementation$checkbox,
			_user$project$Internal_Msg$CheckboxMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$id_(index),
				_1: options
			});
	});
var _user$project$Internal_Checkbox_Implementation$update = F3(
	function (_p6, msg, model) {
		var _p7 = msg;
		switch (_p7.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
			case 'SetFocus':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{isFocused: _p7._0})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Init':
				var _p8 = _p7._1;
				var animation = A2(
					_elm_lang$core$Maybe$andThen,
					A2(_elm_lang$core$Basics$flip, _user$project$Internal_Checkbox_Implementation$animationState, _p8),
					_p7._0);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{
								lastKnownState: _elm_lang$core$Maybe$Just(_p8),
								animation: animation
							})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{animation: _elm_lang$core$Maybe$Nothing})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Internal_Checkbox_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Checkbox_Implementation$get, _user$project$Internal_Checkbox_Implementation$set, _user$project$Internal_Msg$CheckboxMsg, _user$project$Internal_Checkbox_Implementation$update);
var _user$project$Internal_Checkbox_Implementation$Config = F4(
	function (a, b, c, d) {
		return {state: a, disabled: b, nativeControl: c, id_: d};
	});

var _user$project$Internal_Chip_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.chip;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{chip: x});
		}),
	_user$project$Internal_Chip_Model$defaultModel);
var _user$project$Internal_Chip_Implementation$get = _user$project$Internal_Chip_Implementation$_p0._0;
var _user$project$Internal_Chip_Implementation$set = _user$project$Internal_Chip_Implementation$_p0._1;
var _user$project$Internal_Chip_Implementation$input = _user$project$Internal_Options$cs('mdc-chip-set--input');
var _user$project$Internal_Chip_Implementation$choice = _user$project$Internal_Options$cs('mdc-chip-set--choice');
var _user$project$Internal_Chip_Implementation$filter = _user$project$Internal_Options$cs('mdc-chip-set--filter');
var _user$project$Internal_Chip_Implementation$decodeKeyCode = _elm_lang$html$Html_Events$keyCode;
var _user$project$Internal_Chip_Implementation$decodeKey = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'key',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _user$project$Internal_Chip_Implementation$onClick = function (msg) {
	var trigger = F2(
		function (key, keyCode) {
			var isEnter = _elm_lang$core$Native_Utils.eq(key, 'Enter') || _elm_lang$core$Native_Utils.eq(keyCode, 13);
			return isEnter ? _elm_lang$core$Json_Decode$succeed(msg) : _elm_lang$core$Json_Decode$fail('');
		});
	return _user$project$Internal_Options$many(
		{
			ctor: '::',
			_0: _user$project$Internal_Options$onClick(msg),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Internal_Options$on,
					'keyup',
					A2(
						_elm_lang$core$Json_Decode$andThen,
						_elm_lang$core$Basics$identity,
						A3(_elm_lang$core$Json_Decode$map2, trigger, _user$project$Internal_Chip_Implementation$decodeKey, _user$project$Internal_Chip_Implementation$decodeKeyCode))),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Internal_Chip_Implementation$checkmark = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{checkmark: true});
	});
var _user$project$Internal_Chip_Implementation$selected = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{selected: true});
	});
var _user$project$Internal_Chip_Implementation$trailingIcon = function (str) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					trailingIcon: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _user$project$Internal_Chip_Implementation$leadingIcon = function (str) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					leadingIcon: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _user$project$Internal_Chip_Implementation$defaultConfig = {leadingIcon: _elm_lang$core$Maybe$Nothing, trailingIcon: _elm_lang$core$Maybe$Nothing, onClick: _elm_lang$core$Maybe$Nothing, selected: false, checkmark: false};
var _user$project$Internal_Chip_Implementation$chipset = F2(
	function (options, nodes) {
		var _p1 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Chip_Implementation$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-chip-set'),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'},
			nodes);
	});
var _user$project$Internal_Chip_Implementation$chip = F4(
	function (lift, model, options, nodes) {
		var ripple = A4(
			_user$project$Internal_Ripple_Implementation$view,
			false,
			function (_p2) {
				return lift(
					_user$project$Internal_Chip_Model$RippleMsg(_p2));
			},
			model.ripple,
			{ctor: '[]'});
		var _p3 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Chip_Implementation$defaultConfig, options);
		var summary = _p3;
		var config = _p3.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-chip'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						config.selected,
						_user$project$Internal_Options$cs('mdc-chip--selected')),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-js-ripple-effect'),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Options$many(
								{
									ctor: '::',
									_0: ripple.interactionHandler,
									_1: {
										ctor: '::',
										_0: ripple.properties,
										_1: {ctor: '[]'}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Maybe$withDefault,
									_user$project$Internal_Options$nop,
									A2(
										_elm_lang$core$Maybe$map,
										function (_p4) {
											return _user$project$Internal_Options$onClick(
												lift(
													_user$project$Internal_Chip_Model$Click(_p4)));
										},
										config.onClick)),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_Options$attribute(
										_elm_lang$html$Html_Attributes$tabindex(0)),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(
							_elm_lang$core$Maybe$map,
							function (icon) {
								return {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Icon_Implementation$view,
										{
											ctor: '::',
											_0: _user$project$Internal_Options$cs('mdc-chip__icon mdc-chip__icon--leading'),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Options$when,
													config.selected && config.checkmark,
													_user$project$Internal_Options$cs('mdc-chip__icon--leading-hidden')),
												_1: {
													ctor: '::',
													_0: A2(_user$project$Internal_Options$css, 'font-size', '20px'),
													_1: {ctor: '[]'}
												}
											}
										},
										icon),
									_1: {ctor: '[]'}
								};
							},
							config.leadingIcon)),
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: config.checkmark ? A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-chip__checkmark'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$svg,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$class('mdc-chip__checkmark-svg'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$viewBox('-2 -3 30 30'),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$class('mdc-chip__checkmark-path'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('none'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$stroke('white'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M1.73,12.91 8.1,19.28 22.79,4.59'),
																_1: {ctor: '[]'}
															}
														}
													}
												},
												{ctor: '[]'}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}) : _elm_lang$html$Html$text(''),
							_1: {ctor: '[]'}
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '::',
								_0: A3(
									_user$project$Internal_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _user$project$Internal_Options$cs('mdc-chip__text'),
										_1: {ctor: '[]'}
									},
									nodes),
								_1: {ctor: '[]'}
							},
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Maybe$withDefault,
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$map,
										function (icon) {
											return {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Icon_Implementation$view,
													{
														ctor: '::',
														_0: _user$project$Internal_Options$cs('mdc-chip__icon mdc-chip__icon--trailing'),
														_1: {
															ctor: '::',
															_0: _user$project$Internal_Options$attribute(
																_elm_lang$html$Html_Attributes$tabindex(0)),
															_1: {
																ctor: '::',
																_0: _user$project$Internal_Options$role('button'),
																_1: {ctor: '[]'}
															}
														}
													},
													icon),
												_1: {ctor: '[]'}
											};
										},
										config.trailingIcon)),
								_1: {
									ctor: '::',
									_0: {
										ctor: '::',
										_0: ripple.style,
										_1: {ctor: '[]'}
									},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}));
	});
var _user$project$Internal_Chip_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Chip_Implementation$get, _user$project$Internal_Chip_Implementation$chip, _user$project$Internal_Msg$ChipMsg);
var _user$project$Internal_Chip_Implementation$update = F3(
	function (lift, msg, model) {
		var _p5 = msg;
		if (_p5.ctor === 'RippleMsg') {
			var _p6 = A2(_user$project$Internal_Ripple_Implementation$update, _p5._0, model.ripple);
			var ripple = _p6._0;
			var cmd = _p6._1;
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					_elm_lang$core$Native_Utils.update(
						model,
						{ripple: ripple})),
				_1: A2(
					_elm_lang$core$Platform_Cmd$map,
					function (_p7) {
						return lift(
							_user$project$Internal_Chip_Model$RippleMsg(_p7));
					},
					cmd)
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A2(_user$project$Internal_Helpers$delayedCmd, 150, _p5._0)
			};
		}
	});
var _user$project$Internal_Chip_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Chip_Implementation$get, _user$project$Internal_Chip_Implementation$set, _user$project$Internal_Msg$ChipMsg, _user$project$Internal_Chip_Implementation$update);
var _user$project$Internal_Chip_Implementation$Config = F5(
	function (a, b, c, d, e) {
		return {leadingIcon: a, trailingIcon: b, onClick: c, selected: d, checkmark: e};
	});

var _user$project$Internal_Dialog_Implementation$close = _debois$elm_dom$DOM$target(
	A2(
		_elm_lang$core$Json_Decode$map,
		function (className) {
			var hasClass = function ($class) {
				return A2(
					_elm_lang$core$String$contains,
					A2(
						_elm_lang$core$Basics_ops['++'],
						' ',
						A2(_elm_lang$core$Basics_ops['++'], $class, ' ')),
					A2(
						_elm_lang$core$Basics_ops['++'],
						' ',
						A2(_elm_lang$core$Basics_ops['++'], className, ' ')));
			};
			return hasClass('mdc-dialog__backdrop') ? true : false;
		},
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'className',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$string)));
var _user$project$Internal_Dialog_Implementation$transitionend = function () {
	var hasClass = F2(
		function (cs, className) {
			return A2(
				_elm_lang$core$List$member,
				cs,
				A2(_elm_lang$core$String$split, ' ', className));
		});
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (className) {
			return A2(hasClass, 'mdc-dialog__surface', className) ? _elm_lang$core$Json_Decode$succeed(
				{ctor: '_Tuple0'}) : _elm_lang$core$Json_Decode$fail('');
		},
		_debois$elm_dom$DOM$target(_debois$elm_dom$DOM$className));
}();
var _user$project$Internal_Dialog_Implementation$onClose = function (onClose) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onClose: _elm_lang$core$Maybe$Just(onClose)
				});
		});
};
var _user$project$Internal_Dialog_Implementation$accept = _user$project$Internal_Options$cs('mdc-dialog__footer__button mdc-dialog__footer__button--accept');
var _user$project$Internal_Dialog_Implementation$cancel = _user$project$Internal_Options$cs('mdc-dialog__footer__button mdc-dialog__footer__button--cancel');
var _user$project$Internal_Dialog_Implementation$footer = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-dialog__footer'),
			_1: options
		});
};
var _user$project$Internal_Dialog_Implementation$title = _user$project$Internal_Options$cs('mdc-dialog__header__title');
var _user$project$Internal_Dialog_Implementation$header = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-dialog__header'),
			_1: options
		});
};
var _user$project$Internal_Dialog_Implementation$scrollable = _user$project$Internal_Options$cs('mdc-dialog__body--scrollable');
var _user$project$Internal_Dialog_Implementation$body = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-dialog__body'),
			_1: options
		});
};
var _user$project$Internal_Dialog_Implementation$backdrop = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-dialog__backdrop'),
			_1: options
		});
};
var _user$project$Internal_Dialog_Implementation$surface = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-dialog__surface'),
			_1: options
		});
};
var _user$project$Internal_Dialog_Implementation$open = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{open: true});
	});
var _user$project$Internal_Dialog_Implementation$defaultConfig = {onClose: _elm_lang$core$Maybe$Nothing, open: false};
var _user$project$Internal_Dialog_Implementation$dialog = F4(
	function (lift, model, options, nodes) {
		var _p0 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Dialog_Implementation$defaultConfig, options);
		var summary = _p0;
		var config = _p0.config;
		var stateChanged = !_elm_lang$core$Native_Utils.eq(config.open, model.open);
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$aside,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-dialog'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						stateChanged,
						_user$project$Internal_GlobalEvents$onTick(
							_elm_lang$core$Json_Decode$succeed(
								lift(
									_user$project$Internal_Dialog_Model$SetState(config.open))))),
					_1: {
						ctor: '::',
						_0: function (_p1) {
							return A2(
								_user$project$Internal_Options$when,
								model.open,
								_user$project$Internal_Options$many(_p1));
						}(
							{
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-dialog--open'),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Internal_Options$data, 'focustrap', ''),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								model.animating,
								_user$project$Internal_Options$cs('mdc-dialog--animating')),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$on,
									'transitionend',
									A2(
										_elm_lang$core$Json_Decode$map,
										function (_p2) {
											return lift(_user$project$Internal_Dialog_Model$AnimationEnd);
										},
										_user$project$Internal_Dialog_Implementation$transitionend)),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$on,
										'click',
										A2(
											_elm_lang$core$Json_Decode$map,
											function (doClose) {
												return doClose ? A2(
													_elm_lang$core$Maybe$withDefault,
													lift(_user$project$Internal_Dialog_Model$NoOp),
													config.onClose) : lift(_user$project$Internal_Dialog_Model$NoOp);
											},
											_user$project$Internal_Dialog_Implementation$close)),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			nodes);
	});
var _user$project$Internal_Dialog_Implementation$_p3 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.dialog;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{dialog: x});
		}),
	_user$project$Internal_Dialog_Model$defaultModel);
var _user$project$Internal_Dialog_Implementation$get = _user$project$Internal_Dialog_Implementation$_p3._0;
var _user$project$Internal_Dialog_Implementation$set = _user$project$Internal_Dialog_Implementation$_p3._1;
var _user$project$Internal_Dialog_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Dialog_Implementation$get, _user$project$Internal_Dialog_Implementation$dialog, _user$project$Internal_Msg$DialogMsg);
var _user$project$Internal_Dialog_Implementation$update = F3(
	function (lift, msg, model) {
		var _p4 = msg;
		switch (_p4.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
			case 'SetState':
				var _p5 = _p4._0;
				return (!_elm_lang$core$Native_Utils.eq(_p5, model.open)) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{animating: true, open: _p5})),
					_1: _elm_lang$core$Platform_Cmd$none
				} : {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
			case 'SetOpen':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{open: _p4._0})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{animating: false})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Internal_Dialog_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Dialog_Implementation$get, _user$project$Internal_Dialog_Implementation$set, _user$project$Internal_Msg$DialogMsg, _user$project$Internal_Dialog_Implementation$update);
var _user$project$Internal_Dialog_Implementation$Config = F2(
	function (a, b) {
		return {onClose: a, open: b};
	});

var _user$project$Internal_List_Implementation$inset = _user$project$Internal_Options$cs('mdc-list-divider--inset');
var _user$project$Internal_List_Implementation$padded = _user$project$Internal_Options$cs('mdc-list-divier--padded');
var _user$project$Internal_List_Implementation$subheader = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-group__subheader'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$group = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-group'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$metaImage = F2(
	function (options, url) {
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$img,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-list-item__meta'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$attribute(
						_elm_lang$html$Html_Attributes$src(url)),
					_1: options
				}
			},
			{ctor: '[]'});
	});
var _user$project$Internal_List_Implementation$metaIcon = function (options) {
	return _user$project$Internal_Icon_Implementation$view(
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item__meta'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$metaText = F2(
	function (options, str) {
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$span,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-list-item__meta'),
				_1: options
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(str),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_List_Implementation$meta = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item__meta'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$graphicImage = F2(
	function (options, url) {
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$img,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-list-item__graphic'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$attribute(
						_elm_lang$html$Html_Attributes$src(url)),
					_1: options
				}
			},
			{ctor: '[]'});
	});
var _user$project$Internal_List_Implementation$graphicIcon = function (options) {
	return _user$project$Internal_Icon_Implementation$view(
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item__graphic'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$graphic = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item__graphic'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$activated = _user$project$Internal_Options$cs('mdc-list-item--activated');
var _user$project$Internal_List_Implementation$selected = _user$project$Internal_Options$cs('mdc-list-item--selected');
var _user$project$Internal_List_Implementation$secondaryText = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item__secondary-text'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$text = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item__text'),
			_1: options
		});
};
var _user$project$Internal_List_Implementation$twoLine = _user$project$Internal_Options$cs('mdc-list--two-line');
var _user$project$Internal_List_Implementation$avatarList = _user$project$Internal_Options$cs('mdc-list--avatar-list');
var _user$project$Internal_List_Implementation$dense = _user$project$Internal_Options$cs('mdc-list--dense');
var _user$project$Internal_List_Implementation$nonInteractive = _user$project$Internal_Options$cs('mdc-list--non-interactive');
var _user$project$Internal_List_Implementation$node = function (node) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					node: _elm_lang$core$Maybe$Just(node)
				});
		});
};
var _user$project$Internal_List_Implementation$defaultConfig = {node: _elm_lang$core$Maybe$Nothing};
var _user$project$Internal_List_Implementation$ul = function (options) {
	var _p0 = A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, options);
	var summary = _p0;
	var config = _p0.config;
	return A4(
		_user$project$Internal_Options$apply,
		summary,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html$ul, config.node),
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list'),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'});
};
var _user$project$Internal_List_Implementation$ol = function (options) {
	var _p1 = A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, options);
	var summary = _p1;
	var config = _p1.config;
	return A4(
		_user$project$Internal_Options$apply,
		summary,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html$ol, config.node),
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list'),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'});
};
var _user$project$Internal_List_Implementation$nav = function (options) {
	var _p2 = A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, options);
	var summary = _p2;
	var config = _p2.config;
	return A4(
		_user$project$Internal_Options$apply,
		summary,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html$nav, config.node),
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list'),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'});
};
var _user$project$Internal_List_Implementation$li = function (options) {
	var _p3 = A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, options);
	var summary = _p3;
	var config = _p3.config;
	return A4(
		_user$project$Internal_Options$apply,
		summary,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html$li, config.node),
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item'),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'});
};
var _user$project$Internal_List_Implementation$a = function (options) {
	var _p4 = A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, options);
	var summary = _p4;
	var config = _p4.config;
	return A4(
		_user$project$Internal_Options$apply,
		summary,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html$a, config.node),
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-item'),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'});
};
var _user$project$Internal_List_Implementation$divider = function (options) {
	var _p5 = A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, options);
	var summary = _p5;
	var config = _p5.config;
	return A4(
		_user$project$Internal_Options$apply,
		summary,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html$li, config.node),
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-divider'),
			_1: {
				ctor: '::',
				_0: _user$project$Internal_Options$role('separator'),
				_1: {ctor: '[]'}
			}
		},
		{ctor: '[]'});
};
var _user$project$Internal_List_Implementation$groupDivider = function (options) {
	var _p6 = A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, options);
	var summary = _p6;
	var config = _p6.config;
	return A4(
		_user$project$Internal_Options$apply,
		summary,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html$hr, config.node),
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-list-divider'),
			_1: {ctor: '[]'}
		},
		{ctor: '[]'});
};
var _user$project$Internal_List_Implementation$Config = function (a) {
	return {node: a};
};

var _user$project$Internal_Drawer_Implementation$emit = F3(
	function (lift, idx, msg) {
		return _user$project$Internal_Helpers$cmd(
			lift(
				A2(_user$project$Internal_Msg$DrawerMsg, idx, msg)));
	});
var _user$project$Internal_Drawer_Implementation$open = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{open: true});
	});
var _user$project$Internal_Drawer_Implementation$onClose = function (onClose) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onClose: _elm_lang$core$Maybe$Just(onClose)
				});
		});
};
var _user$project$Internal_Drawer_Implementation$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$none;
};
var _user$project$Internal_Drawer_Implementation$subs = A3(
	_user$project$Internal_Component$subs,
	_user$project$Internal_Msg$DrawerMsg,
	function (_) {
		return _.drawer;
	},
	_user$project$Internal_Drawer_Implementation$subscriptions);
var _user$project$Internal_Drawer_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.drawer;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{drawer: x});
		}),
	_user$project$Internal_Drawer_Model$defaultModel);
var _user$project$Internal_Drawer_Implementation$get = _user$project$Internal_Drawer_Implementation$_p0._0;
var _user$project$Internal_Drawer_Implementation$set = _user$project$Internal_Drawer_Implementation$_p0._1;
var _user$project$Internal_Drawer_Implementation$toolbarSpacer = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-drawer__toolbar-spacer'),
			_1: options
		});
};
var _user$project$Internal_Drawer_Implementation$content = _user$project$Internal_Options$cs('mdc-drawer__content');
var _user$project$Internal_Drawer_Implementation$headerContent = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-drawer__header-content'),
			_1: options
		});
};
var _user$project$Internal_Drawer_Implementation$header = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$header,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-drawer__header'),
			_1: options
		});
};
var _user$project$Internal_Drawer_Implementation$defaultConfig = {onClose: _elm_lang$core$Maybe$Nothing, open: false};
var _user$project$Internal_Drawer_Implementation$view = F5(
	function (className, lift, model, options, nodes) {
		var _p1 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Drawer_Implementation$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		var stateChanged = !_elm_lang$core$Native_Utils.eq(config.open, model.open);
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$aside,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-drawer'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$cs(className),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							stateChanged,
							_user$project$Internal_GlobalEvents$onTick(
								_elm_lang$core$Json_Decode$succeed(
									lift(
										_user$project$Internal_Drawer_Model$SetOpen(
											{ctor: '_Tuple2', _0: config.open, _1: model.persistent}))))),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								model.open,
								_user$project$Internal_Options$cs('mdc-drawer--open')),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									model.animating,
									_user$project$Internal_Options$cs('mdc-drawer--animating')),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_Options$onClick(
										A2(
											_elm_lang$core$Maybe$withDefault,
											lift(_user$project$Internal_Drawer_Model$NoOp),
											config.onClose)),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A3(
					_user$project$Internal_Options$styled,
					_elm_lang$html$Html$nav,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-drawer__drawer'),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$onWithOptions,
								'click',
								{
									stopPropagation: _elm_lang$core$Native_Utils.eq(className, 'mdc-drawer--temporary'),
									preventDefault: false
								},
								_elm_lang$core$Json_Decode$succeed(
									lift(_user$project$Internal_Drawer_Model$NoOp))),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									model.open,
									A2(_user$project$Internal_Options$css, 'transform', 'translateX(0)')),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										model.animating,
										A2(
											_user$project$Internal_Options$on,
											'transitionend',
											_elm_lang$core$Json_Decode$succeed(
												lift(_user$project$Internal_Drawer_Model$Tick)))),
									_1: options
								}
							}
						}
					},
					nodes),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Drawer_Implementation$render = function (className) {
	return A3(
		_user$project$Internal_Component$render,
		_user$project$Internal_Drawer_Implementation$get,
		_user$project$Internal_Drawer_Implementation$view(className),
		_user$project$Internal_Msg$DrawerMsg);
};
var _user$project$Internal_Drawer_Implementation$update = F3(
	function (lift, msg, model) {
		var _p2 = msg;
		switch (_p2.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
			case 'Tick':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{
								state: _elm_lang$core$Maybe$Just(model.open),
								animating: false
							})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{open: _p2._0._0, state: _elm_lang$core$Maybe$Nothing, animating: true, persistent: _p2._0._1})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Internal_Drawer_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Drawer_Implementation$get, _user$project$Internal_Drawer_Implementation$set, _user$project$Internal_Msg$DrawerMsg, _user$project$Internal_Drawer_Implementation$update);
var _user$project$Internal_Drawer_Implementation$Config = F2(
	function (a, b) {
		return {onClose: a, open: b};
	});

var _user$project$Internal_Fab_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.fab;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{fab: x});
		}),
	_user$project$Internal_Fab_Model$defaultModel);
var _user$project$Internal_Fab_Implementation$get = _user$project$Internal_Fab_Implementation$_p0._0;
var _user$project$Internal_Fab_Implementation$set = _user$project$Internal_Fab_Implementation$_p0._1;
var _user$project$Internal_Fab_Implementation$ripple = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{ripple: true});
	});
var _user$project$Internal_Fab_Implementation$exited = _user$project$Internal_Options$cs('mdc-fab--exited');
var _user$project$Internal_Fab_Implementation$mini = _user$project$Internal_Options$cs('mdc-fab--mini');
var _user$project$Internal_Fab_Implementation$defaultConfig = {ripple: false};
var _user$project$Internal_Fab_Implementation$fab = F4(
	function (lift, model, options, icon) {
		var ripple = A4(
			_user$project$Internal_Ripple_Implementation$view,
			false,
			function (_p1) {
				return lift(
					_user$project$Internal_Fab_Model$RippleMsg(_p1));
			},
			model.ripple,
			{ctor: '[]'});
		var _p2 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Fab_Implementation$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-fab'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$cs('material-icons'),
					_1: {
						ctor: '::',
						_0: function (_p3) {
							return A2(
								_user$project$Internal_Options$when,
								config.ripple,
								_user$project$Internal_Options$many(_p3));
						}(
							{
								ctor: '::',
								_0: ripple.interactionHandler,
								_1: {
									ctor: '::',
									_0: ripple.properties,
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			},
			{ctor: '[]'},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: {
						ctor: '::',
						_0: A3(
							_user$project$Internal_Options$styled,
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-fab__icon'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(icon),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					},
					_1: {
						ctor: '::',
						_0: config.ripple ? {
							ctor: '::',
							_0: ripple.style,
							_1: {ctor: '[]'}
						} : {ctor: '[]'},
						_1: {ctor: '[]'}
					}
				}));
	});
var _user$project$Internal_Fab_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Fab_Implementation$get, _user$project$Internal_Fab_Implementation$fab, _user$project$Internal_Msg$FabMsg);
var _user$project$Internal_Fab_Implementation$update = F2(
	function (msg, model) {
		var _p4 = msg;
		if (_p4.ctor === 'RippleMsg') {
			var _p5 = A2(_user$project$Internal_Ripple_Implementation$update, _p4._0, model.ripple);
			var ripple = _p5._0;
			var effects = _p5._1;
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{ripple: ripple}),
				_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Internal_Fab_Model$RippleMsg, effects)
			};
		} else {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _user$project$Internal_Fab_Implementation$react = A4(
	_user$project$Internal_Component$react,
	_user$project$Internal_Fab_Implementation$get,
	_user$project$Internal_Fab_Implementation$set,
	_user$project$Internal_Msg$FabMsg,
	_user$project$Internal_Component$generalise(_user$project$Internal_Fab_Implementation$update));
var _user$project$Internal_Fab_Implementation$Config = function (a) {
	return {ripple: a};
};

var _user$project$Internal_FormField_Implementation$alignEnd = _user$project$Internal_Options$cs('mdc-form-field--align-end');
var _user$project$Internal_FormField_Implementation$view = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-form-field'),
			_1: options
		});
};
var _user$project$Internal_FormField_Implementation$Config = {};

var _user$project$Internal_GridList_Implementation$decodeGeometry = _debois$elm_dom$DOM$target(
	A3(
		_elm_lang$core$Json_Decode$map2,
		_user$project$Internal_GridList_Model$Geometry,
		_debois$elm_dom$DOM$offsetWidth,
		A2(
			_debois$elm_dom$DOM$childNode,
			0,
			A2(_debois$elm_dom$DOM$childNode, 0, _debois$elm_dom$DOM$offsetWidth))));
var _user$project$Internal_GridList_Implementation$defaultConfig = {};
var _user$project$Internal_GridList_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.gridList;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{gridList: x});
		}),
	_user$project$Internal_GridList_Model$defaultModel);
var _user$project$Internal_GridList_Implementation$get = _user$project$Internal_GridList_Implementation$_p0._0;
var _user$project$Internal_GridList_Implementation$set = _user$project$Internal_GridList_Implementation$_p0._1;
var _user$project$Internal_GridList_Implementation$primaryContent = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-grid-tile__primary-content'),
			_1: options
		});
};
var _user$project$Internal_GridList_Implementation$icon = F2(
	function (options, icon) {
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-grid-tile__icon'),
				_1: options
			},
			{
				ctor: '::',
				_0: A2(
					_user$project$Internal_Icon_Implementation$view,
					{ctor: '[]'},
					icon),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_GridList_Implementation$supportText = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-grid-tile__support-text'),
			_1: options
		});
};
var _user$project$Internal_GridList_Implementation$title = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-grid-tile__title'),
			_1: options
		});
};
var _user$project$Internal_GridList_Implementation$image = F2(
	function (options, src) {
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$img,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-grid-tile__primary-content'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$attribute(
						_elm_lang$html$Html_Attributes$src(src)),
					_1: options
				}
			},
			{ctor: '[]'});
	});
var _user$project$Internal_GridList_Implementation$secondary = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-grid-tile__secondary'),
			_1: options
		});
};
var _user$project$Internal_GridList_Implementation$primary = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-grid-tile__primary'),
			_1: options
		});
};
var _user$project$Internal_GridList_Implementation$tile = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-grid-tile'),
			_1: options
		});
};
var _user$project$Internal_GridList_Implementation$tileAspect3To2 = _user$project$Internal_Options$cs('mdc-grid-list--tile-aspect-3To2');
var _user$project$Internal_GridList_Implementation$tileAspect2To3 = _user$project$Internal_Options$cs('mdc-grid-list--tile-aspect-2To3');
var _user$project$Internal_GridList_Implementation$tileAspect3To4 = _user$project$Internal_Options$cs('mdc-grid-list--tile-aspect-3To4');
var _user$project$Internal_GridList_Implementation$tileAspect4To3 = _user$project$Internal_Options$cs('mdc-grid-list--tile-aspect-4To3');
var _user$project$Internal_GridList_Implementation$tileAspect16To9 = _user$project$Internal_Options$cs('mdc-grid-list--tile-aspect-16To9');
var _user$project$Internal_GridList_Implementation$gutter1 = _user$project$Internal_Options$cs('mdc-grid-list--tile-gutter-1');
var _user$project$Internal_GridList_Implementation$iconAlignEnd = _user$project$Internal_Options$cs('mdc-grid-list--with-icon-align-end');
var _user$project$Internal_GridList_Implementation$iconAlignStart = _user$project$Internal_Options$cs('mdc-grid-list--with-icon-align-start');
var _user$project$Internal_GridList_Implementation$twolineCaption = _user$project$Internal_Options$cs('mdc-grid-list--twoline-caption');
var _user$project$Internal_GridList_Implementation$headerCaption = _user$project$Internal_Options$cs('mdc-grid-list--header-caption');
var _user$project$Internal_GridList_Implementation$gridList = F4(
	function (lift, model, options, nodes) {
		var width = A2(
			_elm_lang$core$Maybe$withDefault,
			'auto',
			A2(
				_elm_lang$core$Maybe$map,
				function (_p1) {
					return A3(
						_elm_lang$core$Basics$flip,
						F2(
							function (x, y) {
								return A2(_elm_lang$core$Basics_ops['++'], x, y);
							}),
						'px',
						_elm_lang$core$Basics$toString(_p1));
				},
				A2(
					_elm_lang$core$Maybe$map,
					function (_p2) {
						var _p3 = _p2;
						var _p4 = _p3.tileWidth;
						return _p4 * _elm_lang$core$Basics$toFloat(
							_elm_lang$core$Basics$floor(_p3.width / _p4));
					},
					model.geometry)));
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-grid-list'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						_elm_lang$core$Native_Utils.eq(model.geometry, _elm_lang$core$Maybe$Nothing),
						_user$project$Internal_GlobalEvents$onTick(
							A2(
								_elm_lang$core$Json_Decode$map,
								function (_p5) {
									return lift(
										_user$project$Internal_GridList_Model$Init(_p5));
								},
								_user$project$Internal_GridList_Implementation$decodeGeometry))),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_GlobalEvents$onResize(
							A2(
								_elm_lang$core$Json_Decode$map,
								function (_p6) {
									return lift(
										_user$project$Internal_GridList_Model$Init(_p6));
								},
								_user$project$Internal_GridList_Implementation$decodeGeometry)),
						_1: options
					}
				}
			},
			{
				ctor: '::',
				_0: A3(
					_user$project$Internal_Options$styled,
					_elm_lang$html$Html$ul,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-grid-list__tiles'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Internal_Options$css, 'width', width),
							_1: {ctor: '[]'}
						}
					},
					nodes),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_GridList_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_GridList_Implementation$get, _user$project$Internal_GridList_Implementation$gridList, _user$project$Internal_Msg$GridListMsg);
var _user$project$Internal_GridList_Implementation$update = F2(
	function (msg, model) {
		var _p7 = msg;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					geometry: _elm_lang$core$Maybe$Just(_p7._0)
				}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Internal_GridList_Implementation$react = A4(
	_user$project$Internal_Component$react,
	_user$project$Internal_GridList_Implementation$get,
	_user$project$Internal_GridList_Implementation$set,
	_user$project$Internal_Msg$GridListMsg,
	_user$project$Internal_Component$generalise(_user$project$Internal_GridList_Implementation$update));
var _user$project$Internal_GridList_Implementation$Config = {};

var _user$project$Internal_IconToggle_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.iconToggle;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{iconToggle: x});
		}),
	_user$project$Internal_IconToggle_Model$defaultModel);
var _user$project$Internal_IconToggle_Implementation$get = _user$project$Internal_IconToggle_Implementation$_p0._0;
var _user$project$Internal_IconToggle_Implementation$set = _user$project$Internal_IconToggle_Implementation$_p0._1;
var _user$project$Internal_IconToggle_Implementation$disabled = _user$project$Internal_Options$cs('mdc-icon-toggle--disabled');
var _user$project$Internal_IconToggle_Implementation$label = function (label) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{label: label});
		});
};
var _user$project$Internal_IconToggle_Implementation$label1 = function (value) {
	return _user$project$Internal_IconToggle_Implementation$label(
		{on: value, off: value});
};
var _user$project$Internal_IconToggle_Implementation$icon = function (icon) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{icon: icon});
		});
};
var _user$project$Internal_IconToggle_Implementation$icon1 = function (value) {
	return _user$project$Internal_IconToggle_Implementation$icon(
		{on: value, off: value});
};
var _user$project$Internal_IconToggle_Implementation$className = function (className) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					inner: _elm_lang$core$Maybe$Just(className)
				});
		});
};
var _user$project$Internal_IconToggle_Implementation$on = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{on: true});
	});
var _user$project$Internal_IconToggle_Implementation$defaultConfig = {
	on: false,
	label: {on: '', off: ''},
	icon: {on: '', off: ''},
	inner: _elm_lang$core$Maybe$Nothing
};
var _user$project$Internal_IconToggle_Implementation$iconToggle = F4(
	function (lift, model, options, _p1) {
		var ripple = A4(
			_user$project$Internal_Ripple_Implementation$view,
			true,
			function (_p2) {
				return lift(
					_user$project$Internal_IconToggle_Model$RippleMsg(_p2));
			},
			model.ripple,
			{ctor: '[]'});
		var _p3 = A2(_user$project$Internal_Options$collect, _user$project$Internal_IconToggle_Implementation$defaultConfig, options);
		var summary = _p3;
		var config = _p3.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$core$Native_Utils.eq(config.inner, _elm_lang$core$Maybe$Nothing) ? _elm_lang$html$Html$i : _elm_lang$html$Html$span,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-icon-toggle'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						_elm_lang$core$Native_Utils.eq(config.inner, _elm_lang$core$Maybe$Nothing),
						_user$project$Internal_Options$cs('material-icons')),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$aria,
							'label',
							config.on ? config.label.on : config.label.off),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Options$many(
								{
									ctor: '::',
									_0: ripple.interactionHandler,
									_1: {
										ctor: '::',
										_0: ripple.properties,
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: (!_elm_lang$core$Native_Utils.eq(config.inner, _elm_lang$core$Maybe$Nothing)) ? A3(
					_user$project$Internal_Options$styled,
					_elm_lang$html$Html$i,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs(
							A2(_elm_lang$core$Maybe$withDefault, 'material-icons', config.inner)),
						_1: {
							ctor: '::',
							_0: config.on ? _user$project$Internal_Options$cs(config.icon.on) : _user$project$Internal_Options$cs(config.icon.off),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}) : _elm_lang$html$Html$text(
					config.on ? config.icon.on : config.icon.off),
				_1: {
					ctor: '::',
					_0: ripple.style,
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_IconToggle_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_IconToggle_Implementation$get, _user$project$Internal_IconToggle_Implementation$iconToggle, _user$project$Internal_Msg$IconToggleMsg);
var _user$project$Internal_IconToggle_Implementation$update = F2(
	function (msg, model) {
		var _p4 = msg;
		var _p5 = A2(_user$project$Internal_Ripple_Implementation$update, _p4._0, model.ripple);
		var ripple = _p5._0;
		var effects = _p5._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{ripple: ripple}),
			_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Internal_IconToggle_Model$RippleMsg, effects)
		};
	});
var _user$project$Internal_IconToggle_Implementation$react = A4(
	_user$project$Internal_Component$react,
	_user$project$Internal_IconToggle_Implementation$get,
	_user$project$Internal_IconToggle_Implementation$set,
	_user$project$Internal_Msg$IconToggleMsg,
	_user$project$Internal_Component$generalise(_user$project$Internal_IconToggle_Implementation$update));
var _user$project$Internal_IconToggle_Implementation$Config = F4(
	function (a, b, c, d) {
		return {on: a, label: b, icon: c, inner: d};
	});

var _user$project$Internal_Menu_Implementation$decodeGeometry = function () {
	var menu = A3(
		_elm_lang$core$Json_Decode$map2,
		F2(
			function (offsetWidth, offsetHeight) {
				return {width: offsetWidth, height: offsetHeight};
			}),
		_debois$elm_dom$DOM$offsetWidth,
		_debois$elm_dom$DOM$offsetHeight);
	var anchor = function (_p0) {
		var _p1 = _p0;
		return _elm_lang$core$Json_Decode$succeed(
			{width: _p1.width, height: _p1.height});
	};
	var viewportDistance = F2(
		function (viewport, anchorRect) {
			return _elm_lang$core$Json_Decode$succeed(
				{top: anchorRect.top, right: (viewport.width - anchorRect.left) - anchorRect.width, left: anchorRect.left, bottom: (viewport.height - anchorRect.top) - anchorRect.height});
		});
	var viewport = _debois$elm_dom$DOM$target(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'ownerDocument',
				_1: {
					ctor: '::',
					_0: 'defaultView',
					_1: {ctor: '[]'}
				}
			},
			A3(
				_elm_lang$core$Json_Decode$map2,
				_user$project$Internal_Menu_Model$Viewport,
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'innerWidth',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$float),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'innerHeight',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$float))));
	var anchorRect = A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'parentRect',
			_1: {ctor: '[]'}
		},
		A5(
			_elm_lang$core$Json_Decode$map4,
			F4(
				function (top, left, width, height) {
					return {top: top, left: left, width: width, height: height};
				}),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'top',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'left',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'width',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'height',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float)));
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (_p2) {
			var _p3 = _p2;
			var _p5 = _p3._0;
			var _p4 = _p3._1;
			return _debois$elm_dom$DOM$target(
				A4(
					_elm_lang$core$Json_Decode$map3,
					_user$project$Internal_Menu_Model$Geometry(_p5),
					A2(viewportDistance, _p5, _p4),
					anchor(_p4),
					menu));
		},
		A3(
			_elm_lang$core$Json_Decode$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			viewport,
			anchorRect));
}();
var _user$project$Internal_Menu_Implementation$decodeKeyCode = _elm_lang$html$Html_Events$keyCode;
var _user$project$Internal_Menu_Implementation$decodeKey = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'key',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _user$project$Internal_Menu_Implementation$onSelect = function (msg) {
	var trigger = F2(
		function (key, keyCode) {
			var isEnter = _elm_lang$core$Native_Utils.eq(key, 'Enter') || _elm_lang$core$Native_Utils.eq(keyCode, 13);
			var isSpace = _elm_lang$core$Native_Utils.eq(key, 'Space') || _elm_lang$core$Native_Utils.eq(keyCode, 32);
			return (isSpace || isEnter) ? _elm_lang$core$Json_Decode$succeed(msg) : _elm_lang$core$Json_Decode$fail('');
		});
	return _user$project$Internal_Options$many(
		{
			ctor: '::',
			_0: _user$project$Internal_Options$onClick(msg),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Internal_Options$on,
					'keyup',
					A2(
						_elm_lang$core$Json_Decode$andThen,
						_elm_lang$core$Basics$identity,
						A3(_elm_lang$core$Json_Decode$map2, trigger, _user$project$Internal_Menu_Implementation$decodeKey, _user$project$Internal_Menu_Implementation$decodeKeyCode))),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Internal_Menu_Implementation$decodeMeta = A5(
	_elm_lang$core$Json_Decode$map4,
	F4(
		function (altKey, ctrlKey, metaKey, shiftKey) {
			return {altKey: altKey, ctrlKey: ctrlKey, metaKey: metaKey, shiftKey: shiftKey};
		}),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'altKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'ctrlKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'metaKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'shiftKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool));
var _user$project$Internal_Menu_Implementation$_p6 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_user$project$Internal_Menu_Model$defaultModel);
var _user$project$Internal_Menu_Implementation$get = _user$project$Internal_Menu_Implementation$_p6._0;
var _user$project$Internal_Menu_Implementation$set = _user$project$Internal_Menu_Implementation$_p6._1;
var _user$project$Internal_Menu_Implementation$menuMaxHeight = F3(
	function (_p8, corner, _p7) {
		var _p9 = _p8;
		var _p12 = _p9.anchorMargin;
		var _p10 = _p7;
		var _p11 = _p10.viewportDistance;
		var isBottomAligned = corner.bottom;
		return _p9.anchorCorner.bottom ? (isBottomAligned ? (_p11.top + _p12.top) : (_p11.bottom - _p12.bottom)) : 0;
	});
var _user$project$Internal_Menu_Implementation$verticalOffset = F3(
	function (_p13, corner, geometry) {
		var _p14 = _p13;
		var _p16 = _p14.anchorMargin;
		var avoidVerticalOverlap = _p14.anchorCorner.bottom;
		var canOverlapVertically = !avoidVerticalOverlap;
		var marginToEdge = 32;
		var isBottomAligned = corner.bottom;
		var _p15 = geometry;
		var viewport = _p15.viewport;
		var viewportDistance = _p15.viewportDistance;
		var anchor = _p15.anchor;
		var menu = _p15.menu;
		return isBottomAligned ? ((canOverlapVertically && (_elm_lang$core$Native_Utils.cmp(menu.height, viewportDistance.top + anchor.height) > 0)) ? (0 - (A2(_elm_lang$core$Basics$min, menu.height, viewport.height - marginToEdge) - (viewportDistance.top + anchor.height))) : (avoidVerticalOverlap ? (anchor.height - _p16.top) : (0 - _p16.bottom))) : ((canOverlapVertically && (_elm_lang$core$Native_Utils.cmp(menu.height, viewportDistance.bottom + anchor.height) > 0)) ? (0 - (A2(_elm_lang$core$Basics$min, menu.height, viewport.height - marginToEdge) - (viewportDistance.top + anchor.height))) : (avoidVerticalOverlap ? (anchor.height + _p16.bottom) : _p16.top));
	});
var _user$project$Internal_Menu_Implementation$horizontalOffset = F3(
	function (_p18, corner, _p17) {
		var _p19 = _p18;
		var _p22 = _p19.anchorMargin;
		var _p20 = _p17;
		var _p21 = _p20.anchor;
		var avoidHorizontalOverlap = _p19.anchorCorner.right;
		var isRightAligned = corner.right;
		return isRightAligned ? (avoidHorizontalOverlap ? (_p21.width - _p22.left) : _p22.right) : (avoidHorizontalOverlap ? (_p21.width - _p22.right) : _p22.left);
	});
var _user$project$Internal_Menu_Implementation$originCorner = F2(
	function (_p24, _p23) {
		var _p25 = _p24;
		var _p31 = _p25.anchorMargin;
		var _p30 = _p25.anchorCorner;
		var _p26 = _p23;
		var _p29 = _p26.viewportDistance;
		var _p28 = _p26.menu;
		var _p27 = _p26.anchor;
		var center = false;
		var flipRtl = false;
		var avoidHorizontalOverlap = _p30.right;
		var isFlipRtl = _p30.flipRtl;
		var isRtl = false;
		var isAlignedRight = (avoidHorizontalOverlap && (!isRtl)) || ((!avoidHorizontalOverlap) && (isFlipRtl && isRtl));
		var availableLeft = isAlignedRight ? ((_p29.left + _p27.width) + _p31.right) : (_p29.left + _p31.left);
		var leftOverflow = _p28.width - availableLeft;
		var availableRight = isAlignedRight ? (_p29.right - _p31.right) : ((_p29.right + _p27.width) - _p31.left);
		var rightOverflow = _p28.width - availableRight;
		var right = ((_elm_lang$core$Native_Utils.cmp(leftOverflow, 0) < 0) && (isAlignedRight && isRtl)) || ((avoidHorizontalOverlap && ((!isAlignedRight) && (_elm_lang$core$Native_Utils.cmp(leftOverflow, 0) < 0))) || ((_elm_lang$core$Native_Utils.cmp(rightOverflow, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(leftOverflow, rightOverflow) < 0)));
		var isBottomAligned = _p30.bottom;
		var availableTop = isBottomAligned ? ((_p29.top + _p27.height) + _p31.bottom) : (_p29.top + _p31.top);
		var topOverflow = _p28.height - availableTop;
		var availableBottom = isBottomAligned ? (_p29.bottom - _p31.bottom) : ((_p29.bottom + _p27.height) + _p31.top);
		var bottomOverflow = _p28.height - availableBottom;
		var bottom = (_elm_lang$core$Native_Utils.cmp(bottomOverflow, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(topOverflow, bottomOverflow) < 0);
		return {bottom: bottom, center: center, right: right, flipRtl: flipRtl};
	});
var _user$project$Internal_Menu_Implementation$autoPosition = F2(
	function (config, geometry) {
		var _p32 = config;
		var anchorCorner = _p32.anchorCorner;
		var _p33 = geometry;
		var anchor = _p33.anchor;
		var menu = _p33.menu;
		var corner = A2(_user$project$Internal_Menu_Implementation$originCorner, config, geometry);
		var maxMenuHeight = A3(_user$project$Internal_Menu_Implementation$menuMaxHeight, config, corner, geometry);
		var verticalAlignment = corner.bottom ? 'bottom' : 'top';
		var horizontalAlignment = corner.right ? 'right' : 'left';
		var horizontalAlignment_ = (_elm_lang$core$Native_Utils.cmp(anchor.width / menu.width, 0.67) > 0) ? 'center' : horizontalAlignment;
		var horizontalOffset_ = A3(_user$project$Internal_Menu_Implementation$horizontalOffset, config, corner, geometry);
		var verticalOffset_ = A3(_user$project$Internal_Menu_Implementation$verticalOffset, config, corner, geometry);
		var position = {
			top: _elm_lang$core$Native_Utils.eq(verticalAlignment, 'top') ? _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(verticalOffset_),
					'px')) : _elm_lang$core$Maybe$Nothing,
			left: _elm_lang$core$Native_Utils.eq(horizontalAlignment, 'left') ? _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(horizontalOffset_),
					'px')) : _elm_lang$core$Maybe$Nothing,
			bottom: _elm_lang$core$Native_Utils.eq(verticalAlignment, 'bottom') ? _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(verticalOffset_),
					'px')) : _elm_lang$core$Maybe$Nothing,
			right: _elm_lang$core$Native_Utils.eq(horizontalAlignment, 'right') ? _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(horizontalOffset_),
					'px')) : _elm_lang$core$Maybe$Nothing
		};
		var verticalAlignment_ = function () {
			if ((!anchorCorner.bottom) && (_elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$Basics$abs(verticalOffset_ / menu.height),
				0.1) > 0)) {
				var verticalOffsetPercent = _elm_lang$core$Basics$abs(verticalOffset_ / menu.height) * 100;
				var originPercent = corner.bottom ? (100 - verticalOffsetPercent) : verticalOffsetPercent;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						_elm_lang$core$Basics$toFloat(
							_elm_lang$core$Basics$round(originPercent * 100)) / 100),
					'%');
			} else {
				return verticalAlignment;
			}
		}();
		return {
			transformOrigin: A2(
				_elm_lang$core$Basics_ops['++'],
				horizontalAlignment_,
				A2(_elm_lang$core$Basics_ops['++'], ' ', verticalAlignment)),
			position: position,
			maxHeight: (!_elm_lang$core$Native_Utils.eq(maxMenuHeight, 0)) ? A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(maxMenuHeight),
				'px') : ''
		};
	});
var _user$project$Internal_Menu_Implementation$bottomEndCorner = {bottom: true, center: false, right: true, flipRtl: true};
var _user$project$Internal_Menu_Implementation$bottomStartCorner = {bottom: true, center: false, right: false, flipRtl: true};
var _user$project$Internal_Menu_Implementation$topEndCorner = {bottom: false, center: false, right: true, flipRtl: true};
var _user$project$Internal_Menu_Implementation$topStartCorner = {bottom: false, center: false, right: false, flipRtl: true};
var _user$project$Internal_Menu_Implementation$bottomRightCorner = {bottom: true, center: false, right: true, flipRtl: false};
var _user$project$Internal_Menu_Implementation$bottomLeftCorner = {bottom: true, center: false, right: false, flipRtl: false};
var _user$project$Internal_Menu_Implementation$topRightCorner = {bottom: false, center: false, right: true, flipRtl: false};
var _user$project$Internal_Menu_Implementation$topLeftCorner = {bottom: false, center: false, right: false, flipRtl: false};
var _user$project$Internal_Menu_Implementation$quickOpen = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{quickOpen: true});
	});
var _user$project$Internal_Menu_Implementation$anchorMargin = function (anchorMargin) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{anchorMargin: anchorMargin});
		});
};
var _user$project$Internal_Menu_Implementation$anchorCorner = function (anchorCorner) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{anchorCorner: anchorCorner});
		});
};
var _user$project$Internal_Menu_Implementation$index = function (index) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					index: _elm_lang$core$Maybe$Just(index)
				});
		});
};
var _user$project$Internal_Menu_Implementation$defaultMargin = {top: 0, left: 0, bottom: 0, right: 0};
var _user$project$Internal_Menu_Implementation$defaultConfig = {index: _elm_lang$core$Maybe$Nothing, open: false, anchorCorner: _user$project$Internal_Menu_Implementation$topLeftCorner, anchorMargin: _user$project$Internal_Menu_Implementation$defaultMargin, quickOpen: false};
var _user$project$Internal_Menu_Implementation$menu = F4(
	function (lift, model, options, ul) {
		var numItems = _elm_lang$core$List$length(
			A2(
				_elm_lang$core$List$filter,
				function (_p34) {
					return !function (_) {
						return _.divider;
					}(_p34);
				},
				ul.items));
		var numDividersBeforeIndex = function (i) {
			return _elm_lang$core$List$length(
				A2(
					_elm_lang$core$List$filter,
					function (_) {
						return _.divider;
					},
					A2(_elm_lang$core$List$take, i + 1, ul.items)));
		};
		var focusedItemAtIndex = model.focusedItemAtIndex;
		var preventDefaultOnKeyDown = F3(
			function (_p35, key, keyCode) {
				var _p36 = _p35;
				var lastItemIndex = numItems - 1;
				var isSpace = _elm_lang$core$Native_Utils.eq(key, 'Space') || _elm_lang$core$Native_Utils.eq(keyCode, 32);
				var isArrowDown = _elm_lang$core$Native_Utils.eq(key, 'ArrowDown') || _elm_lang$core$Native_Utils.eq(keyCode, 40);
				var isArrowUp = _elm_lang$core$Native_Utils.eq(key, 'ArrowUp') || _elm_lang$core$Native_Utils.eq(keyCode, 38);
				var isTab = _elm_lang$core$Native_Utils.eq(key, 'Tab') || _elm_lang$core$Native_Utils.eq(keyCode, 9);
				return (_p36.altKey || (_p36.ctrlKey || _p36.metaKey)) ? _elm_lang$core$Json_Decode$fail('') : ((_p36.shiftKey && (isTab && _elm_lang$core$Native_Utils.eq(
					A2(_elm_lang$core$Maybe$withDefault, 0, focusedItemAtIndex),
					lastItemIndex))) ? _elm_lang$core$Json_Decode$succeed(
					lift(_user$project$Internal_Menu_Model$NoOp)) : ((isArrowUp || (isArrowDown || isSpace)) ? _elm_lang$core$Json_Decode$succeed(
					lift(_user$project$Internal_Menu_Model$NoOp)) : _elm_lang$core$Json_Decode$fail('')));
			});
		var isOpen = model.animating ? (model.open && (!_elm_lang$core$Native_Utils.eq(model.geometry, _elm_lang$core$Maybe$Nothing))) : model.open;
		var geometry = A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Menu_Model$defaultGeometry, model.geometry);
		var _p37 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Menu_Implementation$defaultConfig, options);
		var summary = _p37;
		var config = _p37.config;
		var _p38 = A2(_user$project$Internal_Menu_Implementation$autoPosition, config, geometry);
		var position = _p38.position;
		var transformOrigin = _p38.transformOrigin;
		var maxHeight = _p38.maxHeight;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-menu'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						model.animating && (!A2(_elm_lang$core$Maybe$withDefault, false, model.quickOpen)),
						model.open ? _user$project$Internal_Options$cs('mdc-menu--animating-open') : _user$project$Internal_Options$cs('mdc-menu--animating-closed')),
					_1: {
						ctor: '::',
						_0: function (_p39) {
							return A2(
								_user$project$Internal_Options$when,
								isOpen,
								_user$project$Internal_Options$many(_p39));
						}(
							{
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-menu--open'),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Internal_Options$data, 'focustrap', ''),
									_1: {
										ctor: '::',
										_0: A3(
											_user$project$Internal_Options$onWithOptions,
											'click',
											{stopPropagation: true, preventDefault: false},
											_elm_lang$core$Json_Decode$succeed(
												lift(_user$project$Internal_Menu_Model$CloseDelayed))),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: function (_p40) {
								return A2(
									_user$project$Internal_Options$when,
									isOpen || model.animating,
									_user$project$Internal_Options$many(_p40));
							}(
								{
									ctor: '::',
									_0: A2(_user$project$Internal_Options$css, 'position', 'absolute'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Internal_Options$css, 'transform-origin', transformOrigin),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$when,
												!_elm_lang$core$Native_Utils.eq(position.top, _elm_lang$core$Maybe$Nothing),
												A2(
													_user$project$Internal_Options$css,
													'top',
													A2(_elm_lang$core$Maybe$withDefault, '', position.top))),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Options$when,
													!_elm_lang$core$Native_Utils.eq(position.left, _elm_lang$core$Maybe$Nothing),
													A2(
														_user$project$Internal_Options$css,
														'left',
														A2(_elm_lang$core$Maybe$withDefault, '', position.left))),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$Internal_Options$when,
														!_elm_lang$core$Native_Utils.eq(position.bottom, _elm_lang$core$Maybe$Nothing),
														A2(
															_user$project$Internal_Options$css,
															'bottom',
															A2(_elm_lang$core$Maybe$withDefault, '', position.bottom))),
													_1: {
														ctor: '::',
														_0: A2(
															_user$project$Internal_Options$when,
															!_elm_lang$core$Native_Utils.eq(position.right, _elm_lang$core$Maybe$Nothing),
															A2(
																_user$project$Internal_Options$css,
																'right',
																A2(_elm_lang$core$Maybe$withDefault, '', position.right))),
														_1: {
															ctor: '::',
															_0: A2(_user$project$Internal_Options$css, 'max-height', maxHeight),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									model.animating && _elm_lang$core$Native_Utils.eq(model.geometry, _elm_lang$core$Maybe$Nothing),
									A2(
										_user$project$Internal_GlobalEvents$onTickWith,
										{targetRect: false, parentRect: true},
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p41) {
												return lift(
													A2(
														_user$project$Internal_Menu_Model$Init,
														{quickOpen: config.quickOpen, index: config.index},
														_p41));
											},
											_user$project$Internal_Menu_Implementation$decodeGeometry))),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$on,
										'keyup',
										A2(
											_elm_lang$core$Json_Decode$map,
											lift,
											A4(_elm_lang$core$Json_Decode$map3, _user$project$Internal_Menu_Model$KeyUp, _user$project$Internal_Menu_Implementation$decodeMeta, _user$project$Internal_Menu_Implementation$decodeKey, _user$project$Internal_Menu_Implementation$decodeKeyCode))),
									_1: {
										ctor: '::',
										_0: function () {
											var numItems = _elm_lang$core$List$length(
												A2(
													_elm_lang$core$List$filter,
													function (_p42) {
														return !function (_) {
															return _.divider;
														}(_p42);
													},
													ul.items));
											return A2(
												_user$project$Internal_Options$on,
												'keydown',
												A2(
													_elm_lang$core$Json_Decode$map,
													lift,
													A4(
														_elm_lang$core$Json_Decode$map3,
														_user$project$Internal_Menu_Model$KeyDown(numItems),
														_user$project$Internal_Menu_Implementation$decodeMeta,
														_user$project$Internal_Menu_Implementation$decodeKey,
														_user$project$Internal_Menu_Implementation$decodeKeyCode)));
										}(),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_user$project$Internal_List_Implementation$ul,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-menu__items'),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$onWithOptions,
								'keydown',
								{stopPropagation: false, preventDefault: true},
								A2(
									_elm_lang$core$Json_Decode$andThen,
									_elm_lang$core$Basics$identity,
									A4(_elm_lang$core$Json_Decode$map3, preventDefaultOnKeyDown, _user$project$Internal_Menu_Implementation$decodeMeta, _user$project$Internal_Menu_Implementation$decodeKey, _user$project$Internal_Menu_Implementation$decodeKeyCode))),
							_1: ul.options
						}
					},
					A2(
						_elm_lang$core$List$indexedMap,
						F2(
							function (i, item) {
								var summary = function (summary) {
									if (!model.keyDownWithinMenu) {
										var dispatch = function (_p43) {
											var _p44 = _p43;
											return _user$project$Internal_Dispatch_Internal$Config(
												_elm_lang$core$Native_Utils.update(
													_p44._0,
													{
														decoders: A2(
															_elm_lang$core$List$filter,
															function (_p45) {
																return A2(
																	F2(
																		function (x, y) {
																			return !_elm_lang$core$Native_Utils.eq(x, y);
																		}),
																	'keyup',
																	_elm_lang$core$Tuple$first(_p45));
															},
															_p44._0.decoders)
													}));
										}(summary.dispatch);
										return _elm_lang$core$Native_Utils.update(
											summary,
											{dispatch: dispatch});
									} else {
										return summary;
									}
								}(
									A2(_user$project$Internal_Options$collect, _user$project$Internal_List_Implementation$defaultConfig, item.options));
								var focusIndex = i - numDividersBeforeIndex(i);
								var hasFocus = _elm_lang$core$Native_Utils.eq(
									_elm_lang$core$Maybe$Just(focusIndex),
									focusedItemAtIndex);
								var autoFocus = (hasFocus && model.open) ? A2(_user$project$Internal_Options$data, 'autofocus', '') : _user$project$Internal_Options$nop;
								return item.divider ? A5(
									_user$project$Internal_Options$apply,
									summary,
									_elm_lang$html$Html$hr,
									{
										ctor: '::',
										_0: _user$project$Internal_Options$cs('mdc-list-divider'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'},
									item.childs) : A5(
									_user$project$Internal_Options$apply,
									summary,
									_elm_lang$html$Html$li,
									{
										ctor: '::',
										_0: _user$project$Internal_Options$cs('mdc-list-item'),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Options$attribute(
												A2(_elm_lang$html$Html_Attributes$attribute, 'tabindex', '0')),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Options$on,
													'focus',
													_elm_lang$core$Json_Decode$succeed(
														lift(
															_user$project$Internal_Menu_Model$SetFocus(focusIndex)))),
												_1: {
													ctor: '::',
													_0: autoFocus,
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{ctor: '[]'},
									item.childs);
							}),
						ul.items)),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Menu_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Menu_Implementation$get, _user$project$Internal_Menu_Implementation$menu, _user$project$Internal_Msg$MenuMsg);
var _user$project$Internal_Menu_Implementation$update = F3(
	function (lift, msg, model) {
		update:
		while (true) {
			var _p46 = msg;
			switch (_p46.ctor) {
				case 'NoOp':
					return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
				case 'Toggle':
					var _v12 = lift,
						_v13 = model.open ? _user$project$Internal_Menu_Model$Close : _user$project$Internal_Menu_Model$Open,
						_v14 = model;
					lift = _v12;
					msg = _v13;
					model = _v14;
					continue update;
				case 'Open':
					var quickOpen = A2(_elm_lang$core$Maybe$withDefault, false, model.quickOpen);
					return (!model.open) ? {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{open: true, animating: true, geometry: _elm_lang$core$Maybe$Nothing})),
						_1: (!quickOpen) ? A2(
							_user$project$Internal_Helpers$delayedCmd,
							120 * _elm_lang$core$Time$millisecond,
							lift(_user$project$Internal_Menu_Model$AnimationEnd)) : _user$project$Internal_Helpers$cmd(
							lift(_user$project$Internal_Menu_Model$AnimationEnd))
					} : {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
				case 'Close':
					var quickOpen = A2(_elm_lang$core$Maybe$withDefault, false, model.quickOpen);
					return model.open ? {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{open: false, animating: true, quickOpen: _elm_lang$core$Maybe$Nothing, focusedItemAtIndex: _elm_lang$core$Maybe$Nothing})),
						_1: (!quickOpen) ? A2(
							_user$project$Internal_Helpers$delayedCmd,
							70 * _elm_lang$core$Time$millisecond,
							lift(_user$project$Internal_Menu_Model$AnimationEnd)) : _user$project$Internal_Helpers$cmd(
							lift(_user$project$Internal_Menu_Model$AnimationEnd))
					} : {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
				case 'CloseDelayed':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Nothing,
						_1: A2(
							_user$project$Internal_Helpers$delayedCmd,
							50 * _elm_lang$core$Time$millisecond,
							lift(_user$project$Internal_Menu_Model$Close))
					};
				case 'Init':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									geometry: _elm_lang$core$Maybe$Just(_p46._1),
									quickOpen: _elm_lang$core$Maybe$Just(_p46._0.quickOpen),
									focusedItemAtIndex: _p46._0.index
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'AnimationEnd':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{animating: false})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'DocumentClick':
					var _v15 = lift,
						_v16 = _user$project$Internal_Menu_Model$Close,
						_v17 = model;
					lift = _v15;
					msg = _v16;
					model = _v17;
					continue update;
				case 'KeyDown':
					var _p48 = _p46._3;
					var _p47 = _p46._2;
					var focusedItemIndex = A2(_elm_lang$core$Maybe$withDefault, 0, model.focusedItemAtIndex);
					var lastItemIndex = _p46._0 - 1;
					var isEnter = _elm_lang$core$Native_Utils.eq(_p47, 'Enter') || _elm_lang$core$Native_Utils.eq(_p48, 13);
					var isSpace = _elm_lang$core$Native_Utils.eq(_p47, 'Space') || _elm_lang$core$Native_Utils.eq(_p48, 32);
					var keyDownWithinMenu = isEnter || isSpace;
					var isArrowDown = _elm_lang$core$Native_Utils.eq(_p47, 'ArrowDown') || _elm_lang$core$Native_Utils.eq(_p48, 40);
					var isArrowUp = _elm_lang$core$Native_Utils.eq(_p47, 'ArrowUp') || _elm_lang$core$Native_Utils.eq(_p48, 38);
					var isTab = _elm_lang$core$Native_Utils.eq(_p47, 'Tab') || _elm_lang$core$Native_Utils.eq(_p48, 9);
					return A2(
						_elm_lang$core$Tuple$mapFirst,
						_elm_lang$core$Maybe$map(
							function (model) {
								return _elm_lang$core$Native_Utils.update(
									model,
									{keyDownWithinMenu: keyDownWithinMenu});
							}),
						(_p46._1.altKey || (_p46._1.ctrlKey || _p46._1.metaKey)) ? {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none} : (isArrowUp ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$core$Native_Utils.eq(focusedItemIndex, 0) ? _elm_lang$core$Native_Utils.update(
									model,
									{
										focusedItemAtIndex: _elm_lang$core$Maybe$Just(lastItemIndex)
									}) : _elm_lang$core$Native_Utils.update(
									model,
									{
										focusedItemAtIndex: _elm_lang$core$Maybe$Just(focusedItemIndex - 1)
									})),
							_1: _elm_lang$core$Platform_Cmd$none
						} : (isArrowDown ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$core$Native_Utils.eq(focusedItemIndex, lastItemIndex) ? _elm_lang$core$Native_Utils.update(
									model,
									{
										focusedItemAtIndex: _elm_lang$core$Maybe$Just(0)
									}) : _elm_lang$core$Native_Utils.update(
									model,
									{
										focusedItemAtIndex: _elm_lang$core$Maybe$Just(focusedItemIndex + 1)
									})),
							_1: _elm_lang$core$Platform_Cmd$none
						} : ((isSpace || isEnter) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Just(model),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none}))));
				case 'KeyUp':
					var _p50 = _p46._2;
					var _p49 = _p46._1;
					var isEnter = _elm_lang$core$Native_Utils.eq(_p49, 'Enter') || _elm_lang$core$Native_Utils.eq(_p50, 13);
					var isSpace = _elm_lang$core$Native_Utils.eq(_p49, 'Space') || _elm_lang$core$Native_Utils.eq(_p50, 32);
					var isEscape = _elm_lang$core$Native_Utils.eq(_p49, 'Escape') || _elm_lang$core$Native_Utils.eq(_p50, 27);
					return A2(
						_elm_lang$core$Tuple$mapFirst,
						_elm_lang$core$Maybe$map(
							function (model) {
								return ((isEnter || isSpace) && model.keyDownWithinMenu) ? _elm_lang$core$Native_Utils.update(
									model,
									{keyDownWithinMenu: false}) : model;
							}),
						(_p46._0.altKey || (_p46._0.ctrlKey || _p46._0.metaKey)) ? {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none} : ((isEscape || ((isSpace || isEnter) && model.keyDownWithinMenu)) ? A3(_user$project$Internal_Menu_Implementation$update, lift, _user$project$Internal_Menu_Model$Close, model) : {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none}));
				default:
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									focusedItemAtIndex: _elm_lang$core$Maybe$Just(_p46._0)
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
			}
		}
	});
var _user$project$Internal_Menu_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Menu_Implementation$get, _user$project$Internal_Menu_Implementation$set, _user$project$Internal_Msg$MenuMsg, _user$project$Internal_Menu_Implementation$update);
var _user$project$Internal_Menu_Implementation$connect = function (lift) {
	return _user$project$Internal_Options$onClick(
		lift(_user$project$Internal_Menu_Model$Toggle));
};
var _user$project$Internal_Menu_Implementation$attach = F2(
	function (lift, idx) {
		return _user$project$Internal_Options$onClick(
			lift(
				A2(_user$project$Internal_Msg$MenuMsg, idx, _user$project$Internal_Menu_Model$Toggle)));
	});
var _user$project$Internal_Menu_Implementation$ul = F2(
	function (options, items) {
		return {options: options, items: items};
	});
var _user$project$Internal_Menu_Implementation$divider = F2(
	function (options, childs) {
		return {options: options, childs: childs, divider: true};
	});
var _user$project$Internal_Menu_Implementation$li = F2(
	function (options, childs) {
		return {options: options, childs: childs, divider: false};
	});
var _user$project$Internal_Menu_Implementation$subscriptions = function (model) {
	return (model.open && (!_elm_lang$core$Native_Utils.eq(model.geometry, _elm_lang$core$Maybe$Nothing))) ? _elm_lang$mouse$Mouse$clicks(
		function (_p51) {
			return _user$project$Internal_Menu_Model$DocumentClick;
		}) : _elm_lang$core$Platform_Sub$none;
};
var _user$project$Internal_Menu_Implementation$subs = A3(
	_user$project$Internal_Component$subs,
	_user$project$Internal_Msg$MenuMsg,
	function (_) {
		return _.menu;
	},
	_user$project$Internal_Menu_Implementation$subscriptions);
var _user$project$Internal_Menu_Implementation$Item = F3(
	function (a, b, c) {
		return {options: a, childs: b, divider: c};
	});
var _user$project$Internal_Menu_Implementation$Menu = F2(
	function (a, b) {
		return {options: a, items: b};
	});
var _user$project$Internal_Menu_Implementation$Config = F5(
	function (a, b, c, d, e) {
		return {index: a, open: b, anchorCorner: c, anchorMargin: d, quickOpen: e};
	});
var _user$project$Internal_Menu_Implementation$Margin = F4(
	function (a, b, c, d) {
		return {top: a, left: b, bottom: c, right: d};
	});
var _user$project$Internal_Menu_Implementation$Corner = F4(
	function (a, b, c, d) {
		return {bottom: a, center: b, right: c, flipRtl: d};
	});

var _user$project$Internal_RadioButton_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.radio;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{radio: x});
		}),
	_user$project$Internal_RadioButton_Model$defaultModel);
var _user$project$Internal_RadioButton_Implementation$get = _user$project$Internal_RadioButton_Implementation$_p0._0;
var _user$project$Internal_RadioButton_Implementation$set = _user$project$Internal_RadioButton_Implementation$_p0._1;
var _user$project$Internal_RadioButton_Implementation$nativeControl = _user$project$Internal_Options$nativeControl;
var _user$project$Internal_RadioButton_Implementation$selected = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{value: true});
	});
var _user$project$Internal_RadioButton_Implementation$disabled = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _user$project$Internal_RadioButton_Implementation$defaultConfig = {
	value: false,
	disabled: false,
	nativeControl: {ctor: '[]'},
	id_: ''
};
var _user$project$Internal_RadioButton_Implementation$radioButton = F4(
	function (lift, model, options, _p1) {
		var preventDefault = {preventDefault: true, stopPropagation: false};
		var ripple = A4(
			_user$project$Internal_Ripple_Implementation$view,
			true,
			function (_p2) {
				return lift(
					_user$project$Internal_RadioButton_Model$RippleMsg(_p2));
			},
			model.ripple,
			{ctor: '[]'});
		var _p3 = A2(_user$project$Internal_Options$collect, _user$project$Internal_RadioButton_Implementation$defaultConfig, options);
		var summary = _p3;
		var config = _p3.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-radio'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$many(
						{
							ctor: '::',
							_0: ripple.interactionHandler,
							_1: {
								ctor: '::',
								_0: ripple.properties,
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A4(
					_user$project$Internal_Options$applyNativeControl,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-radio__native-control'),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Options$id(config.id_),
							_1: {
								ctor: '::',
								_0: _user$project$Internal_Options$attribute(
									_elm_lang$html$Html_Attributes$type_('radio')),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_Options$attribute(
										_elm_lang$html$Html_Attributes$checked(config.value)),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$onFocus(
											lift(
												_user$project$Internal_RadioButton_Model$SetFocus(true))),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Options$onBlur(
												lift(
													_user$project$Internal_RadioButton_Model$SetFocus(false))),
											_1: {
												ctor: '::',
												_0: A3(
													_user$project$Internal_Options$onWithOptions,
													'click',
													preventDefault,
													_elm_lang$core$Json_Decode$succeed(
														lift(_user$project$Internal_RadioButton_Model$NoOp))),
												_1: {
													ctor: '::',
													_0: function (_p4) {
														return A2(
															_user$project$Internal_Options$when,
															config.disabled,
															_user$project$Internal_Options$many(_p4));
													}(
														{
															ctor: '::',
															_0: _user$project$Internal_Options$cs('mdc-radio--disabled'),
															_1: {
																ctor: '::',
																_0: _user$project$Internal_Options$attribute(
																	_elm_lang$html$Html_Attributes$disabled(true)),
																_1: {ctor: '[]'}
															}
														}),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_user$project$Internal_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _user$project$Internal_Options$cs('mdc-radio__background'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-radio__inner-circle'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A3(
									_user$project$Internal_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _user$project$Internal_Options$cs('mdc-radio__outer-circle'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: ripple.style,
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Internal_RadioButton_Implementation$view = F4(
	function (lift, index, store, options) {
		return A7(
			_user$project$Internal_Component$render,
			_user$project$Internal_RadioButton_Implementation$get,
			_user$project$Internal_RadioButton_Implementation$radioButton,
			_user$project$Internal_Msg$RadioButtonMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$id_(index),
				_1: options
			});
	});
var _user$project$Internal_RadioButton_Implementation$update = F3(
	function (lift, msg, model) {
		var _p5 = msg;
		switch (_p5.ctor) {
			case 'RippleMsg':
				var _p6 = A2(_user$project$Internal_Ripple_Implementation$update, _p5._0, model.ripple);
				var ripple = _p6._0;
				var effects = _p6._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{ripple: ripple})),
					_1: A2(
						_elm_lang$core$Platform_Cmd$map,
						function (_p7) {
							return lift(
								_user$project$Internal_RadioButton_Model$RippleMsg(_p7));
						},
						effects)
				};
			case 'NoOp':
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{isFocused: _p5._0})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Internal_RadioButton_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_RadioButton_Implementation$get, _user$project$Internal_RadioButton_Implementation$set, _user$project$Internal_Msg$RadioButtonMsg, _user$project$Internal_RadioButton_Implementation$update);
var _user$project$Internal_RadioButton_Implementation$Config = F4(
	function (a, b, c, d) {
		return {value: a, disabled: b, nativeControl: c, id_: d};
	});

var _user$project$Internal_Select_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.select;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{select: x});
		}),
	_user$project$Internal_Select_Model$defaultModel);
var _user$project$Internal_Select_Implementation$get = _user$project$Internal_Select_Implementation$_p0._0;
var _user$project$Internal_Select_Implementation$set = _user$project$Internal_Select_Implementation$_p0._1;
var _user$project$Internal_Select_Implementation$selected = _user$project$Internal_Options$attribute(
	_elm_lang$html$Html_Attributes$selected(true));
var _user$project$Internal_Select_Implementation$value = function (_p1) {
	return _user$project$Internal_Options$attribute(
		_elm_lang$html$Html_Attributes$value(_p1));
};
var _user$project$Internal_Select_Implementation$option = _user$project$Internal_Options$styled(_elm_lang$html$Html$option);
var _user$project$Internal_Select_Implementation$box = _user$project$Internal_Options$cs('mdc-select--box');
var _user$project$Internal_Select_Implementation$disabled = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _user$project$Internal_Select_Implementation$preselected = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{preselected: true});
	});
var _user$project$Internal_Select_Implementation$label = function (_p2) {
	return _user$project$Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{label: value});
			})(_p2));
};
var _user$project$Internal_Select_Implementation$defaultConfig = {label: '', box: false, disabled: false, preselected: false, id_: ''};
var _user$project$Internal_Select_Implementation$select = F4(
	function (lift, model, options, items_) {
		var isDirty = model.isDirty;
		var _p3 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Select_Implementation$defaultConfig, options);
		var summary = _p3;
		var config = _p3.config;
		var focused = model.focused && (!config.disabled);
		var items = config.preselected ? items_ : {
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$option,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$value(''),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$disabled(true),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$selected(true),
							_1: {ctor: '[]'}
						}
					}
				},
				{ctor: '[]'}),
			_1: items_
		};
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-select'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						config.disabled,
						_user$project$Internal_Options$cs('mdc-select--disabled')),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Options$role('listbox'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$tabindex(0),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(
					_user$project$Internal_Options$styled,
					_elm_lang$html$Html$select,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-select__native-control'),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Options$id(config.id_),
							_1: {
								ctor: '::',
								_0: _user$project$Internal_Options$onFocus(
									lift(_user$project$Internal_Select_Model$Focus)),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_Options$onBlur(
										lift(_user$project$Internal_Select_Model$Blur)),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$onChange(
											function (_p4) {
												return lift(
													_user$project$Internal_Select_Model$Change(_p4));
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$when,
												config.disabled,
												_user$project$Internal_Options$attribute(
													_elm_lang$html$Html_Attributes$disabled(true))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					items),
				_1: {
					ctor: '::',
					_0: A3(
						_user$project$Internal_Options$styled,
						_elm_lang$html$Html$label,
						{
							ctor: '::',
							_0: _user$project$Internal_Options$cs('mdc-floating-label'),
							_1: {
								ctor: '::',
								_0: _user$project$Internal_Options$for(config.id_),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										focused || (isDirty || config.preselected),
										_user$project$Internal_Options$cs('mdc-floating-label--float-above')),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(config.label),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_user$project$Internal_Options$styled,
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-line-ripple'),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										focused,
										_user$project$Internal_Options$cs('mdc-line-ripple--active')),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Internal_Select_Implementation$view = F4(
	function (lift, index, store, options) {
		return A7(
			_user$project$Internal_Component$render,
			_user$project$Internal_Select_Implementation$get,
			_user$project$Internal_Select_Implementation$select,
			_user$project$Internal_Msg$SelectMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$id_(index),
				_1: options
			});
	});
var _user$project$Internal_Select_Implementation$update = F3(
	function (lift, msg, model) {
		var _p5 = msg;
		switch (_p5.ctor) {
			case 'Change':
				var dirty = !_elm_lang$core$Native_Utils.eq(_p5._0, '');
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{isDirty: dirty})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Blur':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{focused: false})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Focus':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{focused: true})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				var _p6 = A2(_user$project$Internal_Ripple_Implementation$update, _p5._0, model.ripple);
				var ripple = _p6._0;
				var effects = _p6._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{ripple: ripple})),
					_1: A2(
						_elm_lang$core$Platform_Cmd$map,
						function (_p7) {
							return lift(
								_user$project$Internal_Select_Model$RippleMsg(_p7));
						},
						effects)
				};
		}
	});
var _user$project$Internal_Select_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Select_Implementation$get, _user$project$Internal_Select_Implementation$set, _user$project$Internal_Msg$SelectMsg, _user$project$Internal_Select_Implementation$update);
var _user$project$Internal_Select_Implementation$Config = F5(
	function (a, b, c, d, e) {
		return {label: a, box: b, disabled: c, preselected: d, id_: e};
	});

var _user$project$Internal_Slider_Implementation$trackMarkers = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{trackMarkers: true});
	});
var _user$project$Internal_Slider_Implementation$step = function (_p0) {
	return _user$project$Internal_Options$option(
		F2(
			function (step, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{step: step});
			})(_p0));
};
var _user$project$Internal_Slider_Implementation$onInput = function (_p1) {
	return _user$project$Internal_Options$option(
		F2(
			function (decoder, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						onInput: _elm_lang$core$Maybe$Just(decoder)
					});
			})(_p1));
};
var _user$project$Internal_Slider_Implementation$onChange = function (_p2) {
	return _user$project$Internal_Options$option(
		F2(
			function (decoder, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						onChange: _elm_lang$core$Maybe$Just(decoder)
					});
			})(_p2));
};
var _user$project$Internal_Slider_Implementation$hasClass = function ($class) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		function (className) {
			return A2(
				_elm_lang$core$String$contains,
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					A2(_elm_lang$core$Basics_ops['++'], $class, ' ')),
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					A2(_elm_lang$core$Basics_ops['++'], className, ' ')));
		},
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'className',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$string));
};
var _user$project$Internal_Slider_Implementation$data = F2(
	function (key, decoder) {
		return A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'dataset',
				_1: {
					ctor: '::',
					_0: key,
					_1: {ctor: '[]'}
				}
			},
			decoder);
	});
var _user$project$Internal_Slider_Implementation$decodeGeometry = function () {
	var traverseToContainer = function (decoder) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (doesHaveClass) {
				return doesHaveClass ? decoder : _debois$elm_dom$DOM$parentElement(
					_elm_lang$core$Json_Decode$lazy(
						function (_p3) {
							return traverseToContainer(decoder);
						}));
			},
			_user$project$Internal_Slider_Implementation$hasClass('mdc-slider'));
	};
	return _debois$elm_dom$DOM$target(
		traverseToContainer(
			A7(
				_elm_lang$core$Json_Decode$map6,
				F6(
					function (offsetWidth, offsetLeft, discrete, min, max, step) {
						return {
							rect: {width: offsetWidth, left: offsetLeft},
							discrete: discrete,
							min: min,
							max: max,
							step: step
						};
					}),
				_debois$elm_dom$DOM$offsetWidth,
				_debois$elm_dom$DOM$offsetLeft,
				_user$project$Internal_Slider_Implementation$hasClass('mdc-slider--discrete'),
				A2(
					_user$project$Internal_Slider_Implementation$data,
					'min',
					A2(
						_elm_lang$core$Json_Decode$map,
						function (_p4) {
							return A2(
								_elm_lang$core$Result$withDefault,
								1,
								_elm_lang$core$String$toFloat(_p4));
						},
						_elm_lang$core$Json_Decode$string)),
				A2(
					_user$project$Internal_Slider_Implementation$data,
					'max',
					A2(
						_elm_lang$core$Json_Decode$map,
						function (_p5) {
							return A2(
								_elm_lang$core$Result$withDefault,
								1,
								_elm_lang$core$String$toFloat(_p5));
						},
						_elm_lang$core$Json_Decode$string)),
				_elm_lang$core$Json_Decode$oneOf(
					{
						ctor: '::',
						_0: A2(
							_user$project$Internal_Slider_Implementation$data,
							'step',
							A2(
								_elm_lang$core$Json_Decode$map,
								function (_p6) {
									return _elm_lang$core$Result$toMaybe(
										_elm_lang$core$String$toFloat(_p6));
								},
								_elm_lang$core$Json_Decode$string)),
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing),
							_1: {ctor: '[]'}
						}
					}))));
}();
var _user$project$Internal_Slider_Implementation$decodePageX = A2(
	_elm_lang$core$Json_Decode$map,
	function (pageX) {
		return {pageX: pageX};
	},
	_elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'targetTouches',
					_1: {
						ctor: '::',
						_0: '0',
						_1: {
							ctor: '::',
							_0: 'pageX',
							_1: {ctor: '[]'}
						}
					}
				},
				_elm_lang$core$Json_Decode$float),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'changedTouches',
						_1: {
							ctor: '::',
							_0: '0',
							_1: {
								ctor: '::',
								_0: 'pageX',
								_1: {ctor: '[]'}
							}
						}
					},
					_elm_lang$core$Json_Decode$float),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Json_Decode$at,
						{
							ctor: '::',
							_0: 'pageX',
							_1: {ctor: '[]'}
						},
						_elm_lang$core$Json_Decode$float),
					_1: {ctor: '[]'}
				}
			}
		}));
var _user$project$Internal_Slider_Implementation$discretize = F2(
	function (geometry, continuousValue) {
		var steps = function (steps) {
			return _elm_lang$core$Native_Utils.eq(steps, 0) ? 1 : steps;
		}(
			A2(_elm_lang$core$Maybe$withDefault, 1, geometry.step));
		var _p7 = geometry;
		var discrete = _p7.discrete;
		var step = _p7.step;
		var min = _p7.min;
		var max = _p7.max;
		var continuous = !discrete;
		return A3(
			_elm_lang$core$Basics$clamp,
			min,
			max,
			function () {
				if (continuous) {
					return continuousValue;
				} else {
					var numSteps = _elm_lang$core$Basics$round(continuousValue / steps);
					var quantizedVal = _elm_lang$core$Basics$toFloat(numSteps) * steps;
					return quantizedVal;
				}
			}());
	});
var _user$project$Internal_Slider_Implementation$_p8 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.slider;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{slider: x});
		}),
	_user$project$Internal_Slider_Model$defaultModel);
var _user$project$Internal_Slider_Implementation$get = _user$project$Internal_Slider_Implementation$_p8._0;
var _user$project$Internal_Slider_Implementation$set = _user$project$Internal_Slider_Implementation$_p8._1;
var _user$project$Internal_Slider_Implementation$disabled = _user$project$Internal_Options$many(
	{
		ctor: '::',
		_0: _user$project$Internal_Options$cs('mdc-slider--disabled'),
		_1: {
			ctor: '::',
			_0: _user$project$Internal_Options$attribute(
				_elm_lang$html$Html_Attributes$disabled(true)),
			_1: {ctor: '[]'}
		}
	});
var _user$project$Internal_Slider_Implementation$discrete = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{discrete: true});
	});
var _user$project$Internal_Slider_Implementation$max = function (_p9) {
	return _user$project$Internal_Options$option(
		F2(
			function (max, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						max: _elm_lang$core$Basics$toFloat(max)
					});
			})(_p9));
};
var _user$project$Internal_Slider_Implementation$min = function (_p10) {
	return _user$project$Internal_Options$option(
		F2(
			function (min, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						min: _elm_lang$core$Basics$toFloat(min)
					});
			})(_p10));
};
var _user$project$Internal_Slider_Implementation$value = function (_p11) {
	return _user$project$Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{value: value});
			})(_p11));
};
var _user$project$Internal_Slider_Implementation$defaultConfig = {value: 0, min: 0, max: 100, step: 1, discrete: false, onInput: _elm_lang$core$Maybe$Nothing, onChange: _elm_lang$core$Maybe$Nothing, trackMarkers: false};
var _user$project$Internal_Slider_Implementation$valueForKey = F4(
	function (key, keyCode, geometry, value) {
		var pageFactor = 4;
		var isPageDown = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('PageDown')) || _elm_lang$core$Native_Utils.eq(keyCode, 34);
		var isPageUp = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('PageUp')) || _elm_lang$core$Native_Utils.eq(keyCode, 33);
		var isEnd = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('End')) || _elm_lang$core$Native_Utils.eq(keyCode, 35);
		var isHome = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('Home')) || _elm_lang$core$Native_Utils.eq(keyCode, 36);
		var isArrowDown = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('ArrowDown')) || _elm_lang$core$Native_Utils.eq(keyCode, 40);
		var isArrowUp = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('ArrowUp')) || _elm_lang$core$Native_Utils.eq(keyCode, 38);
		var isArrowRight = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('ArrowRight')) || _elm_lang$core$Native_Utils.eq(keyCode, 39);
		var isArrowLeft = _elm_lang$core$Native_Utils.eq(
			key,
			_elm_lang$core$Maybe$Just('ArrowLeft')) || _elm_lang$core$Native_Utils.eq(keyCode, 37);
		var _p12 = geometry;
		var max = _p12.max;
		var min = _p12.min;
		var step = _p12.step;
		var discrete = _p12.discrete;
		var isRtl = false;
		var delta = ((isRtl && (isArrowLeft || isArrowRight)) ? F2(
			function (x, y) {
				return x * y;
			})(-1) : _elm_lang$core$Basics$identity)(
			discrete ? A2(_elm_lang$core$Maybe$withDefault, 1, step) : ((max - min) / 100));
		return A2(
			_elm_lang$core$Maybe$map,
			A2(_elm_lang$core$Basics$clamp, min, max),
			(isArrowLeft || isArrowDown) ? _elm_lang$core$Maybe$Just(value - delta) : ((isArrowRight || isArrowUp) ? _elm_lang$core$Maybe$Just(value + delta) : (isHome ? _elm_lang$core$Maybe$Just(min) : (isEnd ? _elm_lang$core$Maybe$Just(max) : (isPageUp ? _elm_lang$core$Maybe$Just(value + (delta * pageFactor)) : (isPageDown ? _elm_lang$core$Maybe$Just(value - (delta * pageFactor)) : _elm_lang$core$Maybe$Nothing))))));
	});
var _user$project$Internal_Slider_Implementation$valueFromPageX = F2(
	function (geometry, pageX) {
		var xPos = pageX - geometry.rect.left;
		var _p13 = geometry;
		var max = _p13.max;
		var min = _p13.min;
		var isRtl = false;
		var pctComplete = isRtl ? (1 - (xPos / geometry.rect.width)) : (xPos / geometry.rect.width);
		return min + (pctComplete * (max - min));
	});
var _user$project$Internal_Slider_Implementation$slider = F4(
	function (lift, model, options, _p14) {
		var moves = {
			ctor: '::',
			_0: _user$project$Internal_GlobalEvents$onMouseMove,
			_1: {
				ctor: '::',
				_0: _user$project$Internal_GlobalEvents$onTouchMove,
				_1: {
					ctor: '::',
					_0: _user$project$Internal_GlobalEvents$onPointerMove,
					_1: {ctor: '[]'}
				}
			}
		};
		var ups = {
			ctor: '::',
			_0: _user$project$Internal_GlobalEvents$onMouseUp,
			_1: {
				ctor: '::',
				_0: _user$project$Internal_GlobalEvents$onPointerUp,
				_1: {
					ctor: '::',
					_0: _user$project$Internal_GlobalEvents$onTouchEnd,
					_1: {ctor: '[]'}
				}
			}
		};
		var downs = {
			ctor: '::',
			_0: 'mousedown',
			_1: {
				ctor: '::',
				_0: 'pointerdown',
				_1: {
					ctor: '::',
					_0: 'touchstart',
					_1: {ctor: '[]'}
				}
			}
		};
		var geometry = A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Slider_Model$defaultGeometry, model.geometry);
		var _p15 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Slider_Implementation$defaultConfig, options);
		var summary = _p15;
		var config = _p15.config;
		var continuousValue = model.active ? A2(_elm_lang$core$Maybe$withDefault, config.value, model.activeValue) : config.value;
		var value = A2(_user$project$Internal_Slider_Implementation$discretize, geometry, continuousValue);
		var translateX = function () {
			var v = A3(_elm_lang$core$Basics$clamp, config.min, config.max, value);
			var c = (!_elm_lang$core$Native_Utils.eq(config.max - config.min, 0)) ? A3(_elm_lang$core$Basics$clamp, 0, 1, (v - config.min) / (config.max - config.min)) : 0;
			return c * geometry.rect.width;
		}();
		var trackScale = _elm_lang$core$Native_Utils.eq(config.max - config.min, 0) ? 0 : ((value - config.min) / (config.max - config.min));
		var stepChanged = !_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Maybe$Just(config.step),
			A2(
				_elm_lang$core$Maybe$andThen,
				function (_) {
					return _.step;
				},
				model.geometry));
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('elm-mdc-slider-wrapper'),
				_1: {
					ctor: '::',
					_0: A3(
						_user$project$Internal_Options$onWithOptions,
						'keydown',
						{preventDefault: true, stopPropagation: false},
						A2(
							_elm_lang$core$Json_Decode$map,
							lift,
							A2(
								_elm_lang$core$Json_Decode$andThen,
								_elm_lang$core$Basics$identity,
								A3(
									_elm_lang$core$Json_Decode$map2,
									F2(
										function (key, keyCode) {
											var activeValue = A4(_user$project$Internal_Slider_Implementation$valueForKey, key, keyCode, geometry, config.value);
											return (!_elm_lang$core$Native_Utils.eq(activeValue, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$core$Json_Decode$succeed(_user$project$Internal_Slider_Model$NoOp) : _elm_lang$core$Json_Decode$fail('');
										}),
									_elm_lang$core$Json_Decode$oneOf(
										{
											ctor: '::',
											_0: A2(
												_elm_lang$core$Json_Decode$map,
												_elm_lang$core$Maybe$Just,
												A2(
													_elm_lang$core$Json_Decode$at,
													{
														ctor: '::',
														_0: 'key',
														_1: {ctor: '[]'}
													},
													_elm_lang$core$Json_Decode$string)),
											_1: {
												ctor: '::',
												_0: _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing),
												_1: {ctor: '[]'}
											}
										}),
									A2(
										_elm_lang$core$Json_Decode$at,
										{
											ctor: '::',
											_0: 'keyCode',
											_1: {ctor: '[]'}
										},
										_elm_lang$core$Json_Decode$int))))),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A5(
					_user$project$Internal_Options$apply,
					summary,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-slider'),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								model.focus,
								_user$project$Internal_Options$cs('mdc-slider--focus')),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									model.active,
									_user$project$Internal_Options$cs('mdc-slider--active')),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										_elm_lang$core$Native_Utils.cmp(value, config.min) < 1,
										_user$project$Internal_Options$cs('mdc-slider--off')),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											config.discrete,
											_user$project$Internal_Options$cs('mdc-slider--discrete')),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$when,
												model.inTransit,
												_user$project$Internal_Options$cs('mdc-slider--in-transit')),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Options$when,
													config.trackMarkers,
													_user$project$Internal_Options$cs('mdc-slider--display-markers')),
												_1: {
													ctor: '::',
													_0: _user$project$Internal_Options$attribute(
														_elm_lang$html$Html_Attributes$tabindex(0)),
													_1: {
														ctor: '::',
														_0: A2(
															_user$project$Internal_Options$data,
															'min',
															_elm_lang$core$Basics$toString(config.min)),
														_1: {
															ctor: '::',
															_0: A2(
																_user$project$Internal_Options$data,
																'max',
																_elm_lang$core$Basics$toString(config.max)),
															_1: {
																ctor: '::',
																_0: A2(
																	_user$project$Internal_Options$data,
																	'step',
																	_elm_lang$core$Basics$toString(config.step)),
																_1: {
																	ctor: '::',
																	_0: _user$project$Internal_Options$role('slider'),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_user$project$Internal_Options$aria,
																			'valuemin',
																			_elm_lang$core$Basics$toString(config.min)),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_user$project$Internal_Options$aria,
																				'valuemax',
																				_elm_lang$core$Basics$toString(config.min)),
																			_1: {
																				ctor: '::',
																				_0: A2(
																					_user$project$Internal_Options$aria,
																					'valuenow',
																					_elm_lang$core$Basics$toString(value)),
																				_1: {
																					ctor: '::',
																					_0: A2(
																						_user$project$Internal_Options$when,
																						_elm_lang$core$Native_Utils.eq(model.geometry, _elm_lang$core$Maybe$Nothing) || stepChanged,
																						_user$project$Internal_GlobalEvents$onTick(
																							A2(
																								_elm_lang$core$Json_Decode$map,
																								function (_p16) {
																									return lift(
																										_user$project$Internal_Slider_Model$Init(_p16));
																								},
																								_user$project$Internal_Slider_Implementation$decodeGeometry))),
																					_1: {
																						ctor: '::',
																						_0: _user$project$Internal_GlobalEvents$onResize(
																							A2(
																								_elm_lang$core$Json_Decode$map,
																								function (_p17) {
																									return lift(
																										_user$project$Internal_Slider_Model$Resize(_p17));
																								},
																								_user$project$Internal_Slider_Implementation$decodeGeometry)),
																						_1: {
																							ctor: '::',
																							_0: A2(
																								_user$project$Internal_Options$on,
																								'keydown',
																								A2(
																									_elm_lang$core$Json_Decode$map,
																									lift,
																									A3(
																										_elm_lang$core$Json_Decode$map2,
																										F2(
																											function (key, keyCode) {
																												var activeValue = A4(_user$project$Internal_Slider_Implementation$valueForKey, key, keyCode, geometry, config.value);
																												return (!_elm_lang$core$Native_Utils.eq(activeValue, _elm_lang$core$Maybe$Nothing)) ? _user$project$Internal_Slider_Model$KeyDown : _user$project$Internal_Slider_Model$NoOp;
																											}),
																										_elm_lang$core$Json_Decode$oneOf(
																											{
																												ctor: '::',
																												_0: A2(
																													_elm_lang$core$Json_Decode$map,
																													_elm_lang$core$Maybe$Just,
																													A2(
																														_elm_lang$core$Json_Decode$at,
																														{
																															ctor: '::',
																															_0: 'key',
																															_1: {ctor: '[]'}
																														},
																														_elm_lang$core$Json_Decode$string)),
																												_1: {
																													ctor: '::',
																													_0: _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing),
																													_1: {ctor: '[]'}
																												}
																											}),
																										A2(
																											_elm_lang$core$Json_Decode$at,
																											{
																												ctor: '::',
																												_0: 'keyCode',
																												_1: {ctor: '[]'}
																											},
																											_elm_lang$core$Json_Decode$int)))),
																							_1: {
																								ctor: '::',
																								_0: A2(
																									_user$project$Internal_Options$when,
																									!_elm_lang$core$Native_Utils.eq(config.onChange, _elm_lang$core$Maybe$Nothing),
																									A2(
																										_user$project$Internal_Options$on,
																										'keydown',
																										A3(
																											_elm_lang$core$Json_Decode$map2,
																											F2(
																												function (key, keyCode) {
																													var activeValue = A2(
																														_elm_lang$core$Maybe$map,
																														_user$project$Internal_Slider_Implementation$discretize(geometry),
																														A4(_user$project$Internal_Slider_Implementation$valueForKey, key, keyCode, geometry, config.value));
																													return A2(
																														_elm_lang$core$Maybe$withDefault,
																														lift(_user$project$Internal_Slider_Model$NoOp),
																														A3(
																															_elm_lang$core$Maybe$map2,
																															F2(
																																function (x, y) {
																																	return x(y);
																																}),
																															config.onChange,
																															activeValue));
																												}),
																											_elm_lang$core$Json_Decode$oneOf(
																												{
																													ctor: '::',
																													_0: A2(
																														_elm_lang$core$Json_Decode$map,
																														_elm_lang$core$Maybe$Just,
																														A2(
																															_elm_lang$core$Json_Decode$at,
																															{
																																ctor: '::',
																																_0: 'key',
																																_1: {ctor: '[]'}
																															},
																															_elm_lang$core$Json_Decode$string)),
																													_1: {
																														ctor: '::',
																														_0: _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing),
																														_1: {ctor: '[]'}
																													}
																												}),
																											A2(
																												_elm_lang$core$Json_Decode$at,
																												{
																													ctor: '::',
																													_0: 'keyCode',
																													_1: {ctor: '[]'}
																												},
																												_elm_lang$core$Json_Decode$int)))),
																								_1: {
																									ctor: '::',
																									_0: A2(
																										_user$project$Internal_Options$when,
																										!_elm_lang$core$Native_Utils.eq(config.onInput, _elm_lang$core$Maybe$Nothing),
																										A2(
																											_user$project$Internal_Options$on,
																											'keydown',
																											A3(
																												_elm_lang$core$Json_Decode$map2,
																												F2(
																													function (key, keyCode) {
																														var activeValue = A2(
																															_elm_lang$core$Maybe$map,
																															_user$project$Internal_Slider_Implementation$discretize(geometry),
																															A4(_user$project$Internal_Slider_Implementation$valueForKey, key, keyCode, geometry, config.value));
																														return A2(
																															_elm_lang$core$Maybe$withDefault,
																															lift(_user$project$Internal_Slider_Model$NoOp),
																															A3(
																																_elm_lang$core$Maybe$map2,
																																F2(
																																	function (x, y) {
																																		return x(y);
																																	}),
																																config.onInput,
																																activeValue));
																													}),
																												_elm_lang$core$Json_Decode$oneOf(
																													{
																														ctor: '::',
																														_0: A2(
																															_elm_lang$core$Json_Decode$map,
																															_elm_lang$core$Maybe$Just,
																															A2(
																																_elm_lang$core$Json_Decode$at,
																																{
																																	ctor: '::',
																																	_0: 'key',
																																	_1: {ctor: '[]'}
																																},
																																_elm_lang$core$Json_Decode$string)),
																														_1: {
																															ctor: '::',
																															_0: _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing),
																															_1: {ctor: '[]'}
																														}
																													}),
																												A2(
																													_elm_lang$core$Json_Decode$at,
																													{
																														ctor: '::',
																														_0: 'keyCode',
																														_1: {ctor: '[]'}
																													},
																													_elm_lang$core$Json_Decode$int)))),
																									_1: {
																										ctor: '::',
																										_0: A2(
																											_user$project$Internal_Options$on,
																											'focus',
																											_elm_lang$core$Json_Decode$succeed(
																												lift(_user$project$Internal_Slider_Model$Focus))),
																										_1: {
																											ctor: '::',
																											_0: A2(
																												_user$project$Internal_Options$on,
																												'blur',
																												_elm_lang$core$Json_Decode$succeed(
																													lift(_user$project$Internal_Slider_Model$Blur))),
																											_1: {
																												ctor: '::',
																												_0: _user$project$Internal_Options$many(
																													A2(
																														_elm_lang$core$List$map,
																														function (event) {
																															return A2(
																																_user$project$Internal_Options$on,
																																event,
																																A2(
																																	_elm_lang$core$Json_Decode$map,
																																	function (_p18) {
																																		return lift(
																																			A2(_user$project$Internal_Slider_Model$InteractionStart, event, _p18));
																																	},
																																	_user$project$Internal_Slider_Implementation$decodePageX));
																														},
																														downs)),
																												_1: {
																													ctor: '::',
																													_0: A2(
																														_user$project$Internal_Options$when,
																														!_elm_lang$core$Native_Utils.eq(config.onChange, _elm_lang$core$Maybe$Nothing),
																														_user$project$Internal_Options$many(
																															A2(
																																_elm_lang$core$List$map,
																																function (event) {
																																	return A2(
																																		_user$project$Internal_Options$on,
																																		event,
																																		A2(
																																			_elm_lang$core$Json_Decode$map,
																																			function (_p19) {
																																				var _p20 = _p19;
																																				var activeValue = A2(
																																					_user$project$Internal_Slider_Implementation$discretize,
																																					geometry,
																																					A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p20.pageX));
																																				return A2(
																																					_elm_lang$core$Maybe$withDefault,
																																					lift(_user$project$Internal_Slider_Model$NoOp),
																																					A2(
																																						_elm_lang$core$Maybe$map,
																																						A2(
																																							_elm_lang$core$Basics$flip,
																																							F2(
																																								function (x, y) {
																																									return x(y);
																																								}),
																																							activeValue),
																																						config.onChange));
																																			},
																																			_user$project$Internal_Slider_Implementation$decodePageX));
																																},
																																downs))),
																													_1: {
																														ctor: '::',
																														_0: A2(
																															_user$project$Internal_Options$when,
																															!_elm_lang$core$Native_Utils.eq(config.onInput, _elm_lang$core$Maybe$Nothing),
																															_user$project$Internal_Options$many(
																																A2(
																																	_elm_lang$core$List$map,
																																	function (event) {
																																		return A2(
																																			_user$project$Internal_Options$on,
																																			event,
																																			A2(
																																				_elm_lang$core$Json_Decode$map,
																																				function (_p21) {
																																					var _p22 = _p21;
																																					var activeValue = A2(
																																						_user$project$Internal_Slider_Implementation$discretize,
																																						geometry,
																																						A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p22.pageX));
																																					return A2(
																																						_elm_lang$core$Maybe$withDefault,
																																						lift(_user$project$Internal_Slider_Model$NoOp),
																																						A2(
																																							_elm_lang$core$Maybe$map,
																																							A2(
																																								_elm_lang$core$Basics$flip,
																																								F2(
																																									function (x, y) {
																																										return x(y);
																																									}),
																																								activeValue),
																																							config.onInput));
																																				},
																																				_user$project$Internal_Slider_Implementation$decodePageX));
																																	},
																																	downs))),
																														_1: {
																															ctor: '::',
																															_0: _user$project$Internal_Options$many(
																																A2(
																																	_elm_lang$core$List$map,
																																	function (handler) {
																																		return handler(
																																			_elm_lang$core$Json_Decode$succeed(
																																				lift(_user$project$Internal_Slider_Model$Up)));
																																	},
																																	ups)),
																															_1: {
																																ctor: '::',
																																_0: A2(
																																	_user$project$Internal_Options$when,
																																	(!_elm_lang$core$Native_Utils.eq(config.onChange, _elm_lang$core$Maybe$Nothing)) && model.active,
																																	_user$project$Internal_Options$many(
																																		A2(
																																			_elm_lang$core$List$map,
																																			function (handler) {
																																				return handler(
																																					A2(
																																						_elm_lang$core$Json_Decode$map,
																																						function (_p23) {
																																							var _p24 = _p23;
																																							var activeValue = A2(
																																								_user$project$Internal_Slider_Implementation$discretize,
																																								geometry,
																																								A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p24.pageX));
																																							return A2(
																																								_elm_lang$core$Maybe$withDefault,
																																								lift(_user$project$Internal_Slider_Model$NoOp),
																																								A2(
																																									_elm_lang$core$Maybe$map,
																																									A2(
																																										_elm_lang$core$Basics$flip,
																																										F2(
																																											function (x, y) {
																																												return x(y);
																																											}),
																																										activeValue),
																																									config.onChange));
																																						},
																																						_user$project$Internal_Slider_Implementation$decodePageX));
																																			},
																																			ups))),
																																_1: {
																																	ctor: '::',
																																	_0: A2(
																																		_user$project$Internal_Options$when,
																																		(!_elm_lang$core$Native_Utils.eq(config.onInput, _elm_lang$core$Maybe$Nothing)) && model.active,
																																		_user$project$Internal_Options$many(
																																			A2(
																																				_elm_lang$core$List$map,
																																				function (handler) {
																																					return handler(
																																						A2(
																																							_elm_lang$core$Json_Decode$map,
																																							function (_p25) {
																																								var _p26 = _p25;
																																								var activeValue = A2(
																																									_user$project$Internal_Slider_Implementation$discretize,
																																									geometry,
																																									A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p26.pageX));
																																								return A2(
																																									_elm_lang$core$Maybe$withDefault,
																																									lift(_user$project$Internal_Slider_Model$NoOp),
																																									A2(
																																										_elm_lang$core$Maybe$map,
																																										A2(
																																											_elm_lang$core$Basics$flip,
																																											F2(
																																												function (x, y) {
																																													return x(y);
																																												}),
																																											activeValue),
																																										config.onInput));
																																							},
																																							_user$project$Internal_Slider_Implementation$decodePageX));
																																				},
																																				ups))),
																																	_1: {
																																		ctor: '::',
																																		_0: A2(
																																			_user$project$Internal_Options$when,
																																			model.active,
																																			_user$project$Internal_Options$many(
																																				A2(
																																					_elm_lang$core$List$map,
																																					function (handler) {
																																						return handler(
																																							A2(
																																								_elm_lang$core$Json_Decode$map,
																																								function (_p27) {
																																									return lift(
																																										_user$project$Internal_Slider_Model$Drag(_p27));
																																								},
																																								_user$project$Internal_Slider_Implementation$decodePageX));
																																					},
																																					moves))),
																																		_1: {
																																			ctor: '::',
																																			_0: A2(
																																				_user$project$Internal_Options$when,
																																				(!_elm_lang$core$Native_Utils.eq(config.onInput, _elm_lang$core$Maybe$Nothing)) && model.active,
																																				_user$project$Internal_Options$many(
																																					A2(
																																						_elm_lang$core$List$map,
																																						function (handler) {
																																							return handler(
																																								A2(
																																									_elm_lang$core$Json_Decode$map,
																																									function (_p28) {
																																										var _p29 = _p28;
																																										var activeValue = A2(
																																											_user$project$Internal_Slider_Implementation$discretize,
																																											geometry,
																																											A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p29.pageX));
																																										return A2(
																																											_elm_lang$core$Maybe$withDefault,
																																											lift(_user$project$Internal_Slider_Model$NoOp),
																																											A2(
																																												_elm_lang$core$Maybe$map,
																																												A2(
																																													_elm_lang$core$Basics$flip,
																																													F2(
																																														function (x, y) {
																																															return x(y);
																																														}),
																																													activeValue),
																																												config.onInput));
																																									},
																																									_user$project$Internal_Slider_Implementation$decodePageX));
																																						},
																																						moves))),
																																			_1: {ctor: '[]'}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A3(
							_user$project$Internal_Options$styled,
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-slider__track-container'),
								_1: {ctor: '[]'}
							},
							_elm_lang$core$List$concat(
								{
									ctor: '::',
									_0: {
										ctor: '::',
										_0: A3(
											_user$project$Internal_Options$styled,
											_elm_lang$html$Html$div,
											{
												ctor: '::',
												_0: _user$project$Internal_Options$cs('mdc-slider__track'),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$Internal_Options$css,
														'transform',
														A2(
															_elm_lang$core$Basics_ops['++'],
															'scaleX(',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_elm_lang$core$Basics$toString(trackScale),
																')'))),
													_1: {ctor: '[]'}
												}
											},
											{ctor: '[]'}),
										_1: {ctor: '[]'}
									},
									_1: {
										ctor: '::',
										_0: config.discrete ? {
											ctor: '::',
											_0: A3(
												_user$project$Internal_Options$styled,
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: _user$project$Internal_Options$cs('mdc-slider__track-marker-container'),
													_1: {ctor: '[]'}
												},
												A2(
													_elm_lang$core$List$repeat,
													_elm_lang$core$Basics$round((config.max - config.min) / config.step),
													A3(
														_user$project$Internal_Options$styled,
														_elm_lang$html$Html$div,
														{
															ctor: '::',
															_0: _user$project$Internal_Options$cs('mdc-slider__track-marker'),
															_1: {ctor: '[]'}
														},
														{ctor: '[]'}))),
											_1: {ctor: '[]'}
										} : {ctor: '[]'},
										_1: {ctor: '[]'}
									}
								})),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-slider__thumb-container'),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$many(
											A2(
												_elm_lang$core$List$map,
												function (event) {
													return A3(
														_user$project$Internal_Options$onWithOptions,
														event,
														{stopPropagation: true, preventDefault: false},
														A2(
															_elm_lang$core$Json_Decode$map,
															function (_p30) {
																return lift(
																	A2(_user$project$Internal_Slider_Model$ThumbContainerPointer, event, _p30));
															},
															_user$project$Internal_Slider_Implementation$decodePageX));
												},
												downs)),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$on,
												'transitionend',
												_elm_lang$core$Json_Decode$succeed(
													lift(_user$project$Internal_Slider_Model$TransitionEnd))),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Options$css,
													'transform',
													A2(
														_elm_lang$core$Basics_ops['++'],
														'translateX(',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_elm_lang$core$Basics$toString(translateX),
															'px) translateX(-50%)'))),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								_elm_lang$core$List$concat(
									{
										ctor: '::',
										_0: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$svg,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$class('mdc-slider__thumb'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$width('21'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$height('21'),
															_1: {ctor: '[]'}
														}
													}
												},
												{
													ctor: '::',
													_0: A2(
														_elm_lang$svg$Svg$circle,
														{
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$cx('10.5'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$cy('10.5'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$r('7.875'),
																	_1: {ctor: '[]'}
																}
															}
														},
														{ctor: '[]'}),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A3(
													_user$project$Internal_Options$styled,
													_elm_lang$html$Html$div,
													{
														ctor: '::',
														_0: _user$project$Internal_Options$cs('mdc-slider__focus-ring'),
														_1: {ctor: '[]'}
													},
													{ctor: '[]'}),
												_1: {ctor: '[]'}
											}
										},
										_1: {
											ctor: '::',
											_0: config.discrete ? {
												ctor: '::',
												_0: A3(
													_user$project$Internal_Options$styled,
													_elm_lang$html$Html$div,
													{
														ctor: '::',
														_0: _user$project$Internal_Options$cs('mdc-slider__pin'),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: A3(
															_user$project$Internal_Options$styled,
															_elm_lang$html$Html$div,
															{
																ctor: '::',
																_0: _user$project$Internal_Options$cs('mdc-slider__pin-value-marker'),
																_1: {ctor: '[]'}
															},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text(
																	_elm_lang$core$Basics$toString(value)),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											} : {ctor: '[]'},
											_1: {ctor: '[]'}
										}
									})),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Slider_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Slider_Implementation$get, _user$project$Internal_Slider_Implementation$slider, _user$project$Internal_Msg$SliderMsg);
var _user$project$Internal_Slider_Implementation$update = F3(
	function (lift, msg, model) {
		update:
		while (true) {
			var _p31 = msg;
			switch (_p31.ctor) {
				case 'NoOp':
					return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
				case 'Focus':
					return (!model.preventFocus) ? {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{focus: true})),
						_1: _elm_lang$core$Platform_Cmd$none
					} : {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
				case 'Blur':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{focus: false, preventFocus: false})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'TransitionEnd':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{inTransit: false})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'InteractionStart':
					var geometry = A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Slider_Model$defaultGeometry, model.geometry);
					var activeValue = A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p31._1.pageX);
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									active: true,
									inTransit: true,
									activeValue: _elm_lang$core$Maybe$Just(activeValue),
									preventFocus: true
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'ThumbContainerPointer':
					var geometry = A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Slider_Model$defaultGeometry, model.geometry);
					var activeValue = A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p31._1.pageX);
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									active: true,
									inTransit: false,
									activeValue: _elm_lang$core$Maybe$Just(activeValue),
									preventFocus: true
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'Drag':
					if (model.active) {
						var geometry = A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Slider_Model$defaultGeometry, model.geometry);
						var activeValue = A2(_user$project$Internal_Slider_Implementation$valueFromPageX, geometry, _p31._0.pageX);
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$core$Native_Utils.update(
									model,
									{
										inTransit: false,
										activeValue: _elm_lang$core$Maybe$Just(activeValue)
									})),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					} else {
						return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
					}
				case 'Init':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									geometry: _elm_lang$core$Maybe$Just(_p31._0)
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'Resize':
					var _v6 = lift,
						_v7 = _user$project$Internal_Slider_Model$Init(_p31._0),
						_v8 = model;
					lift = _v6;
					msg = _v7;
					model = _v8;
					continue update;
				case 'KeyDown':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{focus: true})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'Up':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(model),
						_1: A2(
							_elm_lang$core$Task$perform,
							lift,
							_elm_lang$core$Task$succeed(_user$project$Internal_Slider_Model$ActualUp))
					};
				default:
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{active: false, activeValue: _elm_lang$core$Maybe$Nothing})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
			}
		}
	});
var _user$project$Internal_Slider_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Slider_Implementation$get, _user$project$Internal_Slider_Implementation$set, _user$project$Internal_Msg$SliderMsg, _user$project$Internal_Slider_Implementation$update);
var _user$project$Internal_Slider_Implementation$Config = F8(
	function (a, b, c, d, e, f, g, h) {
		return {value: a, min: b, max: c, discrete: d, step: e, onInput: f, onChange: g, trackMarkers: h};
	});

var _user$project$Internal_Snackbar_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.snackbar;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{snackbar: x});
		}),
	_user$project$Internal_Snackbar_Model$defaultModel);
var _user$project$Internal_Snackbar_Implementation$get = _user$project$Internal_Snackbar_Implementation$_p0._0;
var _user$project$Internal_Snackbar_Implementation$set = _user$project$Internal_Snackbar_Implementation$_p0._1;
var _user$project$Internal_Snackbar_Implementation$alignEnd = _user$project$Internal_Options$cs('mdc-snackbar--align-end');
var _user$project$Internal_Snackbar_Implementation$alignStart = _user$project$Internal_Options$cs('mdc-snackbar--align-start');
var _user$project$Internal_Snackbar_Implementation$defaultConfig = {};
var _user$project$Internal_Snackbar_Implementation$snackbar = F4(
	function (lift, model, options, _p1) {
		var _p2 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Snackbar_Implementation$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		var isActive = function () {
			var _p3 = model.state;
			switch (_p3.ctor) {
				case 'Inert':
					return false;
				case 'Active':
					return true;
				default:
					return false;
			}
		}();
		var contents = function () {
			var _p4 = model.state;
			switch (_p4.ctor) {
				case 'Inert':
					return _elm_lang$core$Maybe$Nothing;
				case 'Active':
					return _elm_lang$core$Maybe$Just(_p4._0);
				default:
					return _elm_lang$core$Maybe$Just(_p4._0);
			}
		}();
		var action = A2(
			_elm_lang$core$Maybe$andThen,
			function (_) {
				return _.action;
			},
			contents);
		var onDismiss = A2(
			_elm_lang$core$Maybe$andThen,
			function (_) {
				return _.onDismiss;
			},
			contents);
		var multiline = _elm_lang$core$Native_Utils.eq(
			A2(
				_elm_lang$core$Maybe$map,
				function (_) {
					return _.multiline;
				},
				contents),
			_elm_lang$core$Maybe$Just(true));
		var actionOnBottom = _elm_lang$core$Native_Utils.eq(
			A2(
				_elm_lang$core$Maybe$map,
				function (_) {
					return _.actionOnBottom;
				},
				contents),
			_elm_lang$core$Maybe$Just(true)) && multiline;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-snackbar'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						isActive,
						_user$project$Internal_Options$cs('mdc-snackbar--active')),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							multiline,
							_user$project$Internal_Options$cs('mdc-snackbar--multiline')),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								actionOnBottom,
								_user$project$Internal_Options$cs('mdc-snackbar--action-on-bottom')),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Internal_Options$aria, 'live', 'assertive'),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Internal_Options$aria, 'atomic', 'true'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Internal_Options$aria, 'hidden', 'true'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_user$project$Internal_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-snackbar__text'),
						_1: {ctor: '[]'}
					},
					A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(
							_elm_lang$core$Maybe$map,
							function (c) {
								return {
									ctor: '::',
									_0: _elm_lang$html$Html$text(c.message),
									_1: {ctor: '[]'}
								};
							},
							contents))),
				_1: {
					ctor: '::',
					_0: A3(
						_user$project$Internal_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _user$project$Internal_Options$cs('mdc-snackbar__action-wrapper'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-snackbar__action-button'),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$attribute(
											_elm_lang$html$Html_Attributes$type_('button')),
										_1: {
											ctor: '::',
											_0: function () {
												var _p5 = onDismiss;
												if (_p5.ctor === 'Just') {
													return A2(
														_user$project$Internal_Options$on,
														'click',
														_elm_lang$core$Json_Decode$succeed(_p5._0));
												} else {
													return _user$project$Internal_Options$nop;
												}
											}(),
											_1: {ctor: '[]'}
										}
									}
								},
								A2(
									_elm_lang$core$Maybe$withDefault,
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$map,
										function (action) {
											return {
												ctor: '::',
												_0: _elm_lang$html$Html$text(action),
												_1: {ctor: '[]'}
											};
										},
										action))),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Snackbar_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Snackbar_Implementation$get, _user$project$Internal_Snackbar_Implementation$snackbar, _user$project$Internal_Msg$SnackbarMsg);
var _user$project$Internal_Snackbar_Implementation$tryDequeue = function (model) {
	var _p6 = {ctor: '_Tuple2', _0: model.state, _1: model.queue};
	if (((_p6.ctor === '_Tuple2') && (_p6._0.ctor === 'Inert')) && (_p6._1.ctor === '::')) {
		var _p7 = _p6._1._0;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					state: _user$project$Internal_Snackbar_Model$Active(_p7),
					queue: _p6._1._1,
					seq: model.seq + 1
				}),
			_1: A2(
				_elm_lang$core$Platform_Cmd$map,
				_user$project$Internal_Snackbar_Model$Move(model.seq + 1),
				A2(_user$project$Internal_Helpers$delayedCmd, _p7.timeout, _user$project$Internal_Snackbar_Model$Timeout))
		};
	} else {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	}
};
var _user$project$Internal_Snackbar_Implementation$enqueue = F2(
	function (contents, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				queue: A2(
					_elm_lang$core$List$append,
					model.queue,
					{
						ctor: '::',
						_0: contents,
						_1: {ctor: '[]'}
					})
			});
	});
var _user$project$Internal_Snackbar_Implementation$add = F4(
	function (lift, idx, contents, store) {
		var component_ = A2(
			_elm_lang$core$Maybe$withDefault,
			_user$project$Internal_Snackbar_Model$defaultModel,
			A2(_elm_lang$core$Dict$get, idx, store.snackbar));
		var _p8 = A2(
			_elm_lang$core$Tuple$mapSecond,
			_elm_lang$core$Platform_Cmd$map(
				function (_p9) {
					return lift(
						A2(_user$project$Internal_Msg$SnackbarMsg, idx, _p9));
				}),
			_user$project$Internal_Snackbar_Implementation$tryDequeue(
				A2(_user$project$Internal_Snackbar_Implementation$enqueue, contents, component_)));
		var component = _p8._0;
		var effects = _p8._1;
		var updatedStore = _elm_lang$core$Native_Utils.update(
			store,
			{
				snackbar: A3(_elm_lang$core$Dict$insert, idx, component, store.snackbar)
			});
		return {ctor: '_Tuple2', _0: updatedStore, _1: effects};
	});
var _user$project$Internal_Snackbar_Implementation$next = function (model) {
	return _elm_lang$core$Platform_Cmd$map(
		_user$project$Internal_Snackbar_Model$Move(model.seq));
};
var _user$project$Internal_Snackbar_Implementation$move = F2(
	function (transition, model) {
		var _p10 = {ctor: '_Tuple2', _0: model.state, _1: transition};
		_v4_4:
		do {
			if (_p10.ctor === '_Tuple2') {
				if (_p10._1.ctor === 'Clicked') {
					if (_p10._0.ctor === 'Active') {
						var _p11 = _p10._0._0;
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									state: _user$project$Internal_Snackbar_Model$Fading(_p11)
								}),
							_1: A2(
								_user$project$Internal_Snackbar_Implementation$next,
								model,
								A2(_user$project$Internal_Helpers$delayedCmd, _p11.fade, _user$project$Internal_Snackbar_Model$Timeout))
						};
					} else {
						break _v4_4;
					}
				} else {
					switch (_p10._0.ctor) {
						case 'Inert':
							return _user$project$Internal_Snackbar_Implementation$tryDequeue(model);
						case 'Active':
							var _p12 = _p10._0._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{
										state: _user$project$Internal_Snackbar_Model$Fading(_p12)
									}),
								_1: A2(
									_user$project$Internal_Snackbar_Implementation$next,
									model,
									A2(_user$project$Internal_Helpers$delayedCmd, _p12.fade, _user$project$Internal_Snackbar_Model$Timeout))
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{state: _user$project$Internal_Snackbar_Model$Inert}),
								_1: A2(
									_user$project$Internal_Snackbar_Implementation$next,
									model,
									_user$project$Internal_Helpers$cmd(_user$project$Internal_Snackbar_Model$Timeout))
							};
					}
				}
			} else {
				break _v4_4;
			}
		} while(false);
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Internal_Snackbar_Implementation$update = F3(
	function (fwd, msg, model) {
		var _p13 = msg;
		if (_p13.ctor === 'Move') {
			return _elm_lang$core$Native_Utils.eq(_p13._0, model.seq) ? A2(
				_elm_lang$core$Tuple$mapSecond,
				_elm_lang$core$Platform_Cmd$map(fwd),
				A2(_user$project$Internal_Snackbar_Implementation$move, _p13._1, model)) : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			var fwdEffect = function () {
				var _p14 = _p13._1;
				if (_p14.ctor === 'Just') {
					return _user$project$Internal_Helpers$cmd(_p14._0);
				} else {
					return _elm_lang$core$Platform_Cmd$none;
				}
			}();
			return A2(
				_elm_lang$core$Tuple$mapSecond,
				function (cmd) {
					return _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: cmd,
							_1: {
								ctor: '::',
								_0: fwdEffect,
								_1: {ctor: '[]'}
							}
						});
				},
				_p13._0 ? A3(
					_user$project$Internal_Snackbar_Implementation$update,
					fwd,
					A2(_user$project$Internal_Snackbar_Model$Move, model.seq, _user$project$Internal_Snackbar_Model$Clicked),
					model) : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none});
		}
	});
var _user$project$Internal_Snackbar_Implementation$react = A4(
	_user$project$Internal_Component$react,
	_user$project$Internal_Snackbar_Implementation$get,
	_user$project$Internal_Snackbar_Implementation$set,
	_user$project$Internal_Msg$SnackbarMsg,
	F3(
		function (fwd, msg, model) {
			return A2(
				_elm_lang$core$Tuple$mapFirst,
				_elm_lang$core$Maybe$Just,
				A3(_user$project$Internal_Snackbar_Implementation$update, fwd, msg, model));
		}));
var _user$project$Internal_Snackbar_Implementation$snack = F3(
	function (onDismiss, message, label) {
		return {
			message: message,
			action: _elm_lang$core$Maybe$Just(label),
			timeout: 2750,
			fade: 250,
			multiline: true,
			actionOnBottom: false,
			dismissOnAction: true,
			onDismiss: onDismiss
		};
	});
var _user$project$Internal_Snackbar_Implementation$toast = F2(
	function (onDismiss, message) {
		return {message: message, action: _elm_lang$core$Maybe$Nothing, timeout: 2750, fade: 250, multiline: false, actionOnBottom: false, dismissOnAction: true, onDismiss: onDismiss};
	});
var _user$project$Internal_Snackbar_Implementation$Config = {};

var _user$project$Internal_Switch_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.$switch;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{$switch: x});
		}),
	_user$project$Internal_Switch_Model$defaultModel);
var _user$project$Internal_Switch_Implementation$get = _user$project$Internal_Switch_Implementation$_p0._0;
var _user$project$Internal_Switch_Implementation$set = _user$project$Internal_Switch_Implementation$_p0._1;
var _user$project$Internal_Switch_Implementation$nativeControl = _user$project$Internal_Options$nativeControl;
var _user$project$Internal_Switch_Implementation$on = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{value: true});
	});
var _user$project$Internal_Switch_Implementation$disabled = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _user$project$Internal_Switch_Implementation$defaultConfig = {
	value: false,
	disabled: false,
	nativeControl: {ctor: '[]'},
	id_: ''
};
var _user$project$Internal_Switch_Implementation$switch = F4(
	function (lift, model, options, _p1) {
		var preventDefault = {preventDefault: true, stopPropagation: false};
		var _p2 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Switch_Implementation$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-switch'),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A4(
					_user$project$Internal_Options$applyNativeControl,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-switch__native-control'),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Options$id(config.id_),
							_1: {
								ctor: '::',
								_0: _user$project$Internal_Options$attribute(
									_elm_lang$html$Html_Attributes$type_('checkbox')),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_Options$attribute(
										_elm_lang$html$Html_Attributes$checked(config.value)),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$onFocus(
											lift(
												_user$project$Internal_Switch_Model$SetFocus(true))),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Options$onBlur(
												lift(
													_user$project$Internal_Switch_Model$SetFocus(false))),
											_1: {
												ctor: '::',
												_0: A3(
													_user$project$Internal_Options$onWithOptions,
													'click',
													preventDefault,
													_elm_lang$core$Json_Decode$succeed(
														lift(_user$project$Internal_Switch_Model$NoOp))),
												_1: {
													ctor: '::',
													_0: function (_p3) {
														return A2(
															_user$project$Internal_Options$when,
															config.disabled,
															_user$project$Internal_Options$many(_p3));
													}(
														{
															ctor: '::',
															_0: _user$project$Internal_Options$cs('mdc-checkbox--disabled'),
															_1: {
																ctor: '::',
																_0: _user$project$Internal_Options$attribute(
																	_elm_lang$html$Html_Attributes$disabled(true)),
																_1: {ctor: '[]'}
															}
														}),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_user$project$Internal_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _user$project$Internal_Options$cs('mdc-switch__background'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-switch__knob'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Switch_Implementation$view = F4(
	function (lift, index, store, options) {
		return A7(
			_user$project$Internal_Component$render,
			_user$project$Internal_Switch_Implementation$get,
			_user$project$Internal_Switch_Implementation$switch,
			_user$project$Internal_Msg$SwitchMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$id_(index),
				_1: options
			});
	});
var _user$project$Internal_Switch_Implementation$update = F3(
	function (_p4, msg, model) {
		var _p5 = msg;
		if (_p5.ctor === 'SetFocus') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					_elm_lang$core$Native_Utils.update(
						model,
						{isFocused: _p5._0})),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _user$project$Internal_Switch_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Switch_Implementation$get, _user$project$Internal_Switch_Implementation$set, _user$project$Internal_Msg$SwitchMsg, _user$project$Internal_Switch_Implementation$update);
var _user$project$Internal_Switch_Implementation$Config = F4(
	function (a, b, c, d) {
		return {value: a, disabled: b, nativeControl: c, id_: d};
	});

var _user$project$Internal_Tabs_Implementation$decodeGeometry = function (hasIndicator) {
	return A4(
		_elm_lang$core$Json_Decode$map3,
		_user$project$Internal_Tabs_Model$Geometry,
		A2(
			_elm_lang$core$Json_Decode$map,
			hasIndicator ? function (xs) {
				return A2(
					_elm_lang$core$List$take,
					_elm_lang$core$List$length(xs) - 1,
					xs);
			} : _elm_lang$core$Basics$identity,
			A2(
				_elm_lang$core$Json_Decode$map,
				_elm_lang$core$List$filterMap(_elm_lang$core$Basics$identity),
				_debois$elm_dom$DOM$childNodes(
					A2(
						_elm_lang$core$Json_Decode$andThen,
						function (tagName) {
							var _p0 = _elm_lang$core$String$toLower(tagName);
							if (_p0 === 'style') {
								return _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing);
							} else {
								return A2(
									_elm_lang$core$Json_Decode$map,
									_elm_lang$core$Maybe$Just,
									A3(
										_elm_lang$core$Json_Decode$map2,
										F2(
											function (offsetLeft, offsetWidth) {
												return {offsetLeft: offsetLeft, offsetWidth: offsetWidth};
											}),
										_debois$elm_dom$DOM$offsetLeft,
										_debois$elm_dom$DOM$offsetWidth));
							}
						},
						A2(
							_elm_lang$core$Json_Decode$at,
							{
								ctor: '::',
								_0: 'tagName',
								_1: {ctor: '[]'}
							},
							_elm_lang$core$Json_Decode$string))))),
		A2(
			_elm_lang$core$Json_Decode$map,
			function (offsetWidth) {
				return {offsetWidth: offsetWidth};
			},
			_debois$elm_dom$DOM$offsetWidth),
		_debois$elm_dom$DOM$parentElement(
			A2(
				_elm_lang$core$Json_Decode$map,
				function (offsetWidth) {
					return {offsetWidth: offsetWidth};
				},
				_debois$elm_dom$DOM$offsetWidth)));
};
var _user$project$Internal_Tabs_Implementation$decodeGeometryOnTabBar = function (hasIndicator) {
	return _debois$elm_dom$DOM$target(
		_user$project$Internal_Tabs_Implementation$decodeGeometry(hasIndicator));
};
var _user$project$Internal_Tabs_Implementation$decodeGeometryOnTab = function (hasIndicator) {
	var traverseToTabBar = function (cont) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$andThen,
					function (className) {
						return A2(
							_elm_lang$core$String$contains,
							' mdc-tab-bar ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								' ',
								A2(_elm_lang$core$Basics_ops['++'], className, ' '))) ? cont : _elm_lang$core$Json_Decode$fail('Material.Tabs.decodeGeometryOnTabBar');
					},
					_debois$elm_dom$DOM$className),
				_1: {
					ctor: '::',
					_0: _debois$elm_dom$DOM$parentElement(
						_elm_lang$core$Json_Decode$lazy(
							function (_p1) {
								return traverseToTabBar(cont);
							})),
					_1: {ctor: '[]'}
				}
			});
	};
	return _debois$elm_dom$DOM$target(
		traverseToTabBar(
			_user$project$Internal_Tabs_Implementation$decodeGeometry(hasIndicator)));
};
var _user$project$Internal_Tabs_Implementation$decodeGeometryOnIndicator = function (hasIndicator) {
	return _debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$parentElement(
			A2(
				_debois$elm_dom$DOM$childNode,
				1,
				A2(
					_debois$elm_dom$DOM$childNode,
					0,
					_user$project$Internal_Tabs_Implementation$decodeGeometry(hasIndicator)))));
};
var _user$project$Internal_Tabs_Implementation$computeScale = F2(
	function (geometry, index) {
		var totalTabsWidth = A3(
			_elm_lang$core$List$foldl,
			F2(
				function (x, y) {
					return x + y;
				}),
			0,
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.offsetWidth;
				},
				geometry.tabs));
		var _p2 = _elm_lang$core$List$head(
			A2(_elm_lang$core$List$drop, index, geometry.tabs));
		if (_p2.ctor === 'Nothing') {
			return 1;
		} else {
			return _elm_lang$core$Native_Utils.eq(totalTabsWidth, 0) ? 1 : (_p2._0.offsetWidth / totalTabsWidth);
		}
	});
var _user$project$Internal_Tabs_Implementation$_p3 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.tabs;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tabs: x});
		}),
	_user$project$Internal_Tabs_Model$defaultModel);
var _user$project$Internal_Tabs_Implementation$get = _user$project$Internal_Tabs_Implementation$_p3._0;
var _user$project$Internal_Tabs_Implementation$set = _user$project$Internal_Tabs_Implementation$_p3._1;
var _user$project$Internal_Tabs_Implementation$iconText = F2(
	function (options, str) {
		return A3(
			_user$project$Internal_Options$styled,
			_elm_lang$html$Html$span,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-tab__icon-text'),
				_1: options
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(str),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_Tabs_Implementation$icon = F2(
	function (options, icon) {
		return A2(
			_user$project$Internal_Icon_Implementation$view,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-tab__icon'),
				_1: {ctor: '[]'}
			},
			icon);
	});
var _user$project$Internal_Tabs_Implementation$withIconAndText = _user$project$Internal_Options$cs('mdc-tab--with-icon-and-text');
var _user$project$Internal_Tabs_Implementation$tab = F2(
	function (options, childs) {
		return {options: options, childs: childs};
	});
var _user$project$Internal_Tabs_Implementation$indicator = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{indicator: true});
	});
var _user$project$Internal_Tabs_Implementation$scrolling = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{scroller: true});
	});
var _user$project$Internal_Tabs_Implementation$defaultConfig = {active: 0, scroller: false, indicator: false};
var _user$project$Internal_Tabs_Implementation$tabs = F4(
	function (lift, model, options, nodes) {
		var geometry = A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Tabs_Model$defaultGeometry, model.geometry);
		var indicatorTransform = function () {
			var tabLeft = A2(
				_elm_lang$core$Maybe$withDefault,
				0,
				A2(
					_elm_lang$core$Maybe$map,
					function (_) {
						return _.offsetLeft;
					},
					_elm_lang$core$List$head(
						A2(_elm_lang$core$List$drop, model.index, geometry.tabs))));
			return A2(
				_elm_lang$core$String$join,
				' ',
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						'translateX(',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(tabLeft),
							'px)')),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Basics_ops['++'],
							'scale(',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(model.scale),
								',1)')),
						_1: {ctor: '[]'}
					}
				});
		}();
		var isRtl = false;
		var tabBarTransform = function () {
			var shiftAmount = isRtl ? model.translateOffset : (0 - model.translateOffset);
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'translateX(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(shiftAmount),
					'px)'));
		}();
		var numTabs = _elm_lang$core$List$length(nodes);
		var summary = A2(_user$project$Internal_Options$collect, _user$project$Internal_Tabs_Implementation$defaultConfig, options);
		var config = summary.config;
		var tabBarScroller = function (tabBar) {
			return A3(
				_user$project$Internal_Options$styled,
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A3(
						_user$project$Internal_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__indicator'),
							_1: {
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__indicator--back'),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__indicator--enabled'),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											!model.backIndicator,
											A2(_user$project$Internal_Options$css, 'display', 'none')),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$on,
												'click',
												A2(
													_elm_lang$core$Json_Decode$map,
													function (_p4) {
														return lift(
															_user$project$Internal_Tabs_Model$ScrollBack(_p4));
													},
													_user$project$Internal_Tabs_Implementation$decodeGeometryOnIndicator(config.indicator))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$a,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-tab-bar__indicator__inner'),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$cs('material-icons'),
										_1: {
											ctor: '::',
											_0: A2(_user$project$Internal_Options$css, 'pointer-events', 'none'),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('navigate_before'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_user$project$Internal_Options$styled,
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__scroll-frame'),
								_1: {
									ctor: '::',
									_0: function (_p5) {
										return _user$project$Internal_Options$attribute(
											A2(_elm_lang$html$Html_Attributes$property, 'scrollLeft', _p5));
									}(
										_elm_lang$core$Json_Encode$int(model.scrollLeftAmount)),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: tabBar,
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__indicator'),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__indicator--next'),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__indicator--enabled'),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Options$on,
													'click',
													A2(
														_elm_lang$core$Json_Decode$map,
														function (_p6) {
															return lift(
																_user$project$Internal_Tabs_Model$ScrollForward(_p6));
														},
														_user$project$Internal_Tabs_Implementation$decodeGeometryOnIndicator(config.indicator))),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$Internal_Options$when,
														!model.forwardIndicator,
														A2(_user$project$Internal_Options$css, 'display', 'none')),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_user$project$Internal_Options$styled,
										_elm_lang$html$Html$a,
										{
											ctor: '::',
											_0: _user$project$Internal_Options$cs('mdc-tab-bar__indicator__inner'),
											_1: {
												ctor: '::',
												_0: _user$project$Internal_Options$cs('material-icons'),
												_1: {
													ctor: '::',
													_0: A2(_user$project$Internal_Options$css, 'pointer-events', 'none'),
													_1: {ctor: '[]'}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('navigate_next'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				});
		};
		return (config.scroller ? tabBarScroller : _elm_lang$core$Basics$identity)(
			A5(
				_user$project$Internal_Options$apply,
				summary,
				_elm_lang$html$Html$nav,
				{
					ctor: '::',
					_0: _user$project$Internal_Options$cs('mdc-tab-bar'),
					_1: {
						ctor: '::',
						_0: _user$project$Internal_Options$cs('mdc-tab-bar-upgraded'),
						_1: {
							ctor: '::',
							_0: _user$project$Internal_Options$many(
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-tab-bar-scroller__scroller-frame__tabs'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Internal_Options$css, 'transform', tabBarTransform),
										_1: {ctor: '[]'}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									_elm_lang$core$Native_Utils.eq(model.geometry, _elm_lang$core$Maybe$Nothing),
									_user$project$Internal_GlobalEvents$onTick(
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p7) {
												return lift(
													_user$project$Internal_Tabs_Model$Init(_p7));
											},
											_user$project$Internal_Tabs_Implementation$decodeGeometryOnTabBar(config.indicator)))),
								_1: {
									ctor: '::',
									_0: _user$project$Internal_GlobalEvents$onResize(
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p8) {
												return lift(
													_user$project$Internal_Tabs_Model$Init(_p8));
											},
											_user$project$Internal_Tabs_Implementation$decodeGeometryOnTabBar(config.indicator))),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				},
				{ctor: '[]'},
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: _elm_lang$core$List$concat(
							A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (index, _p9) {
										var _p10 = _p9;
										var ripple = A4(
											_user$project$Internal_Ripple_Implementation$view,
											false,
											function (_p11) {
												return lift(
													A2(_user$project$Internal_Tabs_Model$RippleMsg, index, _p11));
											},
											A2(
												_elm_lang$core$Maybe$withDefault,
												_user$project$Internal_Ripple_Model$defaultModel,
												A2(_elm_lang$core$Dict$get, index, model.ripples)),
											{ctor: '[]'});
										return {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$a,
												A2(
													_user$project$Internal_Options$addAttributes,
													A2(
														_user$project$Internal_Options$recollect,
														_elm_lang$core$Native_Utils.update(
															summary,
															{
																classes: {ctor: '[]'},
																css: {ctor: '[]'},
																attrs: {ctor: '[]'},
																internal: {ctor: '[]'},
																config: _user$project$Internal_Tabs_Implementation$defaultConfig,
																dispatch: _user$project$Internal_Dispatch$clear(summary.dispatch)
															}),
														{
															ctor: '::',
															_0: _user$project$Internal_Options$cs('mdc-tab'),
															_1: {
																ctor: '::',
																_0: A2(
																	_user$project$Internal_Options$when,
																	_elm_lang$core$Native_Utils.eq(model.index, index),
																	_user$project$Internal_Options$cs('mdc-tab--active')),
																_1: {
																	ctor: '::',
																	_0: _user$project$Internal_Options$attribute(
																		_elm_lang$html$Html_Attributes$tabindex(0)),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_user$project$Internal_Options$on,
																			'click',
																			A2(
																				_elm_lang$core$Json_Decode$map,
																				function (_p12) {
																					return lift(
																						A2(_user$project$Internal_Tabs_Model$Select, index, _p12));
																				},
																				_user$project$Internal_Tabs_Implementation$decodeGeometryOnTab(config.indicator))),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_user$project$Internal_Options$on,
																				'keydown',
																				A2(
																					_elm_lang$core$Json_Decode$map,
																					lift,
																					A4(
																						_elm_lang$core$Json_Decode$map3,
																						F3(
																							function (key, keyCode, geometry) {
																								return (_elm_lang$core$Native_Utils.eq(
																									key,
																									_elm_lang$core$Maybe$Just('Enter')) || _elm_lang$core$Native_Utils.eq(keyCode, 13)) ? A2(_user$project$Internal_Tabs_Model$Select, index, geometry) : _user$project$Internal_Tabs_Model$NoOp;
																							}),
																						_elm_lang$core$Json_Decode$oneOf(
																							{
																								ctor: '::',
																								_0: A2(
																									_elm_lang$core$Json_Decode$map,
																									_elm_lang$core$Maybe$Just,
																									A2(
																										_elm_lang$core$Json_Decode$at,
																										{
																											ctor: '::',
																											_0: 'key',
																											_1: {ctor: '[]'}
																										},
																										_elm_lang$core$Json_Decode$string)),
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing),
																									_1: {ctor: '[]'}
																								}
																							}),
																						A2(
																							_elm_lang$core$Json_Decode$at,
																							{
																								ctor: '::',
																								_0: 'keyCode',
																								_1: {ctor: '[]'}
																							},
																							_elm_lang$core$Json_Decode$int),
																						_user$project$Internal_Tabs_Implementation$decodeGeometryOnTab(config.indicator)))),
																			_1: {
																				ctor: '::',
																				_0: _user$project$Internal_Options$many(
																					{
																						ctor: '::',
																						_0: ripple.interactionHandler,
																						_1: {
																							ctor: '::',
																							_0: ripple.properties,
																							_1: {ctor: '[]'}
																						}
																					}),
																				_1: {
																					ctor: '::',
																					_0: A2(
																						_user$project$Internal_Options$when,
																						config.scroller,
																						A2(
																							_user$project$Internal_Options$on,
																							'focus',
																							A2(
																								_elm_lang$core$Json_Decode$map,
																								function (_p13) {
																									return lift(
																										A2(_user$project$Internal_Tabs_Model$Focus, index, _p13));
																								},
																								_user$project$Internal_Tabs_Implementation$decodeGeometryOnTab(config.indicator)))),
																					_1: _p10.options
																				}
																			}
																		}
																	}
																}
															}
														}),
													{ctor: '[]'}),
												A2(
													_elm_lang$core$Basics_ops['++'],
													_p10.childs,
													{
														ctor: '::',
														_0: ripple.style,
														_1: {ctor: '[]'}
													})),
											_1: {ctor: '[]'}
										};
									}),
								nodes)),
						_1: {
							ctor: '::',
							_0: function () {
								if (config.indicator) {
									var indicatorFirstRender = !model.indicatorShown;
									return {
										ctor: '::',
										_0: A3(
											_user$project$Internal_Options$styled,
											_elm_lang$html$Html$div,
											{
												ctor: '::',
												_0: _user$project$Internal_Options$cs('mdc-tab-bar__indicator'),
												_1: {
													ctor: '::',
													_0: A2(_user$project$Internal_Options$css, 'transform', indicatorTransform),
													_1: {
														ctor: '::',
														_0: A2(
															_user$project$Internal_Options$when,
															_elm_lang$core$Native_Utils.cmp(numTabs, 0) > 0,
															A2(_user$project$Internal_Options$css, 'visibility', 'visible')),
														_1: {
															ctor: '::',
															_0: A2(
																_user$project$Internal_Options$when,
																indicatorFirstRender,
																A2(_user$project$Internal_Options$css, 'display', 'none')),
															_1: {ctor: '[]'}
														}
													}
												}
											},
											{ctor: '[]'}),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}(),
							_1: {ctor: '[]'}
						}
					})));
	});
var _user$project$Internal_Tabs_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Tabs_Implementation$get, _user$project$Internal_Tabs_Implementation$tabs, _user$project$Internal_Msg$TabsMsg);
var _user$project$Internal_Tabs_Implementation$update = F3(
	function (lift, msg, model) {
		update:
		while (true) {
			var indicatorEnabledStates = F2(
				function (geometry, translateOffset) {
					var scrollFrameWidth = geometry.scrollFrame.offsetWidth;
					var tabBarWidth = geometry.tabBar.offsetWidth;
					var remainingTabBarWidth = tabBarWidth - translateOffset;
					var forwardIndicator = _elm_lang$core$Native_Utils.cmp(remainingTabBarWidth, scrollFrameWidth) > 0;
					var backIndicator = !_elm_lang$core$Native_Utils.eq(translateOffset, 0);
					return {forwardIndicator: forwardIndicator, backIndicator: backIndicator};
				});
			var scrollToTabAtIndex = F3(
				function (isRtl, geometry, i) {
					var tabBarWidth = geometry.tabBar.offsetWidth;
					var normalizeForRtl = F2(
						function (left, width) {
							return isRtl ? (tabBarWidth - (left + width)) : left;
						});
					var tab = A2(
						_elm_lang$core$Maybe$withDefault,
						{offsetLeft: 0, offsetWidth: 0},
						_elm_lang$core$List$head(
							A2(_elm_lang$core$List$drop, i, geometry.tabs)));
					var scrollTargetOffsetLeft = tab.offsetLeft;
					var scrollTargetOffsetWidth = tab.offsetWidth;
					return A2(normalizeForRtl, scrollTargetOffsetLeft, scrollTargetOffsetWidth);
				});
			var isRtl = false;
			var _p14 = msg;
			switch (_p14.ctor) {
				case 'RippleMsg':
					var _p17 = _p14._0;
					var _p15 = A2(
						_user$project$Internal_Ripple_Implementation$update,
						_p14._1,
						A2(
							_elm_lang$core$Maybe$withDefault,
							_user$project$Internal_Ripple_Model$defaultModel,
							A2(_elm_lang$core$Dict$get, _p17, model.ripples)));
					var ripple = _p15._0;
					var effects = _p15._1;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									ripples: A3(_elm_lang$core$Dict$insert, _p17, ripple, model.ripples)
								})),
						_1: A2(
							_elm_lang$core$Platform_Cmd$map,
							function (_p16) {
								return lift(
									A2(_user$project$Internal_Tabs_Model$RippleMsg, _p17, _p16));
							},
							effects)
					};
				case 'Dispatch':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Nothing,
						_1: _user$project$Internal_Dispatch$forward(_p14._0)
					};
				case 'NoOp':
					return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
				case 'Select':
					var _p19 = _p14._0;
					var _p18 = _p14._1;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									index: _p19,
									scale: A2(_user$project$Internal_Tabs_Implementation$computeScale, _p18, _p19),
									geometry: _elm_lang$core$Maybe$Just(_p18)
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'ScrollBack':
					var _p29 = _p14._0;
					var currentTranslateOffset = model.translateOffset;
					var scrollFrameWidth = _p29.scrollFrame.offsetWidth;
					var tabBarWidth = _p29.tabBar.offsetWidth;
					var loop = F2(
						function (_p21, _p20) {
							var _p22 = _p21;
							var _p26 = _p22._1;
							var _p25 = _p22._0;
							var _p23 = _p20;
							var _p24 = _p23;
							if (!_elm_lang$core$Native_Utils.eq(_p23.scrollTargetIndex, _elm_lang$core$Maybe$Nothing)) {
								return _p24;
							} else {
								var tabOffsetLeft = _p26.offsetLeft;
								var tabBarWidthLessTabOffsetLeft = tabBarWidth - tabOffsetLeft;
								var tabIsNotOccluded = (!isRtl) ? (_elm_lang$core$Native_Utils.cmp(tabOffsetLeft, currentTranslateOffset) > 0) : (_elm_lang$core$Native_Utils.cmp(tabBarWidthLessTabOffsetLeft, currentTranslateOffset) > 0);
								if (tabIsNotOccluded) {
									return _p24;
								} else {
									var newTabWidthAccumulator = _p23.tabWidthAccumulator + _p26.offsetWidth;
									var scrollTargetDetermined = _elm_lang$core$Native_Utils.cmp(newTabWidthAccumulator, scrollFrameWidth) > 0;
									var newScrollTargetIndex = scrollTargetDetermined ? _elm_lang$core$Maybe$Just(
										isRtl ? (_p25 + 1) : _p25) : _elm_lang$core$Maybe$Nothing;
									return {scrollTargetIndex: newScrollTargetIndex, tabWidthAccumulator: newTabWidthAccumulator};
								}
							}
						});
					var scrollTargetIndex = function (_p27) {
						return A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							function (_) {
								return _.scrollTargetIndex;
							}(_p27));
					}(
						A3(
							_elm_lang$core$List$foldl,
							loop,
							{scrollTargetIndex: _elm_lang$core$Maybe$Nothing, tabWidthAccumulator: 0},
							_elm_lang$core$List$reverse(
								A2(
									_elm_lang$core$List$indexedMap,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									_p29.tabs))));
					var translateOffset = A3(scrollToTabAtIndex, isRtl, _p29, scrollTargetIndex);
					var _p28 = A2(indicatorEnabledStates, _p29, translateOffset);
					var forwardIndicator = _p28.forwardIndicator;
					var backIndicator = _p28.backIndicator;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									geometry: _elm_lang$core$Maybe$Just(_p29),
									translateOffset: translateOffset,
									forwardIndicator: forwardIndicator,
									backIndicator: backIndicator
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'ScrollForward':
					var _p37 = _p14._0;
					var currentTranslationOffset = model.translateOffset;
					var scrollFrameWidth = _p37.scrollFrame.offsetWidth + currentTranslationOffset;
					var loop = F2(
						function (_p31, _p30) {
							var _p32 = _p31;
							var _p34 = _p32._1;
							var _p33 = _p30;
							if (!_elm_lang$core$Native_Utils.eq(_p33.scrollTargetIndex, _elm_lang$core$Maybe$Nothing)) {
								return _p33;
							} else {
								var tabOffsetLeftAndWidth = _p34.offsetLeft + _p34.offsetWidth;
								var scrollTargetDetermined = function () {
									if (!isRtl) {
										return _elm_lang$core$Native_Utils.cmp(tabOffsetLeftAndWidth, scrollFrameWidth) > 0;
									} else {
										var tabRightOffset = _p34.offsetWidth - tabOffsetLeftAndWidth;
										var frameOffsetAndTabWidth = scrollFrameWidth - _p34.offsetWidth;
										return _elm_lang$core$Native_Utils.cmp(tabRightOffset, frameOffsetAndTabWidth) > 0;
									}
								}();
								return scrollTargetDetermined ? {
									scrollTargetIndex: _elm_lang$core$Maybe$Just(_p32._0)
								} : {scrollTargetIndex: _elm_lang$core$Maybe$Nothing};
							}
						});
					var scrollTargetIndex = function (_p35) {
						return A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							function (_) {
								return _.scrollTargetIndex;
							}(_p35));
					}(
						A3(
							_elm_lang$core$List$foldl,
							loop,
							{scrollTargetIndex: _elm_lang$core$Maybe$Nothing},
							A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								_p37.tabs)));
					var translateOffset = A3(scrollToTabAtIndex, isRtl, _p37, scrollTargetIndex);
					var _p36 = A2(indicatorEnabledStates, _p37, translateOffset);
					var forwardIndicator = _p36.forwardIndicator;
					var backIndicator = _p36.backIndicator;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									geometry: _elm_lang$core$Maybe$Just(_p37),
									translateOffset: translateOffset,
									forwardIndicator: forwardIndicator,
									backIndicator: backIndicator
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'Focus':
					var _p38 = _p14._1;
					var currentTranslateOffset = model.translateOffset;
					var tabBarWidth = _p38.tabBar.offsetWidth;
					var scrollFrameWidth = _p38.scrollFrame.offsetWidth;
					var tab = A2(
						_elm_lang$core$Maybe$withDefault,
						{offsetLeft: 0, offsetWidth: 0},
						_elm_lang$core$List$head(
							A2(_elm_lang$core$List$drop, _p14._0, _p38.tabs)));
					var leftEdge = tab.offsetLeft;
					var normalizedLeftOffset = tabBarWidth - leftEdge;
					var rightEdge = leftEdge + tab.offsetWidth;
					var shouldScrollBack = (!isRtl) ? (_elm_lang$core$Native_Utils.cmp(rightEdge, currentTranslateOffset) < 1) : (_elm_lang$core$Native_Utils.cmp(leftEdge, tabBarWidth - currentTranslateOffset) > -1);
					var shouldScrollForward = (!isRtl) ? (_elm_lang$core$Native_Utils.cmp(rightEdge, currentTranslateOffset + scrollFrameWidth) > 0) : (_elm_lang$core$Native_Utils.cmp(normalizedLeftOffset, scrollFrameWidth + currentTranslateOffset) > 0);
					var resetAmt = isRtl ? model.scrollLeftAmount : 0;
					if (shouldScrollForward) {
						var _v8 = lift,
							_v9 = _user$project$Internal_Tabs_Model$ScrollForward(_p38),
							_v10 = model;
						lift = _v8;
						msg = _v9;
						model = _v10;
						continue update;
					} else {
						if (shouldScrollBack) {
							var _v11 = lift,
								_v12 = _user$project$Internal_Tabs_Model$ScrollBack(_p38),
								_v13 = model;
							lift = _v11;
							msg = _v12;
							model = _v13;
							continue update;
						} else {
							return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
						}
					}
				case 'Init':
					var _p40 = _p14._0;
					return {
						ctor: '_Tuple2',
						_0: function () {
							var scrollFrameWidth = _p40.scrollFrame.offsetWidth;
							var tabBarWidth = _p40.tabBar.offsetWidth;
							var isOverflowing = _elm_lang$core$Native_Utils.cmp(tabBarWidth, scrollFrameWidth) > 0;
							var translateOffset = (!isOverflowing) ? 0 : model.translateOffset;
							var _p39 = A2(indicatorEnabledStates, _p40, translateOffset);
							var forwardIndicator = _p39.forwardIndicator;
							var backIndicator = _p39.backIndicator;
							return _elm_lang$core$Maybe$Just(
								_elm_lang$core$Native_Utils.update(
									model,
									{
										geometry: _elm_lang$core$Maybe$Just(_p40),
										scale: A2(_user$project$Internal_Tabs_Implementation$computeScale, _p40, 0),
										forwardIndicator: forwardIndicator,
										backIndicator: backIndicator,
										translateOffset: translateOffset,
										indicatorShown: false || model.indicatorShown
									}));
						}(),
						_1: A2(
							_user$project$Internal_Helpers$delayedCmd,
							0,
							lift(_user$project$Internal_Tabs_Model$SetIndicatorShown))
					};
				default:
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{indicatorShown: true})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
			}
		}
	});
var _user$project$Internal_Tabs_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Tabs_Implementation$get, _user$project$Internal_Tabs_Implementation$set, _user$project$Internal_Msg$TabsMsg, _user$project$Internal_Tabs_Implementation$update);
var _user$project$Internal_Tabs_Implementation$Config = F3(
	function (a, b, c) {
		return {active: a, scroller: b, indicator: c};
	});
var _user$project$Internal_Tabs_Implementation$Tab = F2(
	function (a, b) {
		return {options: a, childs: b};
	});

var _user$project$Internal_Textfield_HelperText_Implementation$validationMsg = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{validationMsg: true});
	});
var _user$project$Internal_Textfield_HelperText_Implementation$persistent = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{persistent: true});
	});
var _user$project$Internal_Textfield_HelperText_Implementation$defaultConfig = {persistent: false, validationMsg: false};
var _user$project$Internal_Textfield_HelperText_Implementation$helperText = function (options) {
	var _p0 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Textfield_HelperText_Implementation$defaultConfig, options);
	var summary = _p0;
	var config = _p0.config;
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$p,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-text-field-helper-text'),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Internal_Options$when,
					config.persistent,
					_user$project$Internal_Options$cs('mdc-text-field-helper-text--persistent')),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						config.validationMsg,
						_user$project$Internal_Options$cs('mdc-text-field-helper-text--validation-msg')),
					_1: options
				}
			}
		});
};
var _user$project$Internal_Textfield_HelperText_Implementation$Config = F2(
	function (a, b) {
		return {persistent: a, validationMsg: b};
	});

var _user$project$Internal_Textfield_Implementation$decodeGeometry = _debois$elm_dom$DOM$target(
	_debois$elm_dom$DOM$parentElement(
		A4(
			_elm_lang$core$Json_Decode$map3,
			_user$project$Internal_Textfield_Model$Geometry,
			A2(_debois$elm_dom$DOM$childNode, 2, _debois$elm_dom$DOM$offsetWidth),
			A2(_debois$elm_dom$DOM$childNode, 2, _debois$elm_dom$DOM$offsetHeight),
			A2(_debois$elm_dom$DOM$childNode, 1, _debois$elm_dom$DOM$offsetWidth))));
var _user$project$Internal_Textfield_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.textfield;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{textfield: x});
		}),
	_user$project$Internal_Textfield_Model$defaultModel);
var _user$project$Internal_Textfield_Implementation$get = _user$project$Internal_Textfield_Implementation$_p0._0;
var _user$project$Internal_Textfield_Implementation$set = _user$project$Internal_Textfield_Implementation$_p0._1;
var _user$project$Internal_Textfield_Implementation$update = F3(
	function (lift, msg, model) {
		var _p1 = msg;
		switch (_p1.ctor) {
			case 'Input':
				var _p2 = _p1._0;
				var dirty = !_elm_lang$core$Native_Utils.eq(_p2, '');
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{
								value: _elm_lang$core$Maybe$Just(_p2),
								isDirty: dirty
							})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Blur':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{focused: false, geometry: _elm_lang$core$Maybe$Nothing})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Focus':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{
								focused: true,
								geometry: _elm_lang$core$Maybe$Just(_p1._0)
							})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'NoOp':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				var _p3 = A2(_user$project$Internal_Ripple_Implementation$update, _p1._0, model.ripple);
				var ripple = _p3._0;
				var effects = _p3._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							model,
							{ripple: ripple})),
					_1: A2(
						_elm_lang$core$Platform_Cmd$map,
						function (_p4) {
							return lift(
								_user$project$Internal_Textfield_Model$RippleMsg(_p4));
						},
						effects)
				};
		}
	});
var _user$project$Internal_Textfield_Implementation$react = A4(_user$project$Internal_Component$react, _user$project$Internal_Textfield_Implementation$get, _user$project$Internal_Textfield_Implementation$set, _user$project$Internal_Msg$TextfieldMsg, _user$project$Internal_Textfield_Implementation$update);
var _user$project$Internal_Textfield_Implementation$nativeControl = _user$project$Internal_Options$nativeControl;
var _user$project$Internal_Textfield_Implementation$placeholder = function (placeholder) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					placeholder: _elm_lang$core$Maybe$Just(placeholder)
				});
		});
};
var _user$project$Internal_Textfield_Implementation$textarea = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{textarea: true});
	});
var _user$project$Internal_Textfield_Implementation$invalid = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{invalid: true});
	});
var _user$project$Internal_Textfield_Implementation$fullwidth = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fullWidth: true});
	});
var _user$project$Internal_Textfield_Implementation$type_ = function (_p5) {
	return _user$project$Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						type_: _elm_lang$core$Maybe$Just(value)
					});
			})(_p5));
};
var _user$project$Internal_Textfield_Implementation$required = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{required: true});
	});
var _user$project$Internal_Textfield_Implementation$dense = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{dense: true});
	});
var _user$project$Internal_Textfield_Implementation$cols = function (cols) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					cols: _elm_lang$core$Maybe$Just(cols)
				});
		});
};
var _user$project$Internal_Textfield_Implementation$rows = function (rows) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					rows: _elm_lang$core$Maybe$Just(rows)
				});
		});
};
var _user$project$Internal_Textfield_Implementation$pattern = function (pattern) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					pattern: _elm_lang$core$Maybe$Just(pattern)
				});
		});
};
var _user$project$Internal_Textfield_Implementation$box = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{box: true});
	});
var _user$project$Internal_Textfield_Implementation$email = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				type_: _elm_lang$core$Maybe$Just('email')
			});
	});
var _user$project$Internal_Textfield_Implementation$password = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				type_: _elm_lang$core$Maybe$Just('password')
			});
	});
var _user$project$Internal_Textfield_Implementation$disabled = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _user$project$Internal_Textfield_Implementation$value = function (_p6) {
	return _user$project$Internal_Options$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						value: _elm_lang$core$Maybe$Just(str)
					});
			})(_p6));
};
var _user$project$Internal_Textfield_Implementation$label = function (_p7) {
	return _user$project$Internal_Options$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						labelText: _elm_lang$core$Maybe$Just(str)
					});
			})(_p7));
};
var _user$project$Internal_Textfield_Implementation$outlined = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{outlined: true});
	});
var _user$project$Internal_Textfield_Implementation$trailingIcon = function (icon) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					trailingIcon: _elm_lang$core$Maybe$Just(icon)
				});
		});
};
var _user$project$Internal_Textfield_Implementation$leadingIcon = function (icon) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					leadingIcon: _elm_lang$core$Maybe$Just(icon)
				});
		});
};
var _user$project$Internal_Textfield_Implementation$iconUnclickable = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{iconClickable: false});
	});
var _user$project$Internal_Textfield_Implementation$defaultConfig = {
	labelText: _elm_lang$core$Maybe$Nothing,
	labelFloat: false,
	value: _elm_lang$core$Maybe$Nothing,
	defaultValue: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	dense: false,
	required: false,
	type_: _elm_lang$core$Maybe$Just('text'),
	box: false,
	pattern: _elm_lang$core$Maybe$Nothing,
	textarea: false,
	fullWidth: false,
	invalid: false,
	outlined: false,
	leadingIcon: _elm_lang$core$Maybe$Nothing,
	trailingIcon: _elm_lang$core$Maybe$Nothing,
	iconClickable: true,
	placeholder: _elm_lang$core$Maybe$Nothing,
	cols: _elm_lang$core$Maybe$Nothing,
	rows: _elm_lang$core$Maybe$Nothing,
	nativeControl: {ctor: '[]'},
	id_: ''
};
var _user$project$Internal_Textfield_Implementation$textField = F4(
	function (lift, model, options, _p8) {
		var ripple = A4(
			_user$project$Internal_Ripple_Implementation$view,
			false,
			function (_p9) {
				return lift(
					_user$project$Internal_Textfield_Model$RippleMsg(_p9));
			},
			model.ripple,
			{ctor: '[]'});
		var _p10 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Textfield_Implementation$defaultConfig, options);
		var summary = _p10;
		var config = _p10.config;
		var isDirty = model.isDirty || A2(
			_elm_lang$core$Maybe$withDefault,
			false,
			A2(
				_elm_lang$core$Maybe$map,
				F2(
					function (x, y) {
						return !_elm_lang$core$Native_Utils.eq(x, y);
					})(''),
				config.value));
		var focused = model.focused && (!config.disabled);
		var isInvalid = A2(
			F2(
				function (x, y) {
					return x || y;
				}),
			config.invalid,
			function () {
				var _p11 = config.pattern;
				if (_p11.ctor === 'Just') {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						false,
						A2(
							_elm_lang$core$Maybe$map,
							function (_p12) {
								return !A2(
									_elm_lang$core$Regex$contains,
									_elm_lang$core$Regex$regex(
										A2(
											_elm_lang$core$Basics_ops['++'],
											'^',
											A2(_elm_lang$core$Basics_ops['++'], _p11._0, '$'))),
									_p12);
							},
							model.value));
				} else {
					return false;
				}
			}());
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-text-field'),
				_1: {
					ctor: '::',
					_0: _user$project$Internal_Options$cs('mdc-text-field--upgraded'),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							focused,
							_user$project$Internal_Options$cs('mdc-text-field--focused')),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								config.disabled,
								_user$project$Internal_Options$cs('mdc-text-field--disabled')),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									config.dense,
									_user$project$Internal_Options$cs('mdc-text-field--dense')),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										config.fullWidth,
										_user$project$Internal_Options$cs('mdc-text-field--fullwidth')),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											isInvalid,
											_user$project$Internal_Options$cs('mdc-text-field--invalid')),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$when,
												config.textarea,
												_user$project$Internal_Options$cs('mdc-text-field--textarea')),
											_1: {
												ctor: '::',
												_0: A2(
													_user$project$Internal_Options$when,
													config.outlined,
													_user$project$Internal_Options$cs('mdc-text-field--outlined')),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$Internal_Options$when,
														(!_elm_lang$core$Native_Utils.eq(config.leadingIcon, _elm_lang$core$Maybe$Nothing)) && _elm_lang$core$Native_Utils.eq(config.trailingIcon, _elm_lang$core$Maybe$Nothing),
														_user$project$Internal_Options$cs('mdc-text-field--with-leading-icon')),
													_1: {
														ctor: '::',
														_0: A2(
															_user$project$Internal_Options$when,
															!_elm_lang$core$Native_Utils.eq(config.trailingIcon, _elm_lang$core$Maybe$Nothing),
															_user$project$Internal_Options$cs('mdc-text-field--with-trailing-icon')),
														_1: {
															ctor: '::',
															_0: A2(_user$project$Internal_Options$when, config.box || config.outlined, ripple.interactionHandler),
															_1: {
																ctor: '::',
																_0: function (_p13) {
																	return A2(
																		_user$project$Internal_Options$when,
																		config.box,
																		_user$project$Internal_Options$many(_p13));
																}(
																	{
																		ctor: '::',
																		_0: _user$project$Internal_Options$cs('mdc-text-field--box'),
																		_1: {
																			ctor: '::',
																			_0: ripple.properties,
																			_1: {ctor: '[]'}
																		}
																	}),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: {
						ctor: '::',
						_0: A4(
							_user$project$Internal_Options$applyNativeControl,
							summary,
							config.textarea ? _elm_lang$html$Html$textarea : _elm_lang$html$Html$input,
							{
								ctor: '::',
								_0: _user$project$Internal_Options$cs('mdc-text-field__input'),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Internal_Options$css, 'outline', 'none'),
									_1: {
										ctor: '::',
										_0: _user$project$Internal_Options$id(config.id_),
										_1: {
											ctor: '::',
											_0: config.outlined ? A2(
												_user$project$Internal_Options$on,
												'focus',
												A2(
													_elm_lang$core$Json_Decode$map,
													function (_p14) {
														return lift(
															_user$project$Internal_Textfield_Model$Focus(_p14));
													},
													_user$project$Internal_Textfield_Implementation$decodeGeometry)) : A2(
												_user$project$Internal_Options$on,
												'focus',
												_elm_lang$core$Json_Decode$succeed(
													lift(
														_user$project$Internal_Textfield_Model$Focus(_user$project$Internal_Textfield_Model$defaultGeometry)))),
											_1: {
												ctor: '::',
												_0: _user$project$Internal_Options$onBlur(
													lift(_user$project$Internal_Textfield_Model$Blur)),
												_1: {
													ctor: '::',
													_0: _user$project$Internal_Options$onInput(
														function (_p15) {
															return lift(
																_user$project$Internal_Textfield_Model$Input(_p15));
														}),
													_1: {
														ctor: '::',
														_0: function (_p16) {
															return _user$project$Internal_Options$many(
																A2(
																	_elm_lang$core$List$map,
																	_user$project$Internal_Options$attribute,
																	A2(_elm_lang$core$List$filterMap, _elm_lang$core$Basics$identity, _p16)));
														}(
															{
																ctor: '::',
																_0: ((!config.textarea) ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																	_elm_lang$html$Html_Attributes$type_(
																		A2(_elm_lang$core$Maybe$withDefault, 'text', config.type_))),
																_1: {
																	ctor: '::',
																	_0: (config.disabled ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																		_elm_lang$html$Html_Attributes$disabled(true)),
																	_1: {
																		ctor: '::',
																		_0: (config.required ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																			A2(
																				_elm_lang$html$Html_Attributes$property,
																				'required',
																				_elm_lang$core$Json_Encode$bool(true))),
																		_1: {
																			ctor: '::',
																			_0: ((!_elm_lang$core$Native_Utils.eq(config.pattern, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																				A2(
																					_elm_lang$html$Html_Attributes$property,
																					'pattern',
																					_elm_lang$core$Json_Encode$string(
																						A2(_elm_lang$core$Maybe$withDefault, '', config.pattern)))),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$core$Maybe$Just(
																					A2(_elm_lang$html$Html_Attributes$attribute, 'outline', 'medium none')),
																				_1: {
																					ctor: '::',
																					_0: ((!_elm_lang$core$Native_Utils.eq(config.value, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																						_elm_lang$html$Html_Attributes$value(
																							A2(_elm_lang$core$Maybe$withDefault, '', config.value))),
																					_1: {ctor: '[]'}
																				}
																			}
																		}
																	}
																}
															}),
														_1: {
															ctor: '::',
															_0: _user$project$Internal_Options$many(
																{
																	ctor: '::',
																	_0: A3(
																		_user$project$Internal_Options$onWithOptions,
																		'keydown',
																		{preventDefault: false, stopPropagation: true},
																		_elm_lang$core$Json_Decode$succeed(
																			lift(_user$project$Internal_Textfield_Model$NoOp))),
																	_1: {
																		ctor: '::',
																		_0: A3(
																			_user$project$Internal_Options$onWithOptions,
																			'keyup',
																			{preventDefault: false, stopPropagation: true},
																			_elm_lang$core$Json_Decode$succeed(
																				lift(_user$project$Internal_Textfield_Model$NoOp))),
																		_1: {ctor: '[]'}
																	}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_user$project$Internal_Options$when,
																	!_elm_lang$core$Native_Utils.eq(config.placeholder, _elm_lang$core$Maybe$Nothing),
																	_user$project$Internal_Options$attribute(
																		_elm_lang$html$Html_Attributes$placeholder(
																			A2(_elm_lang$core$Maybe$withDefault, '', config.placeholder)))),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_user$project$Internal_Options$when,
																		config.textarea && (!_elm_lang$core$Native_Utils.eq(config.rows, _elm_lang$core$Maybe$Nothing)),
																		_user$project$Internal_Options$attribute(
																			_elm_lang$html$Html_Attributes$rows(
																				A2(_elm_lang$core$Maybe$withDefault, 0, config.rows)))),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_user$project$Internal_Options$when,
																			config.textarea && (!_elm_lang$core$Native_Utils.eq(config.cols, _elm_lang$core$Maybe$Nothing)),
																			_user$project$Internal_Options$attribute(
																				_elm_lang$html$Html_Attributes$cols(
																					A2(_elm_lang$core$Maybe$withDefault, 0, config.cols)))),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: (!config.fullWidth) ? A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$label,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-floating-label'),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											focused || isDirty,
											_user$project$Internal_Options$cs('mdc-floating-label--float-above')),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_Options$for(config.id_),
											_1: {ctor: '[]'}
										}
									}
								},
								function () {
									var _p17 = config.labelText;
									if (_p17.ctor === 'Just') {
										return {
											ctor: '::',
											_0: _elm_lang$html$Html$text(_p17._0),
											_1: {ctor: '[]'}
										};
									} else {
										return {ctor: '[]'};
									}
								}()) : _elm_lang$html$Html$text(''),
							_1: {ctor: '[]'}
						}
					},
					_1: {
						ctor: '::',
						_0: ((!config.outlined) && ((!config.textarea) && (!config.fullWidth))) ? {
							ctor: '::',
							_0: A3(
								_user$project$Internal_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _user$project$Internal_Options$cs('mdc-line-ripple'),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											model.focused,
											_user$project$Internal_Options$cs('mdc-line-ripple--active')),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						} : {ctor: '[]'},
						_1: {
							ctor: '::',
							_0: function () {
								if (config.outlined) {
									var isRtl = false;
									var d = function () {
										var labelScale = config.dense ? 0.923 : 0.75;
										var radius = 4;
										var cornerWidth = radius + 1.2;
										var leadingStrokeLength = _elm_lang$core$Basics$abs(11 - cornerWidth);
										var _p18 = A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Textfield_Model$defaultGeometry, model.geometry);
										var labelWidth = _p18.labelWidth;
										var width = _p18.width;
										var height = _p18.height;
										var scaledLabelWidth = labelScale * labelWidth;
										var paddedLabelWidth = scaledLabelWidth + 8;
										var pathMiddle = A2(
											_elm_lang$core$String$join,
											'',
											{
												ctor: '::',
												_0: 'a',
												_1: {
													ctor: '::',
													_0: _elm_lang$core$Basics$toString(radius),
													_1: {
														ctor: '::',
														_0: ',',
														_1: {
															ctor: '::',
															_0: _elm_lang$core$Basics$toString(radius),
															_1: {
																ctor: '::',
																_0: ' 0 0 1 ',
																_1: {
																	ctor: '::',
																	_0: _elm_lang$core$Basics$toString(radius),
																	_1: {
																		ctor: '::',
																		_0: ',',
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$core$Basics$toString(radius),
																			_1: {
																				ctor: '::',
																				_0: 'v',
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$core$Basics$toString(height - (2 * cornerWidth)),
																					_1: {
																						ctor: '::',
																						_0: 'a',
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$core$Basics$toString(radius),
																							_1: {
																								ctor: '::',
																								_0: ',',
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$core$Basics$toString(radius),
																									_1: {
																										ctor: '::',
																										_0: ' 0 0 1 ',
																										_1: {
																											ctor: '::',
																											_0: _elm_lang$core$Basics$toString(0 - radius),
																											_1: {
																												ctor: '::',
																												_0: ',',
																												_1: {
																													ctor: '::',
																													_0: _elm_lang$core$Basics$toString(radius),
																													_1: {
																														ctor: '::',
																														_0: 'h',
																														_1: {
																															ctor: '::',
																															_0: _elm_lang$core$Basics$toString((0 - width) + (2 * cornerWidth)),
																															_1: {
																																ctor: '::',
																																_0: 'a',
																																_1: {
																																	ctor: '::',
																																	_0: _elm_lang$core$Basics$toString(radius),
																																	_1: {
																																		ctor: '::',
																																		_0: ',',
																																		_1: {
																																			ctor: '::',
																																			_0: _elm_lang$core$Basics$toString(radius),
																																			_1: {
																																				ctor: '::',
																																				_0: ' 0 0 1 ',
																																				_1: {
																																					ctor: '::',
																																					_0: _elm_lang$core$Basics$toString(0 - radius),
																																					_1: {
																																						ctor: '::',
																																						_0: ',',
																																						_1: {
																																							ctor: '::',
																																							_0: _elm_lang$core$Basics$toString(0 - radius),
																																							_1: {
																																								ctor: '::',
																																								_0: 'v',
																																								_1: {
																																									ctor: '::',
																																									_0: _elm_lang$core$Basics$toString((0 - height) + (2 * cornerWidth)),
																																									_1: {
																																										ctor: '::',
																																										_0: 'a',
																																										_1: {
																																											ctor: '::',
																																											_0: _elm_lang$core$Basics$toString(radius),
																																											_1: {
																																												ctor: '::',
																																												_0: ',',
																																												_1: {
																																													ctor: '::',
																																													_0: _elm_lang$core$Basics$toString(radius),
																																													_1: {
																																														ctor: '::',
																																														_0: ' 0 0 1 ',
																																														_1: {
																																															ctor: '::',
																																															_0: _elm_lang$core$Basics$toString(radius),
																																															_1: {
																																																ctor: '::',
																																																_0: ',',
																																																_1: {
																																																	ctor: '::',
																																																	_0: _elm_lang$core$Basics$toString(0 - radius),
																																																	_1: {ctor: '[]'}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											});
										return (!isRtl) ? A2(
											_elm_lang$core$String$join,
											'',
											{
												ctor: '::',
												_0: 'M',
												_1: {
													ctor: '::',
													_0: _elm_lang$core$Basics$toString((cornerWidth + leadingStrokeLength) + paddedLabelWidth),
													_1: {
														ctor: '::',
														_0: ',1h',
														_1: {
															ctor: '::',
															_0: _elm_lang$core$Basics$toString(((width - (2 * cornerWidth)) - paddedLabelWidth) - leadingStrokeLength),
															_1: {
																ctor: '::',
																_0: pathMiddle,
																_1: {
																	ctor: '::',
																	_0: 'h',
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$core$Basics$toString(leadingStrokeLength),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}) : A2(
											_elm_lang$core$String$join,
											'',
											{
												ctor: '::',
												_0: 'M',
												_1: {
													ctor: '::',
													_0: _elm_lang$core$Basics$toString((width - cornerWidth) - leadingStrokeLength),
													_1: {
														ctor: '::',
														_0: ',1h',
														_1: {
															ctor: '::',
															_0: _elm_lang$core$Basics$toString(leadingStrokeLength),
															_1: {
																ctor: '::',
																_0: pathMiddle,
																_1: {
																	ctor: '::',
																	_0: 'h',
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$core$Basics$toString(((width - (2 * cornerWidth)) - paddedLabelWidth) - leadingStrokeLength),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											});
									}();
									return {
										ctor: '::',
										_0: A3(
											_user$project$Internal_Options$styled,
											_elm_lang$html$Html$div,
											{
												ctor: '::',
												_0: _user$project$Internal_Options$cs('mdc-notched-outline'),
												_1: {
													ctor: '::',
													_0: A2(
														_user$project$Internal_Options$when,
														focused || isDirty,
														_user$project$Internal_Options$cs('mdc-notched-outline--notched')),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$svg,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: A2(
															_elm_lang$svg$Svg$path,
															{
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$class('mdc-notched-outline__path'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$d(d),
																	_1: {ctor: '[]'}
																}
															},
															{ctor: '[]'}),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A3(
												_user$project$Internal_Options$styled,
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: _user$project$Internal_Options$cs('mdc-notched-outline__idle'),
													_1: {ctor: '[]'}
												},
												{ctor: '[]'}),
											_1: {ctor: '[]'}
										}
									};
								} else {
									return {ctor: '[]'};
								}
							}(),
							_1: {
								ctor: '::',
								_0: function () {
									var icon = A2(
										_elm_lang$core$Maybe$withDefault,
										config.trailingIcon,
										A2(_elm_lang$core$Maybe$map, _elm_lang$core$Maybe$Just, config.leadingIcon));
									var _p19 = icon;
									if (_p19.ctor === 'Just') {
										return {
											ctor: '::',
											_0: A3(
												_user$project$Internal_Options$styled,
												_elm_lang$html$Html$i,
												{
													ctor: '::',
													_0: _user$project$Internal_Options$cs('material-icons mdc-text-field__icon'),
													_1: {
														ctor: '::',
														_0: function (_p20) {
															return _user$project$Internal_Options$attribute(
																_elm_lang$html$Html_Attributes$tabindex(_p20));
														}(
															config.iconClickable ? 0 : -1),
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(_p19._0),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										};
									} else {
										return {ctor: '[]'};
									}
								}(),
								_1: {
									ctor: '::',
									_0: {
										ctor: '::',
										_0: ripple.style,
										_1: {ctor: '[]'}
									},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}));
	});
var _user$project$Internal_Textfield_Implementation$view = F4(
	function (lift, index, store, options) {
		return A7(
			_user$project$Internal_Component$render,
			_user$project$Internal_Textfield_Implementation$get,
			_user$project$Internal_Textfield_Implementation$textField,
			_user$project$Internal_Msg$TextfieldMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$id_(index),
				_1: options
			});
	});
var _user$project$Internal_Textfield_Implementation$Config = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return {labelText: a, labelFloat: b, value: c, defaultValue: d, disabled: e, dense: f, required: g, type_: h, box: i, pattern: j, textarea: k, fullWidth: l, invalid: m, outlined: n, leadingIcon: o, trailingIcon: p, iconClickable: q, placeholder: r, cols: s, rows: t, nativeControl: u, id_: v};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};

var _user$project$Internal_Toolbar_Implementation$iconToggle = _user$project$Internal_Options$cs('mdc-toolbar__icon');
var _user$project$Internal_Toolbar_Implementation$icon = _user$project$Internal_Options$cs('mdc-toolbar__icon');
var _user$project$Internal_Toolbar_Implementation$title = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-toolbar__title'),
			_1: options
		});
};
var _user$project$Internal_Toolbar_Implementation$menuIcon = _user$project$Internal_Options$cs('mdc-toolbar__menu-icon');
var _user$project$Internal_Toolbar_Implementation$shrinkToFit = _user$project$Internal_Options$cs('mdc-toolbar__section--shrink-to-fit');
var _user$project$Internal_Toolbar_Implementation$alignEnd = _user$project$Internal_Options$cs('mdc-toolbar__section--align-end');
var _user$project$Internal_Toolbar_Implementation$alignStart = _user$project$Internal_Options$cs('mdc-toolbar__section--align-start');
var _user$project$Internal_Toolbar_Implementation$section = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$section,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-toolbar__section'),
			_1: options
		});
};
var _user$project$Internal_Toolbar_Implementation$row = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-toolbar__row'),
			_1: options
		});
};
var _user$project$Internal_Toolbar_Implementation$backgroundImage = function (backgroundImage) {
	return _user$project$Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					backgroundImage: _elm_lang$core$Maybe$Just(backgroundImage)
				});
		});
};
var _user$project$Internal_Toolbar_Implementation$fixedLastRow = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedLastrow: true});
	});
var _user$project$Internal_Toolbar_Implementation$flexibleDefaultBehavior = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{useFlexibleDefaultBehavior: true});
	});
var _user$project$Internal_Toolbar_Implementation$flexible = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{flexible: true});
	});
var _user$project$Internal_Toolbar_Implementation$waterfall = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{waterfall: true});
	});
var _user$project$Internal_Toolbar_Implementation$fixed = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixed: true});
	});
var _user$project$Internal_Toolbar_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.toolbar;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{toolbar: x});
		}),
	_user$project$Internal_Toolbar_Model$defaultModel);
var _user$project$Internal_Toolbar_Implementation$get = _user$project$Internal_Toolbar_Implementation$_p0._0;
var _user$project$Internal_Toolbar_Implementation$set = _user$project$Internal_Toolbar_Implementation$_p0._1;
var _user$project$Internal_Toolbar_Implementation$setKeyHeights = F2(
	function (geometry, calculations) {
		var toolbarRowHeight = geometry.getRowHeight;
		var toolbarHeight = calculations.toolbarRatio * toolbarRowHeight;
		var flexibleExpansionHeight = calculations.flexibleExpansionRatio * toolbarRowHeight;
		var maxTranslateYDistance = calculations.maxTranslateYRatio * toolbarRowHeight;
		var scrollThreshold = calculations.scrollThresholdRatio * toolbarRowHeight;
		return _elm_lang$core$Native_Utils.update(
			calculations,
			{toolbarRowHeight: toolbarRowHeight, toolbarHeight: toolbarHeight, flexibleExpansionHeight: flexibleExpansionHeight, maxTranslateYDistance: maxTranslateYDistance, scrollThreshold: scrollThreshold});
	});
var _user$project$Internal_Toolbar_Implementation$initKeyRatio = F2(
	function (config, geometry) {
		var toolbarRowHeight = geometry.getRowHeight;
		var firstRowMaxRatio = _elm_lang$core$Native_Utils.eq(toolbarRowHeight, 0) ? 0 : (geometry.getFirstRowElementOffsetHeight / toolbarRowHeight);
		var flexibleExpansionRatio = firstRowMaxRatio - 1;
		var toolbarRatio = _elm_lang$core$Native_Utils.eq(toolbarRowHeight, 0) ? 0 : (geometry.getOffsetHeight / toolbarRowHeight);
		var maxTranslateYRatio = config.fixedLastrow ? (toolbarRatio - firstRowMaxRatio) : 0;
		var scrollThresholdRatio = config.fixedLastrow ? (toolbarRatio - 1) : (firstRowMaxRatio - 1);
		return _elm_lang$core$Native_Utils.update(
			_user$project$Internal_Toolbar_Model$defaultCalculations,
			{toolbarRatio: toolbarRatio, flexibleExpansionRatio: flexibleExpansionRatio, maxTranslateYRatio: maxTranslateYRatio, scrollThresholdRatio: scrollThresholdRatio});
	});
var _user$project$Internal_Toolbar_Implementation$flexibleExpansionRatio = F2(
	function (calculations, scrollTop) {
		var delta = 1.0e-4;
		return A2(_elm_lang$core$Basics$max, 0, 1 - (scrollTop / (calculations.flexibleExpansionHeight + delta)));
	});
var _user$project$Internal_Toolbar_Implementation$adjustElementStyles = F2(
	function (config, calculations) {
		var marginTop = calculations.toolbarHeight;
		return config.fixed ? _elm_lang$core$Maybe$Just(
			A2(
				_user$project$Internal_Options$css,
				'margin-top',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(marginTop),
					'px'))) : _elm_lang$core$Maybe$Nothing;
	});
var _user$project$Internal_Toolbar_Implementation$fixedAdjust = F2(
	function (index, store) {
		var model = A2(
			_elm_lang$core$Maybe$withDefault,
			_user$project$Internal_Toolbar_Model$defaultModel,
			A2(_elm_lang$core$Dict$get, index, store.toolbar));
		var styles = A2(
			_elm_lang$core$Maybe$andThen,
			function (_p1) {
				var _p2 = _p1;
				return A2(_user$project$Internal_Toolbar_Implementation$adjustElementStyles, _p2._0, _p2._1);
			},
			A3(
				_elm_lang$core$Maybe$map2,
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				model.config,
				model.calculations));
		return _user$project$Internal_Options$many(
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-toolbar-fixed-adjust'),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Maybe$withDefault, _user$project$Internal_Options$nop, styles),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Internal_Toolbar_Implementation$decodeScrollTop = _debois$elm_dom$DOM$target(
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'ownerDocument',
			_1: {
				ctor: '::',
				_0: 'defaultView',
				_1: {
					ctor: '::',
					_0: 'scrollY',
					_1: {ctor: '[]'}
				}
			}
		},
		_elm_lang$core$Json_Decode$float));
var _user$project$Internal_Toolbar_Implementation$update = F2(
	function (msg, model) {
		var _p3 = msg;
		switch (_p3.ctor) {
			case 'Init':
				var _p5 = _p3._1;
				var _p4 = _p3._0;
				var calculations = A2(
					_user$project$Internal_Toolbar_Implementation$setKeyHeights,
					_p5,
					A2(_user$project$Internal_Toolbar_Implementation$initKeyRatio, _p4, _p5));
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							geometry: _elm_lang$core$Maybe$Just(_p5),
							calculations: _elm_lang$core$Maybe$Just(calculations),
							config: _elm_lang$core$Maybe$Just(_p4)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Resize':
				var _p6 = _p3._1;
				var calculations = A2(
					_elm_lang$core$Maybe$map,
					_user$project$Internal_Toolbar_Implementation$setKeyHeights(_p6),
					model.calculations);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							geometry: _elm_lang$core$Maybe$Just(_p6),
							calculations: calculations,
							config: _elm_lang$core$Maybe$Just(_p3._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							scrollTop: _p3._1,
							config: _elm_lang$core$Maybe$Just(_p3._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Internal_Toolbar_Implementation$react = A4(
	_user$project$Internal_Component$react,
	_user$project$Internal_Toolbar_Implementation$get,
	_user$project$Internal_Toolbar_Implementation$set,
	_user$project$Internal_Msg$ToolbarMsg,
	_user$project$Internal_Component$generalise(_user$project$Internal_Toolbar_Implementation$update));
var _user$project$Internal_Toolbar_Implementation$numbers = {maxTitleSize: 2.125, minTitleSize: 1.25, toolbarRowHeight: 64, toolbarRowMobileHeight: 56, toolbarMobileBreakpoint: 600};
var _user$project$Internal_Toolbar_Implementation$decodeGeometry = function () {
	var getOffsetHeight = _debois$elm_dom$DOM$target(_debois$elm_dom$DOM$offsetHeight);
	var firstRowElement = function (decoder) {
		return _debois$elm_dom$DOM$target(
			A2(_debois$elm_dom$DOM$childNode, 0, decoder));
	};
	var getFirstRowElementOffsetHeight = firstRowElement(_debois$elm_dom$DOM$offsetHeight);
	var viewportWidth = _debois$elm_dom$DOM$target(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'ownerDocument',
				_1: {
					ctor: '::',
					_0: 'defaultView',
					_1: {
						ctor: '::',
						_0: 'innerWidth',
						_1: {ctor: '[]'}
					}
				}
			},
			_elm_lang$core$Json_Decode$float));
	var getRowHeight = A2(
		_elm_lang$core$Json_Decode$map,
		function (viewportWidth) {
			return (_elm_lang$core$Native_Utils.cmp(viewportWidth, _user$project$Internal_Toolbar_Implementation$numbers.toolbarMobileBreakpoint) < 0) ? _user$project$Internal_Toolbar_Implementation$numbers.toolbarRowMobileHeight : _user$project$Internal_Toolbar_Implementation$numbers.toolbarRowHeight;
		},
		viewportWidth);
	return A4(
		_elm_lang$core$Json_Decode$map3,
		F3(
			function (getRowHeight, getFirstRowElementOffsetHeight, getOffsetHeight) {
				return {getRowHeight: getRowHeight, getFirstRowElementOffsetHeight: getFirstRowElementOffsetHeight, getOffsetHeight: getOffsetHeight};
			}),
		getRowHeight,
		getFirstRowElementOffsetHeight,
		getOffsetHeight);
}();
var _user$project$Internal_Toolbar_Implementation$strings = {titleSelector: 'mdc-toolbar__title', firstRowSelector: 'mdc-toolbar__row:first-child', changeEvent: 'MDCToolbar:change'};
var _user$project$Internal_Toolbar_Implementation$cssClasses = {fixed: 'mdc-toolbar--fixed', fixedLastRow: 'mdc-toolbar--fixed-lastrow-only', fixedAtLastRow: 'mdc-toolbar--fixed-at-last-row', toolbarRowFlexible: 'mdc-toolbar--flexible', flexibleDefaultBehavior: 'mdc-toolbar--flexible-default-behavior', flexibleMax: 'mdc-toolbar--flexible-space-maximized', flexibleMin: 'mdc-toolbar--flexible-space-minimized'};
var _user$project$Internal_Toolbar_Implementation$toolbarStyles = F4(
	function (config, geometry, scrollTop, calculations) {
		var toolbarFixedState = function () {
			var translateDistance = A2(
				_elm_lang$core$Basics$max,
				0,
				A2(_elm_lang$core$Basics$min, scrollTop - calculations.flexibleExpansionHeight, calculations.maxTranslateYDistance));
			return function (_p7) {
				return A2(
					_user$project$Internal_Options$when,
					config.fixedLastrow,
					_user$project$Internal_Options$many(_p7));
			}(
				{
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$css,
						'transform',
						A2(
							_elm_lang$core$Basics_ops['++'],
							'translateY(-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(translateDistance),
								'px)'))),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							_elm_lang$core$Native_Utils.eq(translateDistance, calculations.maxTranslateYDistance),
							_user$project$Internal_Options$cs(_user$project$Internal_Toolbar_Implementation$cssClasses.fixedAtLastRow)),
						_1: {ctor: '[]'}
					}
				});
		}();
		var flexibleExpansionRatio_ = A2(_user$project$Internal_Toolbar_Implementation$flexibleExpansionRatio, calculations, scrollTop);
		var toolbarFlexibleState = function () {
			var _p8 = flexibleExpansionRatio_;
			switch (_p8) {
				case 1:
					return _user$project$Internal_Options$cs(_user$project$Internal_Toolbar_Implementation$cssClasses.flexibleMax);
				case 0:
					return _user$project$Internal_Options$cs(_user$project$Internal_Toolbar_Implementation$cssClasses.flexibleMin);
				default:
					return _user$project$Internal_Options$nop;
			}
		}();
		var flexibleRowElementStyles = function () {
			if (config.flexible && config.fixed) {
				var height = calculations.flexibleExpansionHeight * flexibleExpansionRatio_;
				return _elm_lang$core$Maybe$Just(
					{
						height: A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(height + calculations.toolbarRowHeight),
							'px')
					});
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}();
		var elementStylesDefaultBehavior = function () {
			if (config.useFlexibleDefaultBehavior) {
				var minTitleSize = _user$project$Internal_Toolbar_Implementation$numbers.minTitleSize;
				var maxTitleSize = _user$project$Internal_Toolbar_Implementation$numbers.maxTitleSize;
				var currentTitleSize = ((maxTitleSize - minTitleSize) * flexibleExpansionRatio_) + minTitleSize;
				return _elm_lang$core$Maybe$Just(
					{
						fontSize: A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(currentTitleSize),
							'rem')
					});
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}();
		var hasScrolledOutOfThreshold = _elm_lang$core$Native_Utils.cmp(scrollTop, calculations.scrollThreshold) > 0;
		return {
			toolbarProperties: {
				ctor: '::',
				_0: toolbarFlexibleState,
				_1: {
					ctor: '::',
					_0: toolbarFixedState,
					_1: {ctor: '[]'}
				}
			},
			flexibleRowElementStyles: flexibleRowElementStyles,
			elementStylesDefaultBehavior: elementStylesDefaultBehavior
		};
	});
var _user$project$Internal_Toolbar_Implementation$toolbar = F4(
	function (lift, model, options, nodes) {
		var _p9 = A2(_user$project$Internal_Options$collect, _user$project$Internal_Toolbar_Model$defaultConfig, options);
		var summary = _p9;
		var config = _p9.config;
		var _p10 = A2(
			_elm_lang$core$Maybe$withDefault,
			{toolbarProperties: _elm_lang$core$Maybe$Nothing, flexibleRowElementStyles: _elm_lang$core$Maybe$Nothing, elementStylesDefaultBehavior: _elm_lang$core$Maybe$Nothing},
			A2(
				_elm_lang$core$Maybe$map,
				function (styles) {
					return {
						toolbarProperties: _elm_lang$core$Maybe$Just(styles.toolbarProperties),
						flexibleRowElementStyles: styles.flexibleRowElementStyles,
						elementStylesDefaultBehavior: styles.elementStylesDefaultBehavior
					};
				},
				A3(
					_elm_lang$core$Maybe$map2,
					F2(
						function (geometry, calculations) {
							return A4(_user$project$Internal_Toolbar_Implementation$toolbarStyles, config, geometry, model.scrollTop, calculations);
						}),
					model.geometry,
					model.calculations)));
		var toolbarProperties = _p10.toolbarProperties;
		var flexibleRowElementStyles = _p10.flexibleRowElementStyles;
		var elementStylesDefaultBehavior = _p10.elementStylesDefaultBehavior;
		var flexibleRowElementStylesHack = A2(
			_elm_lang$core$Maybe$map,
			function (_p11) {
				var _p12 = _p11;
				var _p13 = _p12.height;
				var className = A2(
					_elm_lang$core$Basics_ops['++'],
					'mdc-toolbar-flexible-row-element-styles-hack-',
					A2(
						_elm_lang$core$String$join,
						'-',
						A2(_elm_lang$core$String$split, '.', _p13)));
				var text = A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$Basics_ops['++'],
						className,
						A2(
							_elm_lang$core$Basics_ops['++'],
							' .mdc-toolbar__row:first-child{height:',
							A2(_elm_lang$core$Basics_ops['++'], _p13, ';}'))));
				return {className: className, text: text};
			},
			flexibleRowElementStyles);
		var elementStylesDefaultBehaviorHack = A2(
			_elm_lang$core$Maybe$map,
			function (_p14) {
				var _p15 = _p14;
				var _p16 = _p15.fontSize;
				var className = A2(
					_elm_lang$core$Basics_ops['++'],
					'mdc-toolbar-flexible-default-behavior-hack-',
					A2(
						_elm_lang$core$String$join,
						'-',
						A2(_elm_lang$core$String$split, '.', _p16)));
				var text = A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$Basics_ops['++'],
						className,
						A2(
							_elm_lang$core$Basics_ops['++'],
							' .mdc-toolbar__title{font-size:',
							A2(_elm_lang$core$Basics_ops['++'], _p16, ';}'))));
				return {className: className, text: text};
			},
			elementStylesDefaultBehavior);
		var backgroundImageHack = A2(
			_elm_lang$core$Maybe$map,
			function (backgroundImage) {
				var className = A2(
					F2(
						function (x, y) {
							return A2(_elm_lang$core$Basics_ops['++'], x, y);
						}),
					'mdc-toolbar-background-image-back-',
					A2(
						_elm_lang$core$String$join,
						'-',
						A2(
							_elm_lang$core$String$split,
							'/',
							A2(
								_elm_lang$core$String$join,
								'-',
								A2(_elm_lang$core$String$split, '.', backgroundImage)))));
				var text = A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$Basics_ops['++'],
						className,
						A2(
							_elm_lang$core$Basics_ops['++'],
							' .mdc-toolbar__row:first-child::after {',
							A2(
								_elm_lang$core$Basics_ops['++'],
								'background-image:url(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									backgroundImage,
									A2(
										_elm_lang$core$Basics_ops['++'],
										');',
										A2(_elm_lang$core$Basics_ops['++'], 'background-position:center;', 'background-size:cover;}')))))));
				return {className: className, text: text};
			},
			config.backgroundImage);
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$header,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-toolbar'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						config.fixed,
						_user$project$Internal_Options$cs(_user$project$Internal_Toolbar_Implementation$cssClasses.fixed)),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							config.fixed && config.fixedLastrow,
							_user$project$Internal_Options$cs(_user$project$Internal_Toolbar_Implementation$cssClasses.fixedLastRow)),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								config.waterfall,
								_user$project$Internal_Options$cs('mdc-toolbar--waterfall')),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									config.flexible,
									_user$project$Internal_Options$cs('mdc-toolbar--flexible')),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										config.flexible && config.useFlexibleDefaultBehavior,
										_user$project$Internal_Options$cs('mdc-toolbar--flexible-default-behavior')),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											_elm_lang$core$Native_Utils.eq(model.geometry, _elm_lang$core$Maybe$Nothing),
											_user$project$Internal_GlobalEvents$onTick(
												A2(
													_elm_lang$core$Json_Decode$map,
													function (_p17) {
														return lift(
															A2(_user$project$Internal_Toolbar_Model$Init, config, _p17));
													},
													_user$project$Internal_Toolbar_Implementation$decodeGeometry))),
										_1: {
											ctor: '::',
											_0: _user$project$Internal_GlobalEvents$onResize(
												A2(
													_elm_lang$core$Json_Decode$map,
													function (_p18) {
														return lift(
															A2(_user$project$Internal_Toolbar_Model$Resize, config, _p18));
													},
													_user$project$Internal_Toolbar_Implementation$decodeGeometry)),
											_1: {
												ctor: '::',
												_0: _user$project$Internal_GlobalEvents$onScroll(
													A2(
														_elm_lang$core$Json_Decode$map,
														function (_p19) {
															return lift(
																A2(_user$project$Internal_Toolbar_Model$Scroll, config, _p19));
														},
														_user$project$Internal_Toolbar_Implementation$decodeScrollTop)),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$core$Maybe$withDefault,
														_user$project$Internal_Options$nop,
														A2(_elm_lang$core$Maybe$map, _user$project$Internal_Options$many, toolbarProperties)),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$core$Maybe$withDefault,
															_user$project$Internal_Options$nop,
															A2(
																_elm_lang$core$Maybe$map,
																function (_p20) {
																	return _user$project$Internal_Options$cs(
																		function (_) {
																			return _.className;
																		}(_p20));
																},
																flexibleRowElementStylesHack)),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$core$Maybe$withDefault,
																_user$project$Internal_Options$nop,
																A2(
																	_elm_lang$core$Maybe$map,
																	function (_p21) {
																		return _user$project$Internal_Options$cs(
																			function (_) {
																				return _.className;
																			}(_p21));
																	},
																	elementStylesDefaultBehaviorHack)),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$core$Maybe$withDefault,
																	_user$project$Internal_Options$nop,
																	A2(
																		_elm_lang$core$Maybe$map,
																		function (_p22) {
																			return _user$project$Internal_Options$cs(
																				function (_) {
																					return _.className;
																				}(_p22));
																		},
																		backgroundImageHack)),
																_1: options
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			A2(
				_elm_lang$core$Basics_ops['++'],
				nodes,
				{
					ctor: '::',
					_0: A3(
						_elm_lang$html$Html$node,
						'style',
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$type_('text/css'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(
								A2(
									_elm_lang$core$String$join,
									'\n',
									A2(
										_elm_lang$core$List$filterMap,
										_elm_lang$core$Maybe$map(
											function (_) {
												return _.text;
											}),
										{
											ctor: '::',
											_0: flexibleRowElementStylesHack,
											_1: {
												ctor: '::',
												_0: elementStylesDefaultBehaviorHack,
												_1: {
													ctor: '::',
													_0: backgroundImageHack,
													_1: {ctor: '[]'}
												}
											}
										}))),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}));
	});
var _user$project$Internal_Toolbar_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_Toolbar_Implementation$get, _user$project$Internal_Toolbar_Implementation$toolbar, _user$project$Internal_Msg$ToolbarMsg);

var _user$project$Internal_TopAppBar_Implementation$prominentFixedAdjust = _user$project$Internal_Options$cs('mdc-top-app-bar--prominent-fixed-adjust');
var _user$project$Internal_TopAppBar_Implementation$denseFixedAdjust = _user$project$Internal_Options$cs('mdc-top-app-bar--dense-fixed-adjust');
var _user$project$Internal_TopAppBar_Implementation$fixedAdjust = _user$project$Internal_Options$cs('mdc-top-app-bar--fixed-adjust');
var _user$project$Internal_TopAppBar_Implementation$actionItem = F2(
	function (options, name) {
		return A2(
			_user$project$Internal_Icon_Implementation$view,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-top-app-bar__action-item'),
				_1: {ctor: '::', _0: _user$project$Internal_Icon_Implementation$anchor, _1: options}
			},
			name);
	});
var _user$project$Internal_TopAppBar_Implementation$title = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-top-app-bar__title'),
			_1: options
		});
};
var _user$project$Internal_TopAppBar_Implementation$section = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$section,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-top-app-bar__section'),
			_1: options
		});
};
var _user$project$Internal_TopAppBar_Implementation$navigationIcon = F2(
	function (options, name) {
		return A2(
			_user$project$Internal_Icon_Implementation$view,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-top-app-bar__navigation-icon'),
				_1: {ctor: '::', _0: _user$project$Internal_Icon_Implementation$anchor, _1: options}
			},
			name);
	});
var _user$project$Internal_TopAppBar_Implementation$alignEnd = _user$project$Internal_Options$cs('mdc-top-app-bar__section--align-end');
var _user$project$Internal_TopAppBar_Implementation$alignStart = _user$project$Internal_Options$cs('mdc-top-app-bar__section--align-start');
var _user$project$Internal_TopAppBar_Implementation$hasActionItem = _user$project$Internal_Options$cs('mdc-top-app-bar--short-has-action-item');
var _user$project$Internal_TopAppBar_Implementation$collapsed = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{collapsed: true});
	});
var _user$project$Internal_TopAppBar_Implementation$short = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{$short: true});
	});
var _user$project$Internal_TopAppBar_Implementation$prominent = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{prominent: true});
	});
var _user$project$Internal_TopAppBar_Implementation$fixed = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixed: true});
	});
var _user$project$Internal_TopAppBar_Implementation$dense = _user$project$Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{dense: true});
	});
var _user$project$Internal_TopAppBar_Implementation$_p0 = A3(
	_user$project$Internal_Component$indexed,
	function (_) {
		return _.topAppBar;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{topAppBar: x});
		}),
	_user$project$Internal_TopAppBar_Model$defaultModel);
var _user$project$Internal_TopAppBar_Implementation$get = _user$project$Internal_TopAppBar_Implementation$_p0._0;
var _user$project$Internal_TopAppBar_Implementation$set = _user$project$Internal_TopAppBar_Implementation$_p0._1;
var _user$project$Internal_TopAppBar_Implementation$row = function (options) {
	return A2(
		_user$project$Internal_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _user$project$Internal_Options$cs('mdc-top-app-bar__row'),
			_1: options
		});
};
var _user$project$Internal_TopAppBar_Implementation$checkForUpdate = function (model) {
	return A2(
		_elm_lang$core$Maybe$map,
		function (topAppBarHeight) {
			var hasAnyPixelsOffscreen = _elm_lang$core$Native_Utils.cmp(model.currentAppBarOffsetTop, 0) < 0;
			var offscreenBoundaryTop = 0 - topAppBarHeight;
			var hasAnyPixelsOnscreen = _elm_lang$core$Native_Utils.cmp(model.currentAppBarOffsetTop, offscreenBoundaryTop) > 0;
			var partiallyShowing = hasAnyPixelsOffscreen && hasAnyPixelsOnscreen;
			return partiallyShowing ? {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{wasDocked: false}),
				_1: true
			} : ((!model.wasDocked) ? {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{wasDocked: true}),
				_1: true
			} : ((!_elm_lang$core$Native_Utils.eq(model.isDockedShowing, hasAnyPixelsOnscreen)) ? {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isDockedShowing: hasAnyPixelsOnscreen}),
				_1: true
			} : {ctor: '_Tuple2', _0: model, _1: false}));
		},
		model.topAppBarHeight);
};
var _user$project$Internal_TopAppBar_Implementation$moveTopAppBar = function (model) {
	return A2(
		_elm_lang$core$Maybe$andThen,
		function (_p1) {
			var _p2 = _p1;
			var _p3 = _p2._0;
			return _p2._1 ? A2(
				_elm_lang$core$Maybe$map,
				function (topAppBarHeight) {
					var styleTop = function () {
						var maxTopAppBarHeight = 128;
						return (_elm_lang$core$Native_Utils.cmp(
							_elm_lang$core$Basics$abs(_p3.currentAppBarOffsetTop),
							topAppBarHeight) > 0) ? (0 - maxTopAppBarHeight) : _p3.currentAppBarOffsetTop;
					}();
					return _elm_lang$core$Native_Utils.update(
						_p3,
						{
							styleTop: _elm_lang$core$Maybe$Just(styleTop)
						});
				},
				_p3.topAppBarHeight) : _elm_lang$core$Maybe$Just(_p3);
		},
		_user$project$Internal_TopAppBar_Implementation$checkForUpdate(model));
};
var _user$project$Internal_TopAppBar_Implementation$getAppBarHeight = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'clientHeight',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$float);
var _user$project$Internal_TopAppBar_Implementation$getViewportScrollY = _debois$elm_dom$DOM$target(
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'ownerDocument',
			_1: {
				ctor: '::',
				_0: 'defaultView',
				_1: {
					ctor: '::',
					_0: 'scrollY',
					_1: {ctor: '[]'}
				}
			}
		},
		_elm_lang$core$Json_Decode$float));
var _user$project$Internal_TopAppBar_Implementation$topAppBarScrollHandler = F2(
	function (scrollPosition, model) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			model,
			A2(
				_elm_lang$core$Maybe$andThen,
				_user$project$Internal_TopAppBar_Implementation$moveTopAppBar,
				A2(
					_elm_lang$core$Maybe$map,
					function (_p4) {
						var _p5 = _p4;
						var _p6 = _p5._0;
						var isCurrentlyBeingResized = false;
						var currentScrollPosition = A2(_elm_lang$core$Basics$max, scrollPosition, 0);
						var diff = currentScrollPosition - _p5._1;
						var currentAppBarOffsetTop = model.currentAppBarOffsetTop - diff;
						var updatedAppBarOffsetTop = (!isCurrentlyBeingResized) ? ((_elm_lang$core$Native_Utils.cmp(currentAppBarOffsetTop, 0) > 0) ? 0 : ((_elm_lang$core$Native_Utils.cmp(
							_elm_lang$core$Basics$abs(currentAppBarOffsetTop),
							_p6) > 0) ? (0 - _p6) : currentAppBarOffsetTop)) : model.currentAppBarOffsetTop;
						var updatedModel = _elm_lang$core$Native_Utils.update(
							model,
							{
								lastScrollPosition: _elm_lang$core$Maybe$Just(currentScrollPosition),
								currentAppBarOffsetTop: updatedAppBarOffsetTop
							});
						return A2(
							_elm_lang$core$Maybe$withDefault,
							updatedModel,
							_user$project$Internal_TopAppBar_Implementation$moveTopAppBar(updatedModel));
					},
					A3(
						_elm_lang$core$Maybe$map2,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						model.topAppBarHeight,
						model.lastScrollPosition))));
	});
var _user$project$Internal_TopAppBar_Implementation$update = F2(
	function (msg, model) {
		var _p7 = msg;
		switch (_p7.ctor) {
			case 'Init':
				var _p8 = _p7._0.scrollPosition;
				return {
					ctor: '_Tuple2',
					_0: A2(
						_user$project$Internal_TopAppBar_Implementation$topAppBarScrollHandler,
						_p8,
						_elm_lang$core$Native_Utils.update(
							model,
							{
								lastScrollPosition: _elm_lang$core$Maybe$Just(_p8),
								topAppBarHeight: _elm_lang$core$Maybe$Just(_p7._0.topAppBarHeight)
							})),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Scroll':
				return {
					ctor: '_Tuple2',
					_0: A2(_user$project$Internal_TopAppBar_Implementation$topAppBarScrollHandler, _p7._0.scrollPosition, model),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				var _p9 = _p7._0.topAppBarHeight;
				var currentHeight = _p9;
				var currentAppBarOffsetTop = model.currentAppBarOffsetTop - (_p9 - currentHeight);
				var updatedModel = (!_elm_lang$core$Native_Utils.eq(
					_elm_lang$core$Maybe$Just(_p9),
					model.topAppBarHeight)) ? _elm_lang$core$Native_Utils.update(
					model,
					{
						wasDocked: false,
						currentAppBarOffsetTop: currentAppBarOffsetTop,
						topAppBarHeight: _elm_lang$core$Maybe$Just(currentHeight)
					}) : model;
				return {
					ctor: '_Tuple2',
					_0: A2(_user$project$Internal_TopAppBar_Implementation$topAppBarScrollHandler, _p7._0.scrollPosition, updatedModel),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Internal_TopAppBar_Implementation$react = A4(
	_user$project$Internal_Component$react,
	_user$project$Internal_TopAppBar_Implementation$get,
	_user$project$Internal_TopAppBar_Implementation$set,
	_user$project$Internal_Msg$TopAppBarMsg,
	_user$project$Internal_Component$generalise(_user$project$Internal_TopAppBar_Implementation$update));
var _user$project$Internal_TopAppBar_Implementation$cssClasses = {dense: 'mdc-top-app-bar--dense', fixed: 'mdc-top-app-bar--fixed', scrolled: 'mdc-top-app-bar--fixed-scrolled', prominent: 'mdc-top-app-bar--prominent', $short: 'mdc-top-app-bar--short', collapsed: 'mdc-top-app-bar--short-collapsed'};
var _user$project$Internal_TopAppBar_Implementation$topAppBar = F4(
	function (lift, model, options, sections) {
		var top = A2(_elm_lang$core$Maybe$withDefault, 0, model.styleTop);
		var lastScrollPosition = A2(_elm_lang$core$Maybe$withDefault, 0, model.lastScrollPosition);
		var _p10 = A2(_user$project$Internal_Options$collect, _user$project$Internal_TopAppBar_Model$defaultConfig, options);
		var summary = _p10;
		var config = _p10.config;
		return A5(
			_user$project$Internal_Options$apply,
			summary,
			_elm_lang$html$Html$header,
			{
				ctor: '::',
				_0: _user$project$Internal_Options$cs('mdc-top-app-bar'),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Internal_Options$when,
						config.dense,
						_user$project$Internal_Options$cs(_user$project$Internal_TopAppBar_Implementation$cssClasses.dense)),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Internal_Options$when,
							config.fixed,
							_user$project$Internal_Options$cs(_user$project$Internal_TopAppBar_Implementation$cssClasses.fixed)),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Internal_Options$when,
								config.fixed && (_elm_lang$core$Native_Utils.cmp(lastScrollPosition, 0) > 0),
								_user$project$Internal_Options$cs(_user$project$Internal_TopAppBar_Implementation$cssClasses.scrolled)),
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Internal_Options$when,
									config.prominent,
									_user$project$Internal_Options$cs(_user$project$Internal_TopAppBar_Implementation$cssClasses.prominent)),
								_1: {
									ctor: '::',
									_0: A2(
										_user$project$Internal_Options$when,
										config.$short,
										_user$project$Internal_Options$cs(_user$project$Internal_TopAppBar_Implementation$cssClasses.$short)),
									_1: {
										ctor: '::',
										_0: A2(
											_user$project$Internal_Options$when,
											config.collapsed || (config.$short && (_elm_lang$core$Native_Utils.cmp(lastScrollPosition, 0) > 0)),
											_user$project$Internal_Options$cs(_user$project$Internal_TopAppBar_Implementation$cssClasses.collapsed)),
										_1: {
											ctor: '::',
											_0: A2(
												_user$project$Internal_Options$when,
												(!config.fixed) && (!config.$short),
												A2(
													_user$project$Internal_Options$css,
													'top',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_elm_lang$core$Basics$toString(top),
														'px'))),
											_1: {
												ctor: '::',
												_0: _user$project$Internal_GlobalEvents$onScroll(
													A2(
														_elm_lang$core$Json_Decode$map,
														lift,
														A2(
															_elm_lang$core$Json_Decode$map,
															function (scrollPosition) {
																return _user$project$Internal_TopAppBar_Model$Scroll(
																	{scrollPosition: scrollPosition});
															},
															_user$project$Internal_TopAppBar_Implementation$getViewportScrollY))),
												_1: {
													ctor: '::',
													_0: _user$project$Internal_GlobalEvents$onResize(
														A2(
															_elm_lang$core$Json_Decode$map,
															lift,
															A3(
																_elm_lang$core$Json_Decode$map2,
																F2(
																	function (scrollPosition, topAppBarHeight) {
																		return _user$project$Internal_TopAppBar_Model$Resize(
																			{scrollPosition: scrollPosition, topAppBarHeight: topAppBarHeight});
																	}),
																_user$project$Internal_TopAppBar_Implementation$getViewportScrollY,
																_user$project$Internal_TopAppBar_Implementation$getAppBarHeight))),
													_1: {
														ctor: '::',
														_0: A2(
															_user$project$Internal_Options$when,
															A2(
																_elm_lang$core$List$any,
																_elm_lang$core$Basics$identity,
																{
																	ctor: '::',
																	_0: _elm_lang$core$Native_Utils.eq(model.lastScrollPosition, _elm_lang$core$Maybe$Nothing),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$core$Native_Utils.eq(model.topAppBarHeight, _elm_lang$core$Maybe$Nothing),
																		_1: {ctor: '[]'}
																	}
																}),
															_user$project$Internal_GlobalEvents$onTick(
																A2(
																	_elm_lang$core$Json_Decode$map,
																	lift,
																	A3(
																		_elm_lang$core$Json_Decode$map2,
																		F2(
																			function (scrollPosition, topAppBarHeight) {
																				return _user$project$Internal_TopAppBar_Model$Init(
																					{scrollPosition: scrollPosition, topAppBarHeight: topAppBarHeight});
																			}),
																		_user$project$Internal_TopAppBar_Implementation$getViewportScrollY,
																		_user$project$Internal_TopAppBar_Implementation$getAppBarHeight)))),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_user$project$Internal_TopAppBar_Implementation$row,
					{ctor: '[]'},
					sections),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Internal_TopAppBar_Implementation$view = A3(_user$project$Internal_Component$render, _user$project$Internal_TopAppBar_Implementation$get, _user$project$Internal_TopAppBar_Implementation$topAppBar, _user$project$Internal_Msg$TopAppBarMsg);

var _user$project$Internal_Typography_Implementation$adjustMargin = _user$project$Internal_Options$cs('mdc-typography--adjust-margin');
var _user$project$Internal_Typography_Implementation$button = _user$project$Internal_Options$cs('mdc-typography--button');
var _user$project$Internal_Typography_Implementation$body2 = _user$project$Internal_Options$cs('mdc-typography--body2');
var _user$project$Internal_Typography_Implementation$body1 = _user$project$Internal_Options$cs('mdc-typography--body1');
var _user$project$Internal_Typography_Implementation$caption = _user$project$Internal_Options$cs('mdc-typography--caption');
var _user$project$Internal_Typography_Implementation$overline = _user$project$Internal_Options$cs('mdc-typography--overline');
var _user$project$Internal_Typography_Implementation$subtitle2 = _user$project$Internal_Options$cs('mdc-typography--subtitle2');
var _user$project$Internal_Typography_Implementation$subtitle1 = _user$project$Internal_Options$cs('mdc-typography--subtitle1');
var _user$project$Internal_Typography_Implementation$headline6 = _user$project$Internal_Options$cs('mdc-typography--headline6');
var _user$project$Internal_Typography_Implementation$headline5 = _user$project$Internal_Options$cs('mdc-typography--headline5');
var _user$project$Internal_Typography_Implementation$headline4 = _user$project$Internal_Options$cs('mdc-typography--headline4');
var _user$project$Internal_Typography_Implementation$headline3 = _user$project$Internal_Options$cs('mdc-typography--headline3');
var _user$project$Internal_Typography_Implementation$headline2 = _user$project$Internal_Options$cs('mdc-typography--headline2');
var _user$project$Internal_Typography_Implementation$headline1 = _user$project$Internal_Options$cs('mdc-typography--headline1');
var _user$project$Internal_Typography_Implementation$title = _user$project$Internal_Options$cs('mdc-typography--title');
var _user$project$Internal_Typography_Implementation$typography = _user$project$Internal_Options$cs('mdc-typography');

var _user$project$Material$top = function (content) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: content,
			_1: {
				ctor: '::',
				_0: A3(
					_elm_lang$html$Html$node,
					'style',
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('text/css'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(
								_elm_lang$core$String$join,
								'\n',
								A2(
									_elm_lang$core$List$map,
									function (url) {
										return A2(
											_elm_lang$core$Basics_ops['++'],
											'@import url(',
											A2(_elm_lang$core$Basics_ops['++'], url, ');'));
									},
									{
										ctor: '::',
										_0: 'https://fonts.googleapis.com/css?family=Roboto+Mono',
										_1: {
											ctor: '::',
											_0: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
											_1: {
												ctor: '::',
												_0: 'https://fonts.googleapis.com/icon?family=Material+Icons',
												_1: {
													ctor: '::',
													_0: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css',
													_1: {
														ctor: '::',
														_0: 'https://aforemny.github.io/elm-mdc/material-components-web.css',
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}))),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$html$Html$node,
						'script',
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$type_('text/javascript'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$src('https://aforemny.github.io/elm-mdc/elm-mdc.js'),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Material$init = function (lift) {
	return _elm_lang$core$Platform_Cmd$none;
};
var _user$project$Material$subscriptions = F2(
	function (lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: A2(_user$project$Internal_Drawer_Implementation$subs, lift, model.mdc),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Internal_Menu_Implementation$subs, lift, model.mdc),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Material$update_ = F3(
	function (lift, msg, store) {
		var _p0 = msg;
		switch (_p0.ctor) {
			case 'Dispatch':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Nothing,
					_1: _user$project$Internal_Dispatch$forward(_p0._0)
				};
			case 'ButtonMsg':
				return A4(_user$project$Internal_Button_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'CheckboxMsg':
				return A4(_user$project$Internal_Checkbox_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'ChipMsg':
				return A4(_user$project$Internal_Chip_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'DialogMsg':
				return A4(_user$project$Internal_Dialog_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'DrawerMsg':
				return A4(_user$project$Internal_Drawer_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'FabMsg':
				return A4(_user$project$Internal_Fab_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'GridListMsg':
				return A4(_user$project$Internal_GridList_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'IconToggleMsg':
				return A4(_user$project$Internal_IconToggle_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'MenuMsg':
				return A4(_user$project$Internal_Menu_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'RadioButtonMsg':
				return A4(_user$project$Internal_RadioButton_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'RippleMsg':
				return A4(_user$project$Internal_Ripple_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'SelectMsg':
				return A4(_user$project$Internal_Select_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'SliderMsg':
				return A4(_user$project$Internal_Slider_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'SnackbarMsg':
				return A4(_user$project$Internal_Snackbar_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'SwitchMsg':
				return A4(_user$project$Internal_Switch_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'TabsMsg':
				return A4(_user$project$Internal_Tabs_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'TextfieldMsg':
				return A4(_user$project$Internal_Textfield_Implementation$react, lift, _p0._1, _p0._0, store);
			case 'ToolbarMsg':
				return A4(_user$project$Internal_Toolbar_Implementation$react, lift, _p0._1, _p0._0, store);
			default:
				return A4(_user$project$Internal_TopAppBar_Implementation$react, lift, _p0._1, _p0._0, store);
		}
	});
var _user$project$Material$update = F3(
	function (lift, msg, container) {
		return A2(
			_elm_lang$core$Tuple$mapFirst,
			_elm_lang$core$Maybe$withDefault(container),
			A2(
				_elm_lang$core$Tuple$mapFirst,
				_elm_lang$core$Maybe$map(
					function (mdc) {
						return _elm_lang$core$Native_Utils.update(
							container,
							{mdc: mdc});
					}),
				A3(
					_user$project$Material$update_,
					lift,
					msg,
					function (_) {
						return _.mdc;
					}(container))));
	});
var _user$project$Material$defaultModel = {button: _elm_lang$core$Dict$empty, checkbox: _elm_lang$core$Dict$empty, chip: _elm_lang$core$Dict$empty, dialog: _elm_lang$core$Dict$empty, drawer: _elm_lang$core$Dict$empty, fab: _elm_lang$core$Dict$empty, gridList: _elm_lang$core$Dict$empty, iconToggle: _elm_lang$core$Dict$empty, menu: _elm_lang$core$Dict$empty, radio: _elm_lang$core$Dict$empty, ripple: _elm_lang$core$Dict$empty, select: _elm_lang$core$Dict$empty, slider: _elm_lang$core$Dict$empty, snackbar: _elm_lang$core$Dict$empty, $switch: _elm_lang$core$Dict$empty, tabs: _elm_lang$core$Dict$empty, textfield: _elm_lang$core$Dict$empty, toolbar: _elm_lang$core$Dict$empty, topAppBar: _elm_lang$core$Dict$empty};
var _user$project$Material$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return {button: a, checkbox: b, chip: c, dialog: d, drawer: e, fab: f, gridList: g, iconToggle: h, menu: i, radio: j, ripple: k, select: l, slider: m, snackbar: n, $switch: o, tabs: p, textfield: q, toolbar: r, topAppBar: s};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};

var _user$project$Material_Button$onClick = _user$project$Internal_Button_Implementation$onClick;
var _user$project$Material_Button$disabled = _user$project$Internal_Button_Implementation$disabled;
var _user$project$Material_Button$link = _user$project$Internal_Button_Implementation$link;
var _user$project$Material_Button$ripple = _user$project$Internal_Button_Implementation$ripple;
var _user$project$Material_Button$dense = _user$project$Internal_Button_Implementation$dense;
var _user$project$Material_Button$outlined = _user$project$Internal_Button_Implementation$outlined;
var _user$project$Material_Button$unelevated = _user$project$Internal_Button_Implementation$unelevated;
var _user$project$Material_Button$raised = _user$project$Internal_Button_Implementation$raised;
var _user$project$Material_Button$icon = _user$project$Internal_Button_Implementation$icon;
var _user$project$Material_Button$view = _user$project$Internal_Button_Implementation$view;

var _user$project$Material_FormField$alignEnd = _user$project$Internal_FormField_Implementation$alignEnd;
var _user$project$Material_FormField$view = _user$project$Internal_FormField_Implementation$view;

var _user$project$Material_RadioButton$nativeControl = _user$project$Internal_RadioButton_Implementation$nativeControl;
var _user$project$Material_RadioButton$disabled = _user$project$Internal_RadioButton_Implementation$disabled;
var _user$project$Material_RadioButton$selected = _user$project$Internal_RadioButton_Implementation$selected;
var _user$project$Material_RadioButton$view = _user$project$Internal_RadioButton_Implementation$view;

var _user$project$Material_Switch$nativeControl = _user$project$Internal_Switch_Implementation$nativeControl;
var _user$project$Material_Switch$disabled = _user$project$Internal_Switch_Implementation$disabled;
var _user$project$Material_Switch$on = _user$project$Internal_Switch_Implementation$on;
var _user$project$Material_Switch$view = _user$project$Internal_Switch_Implementation$view;

var _user$project$Material_Textfield$nativeControl = _user$project$Internal_Textfield_Implementation$nativeControl;
var _user$project$Material_Textfield$autocomplete = function (_p0) {
	return _user$project$Material_Textfield$nativeControl(
		_elm_lang$core$List$singleton(
			_user$project$Internal_Options$autocomplete(_p0)));
};
var _user$project$Material_Textfield$autofocus = _user$project$Material_Textfield$nativeControl(
	{
		ctor: '::',
		_0: _user$project$Internal_Options$autofocus(true),
		_1: {ctor: '[]'}
	});
var _user$project$Material_Textfield$onFocus = function (handler) {
	return _user$project$Material_Textfield$nativeControl(
		{
			ctor: '::',
			_0: _user$project$Internal_Options$onFocus(handler),
			_1: {ctor: '[]'}
		});
};
var _user$project$Material_Textfield$onBlur = function (handler) {
	return _user$project$Material_Textfield$nativeControl(
		{
			ctor: '::',
			_0: _user$project$Internal_Options$onBlur(handler),
			_1: {ctor: '[]'}
		});
};
var _user$project$Material_Textfield$placeholder = _user$project$Internal_Textfield_Implementation$placeholder;
var _user$project$Material_Textfield$textarea = _user$project$Internal_Textfield_Implementation$textarea;
var _user$project$Material_Textfield$invalid = _user$project$Internal_Textfield_Implementation$invalid;
var _user$project$Material_Textfield$fullwidth = _user$project$Internal_Textfield_Implementation$fullwidth;
var _user$project$Material_Textfield$type_ = _user$project$Internal_Textfield_Implementation$type_;
var _user$project$Material_Textfield$required = _user$project$Internal_Textfield_Implementation$required;
var _user$project$Material_Textfield$dense = _user$project$Internal_Textfield_Implementation$dense;
var _user$project$Material_Textfield$cols = _user$project$Internal_Textfield_Implementation$cols;
var _user$project$Material_Textfield$rows = _user$project$Internal_Textfield_Implementation$rows;
var _user$project$Material_Textfield$pattern = _user$project$Internal_Textfield_Implementation$pattern;
var _user$project$Material_Textfield$box = _user$project$Internal_Textfield_Implementation$box;
var _user$project$Material_Textfield$email = _user$project$Internal_Textfield_Implementation$email;
var _user$project$Material_Textfield$password = _user$project$Internal_Textfield_Implementation$password;
var _user$project$Material_Textfield$disabled = _user$project$Internal_Textfield_Implementation$disabled;
var _user$project$Material_Textfield$value = _user$project$Internal_Textfield_Implementation$value;
var _user$project$Material_Textfield$label = _user$project$Internal_Textfield_Implementation$label;
var _user$project$Material_Textfield$outlined = _user$project$Internal_Textfield_Implementation$outlined;
var _user$project$Material_Textfield$trailingIcon = _user$project$Internal_Textfield_Implementation$trailingIcon;
var _user$project$Material_Textfield$leadingIcon = _user$project$Internal_Textfield_Implementation$leadingIcon;
var _user$project$Material_Textfield$iconUnclickable = _user$project$Internal_Textfield_Implementation$iconUnclickable;
var _user$project$Material_Textfield$view = _user$project$Internal_Textfield_Implementation$view;

var _user$project$Material_Textfield_HelperText$validationMsg = _user$project$Internal_Textfield_HelperText_Implementation$validationMsg;
var _user$project$Material_Textfield_HelperText$persistent = _user$project$Internal_Textfield_HelperText_Implementation$persistent;
var _user$project$Material_Textfield_HelperText$helperText = _user$project$Internal_Textfield_HelperText_Implementation$helperText;

var _user$project$Material_Typography$adjustMargin = _user$project$Internal_Typography_Implementation$adjustMargin;
var _user$project$Material_Typography$button = _user$project$Internal_Typography_Implementation$button;
var _user$project$Material_Typography$overline = _user$project$Internal_Typography_Implementation$overline;
var _user$project$Material_Typography$body2 = _user$project$Internal_Typography_Implementation$body2;
var _user$project$Material_Typography$body1 = _user$project$Internal_Typography_Implementation$body1;
var _user$project$Material_Typography$caption = _user$project$Internal_Typography_Implementation$caption;
var _user$project$Material_Typography$subtitle2 = _user$project$Internal_Typography_Implementation$subtitle2;
var _user$project$Material_Typography$subheading2 = _user$project$Material_Typography$subtitle2;
var _user$project$Material_Typography$subtitle1 = _user$project$Internal_Typography_Implementation$subtitle1;
var _user$project$Material_Typography$subheading1 = _user$project$Material_Typography$subtitle1;
var _user$project$Material_Typography$headline6 = _user$project$Internal_Typography_Implementation$headline6;
var _user$project$Material_Typography$headline5 = _user$project$Internal_Typography_Implementation$headline5;
var _user$project$Material_Typography$headline4 = _user$project$Internal_Typography_Implementation$headline4;
var _user$project$Material_Typography$headline3 = _user$project$Internal_Typography_Implementation$headline3;
var _user$project$Material_Typography$headline2 = _user$project$Internal_Typography_Implementation$headline2;
var _user$project$Material_Typography$headline1 = _user$project$Internal_Typography_Implementation$headline1;
var _user$project$Material_Typography$headline = _user$project$Internal_Typography_Implementation$headline6;
var _user$project$Material_Typography$title = _user$project$Internal_Typography_Implementation$title;
var _user$project$Material_Typography$display4 = _user$project$Material_Typography$headline4;
var _user$project$Material_Typography$display3 = _user$project$Material_Typography$headline3;
var _user$project$Material_Typography$display2 = _user$project$Material_Typography$headline2;
var _user$project$Material_Typography$display1 = _user$project$Material_Typography$headline1;
var _user$project$Material_Typography$typography = _user$project$Internal_Typography_Implementation$typography;

var _user$project$Pb_Www$rsvpInfoEncoder = function (v) {
	return _elm_lang$core$Json_Encode$object(
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'uuid', _elm_lang$core$Json_Encode$string, '', v.uuid),
				_1: {
					ctor: '::',
					_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'names', _elm_lang$core$Json_Encode$string, '', v.names),
					_1: {
						ctor: '::',
						_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'email', _elm_lang$core$Json_Encode$string, '', v.email),
						_1: {
							ctor: '::',
							_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'presence', _elm_lang$core$Json_Encode$bool, false, v.presence),
							_1: {
								ctor: '::',
								_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'childrenNameAge', _elm_lang$core$Json_Encode$string, '', v.childrenNameAge),
								_1: {
									ctor: '::',
									_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'housing', _elm_lang$core$Json_Encode$bool, false, v.housing),
									_1: {
										ctor: '::',
										_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'music', _elm_lang$core$Json_Encode$string, '', v.music),
										_1: {
											ctor: '::',
											_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'brunch', _elm_lang$core$Json_Encode$bool, false, v.brunch),
											_1: {
												ctor: '::',
												_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'createdAt', _elm_lang$core$Json_Encode$string, '', v.createdAt),
												_1: {
													ctor: '::',
													_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'updatedAt', _elm_lang$core$Json_Encode$string, '', v.updatedAt),
													_1: {
														ctor: '::',
														_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'deletedAt', _elm_lang$core$Json_Encode$string, '', v.deletedAt),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}));
};
var _user$project$Pb_Www$rsvpCreationResponseEncoder = function (v) {
	return _elm_lang$core$Json_Encode$object(
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'ok', _elm_lang$core$Json_Encode$bool, false, v.ok),
				_1: {
					ctor: '::',
					_0: A3(_tiziano88$elm_protobuf$Protobuf$optionalEncoder, 'info', _user$project$Pb_Www$rsvpInfoEncoder, v.info),
					_1: {ctor: '[]'}
				}
			}));
};
var _user$project$Pb_Www$rsvpCreationRequestEncoder = function (v) {
	return _elm_lang$core$Json_Encode$object(
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'names', _elm_lang$core$Json_Encode$string, '', v.names),
				_1: {
					ctor: '::',
					_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'email', _elm_lang$core$Json_Encode$string, '', v.email),
					_1: {
						ctor: '::',
						_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'presence', _elm_lang$core$Json_Encode$bool, false, v.presence),
						_1: {
							ctor: '::',
							_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'childrenNameAge', _elm_lang$core$Json_Encode$string, '', v.childrenNameAge),
							_1: {
								ctor: '::',
								_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'housing', _elm_lang$core$Json_Encode$bool, false, v.housing),
								_1: {
									ctor: '::',
									_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'music', _elm_lang$core$Json_Encode$string, '', v.music),
									_1: {
										ctor: '::',
										_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'brunch', _elm_lang$core$Json_Encode$bool, false, v.brunch),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}));
};
var _user$project$Pb_Www$serviceStatus_StatusEncoder = function (v) {
	var lookup = function (s) {
		var _p0 = s;
		if (_p0.ctor === 'ServiceStatus_Ok') {
			return 'OK';
		} else {
			return 'UNAVAILABLE';
		}
	};
	return _elm_lang$core$Json_Encode$string(
		lookup(v));
};
var _user$project$Pb_Www$versionResponseEncoder = function (v) {
	return _elm_lang$core$Json_Encode$object(
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'name', _elm_lang$core$Json_Encode$string, '', v.name),
				_1: {
					ctor: '::',
					_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'version', _elm_lang$core$Json_Encode$string, '', v.version),
					_1: {ctor: '[]'}
				}
			}));
};
var _user$project$Pb_Www$emptyMessageEncoder = function (v) {
	return _elm_lang$core$Json_Encode$object(
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{ctor: '[]'}));
};
var _user$project$Pb_Www$EmptyMessage = {};
var _user$project$Pb_Www$emptyMessageDecoder = _elm_lang$core$Json_Decode$lazy(
	function (_p1) {
		return _tiziano88$elm_protobuf$Protobuf$decode(_user$project$Pb_Www$EmptyMessage);
	});
var _user$project$Pb_Www$VersionResponse = F2(
	function (a, b) {
		return {name: a, version: b};
	});
var _user$project$Pb_Www$versionResponseDecoder = _elm_lang$core$Json_Decode$lazy(
	function (_p2) {
		return A4(
			_tiziano88$elm_protobuf$Protobuf$required,
			'version',
			_elm_lang$core$Json_Decode$string,
			'',
			A4(
				_tiziano88$elm_protobuf$Protobuf$required,
				'name',
				_elm_lang$core$Json_Decode$string,
				'',
				_tiziano88$elm_protobuf$Protobuf$decode(_user$project$Pb_Www$VersionResponse)));
	});
var _user$project$Pb_Www$ServiceStatus = F4(
	function (a, b, c, d) {
		return {name: a, version: b, status: c, eMsg: d};
	});
var _user$project$Pb_Www$ServicesStatusList = function (a) {
	return {services: a};
};
var _user$project$Pb_Www$RsvpCreationRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {names: a, email: b, presence: c, childrenNameAge: d, housing: e, music: f, brunch: g};
	});
var _user$project$Pb_Www$rsvpCreationRequestDecoder = _elm_lang$core$Json_Decode$lazy(
	function (_p3) {
		return A4(
			_tiziano88$elm_protobuf$Protobuf$required,
			'brunch',
			_elm_lang$core$Json_Decode$bool,
			false,
			A4(
				_tiziano88$elm_protobuf$Protobuf$required,
				'music',
				_elm_lang$core$Json_Decode$string,
				'',
				A4(
					_tiziano88$elm_protobuf$Protobuf$required,
					'housing',
					_elm_lang$core$Json_Decode$bool,
					false,
					A4(
						_tiziano88$elm_protobuf$Protobuf$required,
						'childrenNameAge',
						_elm_lang$core$Json_Decode$string,
						'',
						A4(
							_tiziano88$elm_protobuf$Protobuf$required,
							'presence',
							_elm_lang$core$Json_Decode$bool,
							false,
							A4(
								_tiziano88$elm_protobuf$Protobuf$required,
								'email',
								_elm_lang$core$Json_Decode$string,
								'',
								A4(
									_tiziano88$elm_protobuf$Protobuf$required,
									'names',
									_elm_lang$core$Json_Decode$string,
									'',
									_tiziano88$elm_protobuf$Protobuf$decode(_user$project$Pb_Www$RsvpCreationRequest))))))));
	});
var _user$project$Pb_Www$RsvpInfo = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {uuid: a, names: b, email: c, presence: d, childrenNameAge: e, housing: f, music: g, brunch: h, createdAt: i, updatedAt: j, deletedAt: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Pb_Www$rsvpInfoDecoder = _elm_lang$core$Json_Decode$lazy(
	function (_p4) {
		return A4(
			_tiziano88$elm_protobuf$Protobuf$required,
			'deletedAt',
			_elm_lang$core$Json_Decode$string,
			'',
			A4(
				_tiziano88$elm_protobuf$Protobuf$required,
				'updatedAt',
				_elm_lang$core$Json_Decode$string,
				'',
				A4(
					_tiziano88$elm_protobuf$Protobuf$required,
					'createdAt',
					_elm_lang$core$Json_Decode$string,
					'',
					A4(
						_tiziano88$elm_protobuf$Protobuf$required,
						'brunch',
						_elm_lang$core$Json_Decode$bool,
						false,
						A4(
							_tiziano88$elm_protobuf$Protobuf$required,
							'music',
							_elm_lang$core$Json_Decode$string,
							'',
							A4(
								_tiziano88$elm_protobuf$Protobuf$required,
								'housing',
								_elm_lang$core$Json_Decode$bool,
								false,
								A4(
									_tiziano88$elm_protobuf$Protobuf$required,
									'childrenNameAge',
									_elm_lang$core$Json_Decode$string,
									'',
									A4(
										_tiziano88$elm_protobuf$Protobuf$required,
										'presence',
										_elm_lang$core$Json_Decode$bool,
										false,
										A4(
											_tiziano88$elm_protobuf$Protobuf$required,
											'email',
											_elm_lang$core$Json_Decode$string,
											'',
											A4(
												_tiziano88$elm_protobuf$Protobuf$required,
												'names',
												_elm_lang$core$Json_Decode$string,
												'',
												A4(
													_tiziano88$elm_protobuf$Protobuf$required,
													'uuid',
													_elm_lang$core$Json_Decode$string,
													'',
													_tiziano88$elm_protobuf$Protobuf$decode(_user$project$Pb_Www$RsvpInfo))))))))))));
	});
var _user$project$Pb_Www$RsvpCreationResponse = F2(
	function (a, b) {
		return {ok: a, info: b};
	});
var _user$project$Pb_Www$rsvpCreationResponseDecoder = _elm_lang$core$Json_Decode$lazy(
	function (_p5) {
		return A3(
			_tiziano88$elm_protobuf$Protobuf$optional,
			'info',
			_user$project$Pb_Www$rsvpInfoDecoder,
			A4(
				_tiziano88$elm_protobuf$Protobuf$required,
				'ok',
				_elm_lang$core$Json_Decode$bool,
				false,
				_tiziano88$elm_protobuf$Protobuf$decode(_user$project$Pb_Www$RsvpCreationResponse)));
	});
var _user$project$Pb_Www$ServiceStatus_Unavailable = {ctor: 'ServiceStatus_Unavailable'};
var _user$project$Pb_Www$ServiceStatus_Ok = {ctor: 'ServiceStatus_Ok'};
var _user$project$Pb_Www$serviceStatus_StatusDecoder = function () {
	var lookup = function (s) {
		var _p6 = s;
		switch (_p6) {
			case 'OK':
				return _user$project$Pb_Www$ServiceStatus_Ok;
			case 'UNAVAILABLE':
				return _user$project$Pb_Www$ServiceStatus_Unavailable;
			default:
				return _user$project$Pb_Www$ServiceStatus_Ok;
		}
	};
	return A2(_elm_lang$core$Json_Decode$map, lookup, _elm_lang$core$Json_Decode$string);
}();
var _user$project$Pb_Www$serviceStatus_StatusDefault = _user$project$Pb_Www$ServiceStatus_Ok;
var _user$project$Pb_Www$serviceStatusDecoder = _elm_lang$core$Json_Decode$lazy(
	function (_p7) {
		return A4(
			_tiziano88$elm_protobuf$Protobuf$required,
			'eMsg',
			_elm_lang$core$Json_Decode$string,
			'',
			A4(
				_tiziano88$elm_protobuf$Protobuf$required,
				'status',
				_user$project$Pb_Www$serviceStatus_StatusDecoder,
				_user$project$Pb_Www$serviceStatus_StatusDefault,
				A4(
					_tiziano88$elm_protobuf$Protobuf$required,
					'version',
					_elm_lang$core$Json_Decode$string,
					'',
					A4(
						_tiziano88$elm_protobuf$Protobuf$required,
						'name',
						_elm_lang$core$Json_Decode$string,
						'',
						_tiziano88$elm_protobuf$Protobuf$decode(_user$project$Pb_Www$ServiceStatus)))));
	});
var _user$project$Pb_Www$servicesStatusListDecoder = _elm_lang$core$Json_Decode$lazy(
	function (_p8) {
		return A3(
			_tiziano88$elm_protobuf$Protobuf$repeated,
			'services',
			_user$project$Pb_Www$serviceStatusDecoder,
			_tiziano88$elm_protobuf$Protobuf$decode(_user$project$Pb_Www$ServicesStatusList));
	});
var _user$project$Pb_Www$serviceStatusEncoder = function (v) {
	return _elm_lang$core$Json_Encode$object(
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'name', _elm_lang$core$Json_Encode$string, '', v.name),
				_1: {
					ctor: '::',
					_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'version', _elm_lang$core$Json_Encode$string, '', v.version),
					_1: {
						ctor: '::',
						_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'status', _user$project$Pb_Www$serviceStatus_StatusEncoder, _user$project$Pb_Www$serviceStatus_StatusDefault, v.status),
						_1: {
							ctor: '::',
							_0: A4(_tiziano88$elm_protobuf$Protobuf$requiredFieldEncoder, 'eMsg', _elm_lang$core$Json_Encode$string, '', v.eMsg),
							_1: {ctor: '[]'}
						}
					}
				}
			}));
};
var _user$project$Pb_Www$servicesStatusListEncoder = function (v) {
	return _elm_lang$core$Json_Encode$object(
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: A3(_tiziano88$elm_protobuf$Protobuf$repeatedFieldEncoder, 'services', _user$project$Pb_Www$serviceStatusEncoder, v.services),
				_1: {ctor: '[]'}
			}));
};

var _user$project$Request_Helpers$apiUrl = function (str) {
	return A2(_elm_lang$core$Basics_ops['++'], '/api/v1/', str);
};

var _user$project$Request_Www$rsvpCreation = function (rsvpCreationRequest) {
	return _krisajenkins$remotedata$RemoteData$fromTask(
		_lukewestby$elm_http_builder$HttpBuilder$toTask(
			A2(
				_lukewestby$elm_http_builder$HttpBuilder$withExpect,
				_elm_lang$http$Http$expectJson(_user$project$Pb_Www$rsvpCreationResponseDecoder),
				A2(
					_lukewestby$elm_http_builder$HttpBuilder$withBody,
					_elm_lang$http$Http$jsonBody(
						_user$project$Pb_Www$rsvpCreationRequestEncoder(rsvpCreationRequest)),
					_lukewestby$elm_http_builder$HttpBuilder$post(
						_user$project$Request_Helpers$apiUrl('rsvp_creation'))))));
};
var _user$project$Request_Www$servicesStatus = _krisajenkins$remotedata$RemoteData$fromTask(
	_lukewestby$elm_http_builder$HttpBuilder$toTask(
		A2(
			_lukewestby$elm_http_builder$HttpBuilder$withExpect,
			_elm_lang$http$Http$expectJson(_user$project$Pb_Www$serviceStatusDecoder),
			_lukewestby$elm_http_builder$HttpBuilder$get(
				_user$project$Request_Helpers$apiUrl('services_status')))));
var _user$project$Request_Www$version = _krisajenkins$remotedata$RemoteData$fromTask(
	_lukewestby$elm_http_builder$HttpBuilder$toTask(
		A2(
			_lukewestby$elm_http_builder$HttpBuilder$withExpect,
			_elm_lang$http$Http$expectJson(_user$project$Pb_Www$versionResponseDecoder),
			_lukewestby$elm_http_builder$HttpBuilder$get(
				_user$project$Request_Helpers$apiUrl('version')))));

var _user$project$Main$viewGlobalError = A3(
	_user$project$Material_Options$styled,
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
		_1: {
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'display', 'block'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'margin', '40px 5px'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'text-align', 'center'),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Material_Options$css, 'height', '40px'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Material_Options$css, 'border-color', '#d32f2f'),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Material_Options$css, 'border-top', '15px solid #d32f2f'),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Material_Options$css, 'color', '#d32f2f'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Material_Options$css, 'font-size', '20px'),
										_1: {
											ctor: '::',
											_0: _user$project$Material_Typography$title,
											_1: {
												ctor: '::',
												_0: _user$project$Material_Typography$adjustMargin,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text('Une erreur s\'est produite veuillez recharger la page'),
		_1: {ctor: '[]'}
	});
var _user$project$Main$viewAgenda = A3(
	_user$project$Material_Options$styled,
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
		_1: {
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'display', 'block'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'margin', '40px 5px'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'text-align', 'center'),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Material_Options$css, 'height', '40px'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Material_Options$css, 'font-size', '20px'),
								_1: {
									ctor: '::',
									_0: _user$project$Material_Typography$title,
									_1: {
										ctor: '::',
										_0: _user$project$Material_Typography$adjustMargin,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text('Nous sommes impatients de vous voir le 08.09.18.'),
		_1: {ctor: '[]'}
	});
var _user$project$Main$viewNotHereMsg = A3(
	_user$project$Material_Options$styled,
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
		_1: {
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'display', 'block'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'margin', '40px 5px'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'text-align', 'center'),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Material_Options$css, 'height', '40px'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Material_Options$css, 'font-size', '20px'),
								_1: {
									ctor: '::',
									_0: _user$project$Material_Typography$title,
									_1: {
										ctor: '::',
										_0: _user$project$Material_Typography$adjustMargin,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text('Quel dommage on se faisait une joie de votre présence.'),
		_1: {ctor: '[]'}
	});
var _user$project$Main$viewConfirm = function (rsvpResponse) {
	var _p0 = rsvpResponse.info;
	if (_p0.ctor === 'Just') {
		return _p0._0.presence ? _user$project$Main$viewAgenda : _user$project$Main$viewNotHereMsg;
	} else {
		return _user$project$Main$viewGlobalError;
	}
};
var _user$project$Main$errorServerToError = F3(
	function (error, field, msg) {
		var pattern = _elm_lang$core$Regex$regex(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'invalid field ',
				_elm_lang$core$Basics$toString(field)));
		return A2(_elm_lang$core$Regex$contains, pattern, error) ? {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: field, _1: msg},
			_1: {ctor: '[]'}
		} : {ctor: '[]'};
	});
var _user$project$Main$defaultRsvp = {email: '', names: '', presence: true, childrenNameAge: '', housing: true, music: '', brunch: true};
var _user$project$Main$defaultModel = {
	mdc: _user$project$Material$defaultModel,
	rsvp: _user$project$Main$defaultRsvp,
	rsvpResponse: _krisajenkins$remotedata$RemoteData$NotAsked,
	errors: {ctor: '[]'},
	displayNamesError: false,
	displayEmailError: false,
	displayChildrenNameAgeError: false,
	displayMusicError: false
};
var _user$project$Main$hasError = F2(
	function (field, errors) {
		return !_elm_lang$core$List$isEmpty(
			A2(
				_elm_lang$core$List$filter,
				function (_p1) {
					var _p2 = _p1;
					return _elm_lang$core$Native_Utils.eq(_p2._0, field);
				},
				errors));
	});
var _user$project$Main$errorMsg = F2(
	function (field, errors) {
		return _elm_lang$core$String$concat(
			A2(
				_elm_lang$core$List$map,
				function (_p3) {
					var _p4 = _p3;
					return A2(_elm_lang$core$Basics_ops['++'], _p4._1, ' ');
				},
				A2(
					_elm_lang$core$List$filter,
					function (_p5) {
						var _p6 = _p5;
						return _elm_lang$core$Native_Utils.eq(_p6._0, field);
					},
					errors)));
	});
var _user$project$Main$Model = F8(
	function (a, b, c, d, e, f, g, h) {
		return {mdc: a, rsvp: b, rsvpResponse: c, errors: d, displayEmailError: e, displayNamesError: f, displayChildrenNameAgeError: g, displayMusicError: h};
	});
var _user$project$Main$GlobalError = {ctor: 'GlobalError'};
var _user$project$Main$Music = {ctor: 'Music'};
var _user$project$Main$ChildrenNameAge = {ctor: 'ChildrenNameAge'};
var _user$project$Main$Email = {ctor: 'Email'};
var _user$project$Main$Names = {ctor: 'Names'};
var _user$project$Main$rsvpValidator = _rtfeldman$elm_validate$Validate$all(
	{
		ctor: '::',
		_0: _rtfeldman$elm_validate$Validate$firstError(
			{
				ctor: '::',
				_0: A2(
					_rtfeldman$elm_validate$Validate$ifBlank,
					function (_) {
						return _.names;
					},
					{ctor: '_Tuple2', _0: _user$project$Main$Names, _1: 'Vos noms et prenoms sont obligatoire'}),
				_1: {
					ctor: '::',
					_0: A2(
						_rtfeldman$elm_validate$Validate$ifFalse,
						function (subject) {
							return _elm_lang$core$Native_Utils.cmp(
								2,
								_elm_lang$core$String$length(subject.names)) < 0;
						},
						{ctor: '_Tuple2', _0: _user$project$Main$Names, _1: 'Au moins trois caractéres'}),
					_1: {ctor: '[]'}
				}
			}),
		_1: {
			ctor: '::',
			_0: _rtfeldman$elm_validate$Validate$firstError(
				{
					ctor: '::',
					_0: A2(
						_rtfeldman$elm_validate$Validate$ifBlank,
						function (_) {
							return _.email;
						},
						{ctor: '_Tuple2', _0: _user$project$Main$Email, _1: 'Un email est obligatoire'}),
					_1: {
						ctor: '::',
						_0: A2(
							_rtfeldman$elm_validate$Validate$ifInvalidEmail,
							function (_) {
								return _.email;
							},
							function (_p7) {
								return {ctor: '_Tuple2', _0: _user$project$Main$Email, _1: 'Invalide email'};
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		}
	});
var _user$project$Main$errorServerToErrors = function (error) {
	var _p8 = error;
	switch (_p8.ctor) {
		case 'BadStatus':
			var _p9 = _p8._0;
			return _elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: A3(_user$project$Main$errorServerToError, _p9.body, _user$project$Main$Names, 'de 3 à 255 caractéres'),
					_1: {
						ctor: '::',
						_0: A3(_user$project$Main$errorServerToError, _p9.body, _user$project$Main$Email, 'un email valide'),
						_1: {
							ctor: '::',
							_0: A3(_user$project$Main$errorServerToError, _p9.body, _user$project$Main$ChildrenNameAge, 'pas plus 255 caractéres'),
							_1: {
								ctor: '::',
								_0: A3(_user$project$Main$errorServerToError, _p9.body, _user$project$Main$Music, 'pas plus 255 caractéres'),
								_1: {ctor: '[]'}
							}
						}
					}
				});
		case 'NetworkError':
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _user$project$Main$GlobalError, _1: 'Une erreur réseaux est survenue essayer plus tard'},
				_1: {ctor: '[]'}
			};
		default:
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _user$project$Main$GlobalError, _1: 'Une erreur inconnue est survenue contactez-nous par un autre moyen'},
				_1: {ctor: '[]'}
			};
	}
};
var _user$project$Main$Brunch = {ctor: 'Brunch'};
var _user$project$Main$Housing = {ctor: 'Housing'};
var _user$project$Main$Presence = {ctor: 'Presence'};
var _user$project$Main$RsvpCreation = function (a) {
	return {ctor: 'RsvpCreation', _0: a};
};
var _user$project$Main$MusicChange = function (a) {
	return {ctor: 'MusicChange', _0: a};
};
var _user$project$Main$ChildrenNameAgeChange = function (a) {
	return {ctor: 'ChildrenNameAgeChange', _0: a};
};
var _user$project$Main$EmailChange = function (a) {
	return {ctor: 'EmailChange', _0: a};
};
var _user$project$Main$NamesChange = function (a) {
	return {ctor: 'NamesChange', _0: a};
};
var _user$project$Main$Toogle = function (a) {
	return {ctor: 'Toogle', _0: a};
};
var _user$project$Main$Submit = {ctor: 'Submit'};
var _user$project$Main$Mdc = function (a) {
	return {ctor: 'Mdc', _0: a};
};
var _user$project$Main$init = {
	ctor: '_Tuple2',
	_0: _user$project$Main$defaultModel,
	_1: _user$project$Material$init(_user$project$Main$Mdc)
};
var _user$project$Main$subscriptions = function (model) {
	return A2(_user$project$Material$subscriptions, _user$project$Main$Mdc, model);
};
var _user$project$Main$update = F2(
	function (msg, model) {
		var rsvp = model.rsvp;
		var _p10 = msg;
		switch (_p10.ctor) {
			case 'Mdc':
				return A3(_user$project$Material$update, _user$project$Main$Mdc, _p10._0, model);
			case 'EmailChange':
				var newRsvp = _elm_lang$core$Native_Utils.update(
					rsvp,
					{email: _p10._0});
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							rsvp: newRsvp,
							errors: A2(_rtfeldman$elm_validate$Validate$validate, _user$project$Main$rsvpValidator, newRsvp),
							displayEmailError: true
						}),
					{ctor: '[]'});
			case 'NamesChange':
				var newRsvp = _elm_lang$core$Native_Utils.update(
					rsvp,
					{names: _p10._0});
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							rsvp: newRsvp,
							errors: A2(_rtfeldman$elm_validate$Validate$validate, _user$project$Main$rsvpValidator, newRsvp),
							displayNamesError: true
						}),
					{ctor: '[]'});
			case 'ChildrenNameAgeChange':
				var newRsvp = _elm_lang$core$Native_Utils.update(
					rsvp,
					{childrenNameAge: _p10._0});
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							rsvp: newRsvp,
							errors: A2(_rtfeldman$elm_validate$Validate$validate, _user$project$Main$rsvpValidator, newRsvp),
							displayChildrenNameAgeError: true
						}),
					{ctor: '[]'});
			case 'MusicChange':
				var newRsvp = _elm_lang$core$Native_Utils.update(
					rsvp,
					{music: _p10._0});
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							rsvp: newRsvp,
							errors: A2(_rtfeldman$elm_validate$Validate$validate, _user$project$Main$rsvpValidator, newRsvp),
							displayMusicError: true
						}),
					{ctor: '[]'});
			case 'Toogle':
				var _p11 = _p10._0;
				switch (_p11.ctor) {
					case 'Presence':
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									rsvp: _elm_lang$core$Native_Utils.update(
										rsvp,
										{presence: !rsvp.presence})
								}),
							{ctor: '[]'});
					case 'Housing':
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									rsvp: _elm_lang$core$Native_Utils.update(
										rsvp,
										{housing: !rsvp.housing})
								}),
							{ctor: '[]'});
					default:
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									rsvp: _elm_lang$core$Native_Utils.update(
										rsvp,
										{brunch: !rsvp.brunch})
								}),
							{ctor: '[]'});
				}
			case 'RsvpCreation':
				var _p13 = _p10._0;
				var errors = function () {
					var _p12 = _p13;
					if (_p12.ctor === 'Failure') {
						return _user$project$Main$errorServerToErrors(
							A2(_elm_lang$core$Debug$log, 'errors', _p12._0));
					} else {
						return {ctor: '[]'};
					}
				}();
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{rsvpResponse: _p13, errors: errors}),
					{ctor: '[]'});
			default:
				var _p14 = A2(_rtfeldman$elm_validate$Validate$validate, _user$project$Main$rsvpValidator, rsvp);
				if (_p14.ctor === '[]') {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						model,
						{
							ctor: '::',
							_0: A2(
								_elm_lang$core$Task$perform,
								_user$project$Main$RsvpCreation,
								_user$project$Request_Www$rsvpCreation(rsvp)),
							_1: {ctor: '[]'}
						});
				} else {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{errors: _p14, displayNamesError: true, displayEmailError: true}),
						{ctor: '[]'});
				}
		}
	});
var _user$project$Main$viewSubmit = F2(
	function (model, isLoading) {
		return A2(_user$project$Main$hasError, _user$project$Main$GlobalError, model.errors) ? _user$project$Main$viewGlobalError : A2(
			_user$project$Material_FormField$view,
			{
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'display', 'block'),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A5(
					_user$project$Material_Button$view,
					_user$project$Main$Mdc,
					'btn-send',
					model.mdc,
					{
						ctor: '::',
						_0: _user$project$Material_Button$ripple,
						_1: {
							ctor: '::',
							_0: _user$project$Material_Button$raised,
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Material_Options$when,
									!isLoading,
									_user$project$Material_Options$onClick(_user$project$Main$Submit)),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Material_Options$css, 'display', 'block'),
										_1: {
											ctor: '::',
											_0: A2(_user$project$Material_Options$css, 'margin', '30px auto'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Envoyer'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Main$viewEmail = function (model) {
	var invalid = model.displayEmailError && A2(_user$project$Main$hasError, _user$project$Main$Email, model.errors);
	return A2(
		_user$project$Material_FormField$view,
		{
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'display', 'block'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A5(
				_user$project$Material_Textfield$view,
				_user$project$Main$Mdc,
				'txt-email',
				model.mdc,
				{
					ctor: '::',
					_0: _user$project$Material_Textfield$label('Une addresse email'),
					_1: {
						ctor: '::',
						_0: _user$project$Material_Textfield$required,
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield$pattern('^[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'),
							_1: {
								ctor: '::',
								_0: _user$project$Material_Options$onInput(_user$project$Main$EmailChange),
								_1: {
									ctor: '::',
									_0: _user$project$Material_Textfield$value(model.rsvp.email),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Material_Options$css, 'width', '100%'),
										_1: {
											ctor: '::',
											_0: A2(_user$project$Material_Options$when, invalid, _user$project$Material_Textfield$invalid),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Material_Textfield_HelperText$helperText,
					{
						ctor: '::',
						_0: _user$project$Material_Textfield_HelperText$persistent,
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield_HelperText$validationMsg,
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Material_Options$when,
									!invalid,
									A2(_user$project$Material_Options$css, 'display', 'none')),
								_1: {ctor: '[]'}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(_user$project$Main$errorMsg, _user$project$Main$Email, model.errors)),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$viewNames = function (model) {
	var invalid = model.displayNamesError && A2(_user$project$Main$hasError, _user$project$Main$Names, model.errors);
	return A2(
		_user$project$Material_FormField$view,
		{
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'display', 'block'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A5(
				_user$project$Material_Textfield$view,
				_user$project$Main$Mdc,
				'txt-names',
				model.mdc,
				{
					ctor: '::',
					_0: _user$project$Material_Textfield$label('Vos noms et prenoms'),
					_1: {
						ctor: '::',
						_0: _user$project$Material_Textfield$required,
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield$pattern('.{3,}'),
							_1: {
								ctor: '::',
								_0: _user$project$Material_Options$onInput(_user$project$Main$NamesChange),
								_1: {
									ctor: '::',
									_0: _user$project$Material_Textfield$value(model.rsvp.names),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Material_Options$css, 'width', '100%'),
										_1: {
											ctor: '::',
											_0: A2(_user$project$Material_Options$when, invalid, _user$project$Material_Textfield$invalid),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Material_Textfield_HelperText$helperText,
					{
						ctor: '::',
						_0: _user$project$Material_Textfield_HelperText$persistent,
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield_HelperText$validationMsg,
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Material_Options$when,
									!invalid,
									A2(_user$project$Material_Options$css, 'display', 'none')),
								_1: {ctor: '[]'}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(_user$project$Main$errorMsg, _user$project$Main$Names, model.errors)),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$viewChildrenNameAge = function (model) {
	var invalid = model.displayChildrenNameAgeError && A2(_user$project$Main$hasError, _user$project$Main$ChildrenNameAge, model.errors);
	return A2(
		_user$project$Material_FormField$view,
		{
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'display', 'block'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A5(
				_user$project$Material_Textfield$view,
				_user$project$Main$Mdc,
				'txt-children-name-age',
				model.mdc,
				{
					ctor: '::',
					_0: _user$project$Material_Textfield$label('Prenoms et ages des enfants'),
					_1: {
						ctor: '::',
						_0: _user$project$Material_Options$onInput(_user$project$Main$ChildrenNameAgeChange),
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield$value(model.rsvp.childrenNameAge),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Material_Options$css, 'width', '100%'),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Material_Options$when, invalid, _user$project$Material_Textfield$invalid),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Material_Textfield_HelperText$helperText,
					{
						ctor: '::',
						_0: _user$project$Material_Textfield_HelperText$persistent,
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield_HelperText$validationMsg,
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Material_Options$when,
									!invalid,
									A2(_user$project$Material_Options$css, 'display', 'none')),
								_1: {ctor: '[]'}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(_user$project$Main$errorMsg, _user$project$Main$ChildrenNameAge, model.errors)),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$viewMusic = function (model) {
	var invalid = model.displayMusicError && A2(_user$project$Main$hasError, _user$project$Main$Music, model.errors);
	return A2(
		_user$project$Material_FormField$view,
		{
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'display', 'block'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'margin-top', '16px'),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A5(
				_user$project$Material_Textfield$view,
				_user$project$Main$Mdc,
				'display-music',
				model.mdc,
				{
					ctor: '::',
					_0: _user$project$Material_Textfield$label('Sur quel morceau souhaitez-vous danser?'),
					_1: {
						ctor: '::',
						_0: _user$project$Material_Options$onInput(_user$project$Main$MusicChange),
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield$value(model.rsvp.music),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Material_Options$css, 'width', '100%'),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Material_Options$when, invalid, _user$project$Material_Textfield$invalid),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Material_Textfield_HelperText$helperText,
					{
						ctor: '::',
						_0: _user$project$Material_Textfield_HelperText$persistent,
						_1: {
							ctor: '::',
							_0: _user$project$Material_Textfield_HelperText$validationMsg,
							_1: {
								ctor: '::',
								_0: A2(
									_user$project$Material_Options$when,
									!invalid,
									A2(_user$project$Material_Options$css, 'display', 'none')),
								_1: {ctor: '[]'}
							}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(_user$project$Main$errorMsg, _user$project$Main$Music, model.errors)),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$viewPresence = function (model) {
	return A3(
		_user$project$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'display', 'block'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'padding-top', '20px'),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A3(
				_user$project$Material_Options$styled,
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'font-size', '16px'),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Material_Options$css, 'margin-top', '12.4px'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('On vous compte parmi nous?*'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Material_FormField$view,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A5(
							_user$project$Material_Switch$view,
							_user$project$Main$Mdc,
							'txt-presence',
							model.mdc,
							{
								ctor: '::',
								_0: A2(_user$project$Material_Options$when, model.rsvp.presence, _user$project$Material_Switch$on),
								_1: {
									ctor: '::',
									_0: _user$project$Material_Options$onClick(
										_user$project$Main$Toogle(_user$project$Main$Presence)),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$Material_Options$styled,
								_elm_lang$html$Html$label,
								{
									ctor: '::',
									_0: A2(_user$project$Material_Options$css, 'font-size', '16px'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										model.rsvp.presence ? 'Oui' : 'Non désolé'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$viewHousing = function (model) {
	return A3(
		_user$project$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'display', 'block'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'padding-top', '20px'),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A3(
				_user$project$Material_Options$styled,
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'font-size', '16px'),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Material_Options$css, 'margin-top', '12.4px'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('On a prévu un hébergement pour vous'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Material_FormField$view,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A5(
							_user$project$Material_Switch$view,
							_user$project$Main$Mdc,
							'txt-housing',
							model.mdc,
							{
								ctor: '::',
								_0: A2(_user$project$Material_Options$when, model.rsvp.housing, _user$project$Material_Switch$on),
								_1: {
									ctor: '::',
									_0: _user$project$Material_Options$onClick(
										_user$project$Main$Toogle(_user$project$Main$Housing)),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$Material_Options$styled,
								_elm_lang$html$Html$label,
								{
									ctor: '::',
									_0: A2(_user$project$Material_Options$css, 'font-size', '16px'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										model.rsvp.housing ? 'Oui ça m\'intéresse' : 'Non je me débrouille par moi même'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$viewBrunch = function (model) {
	return A3(
		_user$project$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
			_1: {
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'display', 'block'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'padding-top', '20px'),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A3(
				_user$project$Material_Options$styled,
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'font-size', '16px'),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Material_Options$css, 'margin-top', '12.4px'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Serez vous présent pour le Brunch du dimanche?'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Material_FormField$view,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A5(
							_user$project$Material_Switch$view,
							_user$project$Main$Mdc,
							'txt-brunch',
							model.mdc,
							{
								ctor: '::',
								_0: A2(_user$project$Material_Options$when, model.rsvp.brunch, _user$project$Material_Switch$on),
								_1: {
									ctor: '::',
									_0: _user$project$Material_Options$onClick(
										_user$project$Main$Toogle(_user$project$Main$Brunch)),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A3(
								_user$project$Material_Options$styled,
								_elm_lang$html$Html$label,
								{
									ctor: '::',
									_0: A2(_user$project$Material_Options$css, 'font-size', '16px'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$Material_Options$css, 'color', 'rgba(0, 0, 0, 0.6)'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										model.rsvp.brunch ? 'Oui je serais là' : 'Non je me casse à jeun'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$viewHere = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _user$project$Main$viewChildrenNameAge(model),
			_1: {
				ctor: '::',
				_0: _user$project$Main$viewHousing(model),
				_1: {
					ctor: '::',
					_0: _user$project$Main$viewMusic(model),
					_1: {
						ctor: '::',
						_0: _user$project$Main$viewBrunch(model),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$Main$viewWrapper = F2(
	function (model, isLoading) {
		return A3(
			_user$project$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: A2(_user$project$Material_Options$css, 'position', 'relative'),
				_1: {
					ctor: '::',
					_0: A2(_user$project$Material_Options$css, 'display', 'block'),
					_1: {
						ctor: '::',
						_0: A2(_user$project$Material_Options$css, 'padding', '0px 5px'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _user$project$Main$viewNames(model),
				_1: {
					ctor: '::',
					_0: _user$project$Main$viewEmail(model),
					_1: {
						ctor: '::',
						_0: _user$project$Main$viewPresence(model),
						_1: {
							ctor: '::',
							_0: model.rsvp.presence ? _user$project$Main$viewHere(model) : _user$project$Main$viewNotHereMsg,
							_1: {
								ctor: '::',
								_0: A2(_user$project$Main$viewSubmit, model, isLoading),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			});
	});
var _user$project$Main$view = function (model) {
	var _p15 = model.rsvpResponse;
	switch (_p15.ctor) {
		case 'Success':
			return _user$project$Main$viewConfirm(_p15._0);
		case 'Loading':
			return A2(_user$project$Main$viewWrapper, model, true);
		default:
			return A2(_user$project$Main$viewWrapper, model, false);
	}
};
var _user$project$Main$main = _elm_lang$html$Html$program(
	{init: _user$project$Main$init, subscriptions: _user$project$Main$subscriptions, update: _user$project$Main$update, view: _user$project$Main$view})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

