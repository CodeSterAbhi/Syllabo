import { Course, Subject, Unit, TheoryQuestion, Numerical, MCQ, FacultyProfile, FacultySubjectAssignment, Evaluation } from '../types';

export const MOCK_COURSES: Course[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    code: 'BTECH-CSE',
    name: 'B.Tech Computer Science & Engineering',
    description: 'Four-year undergraduate engineering degree program',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    code: 'BCA',
    name: 'Bachelor of Computer Applications (BCA)',
    description: 'Three-year undergraduate program in computer applications and software development',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    code: 'BTECH-ECE',
    name: 'B.Tech Electronics & Communication',
    description: 'Undergraduate degree focusing on electronics, signal processing, and communication systems',
    is_published: true,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 's0000000-0000-0000-0000-000000000001',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    semester: 3,
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    description: 'Foundational study of data structures, algorithm analysis, and problem-solving techniques',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's0000000-0000-0000-0000-000000000002',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    semester: 3,
    code: 'CS302',
    name: 'Computer Organization & Architecture',
    description: 'Instruction sets, CPU microarchitecture, pipelining, and memory hierarchy',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's0000000-0000-0000-0000-000000000003',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    semester: 4,
    code: 'CS401',
    name: 'Database Management Systems',
    description: 'Relational model, SQL, normalization, transactions, and indexing',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's0000000-0000-0000-0000-000000000004',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    semester: 4,
    code: 'CS402',
    name: 'Operating Systems',
    description: 'Process management, concurrency, virtual memory, and file systems',
    is_published: true,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_UNITS: Unit[] = [
  {
    id: 'u0000000-0000-0000-0000-000000000001',
    subject_id: 's0000000-0000-0000-0000-000000000001',
    unit_number: 1,
    title: 'Unit 1: Linear Data Structures & Arrays',
    description: 'Linear arrays, representation in memory, row/column major order, and asymptotic complexity.',
    numericals_applicable: true,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u0000000-0000-0000-0000-000000000002',
    subject_id: 's0000000-0000-0000-0000-000000000001',
    unit_number: 2,
    title: 'Unit 2: Stacks, Queues & Recursion',
    description: 'Stack LIFO operations, queue FIFO operations, circular queues, and recursive call frames.',
    numericals_applicable: true,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u0000000-0000-0000-0000-000000000003',
    subject_id: 's0000000-0000-0000-0000-000000000001',
    unit_number: 3,
    title: 'Unit 3: Linked Lists & Dynamic Memory',
    description: 'Singly, doubly, and circular linked lists with pointer manipulation algorithms.',
    numericals_applicable: false, // Numericals NOT applicable demonstration
    is_published: true,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_THEORY_QUESTIONS: TheoryQuestion[] = [
  {
    id: 'q0000000-0000-0000-0000-000000000001',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 1,
    topics_covered: ['Data Structures Classification', 'Primitive vs Non-Primitive', 'Linear vs Non-Linear Structures'],
    question: 'Define Data Structures and explain their classification with suitable examples.',
    question_text: 'Define Data Structures and explain their classification with suitable examples.',
    answer_intro: 'A data structure is a specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently, balancing computational time and spatial resources.',
    answer_body: `Data structures are primarily categorized into two foundational classifications:

1. Primitive Data Structures:
   Directly operated upon by machine-level instructions. Examples include Integer, Floating-point, Character, and Pointer types.

2. Non-Primitive Data Structures:
   Derived composite structures constructed using primitive data types:
   a. Linear Data Structures: Elements form a sequential sequence where every element has unique predecessor and successor (except endpoints).
      - Arrays: Fixed-size contiguous memory blocks.
      - Linked Lists: Nodes connected via explicit pointers.
      - Stacks: LIFO (Last-In-First-Out) access pattern.
      - Queues: FIFO (First-In-First-Out) access pattern.
   b. Non-Linear Data Structures: Elements are organized hierarchically or interconnected arbitrarily.
      - Trees: Hierarchical parent-child relationships (e.g., Binary Search Trees).
      - Graphs: Networks of vertices interconnected by directional or weighted edges.`,
    answer_conclusion: 'The judicious selection of a data structure directly dictates the algorithmic efficiency, memory consumption, and maintainability of production software systems.',
    diagram_url: '',
    hinglish_explanation: 'Data structure computer memory me data ko arrange karne ka tarika hai taaki kaam jaldi ho sake. Primitive basic hote hain jaise int ya float, aur non-primitive complex hote hain jaise Arrays, Stacks aur Trees.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q0000000-0000-0000-0000-000000000002',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 2,
    topics_covered: ['Asymptotic Notations', 'Time Complexity', 'Space Complexity', 'Big-O', 'Omega', 'Theta'],
    question: 'What are asymptotic notations? Explain Big-O, Omega, and Theta notations with mathematical formulations.',
    question_text: 'What are asymptotic notations? Explain Big-O, Omega, and Theta notations with mathematical formulations.',
    answer_intro: 'Asymptotic analysis evaluates the resource scaling behavior (time and space complexity) of an algorithm as the input size n tends toward infinity, abstracting machine hardware variations.',
    answer_body: `The three canonical asymptotic notations are:

1. Big-O Notation (O) - Asymptotic Upper Bound:
   Represents the maximum time taken by an algorithm in the worst-case scenario.
   Mathematical Definition: f(n) = O(g(n)) iff there exist positive constants c and n0 such that:
   0 <= f(n) <= c * g(n) for all n >= n0.

2. Big-Omega Notation (Ω) - Asymptotic Lower Bound:
   Represents the minimum time required in the best-case scenario.
   Mathematical Definition: f(n) = Ω(g(n)) iff there exist positive constants c and n0 such that:
   0 <= c * g(n) <= f(n) for all n >= n0.

3. Big-Theta Notation (Θ) - Asymptotically Tight Bound:
   Encloses the function from above and below, describing exact order of growth.
   Mathematical Definition: f(n) = Θ(g(n)) iff there exist positive constants c1, c2, and n0 such that:
   c1 * g(n) <= f(n) <= c2 * g(n) for all n >= n0.`,
    answer_conclusion: 'These mathematical bounds enable rigorous comparison between algorithms regardless of clock speed, compiler optimizations, or operating systems.',
    diagram_url: '',
    hinglish_explanation: 'Asymptotic notation se hum check karte hain ki jab input data bahut bada hoga toh algorithm kitna time lega. Big-O worst case batata hai, Omega best case, aur Theta exact tight range deta hai.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q0000000-0000-0000-0000-000000000003',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 3,
    topics_covered: ['1D & 2D Arrays', 'Contiguous Memory', 'Row-Major vs Column-Major Addressing Formulas'],
    question: 'Explain how 2D arrays are mapped into linear computer memory using Row-Major and Column-Major order.',
    question_text: 'Explain how 2D arrays are mapped into linear computer memory using Row-Major and Column-Major order.',
    answer_intro: 'Although multi-dimensional arrays are conceptually structured as rectangular matrices, physical computer RAM is strictly one-dimensional and linearly addressed.',
    answer_body: `To map a 2D array A[LB1..UB1, LB2..UB2] into contiguous memory, compilers employ one of two standard layout conventions:

1. Row-Major Order (RMO):
   Elements of the first row are placed contiguously, followed by elements of the second row, and so on.
   Let Base = starting memory address, W = size of each element in bytes, M = total rows, N = total columns (UB2 - LB2 + 1).
   Formula for address of A[i, j]:
   Address(A[i, j]) = Base + W * [ (i - LB1) * N + (j - LB2) ]

2. Column-Major Order (CMO):
   Elements of the first column are placed contiguously, followed by elements of the second column.
   Formula for address of A[i, j]:
   Address(A[i, j]) = Base + W * [ (j - LB2) * M + (i - LB1) ]
   where M = (UB1 - LB1 + 1).

Major languages like C, C++, and Python utilize Row-Major order, while Fortran and MATLAB utilize Column-Major order.`,
    answer_conclusion: 'Understanding memory layout is essential for exploiting CPU hardware cache locality and writing cache-friendly high-performance matrix algorithms.',
    diagram_url: '',
    hinglish_explanation: '2D array matrix hota hai par RAM ek seedhi line hoti hai. Row-Major me pehle puri row memory me aati hai, fir doosri row. Column-Major me pehle columns store hote hain. C aur C++ Row-Major use karte hain.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q0000000-0000-0000-0000-000000000004',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 4,
    topics_covered: ['Array Operations', 'Traversal', 'Insertion', 'Deletion', 'Search Complexity', 'Shifting Overhead'],
    question: 'Discuss basic operations supported on linear arrays along with their respective computational complexities.',
    question_text: 'Discuss basic operations supported on linear arrays along with their respective computational complexities.',
    answer_intro: 'A linear array is a homogeneous collection of elements stored at contiguous memory locations, characterized by fast direct index-based access.',
    answer_body: `Standard fundamental operations performed on arrays:

1. Direct Access / Indexing:
   Calculates address as Base + index * size. Time complexity is O(1) constant time.

2. Traversal:
   Visiting every element exactly once (e.g. printing or accumulating a sum). Time complexity is O(n).

3. Search Operations:
   - Linear Search (Unsorted array): Scans sequentially until target is found. Complexity: O(n).
   - Binary Search (Sorted array): Repeatedly divides search interval in half. Complexity: O(log n).

4. Insertion:
   - At end (with capacity): O(1).
   - At arbitrary index k: Requires shifting (n - k) elements to the right. Worst-case (at index 0): O(n).

5. Deletion:
   - At end: O(1).
   - At arbitrary index k: Requires shifting subsequent elements left to close the gap. Worst-case: O(n).`,
    answer_conclusion: 'Arrays offer unrivaled random-access read performance but impose significant memory-shifting penalties during dynamic insertions and deletions.',
    diagram_url: '',
    hinglish_explanation: 'Array me direct index se element turant O(1) me mil jata hai. Lekin beech me naya element daalne ya nikalne ke liye baaki sabhi elements ko aage ya peeche khiskana padta hai, jisme O(n) time lagta hai.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'q0000000-0000-0000-0000-000000000005',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 5,
    topics_covered: ['Sparse Matrix', 'Coordinate List (COO)', 'Compressed Sparse Row (CSR)', 'Memory Footprint Optimization'],
    question: 'What is a Sparse Matrix? Explain its representations and describe how it optimizes memory usage.',
    question_text: 'What is a Sparse Matrix? Explain its representations and describe how it optimizes memory usage.',
    answer_intro: 'A matrix is formally classified as sparse when the count of zero-valued elements is substantially greater than the count of non-zero elements.',
    answer_body: `Storing large sparse matrices in traditional two-dimensional arrays wastes significant memory allocating bytes for zeroes. 

Specialized compact representations:

1. Triplet Representation (Coordinate Format / 3-Tuple):
   Stores only the non-zero elements as an array of rows having 3 columns:
   - Row index
   - Column index
   - Non-zero value
   A metadata header record stores: [Total Rows, Total Columns, Total Non-Zero Count].

2. Compressed Sparse Row (CSR):
   Employs three 1D arrays:
   - Values array: All non-zero values in row-major sequence.
   - Column Indices array: Column index corresponding to each value.
   - Row Pointer array: Offset index where each row starts in the values array.

Memory Advantages:
Standard matrix requires O(M * N) space. Sparse triplet requires O(3 * NZ) where NZ << (M * N). For a 1000x1000 matrix with 1% non-zeroes, memory consumption is reduced by nearly 97%.`,
    answer_conclusion: 'Sparse matrix representations are foundational in graph analytics, physics simulations, natural language processing, and neural network weight compression.',
    diagram_url: '',
    hinglish_explanation: 'Sparse matrix me mostly numbers zero hote hain. Agar normal matrix banayein toh RAM waste hoti hai. Isliye hum sirf un numbers ko store karte hain jo zero nahi hain, unki row aur column number ke saath.',
    is_published: true,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_NUMERICALS: Numerical[] = [
  {
    id: 'n0000000-0000-0000-0000-000000000001',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    problem_number: 1,
    problem: 'An array A[10..20, 1..15] is stored in memory in Row-Major Order. The base address is 2000 and each element occupies 4 bytes. Find the exact memory address of element A[15, 8].',
    problem_statement: 'An array A[10..20, 1..15] is stored in memory in Row-Major Order. The base address is 2000 and each element occupies 4 bytes. Find the exact memory address of element A[15, 8].',
    given_data: `Lower bound of rows (LB1) = 10, Upper bound of rows (UB1) = 20
Lower bound of columns (LB2) = 1, Upper bound of columns (UB2) = 15
Base Address = 2000
Element size (W) = 4 bytes
Target element indices: i = 15, j = 8`,
    given: `Lower bound of rows (LB1) = 10, Upper bound of rows (UB1) = 20
Lower bound of columns (LB2) = 1, Upper bound of columns (UB2) = 15
Base Address = 2000
Element size (W) = 4 bytes
Target element indices: i = 15, j = 8`,
    required_result: 'Memory address of element A[15, 8] under Row-Major Order mapping.',
    required: 'Memory address of element A[15, 8] under Row-Major Order mapping.',
    formula: 'Address(A[i, j]) = Base + W * [ (i - LB1) * N + (j - LB2) ]\nwhere N = total columns per row = (UB2 - LB2 + 1)',
    solution_steps: `Step 1: Compute total number of columns (N) per row:
N = UB2 - LB2 + 1 = 15 - 1 + 1 = 15 columns.

Step 2: Calculate completed rows preceding target row index 15:
Rows completed = (i - LB1) = 15 - 10 = 5 complete rows.

Step 3: Calculate elements contained in those 5 preceding rows:
Preceding row elements = 5 * N = 5 * 15 = 75 elements.

Step 4: Calculate elements passed in the current 15th row up to column 8:
Column offset = (j - LB2) = 8 - 1 = 7 elements.

Step 5: Calculate total number of elements preceding A[15, 8]:
Total preceding elements = 75 + 7 = 82 elements.

Step 6: Calculate total byte displacement:
Displacement = 82 * W = 82 * 4 bytes = 328 bytes.

Step 7: Add displacement to Base Address:
Address = 2000 + 328 = 2328.`,
    final_answer: 'Address of A[15, 8] = 2328',
    diagram_url: '',
    hinglish_explanation: 'Target row 15 se pehle 5 full rows cross hoti hain (5 * 15 = 75 elements). 15th row me 8th column tak 7 elements aate hain. Total 82 elements * 4 bytes = 328 bytes. Base 2000 me add karne par 2328 answer aata hai.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'n0000000-0000-0000-0000-000000000002',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    problem_number: 2,
    problem: 'A 2D array B[-5..15, 10..40] is stored in Column-Major Order. Given Base = 1500 and size of each element = 2 bytes, calculate the address of B[5, 25].',
    problem_statement: 'A 2D array B[-5..15, 10..40] is stored in Column-Major Order. Given Base = 1500 and size of each element = 2 bytes, calculate the address of B[5, 25].',
    given_data: `Row bounds: LB1 = -5, UB1 = 15
Column bounds: LB2 = 10, UB2 = 40
Base Address = 1500
Element size (W) = 2 bytes
Target indices: i = 5, j = 25`,
    given: `Row bounds: LB1 = -5, UB1 = 15
Column bounds: LB2 = 10, UB2 = 40
Base Address = 1500
Element size (W) = 2 bytes
Target indices: i = 5, j = 25`,
    required_result: 'Address of B[5, 25] under Column-Major Order.',
    required: 'Address of B[5, 25] under Column-Major Order.',
    formula: 'Address(B[i, j]) = Base + W * [ (j - LB2) * M + (i - LB1) ]\nwhere M = total rows = (UB1 - LB1 + 1)',
    solution_steps: `Step 1: Compute total rows (M):
M = UB1 - LB1 + 1 = 15 - (-5) + 1 = 21 rows.

Step 2: Calculate completed columns before column 25:
Columns completed = (j - LB2) = 25 - 10 = 15 complete columns.

Step 3: Calculate elements in completed columns:
15 * M = 15 * 21 = 315 elements.

Step 4: Calculate row offset within column 25:
Row offset = (i - LB1) = 5 - (-5) = 10 elements.

Step 5: Total elements before B[5, 25]:
315 + 10 = 325 elements.

Step 6: Compute address:
Address = 1500 + 2 * (325) = 1500 + 650 = 2150.`,
    final_answer: 'Address of B[5, 25] = 2150',
    diagram_url: '',
    hinglish_explanation: 'Column-Major me columns pehle store hote hain. Total rows 21 hain. 15 columns pass ho chuke hain (15 * 21 = 315 elements). 25th column me 10 elements cross hue. Total 325 * 2 bytes = 650 bytes. Base 1500 + 650 = 2150.',
    is_published: true,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_MCQS: MCQ[] = [
  {
    id: 'm0000000-0000-0000-0000-000000000001',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 1,
    question: 'Which of the following is an example of a non-linear data structure?',
    question_text: 'Which of the following is an example of a non-linear data structure?',
    options: {
      A: 'Array',
      B: 'Linked List',
      C: 'Tree',
      D: 'Queue',
    },
    correct_option: 'C',
    explanation: 'Trees and Graphs are non-linear because their nodes have hierarchical or network relationships rather than sequential single-predecessor single-successor relationships.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'm0000000-0000-0000-0000-000000000002',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 2,
    question: 'What is the time complexity to retrieve an element from a 1D array given its index?',
    question_text: 'What is the time complexity to retrieve an element from a 1D array given its index?',
    options: {
      A: 'O(1)',
      B: 'O(n)',
      C: 'O(log n)',
      D: 'O(n log n)',
    },
    correct_option: 'A',
    explanation: 'Arrays reside in contiguous memory, allowing direct arithmetic pointer calculation Base + (index * size) in O(1) constant time.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'm0000000-0000-0000-0000-000000000003',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 3,
    question: 'In Row-Major Order memory mapping of a 2D array, which elements are stored consecutively in RAM?',
    question_text: 'In Row-Major Order memory mapping of a 2D array, which elements are stored consecutively in RAM?',
    options: {
      A: 'Elements of the same column',
      B: 'Elements of the same row',
      C: 'Diagonal elements',
      D: 'Anti-diagonal elements',
    },
    correct_option: 'B',
    explanation: 'In Row-Major Order, all elements belonging to row 0 are placed sequentially in physical memory, followed immediately by row 1.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'm0000000-0000-0000-0000-000000000004',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 4,
    question: 'What is the worst-case time complexity of inserting an item at the beginning of an unsorted array of size n?',
    question_text: 'What is the worst-case time complexity of inserting an item at the beginning of an unsorted array of size n?',
    options: {
      A: 'O(1)',
      B: 'O(log n)',
      C: 'O(n)',
      D: 'O(n^2)',
    },
    correct_option: 'C',
    explanation: 'Inserting at index 0 requires shifting all n existing elements one position to the right, incurring O(n) operations.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'm0000000-0000-0000-0000-000000000005',
    unit_id: 'u0000000-0000-0000-0000-000000000001',
    question_number: 5,
    question: 'A matrix having M rows and N columns is considered sparse when:',
    question_text: 'A matrix having M rows and N columns is considered sparse when:',
    options: {
      A: 'The number of zero elements is substantially greater than non-zero elements',
      B: 'All diagonal entries are equal to 1',
      C: 'The matrix is strictly symmetric',
      D: 'All elements are positive integers',
    },
    correct_option: 'A',
    explanation: 'A sparse matrix is formally characterized by having a predominant majority of zero-valued entries compared to non-zero values.',
    is_published: true,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_FACULTY_LIST: FacultyProfile[] = [
  {
    user_id: 'u00000000-auth-user-0000-000000000001',
    faculty_code: 'FAC-QTU-001',
    display_name: 'Dr. R. K. Sharma (Dept of CSE)',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    user_id: 'u00000000-auth-user-0000-000000000002',
    faculty_code: 'FAC-QTU-002',
    display_name: 'Prof. Anjali Verma (Dept of CSE)',
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

export const MOCK_FACULTY: FacultyProfile = MOCK_FACULTY_LIST[0];

export const MOCK_ASSIGNMENTS: FacultySubjectAssignment[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    faculty_id: 'u00000000-auth-user-0000-000000000001',
    subject_id: 's0000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
  }
];

export const MOCK_EVALUATIONS: Record<string, Evaluation> = {
  'q0000000-0000-0000-0000-000000000001': {
    id: 'e0000000-0000-0000-0000-000000000001',
    question_id: 'q0000000-0000-0000-0000-000000000001',
    faculty_id: 'u00000000-auth-user-0000-000000000001',
    score: 7.5,
    created_at: new Date().toISOString(),
  },
  'q0000000-0000-0000-0000-000000000002': {
    id: 'e0000000-0000-0000-0000-000000000002',
    question_id: 'q0000000-0000-0000-0000-000000000002',
    faculty_id: 'u00000000-auth-user-0000-000000000001',
    score: 8.0,
    created_at: new Date().toISOString(),
  }
};
