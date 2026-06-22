// IndexedDB Database Layer
class Database {
    constructor() {
        this.dbName = 'SchoolPortalDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create users store
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    usersStore.createIndex('username', 'username', { unique: true });
                    usersStore.createIndex('role', 'role', { unique: false });
                }

                // Create students store
                if (!db.objectStoreNames.contains('students')) {
                    const studentsStore = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
                    studentsStore.createIndex('studentId', 'studentId', { unique: true });
                    studentsStore.createIndex('name', 'name', { unique: false });
                }

                // Create exams store
                if (!db.objectStoreNames.contains('exams')) {
                    const examsStore = db.createObjectStore('exams', { keyPath: 'id', autoIncrement: true });
                    examsStore.createIndex('subject', 'subject', { unique: false });
                    examsStore.createIndex('status', 'status', { unique: false });
                }

                // Create exam results store
                if (!db.objectStoreNames.contains('examResults')) {
                    const resultsStore = db.createObjectStore('examResults', { keyPath: 'id', autoIncrement: true });
                    resultsStore.createIndex('studentId', 'studentId', { unique: false });
                    resultsStore.createIndex('examId', 'examId', { unique: false });
                }

                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // User operations
    async createUser(username, password, role, email = null) {
        const user = {
            username,
            password, // In production, this should be hashed
            role,
            email,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        return this.add('users', user);
    }

    async authenticateUser(username, password, role) {
        const users = await this.getByIndex('users', 'username', username);
        const user = users.find(u => u.password === password && u.role === role);
        return user || null;
    }

    // Student operations
    async createStudent(studentId, name, email, className) {
        const student = {
            studentId,
            name,
            email,
            className,
            createdAt: new Date().toISOString()
        };
        return this.add('students', student);
    }

    async getStudentByStudentId(studentId) {
        const students = await this.getByIndex('students', 'studentId', studentId);
        return students[0] || null;
    }

    async getAllStudents() {
        return this.getAll('students');
    }

    async updateStudent(id, data) {
        const student = await this.get('students', id);
        const updatedStudent = { ...student, ...data };
        return this.update('students', updatedStudent);
    }

    async deleteStudent(id) {
        return this.delete('students', id);
    }

    // Exam operations
    async createExam(examData) {
        const exam = {
            ...examData,
            createdAt: new Date().toISOString(),
            status: 'draft'
        };
        return this.add('exams', exam);
    }

    async getAllExams() {
        return this.getAll('exams');
    }

    async getExam(id) {
        return this.get('exams', id);
    }

    async updateExam(id, data) {
        const exam = await this.get('exams', id);
        const updatedExam = { ...exam, ...data };
        return this.update('exams', updatedExam);
    }

    async deleteExam(id) {
        return this.delete('exams', id);
    }

    async getExamsByStatus(status) {
        return this.getByIndex('exams', 'status', status);
    }

    // Exam results operations
    async createExamResult(studentId, examId, score, answers, status) {
        const result = {
            studentId,
            examId,
            score,
            answers,
            status,
            submittedAt: new Date().toISOString()
        };
        return this.add('examResults', result);
    }

    async getExamResultsByStudent(studentId) {
        return this.getByIndex('examResults', 'studentId', studentId);
    }

    async getExamResultsByExam(examId) {
        return this.getByIndex('examResults', 'examId', examId);
    }

    async getAllExamResults() {
        return this.getAll('examResults');
    }

    async hasStudentTakenExam(studentId, examId) {
        const results = await this.getExamResultsByStudent(studentId);
        return results.some(r => r.examId === examId);
    }

    // Settings operations
    async getSetting(key) {
        return this.get('settings', key);
    }

    async setSetting(key, value) {
        return this.update('settings', { key, value });
    }

    // Initialize with demo data
    async initializeDemoData() {
        try {
            // Check if users already exist
            const users = await this.getAll('users');
            if (users.length === 0) {
                // Create demo users
                await this.createUser('teacher', 'teacher123', 'teacher', 'teacher@school.edu');
                await this.createUser('student', 'student123', 'student', 'student@school.edu');
                await this.createUser('admin', 'admin123', 'admin', 'admin@school.edu');

                // Create demo students
                await this.createStudent('STU001', 'John Doe', 'john@school.edu', 'Class 10A');
                await this.createStudent('STU002', 'Jane Smith', 'jane@school.edu', 'Class 10A');
                await this.createStudent('STU003', 'Bob Johnson', 'bob@school.edu', 'Class 10B');

                // Create demo exam
                await this.createExam({
                    name: 'Mathematics Final Exam',
                    subject: 'Mathematics',
                    duration: 60,
                    instructions: 'Answer all questions carefully. No calculators allowed.',
                    questions: [
                        {
                            question: 'What is 2 + 2?',
                            options: ['3', '4', '5', '6'],
                            correctAnswer: 1
                        },
                        {
                            question: 'What is the square root of 16?',
                            options: ['2', '4', '8', '16'],
                            correctAnswer: 1
                        },
                        {
                            question: 'What is 5 × 5?',
                            options: ['10', '20', '25', '30'],
                            correctAnswer: 2
                        },
                        {
                            question: 'What is 100 ÷ 10?',
                            options: ['5', '10', '15', '20'],
                            correctAnswer: 1
                        },
                        {
                            question: 'What is 7 + 8?',
                            options: ['13', '14', '15', '16'],
                            correctAnswer: 2
                        }
                    ],
                    status: 'active'
                });

                console.log('Demo data initialized successfully');
            }
        } catch (error) {
            console.error('Error initializing demo data:', error);
        }
    }
}

// Create global database instance
const db = new Database();

// Initialize database when script loads
db.init().then(() => {
    console.log('Database initialized');
    db.initializeDemoData();
}).catch(error => {
    console.error('Database initialization failed:', error);
});
