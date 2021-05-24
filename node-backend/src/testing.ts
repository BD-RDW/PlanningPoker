const col = [[{name: 'a', vote: 2}, {name: 'a', vote: 1}, {name: 'a', vote: 5}, {name: 'a', vote: -1} ],
    [{name: 'a', vote: 3}, {name: 'a', vote: 3}, {name: 'a', vote: 10}, {name: 'a', vote: -7} ],
    [{name: 'a', vote: 6}, {name: 'a', vote: 9}, {name: 'a', vote: 5}, {name: 'a', vote: -4} ]];

let max = -10;
col.forEach(a => {
  max = a.reduce((mx, m) => mx = mx > m.vote ? mx : m.vote, max);
});

console.log(`Max is ${max}`);

const sess = [
  {id: 1, users: [{user: 1, id: 1}, {user: 2, id: 2}, {user: 3, id: 3}]},
  {id: 2, users: [{user: 4, id: 4}, {user: 5, id: 5}, {user: 6, id: 6}]},
  {id: 3, users: [{user: 7, id: 7}, {user: 8, id: 8}, {user: 9, id: 9}]},
];

let session;
const id = 5;
sess.find(s => {if (s.users.find(u => u.id === id)) {session = s; }});
console.log('Object found: %O', session);

const arr = ['A', 'B', 'B', 'D', 'E'];
console.log('%O', arr);
arr.splice(2, 1, 'C');
console.log('%O', arr);
arr.splice(0, 1, 'AA');
console.log('%O', arr);
