-- Syllabo: Development Sample Seed Data
-- =========================================================================
-- NOTICE & ENVIRONMENT GUARD:
-- THIS SCRIPT CONTAINS EXPLICITLY FICTITIOUS SAMPLE DATA FOR LOCAL
-- DEVELOPMENT, CI TESTING AND PREVIEW PURPOSES ONLY.
-- IT MUST NEVER BE PUBLISHED OR EXECUTED AGAINST THE PRODUCTION DATABASE.
-- ALL REAL CURRICULUM MUST BE AUTHORITATIVELY ENTERED BY UNIVERSITY MAINTAINERS.
--
-- Schema alignment: Conforms strictly to the live database column names:
-- - courses, subjects, units: lacks 'description' in live schema
-- - theory_questions: uses 'question' (not question_text) and 'topics_covered' text[]
-- - numericals: uses 'problem', 'given_data', 'required_result'
-- - mcqs: uses 'question' (not question_text)
-- =========================================================================

-- Safety check: Ensure script does not run if production flag or real data is detected
DO $$
BEGIN
    -- Prevent accidental execution in environments with non-sample courses
    IF EXISTS (SELECT 1 FROM public.courses WHERE code NOT IN ('BTECH-CSE', 'BCA', 'BTECH-ECE')) THEN
        RAISE EXCEPTION 'Safety check failed: Non-sample curriculum detected. Aborting sample seed execution to prevent overwriting production data.';
    END IF;
END $$;

-- Sample Course
INSERT INTO public.courses (id, code, name, is_published)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'BTECH-CSE',
    'B.Tech Computer Science & Engineering',
    true
)
ON CONFLICT (code) DO NOTHING;

-- Sample Subject
INSERT INTO public.subjects (id, course_id, semester, code, name, is_published)
VALUES (
    's0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    3,
    'CS301',
    'Data Structures & Algorithms',
    true
)
ON CONFLICT (course_id, semester, code) DO NOTHING;

-- Sample Unit 1 (With numericals applicable)
INSERT INTO public.units (id, subject_id, unit_number, title, numericals_applicable, is_published)
VALUES (
    'u0000000-0000-0000-0000-000000000001',
    's0000000-0000-0000-0000-000000000001',
    1,
    'Unit 1: Linear Data Structures & Arrays',
    true,
    true
)
ON CONFLICT (subject_id, unit_number) DO NOTHING;

-- Sample Unit 2 (Numericals NOT applicable example)
INSERT INTO public.units (id, subject_id, unit_number, title, numericals_applicable, is_published)
VALUES (
    'u0000000-0000-0000-0000-000000000002',
    's0000000-0000-0000-0000-000000000001',
    2,
    'Unit 2: Theoretical Foundations of Abstract Data Types',
    false,
    true
)
ON CONFLICT (subject_id, unit_number) DO NOTHING;

