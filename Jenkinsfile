pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker_cred')
        IMAGE_NAME_FRONTEND = 'pavantejareddy05/react-chatbot-frontend'
        IMAGE_NAME_BACKEND = 'pavantejareddy05/react-chatbot-backend'
    }

    stages {
        stage('Verify Node.js Installation') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
        stage('Clone Repository') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/PavanTejaReddy05/Chatbot.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                // sh 'node --version'
                // sh 'npm --version'
                sh 'npm install'
                sh 'npm install axios @types/axios'
                // sh 'docker-compose down'
                // sh 'docker-compose up -d --build'
            }
        }
        stage('Build Frontend') {
            steps {
                    sh 'npm run build'
                }
            }
        }
        stage('Docker Build & Push') {
            steps {
                script {
                    // Login to Docker Hub
                    sh """
                    echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                    """

                    // Build and push frontend image
                    sh """
                    docker build -f Dockerfile.frontend -t $IMAGE_NAME_FRONTEND:latest .
                    docker push $IMAGE_NAME_FRONTEND:latest
                    """

                    // Build and push backend image
                    sh """
                    docker build -f Dockerfile.backend -t $IMAGE_NAME_BACKEND:latest .
                    docker push $IMAGE_NAME_BACKEND:latest
                    """
                }
            }
        }
        stage('Deploy Containers') {
            steps {
                script {
                    // Safely bring down any existing containers and deploy new ones
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning workspace...'
            cleanWs() // Clean workspace to avoid leftovers
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}
