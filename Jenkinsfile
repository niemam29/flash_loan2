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
                        sh 'echo "Container started. Waiting for tests to complete..."'
                    }
                }
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