-- 5 Sample Theory Questions for Unit 1
INSERT INTO public.theory_questions (id, unit_id, question_number, topics_covered, question, answer_intro, answer_body, answer_conclusion, hinglish_explanation, is_published)
VALUES
(
    'q0000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000001',
    1,
    ARRAY['Data Structures Classification', 'Primitive vs Non-Primitive', 'Linear vs Non-Linear']::text[],
    '[SAMPLE DEMO] Define Data Structures and explain their classification with suitable examples.',
    'A data structure is a specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently.',
    'Data structures are primarily classified into two broad categories:
1. Primitive Data Structures: Basic system-level building blocks such as Integer, Float, Character, and Pointer.
2. Non-Primitive Data Structures: Complex structures derived from primitive types:
   a. Linear: Elements are arranged sequentially (e.g., Arrays, Linked Lists, Stacks, Queues).
   b. Non-Linear: Elements form hierarchical or interconnected networks (e.g., Trees, Graphs).
Selection criteria depend on memory footprint, algorithmic complexity, and dynamic scalability requirements.',
    'Understanding data structure classification helps software engineers choose optimal memory arrangements and traversal mechanisms for specific application workloads.',
    'Data structure ka matlab computer memory me data ko organize karna taaki fast access aur processing ho sake. Primitive types basic hote hain jaise int/float, aur non-primitive complex hote hain jaise Arrays aur Trees.',
    true
),
(
    'q0000000-0000-0000-0000-000000000002',
    'u0000000-0000-0000-0000-000000000002',
    2,
    ARRAY['Asymptotic Notations', 'Time Complexity', 'Space Complexity', 'Big-O', 'Omega', 'Theta']::text[],
    '[SAMPLE DEMO] What are asymptotic notations? Explain Big-O, Omega, and Theta notations.',
    'Asymptotic analysis evaluates mathematical performance bounds of algorithms as the input size n approaches infinity, independent of machine architecture.',
    'The three primary standard notations are:
1. Big-O (O) Notation: Represents upper asymptotic bound (worst-case scenario). Formally: f(n) <= c * g(n) for all n >= n0.
2. Omega (Ω) Notation: Represents lower asymptotic bound (best-case scenario). Formally: f(n) >= c * g(n) for all n >= n0.
3. Theta (Θ) Notation: Represents tight bound (asymptotic equality). Formally: c1 * g(n) <= f(n) <= c2 * g(n) for all n >= n0.
These bounds allow objective comparison between sorting, searching, and traversal algorithms.',
    'Asymptotic notation provides a hardware-independent mathematical guarantee on algorithm execution limits and growth rates.',
    'Asymptotic notation se hum check karte hain ki jab input data bahut bada hoga toh algorithm kitna time aur memory lega. Big-O worst case dikhata hai, Omega best case, aur Theta exact bound batata hai.',
    true
),
(
    'q0000000-0000-0000-0000-000000000003',
    'u0000000-0000-0000-0000-000000000003',
    3,
    ARRAY['1D & 2D Arrays', 'Memory Allocation', 'Row-Major vs Column-Major Addressing']::text[],
    '[SAMPLE DEMO] Explain how 2D arrays are stored in memory using Row-Major and Column-Major order.',
    'A 2D array is a matrix of elements of uniform data type mapped onto contiguous linear physical computer memory.',
    'Since physical RAM is linearly addressed, 2D arrays are linearized using two canonical mapping techniques:
1. Row-Major Order (RMO): Consecutive elements of a row reside in consecutive memory cells.
   Address(A[i][j]) = Base + W * [(i - LB1) * N + (j - LB2)]
   where Base = starting address, W = size in bytes, N = column count, LB1/LB2 = lower bounds.
2. Column-Major Order (CMO): Consecutive elements of a column reside in consecutive memory cells.
   Address(A[i][j]) = Base + W * [(j - LB2) * M + (i - LB1)]
   where M = row count.
C/C++ utilize Row-Major mapping, whereas Fortran utilizes Column-Major mapping.',
    'Correct address mapping formulas ensure compile-time and runtime memory boundary safety and spatial cache locality.',
    '2D array matrix hota hai par computer memory ek single line jaisi hoti hai. Row-Major me rows pehle store hoti hain aur Column-Major me columns pehle. C aur C++ language Row-Major use karti hain.',
    true
),
(
    'q0000000-0000-0000-0000-000000000004',
    'u0000000-0000-0000-0000-000000000004',
    4,
    ARRAY['Array Operations', 'Traversal', 'Insertion', 'Deletion', 'Search Complexity']::text[],
    '[SAMPLE DEMO] Discuss basic operations on linear arrays and their respective time complexities.',
    'Linear arrays support a standardized suite of operations dictated by fixed-size contiguous memory allocation.',
    'Core array operations and algorithmic complexities:
1. Traversal: Accessing every element sequentially once - O(n).
2. Search: Linear search requires O(n); Binary search on sorted arrays requires O(log n).
3. Insertion: Inserting at an arbitrary index requires shifting (n - k) elements to the right - O(n) worst case, O(1) at end if capacity remains.
4. Deletion: Removing an item requires shifting subsequent items to the left - O(n) worst case, O(1) at end.
5. Direct Access: Direct indexing via base address offset calculation - O(1) constant time.',
    'Arrays excel at fast random access by index O(1), but incur shifting overhead O(n) during arbitrary insertions and deletions.',
    'Array me index pata ho toh element instant O(1) me mil jata hai. Par beech me insert ya delete karne par baaki elements ko aage ya peeche shift karna padta hai, isliye O(n) time lagta hai.',
    true
),
(
    'q0000000-0000-0000-0000-000000000005',
    'u0000000-0000-0000-0000-000000000005',
    5,
    ARRAY['Sparse Matrix', 'Coordinate List (COO)', 'Compressed Sparse Row (CSR)', 'Memory Optimization']::text[],
    '[SAMPLE DEMO] What is a Sparse Matrix? Explain representation methods and memory advantages.',
    'A sparse matrix is a matrix in which the majority of elements have a value of zero.',
    'Storing sparse matrices in full standard 2D arrays wastes significant memory. Alternative efficient representations include:
1. Triplet Representation (Coordinate Format / 3-Tuple):
   Only non-zero entries are stored as rows of [Row, Column, Value], plus a header storing [Total Rows, Total Cols, Total Non-Zeroes].
2. Compressed Sparse Row (CSR):
   Uses three 1D arrays: values array, column indices array, and row pointers array, optimizing vector multiplication.
Space complexity reduces from O(M * N) down to O(NonZeroCount).',
    'Sparse matrix compression drastically cuts memory footprint in numerical physics, graphics, neural networks, and web graphs.',
    'Sparse matrix me zyadatar values zero hoti hain. Agar normal array banayein toh memory waste hogi, isliye sirf non-zero numbers ko unki row aur column position ke saath store karte hain.',
    true
)
ON CONFLICT (unit_id, question_number) DO NOTHING;

