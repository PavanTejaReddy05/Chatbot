pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker_cred')
        IMAGE_NAME_FRONTEND = 'pavantejareddy05/react-chatbot-frontend'
        IMAGE_NAME_BACKEND = 'pavantejareddy05/react-chatbot-backend'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/PavanTejaReddy05/Chatbot.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('.') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('src') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    // Build and push frontend image
                    sh """
                    docker build -f Dockerfile.frontend -t $IMAGE_NAME_FRONTEND:latest .
                    echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                    docker push $IMAGE_NAME_FRONTEND:latest
                    """

                    // Build and push backend image
                    sh """
                    docker build -f Dockerfile.backend -t $IMAGE_NAME_BACKEND:latest .
                    echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                    docker push $IMAGE_NAME_BACKEND:latest
                    """
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                script {
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d'
                }
            }
        }
    }
    post {
        always {
            cleanWs() // Clean workspace inside a node context
            }
        }
}
