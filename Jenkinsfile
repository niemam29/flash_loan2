pipeline {
    agent any

    environment {
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Build') {
            steps {
                script {
                    echo "Building main image using Dockerfile..."
                    docker.build("my-hardhat-env:${IMAGE_TAG}", "-f Dockerfile .")
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    echo "Building tester image using Dockerfile.test..."
                    docker.build("my-hardhat-test:${IMAGE_TAG}", "-f Dockerfile.test .")
                    echo "Running tests using the container's default CMD (npx hardhat test)..."
                    docker.image("my-hardhat-test:${IMAGE_TAG}").inside {
                        // No explicit command is run here.
                        // The container starts and executes its default CMD from Dockerfile.test.
                        sh 'echo "Container started. Waiting for tests to complete..."'
                    }
                }
            }
        }
        stage('Archive Logs') {
            steps {
                echo "Archiving logs..."
                archiveArtifacts artifacts: 'logs/**/*.log', fingerprint: true
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
