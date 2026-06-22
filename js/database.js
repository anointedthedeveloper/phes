// IndexedDB Database Layer
class Database {
    constructor() {
        this.dbName = 'SchoolPortalDB';
        this.dbVersion = 2;
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

                // Create sessions store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
                    sessionsStore.createIndex('userId', 'userId', { unique: false });
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

    // Initialize with data from JSON file
    async initializeFromJSON() {
        try {
            // Check if users already exist
            const users = await this.getAll('users');
            if (users.length === 0) {
                // Fetch users from JSON file
                const response = await fetch('db/users.json');
                const data = await response.json();

                // Create teachers
                for (const teacher of data.teachers) {
                    await this.createUser(teacher.id, teacher.password, 'teacher', null);
                }

                // Create students
                for (const student of data.students) {
                    await this.createStudent(student.id, student.name, `${student.id}@school.edu`, student.class);
                    // Also create user account for student login
                    await this.createUser(student.id, student.password, 'student', `${student.id}@school.edu`);
                }

                // Create admins
                for (const admin of data.admins) {
                    await this.createUser(admin.id, admin.password, 'admin', null);
                }

                // Create demo exam
                await this.createExam({
                    name: 'Mathematics Final Exam',
                    subject: 'Mathematics',
                    duration: 60,
                    instructions: 'Answer all questions carefully. No calculators allowed.',
                    targetClass: 'SS 2',
                    sessionCode: 'MATH-2024-001',
                    status: 'draft',
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
                    ]
                });

                console.log('Data initialized from JSON successfully');
            }
        } catch (error) {
            console.error('Error initializing data from JSON:', error);
        }
    }

    // Session management
    async createSession(userId, sessionId) {
        const session = {
            id: sessionId,
            userId: userId,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        return this.add('sessions', session);
    }

    async getSession(sessionId) {
        return this.get('sessions', sessionId);
    }

    async updateSessionActivity(sessionId) {
        const session = await this.getSession(sessionId);
        if (session) {
            session.lastActive = new Date().toISOString();
            return this.update('sessions', session);
        }
    }

    async deleteSession(sessionId) {
        return this.delete('sessions', sessionId);
    }

    async getUserSessions(userId) {
        const allSessions = await this.getAll('sessions');
        return allSessions.filter(session => session.userId === userId);
    }

    async revokeUserSessions(userId) {
        const sessions = await this.getUserSessions(userId);
        for (const session of sessions) {
            await this.deleteSession(session.id);
        }
    }

    async isUserLoggedIn(userId) {
        const sessions = await this.getUserSessions(userId);
        return sessions.length > 0;
    }
}

// Create global database instance
const db = new Database();

// Initialize database when script loads
db.init().then(() => {
    console.log('Database initialized');
    db.initializeFromJSON();
}).catch(error => {
    console.error('Database initialization failed:', error);
});
