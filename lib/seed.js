const db = require('./db');
const { generateEmbedding } = require('./ai');

console.log('Seeding database...');

const insertUser = db.prepare('INSERT OR IGNORE INTO users (roll_number, name, branch, reputation) VALUES (?, ?, ?, ?)');
const users = [
  ['CS21B001', 'Aarav Sharma', 'CSE', 145],
  ['CS21B002', 'Diya Patel', 'CSE', 98],
  ['CS21B003', 'Rohan Iyer', 'CSE', 76],
  ['EC21B010', 'Priya Reddy', 'ECE', 52],
];
users.forEach(u => insertUser.run(...u));

const getUserByRoll = db.prepare('SELECT id FROM users WHERE roll_number = ?');
const u1 = getUserByRoll.get('CS21B001').id;
const u2 = getUserByRoll.get('CS21B002').id;
const u3 = getUserByRoll.get('CS21B003').id;

const insertNote = db.prepare(`INSERT INTO notes (user_id, title, subject, unit, tags, file_url, extracted_text, summary, key_topics, exam_questions, embedding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const notesData = [
  {
    user_id: u1,
    title: 'Operating Systems - Process Scheduling',
    subject: 'Operating Systems',
    unit: 'Unit 2',
    tags: 'scheduling,processes,cpu,fcfs,sjf,round-robin',
    text: 'Process scheduling is the activity of managing process execution on the CPU. Common algorithms include First Come First Served (FCFS), Shortest Job First (SJF), Round Robin, and Priority Scheduling. FCFS is simple but causes the convoy effect where short processes wait behind long ones. SJF minimizes average waiting time but requires knowing burst times in advance. Round Robin uses time quanta to ensure fairness in time-sharing systems. Priority scheduling assigns priorities to processes but can cause starvation, which is mitigated using aging.',
    summary: 'Process scheduling determines which process runs on the CPU. Major algorithms include FCFS (simple but causes convoy effect), SJF (optimal average waiting time but needs burst time prediction), Round Robin (fair time-sharing using quanta), and Priority Scheduling (which risks starvation, solved by aging). Each algorithm trades off fairness, throughput, and response time.',
    topics: ['FCFS','SJF','Round Robin','Priority','Convoy Effect','Starvation'],
    questions: ['Compare FCFS and SJF with examples.','Explain Round Robin scheduling and the effect of time quantum size.','What is starvation? How does aging solve it?','Calculate average waiting time for given burst times using SJF.'],
  },
  {
    user_id: u2,
    title: 'DBMS - Normalization (1NF to BCNF)',
    subject: 'Database Systems',
    unit: 'Unit 3',
    tags: 'normalization,1nf,2nf,3nf,bcnf,functional-dependency',
    text: 'Normalization is the process of organizing data to reduce redundancy and improve integrity. First Normal Form (1NF) requires atomic values. Second Normal Form (2NF) eliminates partial dependencies on composite keys. Third Normal Form (3NF) eliminates transitive dependencies. Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF where every determinant must be a candidate key. Functional dependencies are the foundation of normalization theory.',
    summary: 'Normalization organizes relational data to reduce redundancy. 1NF demands atomic columns. 2NF removes partial dependencies. 3NF removes transitive dependencies. BCNF strengthens 3NF by requiring every determinant to be a candidate key. The whole framework rests on functional dependencies between attributes.',
    topics: ['1NF','2NF','3NF','BCNF','Functional Dependency','Redundancy'],
    questions: ['Define functional dependency with an example.','Decompose a given relation into BCNF.','Difference between 3NF and BCNF.','Why is normalization important in database design?'],
  },
  {
    user_id: u3,
    title: 'Computer Networks - TCP vs UDP',
    subject: 'Computer Networks',
    unit: 'Unit 4',
    tags: 'tcp,udp,transport-layer,protocols,reliability',
    text: 'TCP (Transmission Control Protocol) is a connection-oriented protocol that provides reliable, ordered, and error-checked delivery of data. It uses three-way handshake for connection establishment. UDP (User Datagram Protocol) is connectionless and provides no guarantees of delivery, ordering, or duplicate protection but has lower overhead. TCP is used for HTTP, email, file transfer. UDP is used for DNS, video streaming, and online gaming where speed matters more than reliability.',
    summary: 'TCP is connection-oriented, reliable, and ordered, using a three-way handshake — ideal for HTTP, email, and file transfer. UDP is connectionless and unreliable but lightweight, making it the right choice for DNS, streaming, and gaming where latency beats reliability. Both operate at the transport layer.',
    topics: ['TCP','UDP','Three-way Handshake','Transport Layer','Reliability'],
    questions: ['Explain the three-way handshake in TCP.','When would you choose UDP over TCP?','What is the structure of a TCP segment header?','How does TCP handle congestion control?'],
  },
  {
    user_id: u1,
    title: 'Data Structures - Binary Search Trees',
    subject: 'Data Structures',
    unit: 'Unit 5',
    tags: 'bst,trees,search,insertion,deletion',
    text: 'A Binary Search Tree (BST) is a tree where each node has at most two children, and for every node, the left subtree contains values less than the node and the right subtree contains values greater. Search, insertion, and deletion operations have average time complexity O(log n) for balanced trees but degrade to O(n) for skewed trees. Self-balancing BSTs like AVL and Red-Black trees maintain logarithmic height.',
    summary: 'A Binary Search Tree organizes nodes so left children are smaller and right children larger than the parent. Average operations run in O(log n) when balanced but degrade to O(n) when skewed. AVL and Red-Black trees self-balance to guarantee logarithmic height.',
    topics: ['BST','Tree Traversal','AVL','Red-Black','Logarithmic Height'],
    questions: ['Insert a sequence of values into a BST and show the tree.','Explain in-order, pre-order, post-order traversal.','Why do AVL trees need rotations?','Compare AVL and Red-Black trees.'],
  },
];

notesData.forEach(n => {
  const emb = JSON.stringify(generateEmbedding(n.text + ' ' + n.summary + ' ' + n.tags));
  insertNote.run(n.user_id, n.title, n.subject, n.unit, n.tags, '', n.text, n.summary, JSON.stringify(n.topics), JSON.stringify(n.questions), emb);
});

const insertQuestion = db.prepare(`INSERT INTO questions (user_id, title, body, subject, tags, is_anonymous, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)`);
const insertAnswer = db.prepare(`INSERT INTO answers (question_id, user_id, body, is_ai, votes) VALUES (?, ?, ?, ?, ?)`);

const q1Body = 'I keep getting confused between SJF and Round Robin. When should I use each one and why?';
const q1Emb = JSON.stringify(generateEmbedding('SJF Round Robin scheduling difference ' + q1Body));
const q1 = insertQuestion.run(u2, 'When to use SJF vs Round Robin?', q1Body, 'Operating Systems', 'scheduling,sjf,round-robin', 0, q1Emb);
insertAnswer.run(q1.lastInsertRowid, null, 'SJF (Shortest Job First) gives the minimum average waiting time when you know burst times in advance — good for batch systems. Round Robin uses fixed time quanta and is fair, making it ideal for interactive/time-sharing systems where response time matters more than total throughput. In short: SJF for predictable batch workloads, RR for interactive multi-user systems.', 1, 0);
insertAnswer.run(q1.lastInsertRowid, u1, 'Adding to the AI answer: in practice, modern OSes use multilevel feedback queues which combine both ideas. RR for interactive processes, longer slices for CPU-bound ones.', 0, 5);

const q2Body = 'Why exactly do we need BCNF if 3NF already handles transitive dependencies?';
const q2Emb = JSON.stringify(generateEmbedding('BCNF 3NF normalization difference ' + q2Body));
const q2 = insertQuestion.run(u3, 'Why is BCNF needed if we have 3NF?', q2Body, 'Database Systems', 'bcnf,3nf,normalization', 0, q2Emb);
insertAnswer.run(q2.lastInsertRowid, null, '3NF allows a non-prime attribute to determine a prime attribute, which can still cause anomalies. BCNF closes this gap by requiring every determinant to be a candidate key. Most relations in 3NF are also in BCNF, but the rare exceptions are exactly the cases where BCNF helps eliminate redundancy that 3NF misses.', 1, 0);

const insertSession = db.prepare(`INSERT INTO sessions (user_id, title, subject, description, meet_link, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)`);
const futureTime = Math.floor(Date.now() / 1000) + 86400;
insertSession.run(u1, 'OS Midterm Revision', 'Operating Systems', 'Going through scheduling, deadlocks and memory management together.', 'https://meet.google.com/abc-defg-hij', futureTime);
insertSession.run(u2, 'DBMS Normalization Doubts', 'Database Systems', 'Solving practice problems on 1NF through BCNF.', 'https://meet.google.com/xyz-uvwx-rst', futureTime + 3600);

console.log('✓ Seeded users, notes, questions, answers, and sessions.');
console.log('✓ Demo login: roll number CS21B001 (or any of CS21B002, CS21B003, EC21B010)');
