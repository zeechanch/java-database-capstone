pipeline {
    agent any

    tools {
        maven 'Maven_3'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
    }

    stages {

        stage('Backend Lint & Build') {
            steps {
                dir('app') {
                    // echo 'Linting Java code with Checkstyle...'
                    // sh 'mvn checkstyle:check'

                    echo 'Building backend...'
                    sh 'mvn clean install -DskipTests'
                }
            }
        }

        stage('Docker Lint & Build') {
            steps {
                /*
                echo 'Linting Dockerfile...'
                sh '''
                    export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                    docker run --rm -i hadolint/hadolint < Dockerfile
                '''
                */

                echo 'Building Docker image...'
                sh '''
                    export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                    docker build -t spring-boot-app .
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application...'
                    // Combine all commands into one block so PATH applies to everything
                    sh '''
                        export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
                        
                        # Force remove the specific container by name (ignore error if it doesn't exist)
                        docker rm -f spring-boot-container || true
                        
                        # Now run compose
                        docker-compose down
                        docker-compose up -d --build
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Application deployed.'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
