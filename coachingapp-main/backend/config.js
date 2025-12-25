// Configuration for Coaching Platform
export default {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    
    // Beam Live API Configuration
    BEAM_LIVE: {
        BASE_URL: 'https://api.beaml1ve.com', // Update with actual URL
        MQTT_BROKER: 'wss://mqtt.beaml1ve.com:8884',
        API_KEY: process.env.BEAM_API_KEY || 'your-api-key',
        API_SECRET: process.env.BEAM_API_SECRET || 'your-api-secret'
    },
    
    // JWT Configuration
    JWT: {
        SECRET: process.env.JWT_SECRET || 'coaching-platform-secret-key',
        EXPIRES_IN: '24h'
    },
    
    // User Roles
    ROLES: {
        ADMIN: 'admin',
        COACH: 'coach',
        STUDENT: 'student'
    },
    
    // Default Users (for testing)
    DEFAULT_USERS: [
        // Admin
        {
            id: '1',
            username: 'admin',
            password: 'admin',
            role: 'admin',
            email: 'admin@coaching.com',
            name: 'Admin User'
        },
        
        // 10 Coaches
        { id: '101', username: 'coach1', password: 'coach123', role: 'coach', email: 'coach1@coaching.com', name: 'Dr. Sarah Johnson', specialty: 'Web Development' },
        { id: '102', username: 'coach2', password: 'coach123', role: 'coach', email: 'coach2@coaching.com', name: 'Prof. Michael Chen', specialty: 'Data Science' },
        { id: '103', username: 'coach3', password: 'coach123', role: 'coach', email: 'coach3@coaching.com', name: 'Dr. Emily Rodriguez', specialty: 'Mobile Development' },
        { id: '104', username: 'coach4', password: 'coach123', role: 'coach', email: 'coach4@coaching.com', name: 'Prof. David Kim', specialty: 'Machine Learning' },
        { id: '105', username: 'coach5', password: 'coach123', role: 'coach', email: 'coach5@coaching.com', name: 'Dr. Lisa Anderson', specialty: 'Cloud Computing' },
        { id: '106', username: 'coach6', password: 'coach123', role: 'coach', email: 'coach6@coaching.com', name: 'Prof. James Wilson', specialty: 'Cybersecurity' },
        { id: '107', username: 'coach7', password: 'coach123', role: 'coach', email: 'coach7@coaching.com', name: 'Dr. Maria Garcia', specialty: 'UI/UX Design' },
        { id: '108', username: 'coach8', password: 'coach123', role: 'coach', email: 'coach8@coaching.com', name: 'Prof. Robert Taylor', specialty: 'DevOps' },
        { id: '109', username: 'coach9', password: 'coach123', role: 'coach', email: 'coach9@coaching.com', name: 'Dr. Jennifer Lee', specialty: 'Blockchain' },
        { id: '110', username: 'coach10', password: 'coach123', role: 'coach', email: 'coach10@coaching.com', name: 'Prof. Thomas Brown', specialty: 'AI & Robotics' },
        
        // 50 Students (10 per course)
        // Course 1 Students (Web Development)
        { id: '201', username: 'student1', password: 'student123', role: 'student', email: 'student1@coaching.com', name: 'Alex Martinez' },
        { id: '202', username: 'student2', password: 'student123', role: 'student', email: 'student2@coaching.com', name: 'Emma Thompson' },
        { id: '203', username: 'student3', password: 'student123', role: 'student', email: 'student3@coaching.com', name: 'Oliver Davis' },
        { id: '204', username: 'student4', password: 'student123', role: 'student', email: 'student4@coaching.com', name: 'Sophia White' },
        { id: '205', username: 'student5', password: 'student123', role: 'student', email: 'student5@coaching.com', name: 'Liam Harris' },
        { id: '206', username: 'student6', password: 'student123', role: 'student', email: 'student6@coaching.com', name: 'Ava Clark' },
        { id: '207', username: 'student7', password: 'student123', role: 'student', email: 'student7@coaching.com', name: 'Noah Lewis' },
        { id: '208', username: 'student8', password: 'student123', role: 'student', email: 'student8@coaching.com', name: 'Isabella Walker' },
        { id: '209', username: 'student9', password: 'student123', role: 'student', email: 'student9@coaching.com', name: 'Ethan Hall' },
        { id: '210', username: 'student10', password: 'student123', role: 'student', email: 'student10@coaching.com', name: 'Mia Allen' },
        
        // Course 2 Students (Data Science)
        { id: '211', username: 'student11', password: 'student123', role: 'student', email: 'student11@coaching.com', name: 'Lucas Young' },
        { id: '212', username: 'student12', password: 'student123', role: 'student', email: 'student12@coaching.com', name: 'Charlotte King' },
        { id: '213', username: 'student13', password: 'student123', role: 'student', email: 'student13@coaching.com', name: 'Mason Wright' },
        { id: '214', username: 'student14', password: 'student123', role: 'student', email: 'student14@coaching.com', name: 'Amelia Scott' },
        { id: '215', username: 'student15', password: 'student123', role: 'student', email: 'student15@coaching.com', name: 'Logan Green' },
        { id: '216', username: 'student16', password: 'student123', role: 'student', email: 'student16@coaching.com', name: 'Harper Adams' },
        { id: '217', username: 'student17', password: 'student123', role: 'student', email: 'student17@coaching.com', name: 'Jackson Baker' },
        { id: '218', username: 'student18', password: 'student123', role: 'student', email: 'student18@coaching.com', name: 'Ella Nelson' },
        { id: '219', username: 'student19', password: 'student123', role: 'student', email: 'student19@coaching.com', name: 'Aiden Carter' },
        { id: '220', username: 'student20', password: 'student123', role: 'student', email: 'student20@coaching.com', name: 'Scarlett Mitchell' },
        
        // Course 3 Students (Mobile Development)
        { id: '221', username: 'student21', password: 'student123', role: 'student', email: 'student21@coaching.com', name: 'Sebastian Perez' },
        { id: '222', username: 'student22', password: 'student123', role: 'student', email: 'student22@coaching.com', name: 'Victoria Roberts' },
        { id: '223', username: 'student23', password: 'student123', role: 'student', email: 'student23@coaching.com', name: 'Jack Turner' },
        { id: '224', username: 'student24', password: 'student123', role: 'student', email: 'student24@coaching.com', name: 'Grace Phillips' },
        { id: '225', username: 'student25', password: 'student123', role: 'student', email: 'student25@coaching.com', name: 'Henry Campbell' },
        { id: '226', username: 'student26', password: 'student123', role: 'student', email: 'student26@coaching.com', name: 'Chloe Parker' },
        { id: '227', username: 'student27', password: 'student123', role: 'student', email: 'student27@coaching.com', name: 'Samuel Evans' },
        { id: '228', username: 'student28', password: 'student123', role: 'student', email: 'student28@coaching.com', name: 'Lily Edwards' },
        { id: '229', username: 'student29', password: 'student123', role: 'student', email: 'student29@coaching.com', name: 'Daniel Collins' },
        { id: '230', username: 'student30', password: 'student123', role: 'student', email: 'student30@coaching.com', name: 'Zoe Stewart' },
        
        // Course 4 Students (Machine Learning)
        { id: '231', username: 'student31', password: 'student123', role: 'student', email: 'student31@coaching.com', name: 'Matthew Sanchez' },
        { id: '232', username: 'student32', password: 'student123', role: 'student', email: 'student32@coaching.com', name: 'Aria Morris' },
        { id: '233', username: 'student33', password: 'student123', role: 'student', email: 'student33@coaching.com', name: 'Joseph Rogers' },
        { id: '234', username: 'student34', password: 'student123', role: 'student', email: 'student34@coaching.com', name: 'Luna Reed' },
        { id: '235', username: 'student35', password: 'student123', role: 'student', email: 'student35@coaching.com', name: 'David Cook' },
        { id: '236', username: 'student36', password: 'student123', role: 'student', email: 'student36@coaching.com', name: 'Layla Morgan' },
        { id: '237', username: 'student37', password: 'student123', role: 'student', email: 'student37@coaching.com', name: 'Carter Bell' },
        { id: '238', username: 'student38', password: 'student123', role: 'student', email: 'student38@coaching.com', name: 'Penelope Murphy' },
        { id: '239', username: 'student39', password: 'student123', role: 'student', email: 'student39@coaching.com', name: 'Wyatt Bailey' },
        { id: '240', username: 'student40', password: 'student123', role: 'student', email: 'student40@coaching.com', name: 'Riley Rivera' },
        
        // Course 5 Students (Cloud Computing)
        { id: '241', username: 'student41', password: 'student123', role: 'student', email: 'student41@coaching.com', name: 'John Cooper' },
        { id: '242', username: 'student42', password: 'student123', role: 'student', email: 'student42@coaching.com', name: 'Hannah Richardson' },
        { id: '243', username: 'student43', password: 'student123', role: 'student', email: 'student43@coaching.com', name: 'Luke Cox' },
        { id: '244', username: 'student44', password: 'student123', role: 'student', email: 'student44@coaching.com', name: 'Nora Howard' },
        { id: '245', username: 'student45', password: 'student123', role: 'student', email: 'student45@coaching.com', name: 'Ryan Ward' },
        { id: '246', username: 'student46', password: 'student123', role: 'student', email: 'student46@coaching.com', name: 'Ellie Torres' },
        { id: '247', username: 'student47', password: 'student123', role: 'student', email: 'student47@coaching.com', name: 'Nathan Peterson' },
        { id: '248', username: 'student48', password: 'student123', role: 'student', email: 'student48@coaching.com', name: 'Hazel Gray' },
        { id: '249', username: 'student49', password: 'student123', role: 'student', email: 'student49@coaching.com', name: 'Isaac Ramirez' },
        { id: '250', username: 'student50', password: 'student123', role: 'student', email: 'student50@coaching.com', name: 'Violet James' }
    ],
    
    // Sample Courses
    DEFAULT_COURSES: [
        {
            id: '1',
            title: 'Complete Web Development Bootcamp',
            description: 'Master HTML, CSS, JavaScript, React, Node.js and become a full-stack developer',
            coachId: '101',
            price: 2999,
            duration: '12 weeks',
            level: 'Beginner to Advanced',
            category: 'Web Development',
            thumbnail: 'web-dev.jpg',
            syllabus: [
                { week: 1, title: 'HTML Fundamentals', topics: ['HTML5 Structure', 'Semantic Elements', 'Forms & Validation', 'Accessibility'] },
                { week: 2, title: 'CSS Mastery', topics: ['Flexbox & Grid', 'Responsive Design', 'Animations', 'CSS Variables'] },
                { week: 3, title: 'JavaScript Basics', topics: ['Variables & Data Types', 'Functions & Scope', 'DOM Manipulation', 'Events'] },
                { week: 4, title: 'Advanced JavaScript', topics: ['ES6+ Features', 'Async/Await', 'Promises', 'Fetch API'] },
                { week: 5, title: 'React Fundamentals', topics: ['Components', 'Props & State', 'Hooks', 'Event Handling'] },
                { week: 6, title: 'React Advanced', topics: ['Context API', 'Redux', 'React Router', 'Performance'] },
                { week: 7, title: 'Node.js Basics', topics: ['Express Setup', 'Routing', 'Middleware', 'Error Handling'] },
                { week: 8, title: 'Database Integration', topics: ['MongoDB', 'Mongoose', 'CRUD Operations', 'Relationships'] },
                { week: 9, title: 'Authentication', topics: ['JWT', 'Bcrypt', 'Sessions', 'OAuth'] },
                { week: 10, title: 'REST APIs', topics: ['API Design', 'Validation', 'Testing', 'Documentation'] },
                { week: 11, title: 'Deployment', topics: ['Git & GitHub', 'Heroku', 'AWS', 'CI/CD'] },
                { week: 12, title: 'Final Project', topics: ['Project Planning', 'Implementation', 'Testing', 'Presentation'] }
            ],
            learningOutcomes: [
                'Build responsive websites from scratch',
                'Create dynamic web applications with React',
                'Develop RESTful APIs with Node.js',
                'Deploy full-stack applications to production',
                'Work with databases and authentication'
            ]
        },
        {
            id: '2',
            title: 'Data Science & Machine Learning A-Z',
            description: 'Learn Python, Statistics, Machine Learning, Deep Learning and AI',
            coachId: '102',
            price: 3499,
            duration: '16 weeks',
            level: 'Intermediate',
            category: 'Data Science',
            thumbnail: 'data-science.jpg',
            syllabus: [
                { week: 1, title: 'Python for Data Science', topics: ['NumPy Arrays', 'Pandas DataFrames', 'Data Cleaning', 'File I/O'] },
                { week: 2, title: 'Data Visualization', topics: ['Matplotlib', 'Seaborn', 'Plotly', 'Interactive Dashboards'] },
                { week: 3, title: 'Statistics Fundamentals', topics: ['Descriptive Stats', 'Probability', 'Distributions', 'Hypothesis Testing'] },
                { week: 4, title: 'Exploratory Data Analysis', topics: ['Data Profiling', 'Correlation', 'Feature Engineering', 'Outlier Detection'] },
                { week: 5, title: 'Linear Regression', topics: ['Simple Regression', 'Multiple Regression', 'Regularization', 'Model Evaluation'] },
                { week: 6, title: 'Classification Algorithms', topics: ['Logistic Regression', 'Decision Trees', 'Random Forest', 'SVM'] },
                { week: 7, title: 'Clustering', topics: ['K-Means', 'Hierarchical', 'DBSCAN', 'Dimensionality Reduction'] },
                { week: 8, title: 'Model Selection', topics: ['Cross-Validation', 'Hyperparameter Tuning', 'Grid Search', 'Metrics'] },
                { week: 9, title: 'Neural Networks', topics: ['Perceptrons', 'Backpropagation', 'Activation Functions', 'Optimization'] },
                { week: 10, title: 'Deep Learning', topics: ['CNNs', 'RNNs', 'Transfer Learning', 'TensorFlow/Keras'] },
                { week: 11, title: 'NLP Basics', topics: ['Text Processing', 'Tokenization', 'Word Embeddings', 'Sentiment Analysis'] },
                { week: 12, title: 'Time Series', topics: ['ARIMA', 'Forecasting', 'Seasonality', 'Prophet'] },
                { week: 13, title: 'Big Data Tools', topics: ['Spark', 'Hadoop', 'Distributed Computing', 'Cloud ML'] },
                { week: 14, title: 'ML Deployment', topics: ['Flask APIs', 'Docker', 'Model Serving', 'Monitoring'] },
                { week: 15, title: 'Ethics & Best Practices', topics: ['Bias', 'Fairness', 'Privacy', 'Interpretability'] },
                { week: 16, title: 'Capstone Project', topics: ['Problem Definition', 'Data Collection', 'Model Building', 'Presentation'] }
            ],
            learningOutcomes: [
                'Analyze and visualize complex datasets',
                'Build predictive models with machine learning',
                'Implement deep learning solutions',
                'Deploy ML models to production',
                'Apply data science to real-world problems'
            ]
        },
        {
            id: '3',
            title: 'iOS & Android Mobile App Development',
            description: 'Build native mobile apps with React Native, Flutter and Swift',
            coachId: '103',
            price: 2799,
            duration: '10 weeks',
            level: 'Intermediate',
            category: 'Mobile Development',
            thumbnail: 'mobile-dev.jpg',
            syllabus: [
                { week: 1, title: 'Mobile Development Intro', topics: ['iOS vs Android', 'Development Tools', 'Emulators', 'App Architecture'] },
                { week: 2, title: 'React Native Basics', topics: ['Components', 'Styling', 'Navigation', 'State Management'] },
                { week: 3, title: 'UI Components', topics: ['Lists', 'Forms', 'Modals', 'Animations'] },
                { week: 4, title: 'API Integration', topics: ['Fetch', 'Axios', 'Authentication', 'Error Handling'] },
                { week: 5, title: 'Local Storage', topics: ['AsyncStorage', 'SQLite', 'Realm', 'Offline Support'] },
                { week: 6, title: 'Native Features', topics: ['Camera', 'GPS', 'Push Notifications', 'Biometrics'] },
                { week: 7, title: 'Flutter Development', topics: ['Widgets', 'Dart Language', 'State Management', 'Material Design'] },
                { week: 8, title: 'Testing & Debugging', topics: ['Unit Tests', 'Integration Tests', 'Debugging Tools', 'Performance'] },
                { week: 9, title: 'App Deployment', topics: ['App Store', 'Google Play', 'Code Signing', 'Release Management'] },
                { week: 10, title: 'Final Project', topics: ['App Design', 'Implementation', 'Testing', 'Publishing'] }
            ],
            learningOutcomes: [
                'Build cross-platform mobile applications',
                'Integrate with REST APIs and databases',
                'Implement native device features',
                'Publish apps to App Store and Google Play',
                'Optimize app performance and UX'
            ]
        },
        {
            id: '4',
            title: 'Advanced Machine Learning & AI',
            description: 'Deep Learning, Neural Networks, Computer Vision and NLP',
            coachId: '104',
            price: 3999,
            duration: '14 weeks',
            level: 'Advanced',
            category: 'Artificial Intelligence',
            thumbnail: 'ml-ai.jpg',
            syllabus: [
                { week: 1, title: 'Deep Learning Foundations', topics: ['Neural Networks', 'Gradient Descent', 'Backpropagation', 'Optimization'] },
                { week: 2, title: 'CNN Architecture', topics: ['Convolutions', 'Pooling', 'ResNet', 'VGG'] },
                { week: 3, title: 'Computer Vision', topics: ['Image Classification', 'Object Detection', 'YOLO', 'Semantic Segmentation'] },
                { week: 4, title: 'Transfer Learning', topics: ['Pre-trained Models', 'Fine-tuning', 'Feature Extraction', 'Domain Adaptation'] },
                { week: 5, title: 'RNN & LSTM', topics: ['Sequence Models', 'Time Series', 'Text Generation', 'Attention Mechanism'] },
                { week: 6, title: 'Transformers', topics: ['BERT', 'GPT', 'Attention', 'Self-Attention'] },
                { week: 7, title: 'NLP Advanced', topics: ['Named Entity Recognition', 'Question Answering', 'Summarization', 'Translation'] },
                { week: 8, title: 'GANs', topics: ['Generative Models', 'Image Generation', 'Style Transfer', 'CycleGAN'] },
                { week: 9, title: 'Reinforcement Learning', topics: ['Q-Learning', 'Policy Gradients', 'Actor-Critic', 'Deep RL'] },
                { week: 10, title: 'AutoML', topics: ['Neural Architecture Search', 'Hyperparameter Optimization', 'AutoKeras', 'H2O'] },
                { week: 11, title: 'Model Optimization', topics: ['Pruning', 'Quantization', 'Knowledge Distillation', 'Mobile Deployment'] },
                { week: 12, title: 'MLOps', topics: ['Model Versioning', 'A/B Testing', 'Monitoring', 'CI/CD for ML'] },
                { week: 13, title: 'Ethics & Fairness', topics: ['Bias Detection', 'Explainable AI', 'Privacy', 'Responsible AI'] },
                { week: 14, title: 'Capstone Project', topics: ['Research Paper Implementation', 'Model Development', 'Evaluation', 'Deployment'] }
            ],
            learningOutcomes: [
                'Design and train deep neural networks',
                'Build computer vision applications',
                'Implement NLP solutions with transformers',
                'Deploy AI models at scale',
                'Apply reinforcement learning techniques'
            ]
        },
        {
            id: '5',
            title: 'Cloud Computing with AWS & Azure',
            description: 'Master cloud architecture, deployment, and DevOps practices',
            coachId: '105',
            price: 3299,
            duration: '12 weeks',
            level: 'Intermediate to Advanced',
            category: 'Cloud Computing',
            thumbnail: 'cloud.jpg',
            syllabus: [
                { week: 1, title: 'Cloud Fundamentals', topics: ['IaaS vs PaaS vs SaaS', 'Cloud Economics', 'Security Basics', 'Regions & Zones'] },
                { week: 2, title: 'AWS Core Services', topics: ['EC2', 'S3', 'RDS', 'VPC'] },
                { week: 3, title: 'AWS Advanced', topics: ['Lambda', 'API Gateway', 'DynamoDB', 'CloudFormation'] },
                { week: 4, title: 'Azure Fundamentals', topics: ['Virtual Machines', 'Storage', 'SQL Database', 'App Service'] },
                { week: 5, title: 'Azure Advanced', topics: ['Functions', 'Cosmos DB', 'Service Bus', 'ARM Templates'] },
                { week: 6, title: 'Containerization', topics: ['Docker Basics', 'Images', 'Volumes', 'Networking'] },
                { week: 7, title: 'Kubernetes', topics: ['Pods', 'Services', 'Deployments', 'Helm'] },
                { week: 8, title: 'CI/CD Pipelines', topics: ['Jenkins', 'GitHub Actions', 'Azure DevOps', 'GitLab CI'] },
                { week: 9, title: 'Infrastructure as Code', topics: ['Terraform', 'Ansible', 'CloudFormation', 'ARM'] },
                { week: 10, title: 'Monitoring & Logging', topics: ['CloudWatch', 'Azure Monitor', 'ELK Stack', 'Prometheus'] },
                { week: 11, title: 'Security & Compliance', topics: ['IAM', 'Encryption', 'Compliance', 'Best Practices'] },
                { week: 12, title: 'Final Project', topics: ['Architecture Design', 'Multi-cloud Deployment', 'Cost Optimization', 'Presentation'] }
            ],
            learningOutcomes: [
                'Design scalable cloud architectures',
                'Deploy applications on AWS and Azure',
                'Implement containerization with Docker and Kubernetes',
                'Build automated CI/CD pipelines',
                'Manage cloud security and compliance'
            ]
        }
    ],
    
    // Sample Enrollments
    DEFAULT_ENROLLMENTS: [
        // Course 1 enrollments
        ...Array.from({length: 10}, (_, i) => ({ courseId: '1', studentId: `${201 + i}` })),
        // Course 2 enrollments
        ...Array.from({length: 10}, (_, i) => ({ courseId: '2', studentId: `${211 + i}` })),
        // Course 3 enrollments
        ...Array.from({length: 10}, (_, i) => ({ courseId: '3', studentId: `${221 + i}` })),
        // Course 4 enrollments
        ...Array.from({length: 10}, (_, i) => ({ courseId: '4', studentId: `${231 + i}` })),
        // Course 5 enrollments
        ...Array.from({length: 10}, (_, i) => ({ courseId: '5', studentId: `${241 + i}` }))
    ]
};