-- Sample Numerical Problem for Unit 1
INSERT INTO public.numericals (id, unit_id, problem_number, problem, given_data, required_result, formula, solution_steps, final_answer, hinglish_explanation, is_published)
VALUES (
    'n0000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000001',
    1,
    '[SAMPLE DEMO] An array A[10..20, 1..15] is stored in memory in Row-Major Order. The base address is 2000 and each element occupies 4 bytes. Find the address of element A[15, 8].',
    'Lower bound of rows LB1 = 10, Upper bound of rows UB1 = 20.
Lower bound of columns LB2 = 1, Upper bound of columns UB2 = 15.
Base address = 2000.
Element size W = 4 bytes.
Target element: i = 15, j = 8.',
    'Address of element A[15, 8] in Row-Major Order.',
    'Address(A[i][j]) = Base + W * [ (i - LB1) * N + (j - LB2) ]
where N = total columns = UB2 - LB2 + 1 = 15 - 1 + 1 = 15.',
    'Step 1: Compute total columns N:
N = 15 - 1 + 1 = 15 columns.

Step 2: Calculate row offset:
(i - LB1) = 15 - 10 = 5 rows before target row.

Step 3: Calculate elements passed across previous 5 rows:
5 * 15 = 75 elements.

Step 4: Calculate column offset within target row:
(j - LB2) = 8 - 1 = 7 elements.

Step 5: Total elements before A[15, 8]:
75 + 7 = 82 elements.

Step 6: Compute byte address:
Address = 2000 + 4 * (82) = 2000 + 328 = 2328.',
    'Address of A[15, 8] = 2328',
    'Total columns 15 hain. Target row 15 se pehle 5 puri rows hain, matlab 5 * 15 = 75 elements. Current row me 7th element tak jana hai, total 82 elements. 82 * 4 bytes = 328 bytes. Base 2000 + 328 = 2328.',
    true
)
ON CONFLICT (unit_id, problem_number) DO NOTHING;

-- Sample MCQs for Unit 1
INSERT INTO public.mcqs (id, unit_id, question_number, question, options, correct_option, explanation, is_published)
VALUES
(
    'm0000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000001',
    1,
    '[SAMPLE DEMO] Which of the following is an example of a non-linear data structure?',
    '{"A": "Array", "B": "Linked List", "C": "Tree", "D": "Queue"}',
    'C',
    'Trees and Graphs are non-linear data structures because elements are organized hierarchically rather than sequentially.',
    true
),
(
    'm0000000-0000-0000-0000-000000000002',
    'u0000000-0000-0000-0000-000000000001',
    2,
    '[SAMPLE DEMO] What is the average-case time complexity of accessing an element in an array by its index?',
    '{"A": "O(1)", "B": "O(n)", "C": "O(log n)", "D": "O(n log n)"}',
    'A',
    'Array elements are stored in contiguous memory addresses, allowing direct offset calculation Base + index * size in O(1) constant time.',
    true
),
(
    'm0000000-0000-0000-0000-000000000003',
    'u0000000-0000-0000-0000-000000000001',
    3,
    '[SAMPLE DEMO] In a Row-Major Order 2D array representation, consecutive elements of which entity are stored contiguously?',
    '{"A": "Column", "B": "Row", "C": "Diagonal", "D": "Random block"}',
    'B',
    'In Row-Major Order, all elements of the first row are stored first, followed by all elements of the second row, and so forth.',
    true
)
ON CONFLICT (unit_id, question_number) DO NOTHING;
