pipeline {
    agent any

    tools {
        maven 'Maven_3'
    }

    stages {

        stage('Backend Lint & Build') {
            steps {
                dir('app') {
                    echo 'Linting Java code with Checkstyle...'
                    sh 'mvn checkstyle:check'

                    echo 'Building backend...'
                    sh 'mvn clean install -DskipTests'
                }
            }
        }

        stage('Docker Lint & Build') {
            steps {
                echo 'Linting Dockerfile...'
                sh '''
                    export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                    docker run --rm -i hadolint/hadolint < Dockerfile
                '''

                echo 'Building Docker image...'
                sh '''
                    export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                    docker build -t spring-boot-app .
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
